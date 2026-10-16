import {dailyQuestions,ROUNDS,getDay,evaluateGame} from '../public/shared.mjs';
const json=(value,status=200,origin='*')=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
function cors(request,env){const incoming=request.headers.get('Origin')||'';const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);return allowed.includes(incoming)?incoming:(allowed.length?'null':'*')}
export default {async fetch(req,env){
 let u=new URL(req.url),origin=cors(req,env);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'}});
 if(u.pathname==='/api/health')return json({ok:true,database:!!env.DB},200,origin);
 if(u.pathname!=='/api/leaderboard')return json({error:'Rota não encontrada'},404,origin);
 if(!env.DB)return json({error:'Banco D1 não configurado'},503,origin);
 try{
   if(req.method==='GET'){
     const date=u.searchParams.get('date')||getDay();
     if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:'Data inválida'},400,origin);
     const list=await env.DB.prepare('SELECT name, score FROM scores WHERE day = ? ORDER BY score DESC, created_at ASC LIMIT 30').bind(date).all();
     let you=null; const who=(u.searchParams.get('name')||'').trim();
     if(who.length>=2&&who.length<=20){
       const row=await env.DB.prepare('SELECT name,score,created_at FROM scores WHERE day=? AND name=? COLLATE NOCASE ORDER BY score DESC LIMIT 1').bind(date,who).first();
       if(row){const above=await env.DB.prepare('SELECT count(*) AS n FROM scores WHERE day=? AND (score>? OR (score=? AND created_at<?))').bind(date,row.score,row.score,row.created_at).first(); you={name:row.name,score:row.score,rank:Number(above.n)+1}}
     }
     return json({date,entries:list.results||[],you},200,origin)
   }
   if(req.method==='POST'){
     if(Number(req.headers.get('content-length')||0)>8192)return json({error:'Envio muito grande'},413,origin);
     const body=await req.json();
     const name=String(body.name||'').replace(/[<>\x00-\x1f]/g,'').trim();
     if(name.length<2||name.length>20)return json({error:'Use um apelido de 2 a 20 caracteres.'},400,origin);
     let today=getDay();
     if(body.date!==today)return json({error:'Só é possível registrar o desafio de hoje.'},400,origin);
     const rounds=Array.isArray(body.rounds)?body.rounds:(Array.isArray(body.answers)?body.answers:[]);
     if(rounds.length!==ROUNDS)return json({error:'Partida inválida.'},400,origin);
     const sanitized=rounds.map((item)=>{
       if(typeof item==='string')return item;
       if(!item||typeof item!=='object')throw new Error('Formato inválido');
       const answer=String(item.answer||'');
       if(answer.length>85)throw new Error('Resposta inválida');
       const remainingMs=Math.max(0,Math.min(25000,Math.round(Number(item.remainingMs)||0)));
       return {answer,remainingMs};
     });
     const questions=dailyQuestions(today);
     const evaluated=evaluateGame(questions,sanitized);
     const score=evaluated.score;
     const fingerprint=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(name.toLowerCase()+'|'+today));
     const id=Array.from(new Uint8Array(fingerprint)).map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);
     await env.DB.prepare(`INSERT INTO scores (id,day,name,score,created_at) VALUES (?,?,?,?,datetime('now')) ON CONFLICT(id) DO UPDATE SET score=MAX(scores.score, excluded.score),name=excluded.name`).bind(id,today,name,score).run();
     const stored=await env.DB.prepare('SELECT score,created_at FROM scores WHERE id=?').bind(id).first();
     const above=await env.DB.prepare('SELECT count(*) AS n FROM scores WHERE day=? AND (score>? OR (score=? AND created_at<?))').bind(today,stored.score,stored.score,stored.created_at).first();
     return json({ok:true,score:stored.score,rank:Number(above.n)+1,maxStreak:evaluated.maxStreak},200,origin)
   }
   return json({error:'Método inválido'},405,origin)
 }catch(e){ return json({error:e?.message==='Formato inválido'||e?.message==='Resposta inválida'?e.message:'Falha ao processar requisição.'},e?.message==='Formato inválido'||e?.message==='Resposta inválida'?400:500,origin) }
 }};
