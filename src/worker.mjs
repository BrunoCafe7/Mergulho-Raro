import {dailyQuestions,ROUNDS,getDay,evaluateGame} from '../public/shared.mjs';
const json=(value,status=200,origin='*')=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
function cors(request,env){const incoming=request.headers.get('Origin')||'';const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);return allowed.includes(incoming)?incoming:(allowed.length?'null':'*')}
export default {async fetch(req,env){
 let u=new URL(req.url),origin=cors(req,env);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'}});
 if(u.pathname==='/api/health')return json({ok:true,database:!!env.DB},200,origin);
 if(u.pathname==='/api/suggestions'&&req.method==='POST'){
 if(!env.DB)return json({error:'Banco indisponível'},503,origin);
 if(Number(req.headers.get('content-length')||0)>1024)return json({error:'Sugestão muito grande'},413,origin);
 try{const body=await req.json(); const question=String(body.question||'').trim(),answer=String(body.answer||'').trim();
 if(question.length<5||question.length>200||answer.length<2||answer.length>85)return json({error:'Sugestão inválida'},400,origin);
 const validQuestion=(await import('../public/shared.mjs')).BANK.some(q=>q.q===question);
 if(!validQuestion)return json({error:'Pergunta não encontrada'},400,origin);
 await env.DB.prepare('INSERT INTO answer_suggestions (question,answer) VALUES (?,?)').bind(question,answer).run();
 return json({ok:true},200,origin)
 }catch{return json({error:'Não foi possível guardar a sugestão; confira a migração V7 do D1.'},500,origin)}
 }
 if(u.pathname!=='/api/leaderboard')return json({error:'Rota não encontrada'},404,origin);
 if(!env.DB)return json({error:'Banco D1 não configurado'},503,origin);
 try{
   if(req.method==='GET'){
     const date=u.searchParams.get('date')||getDay();
     if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({error:'Data inválida'},400,origin);
     const period=['week','month'].includes(u.searchParams.get('period'))?u.searchParams.get('period'):'day';
     const endDate=getDay();
     const now=new Date(endDate+'T12:00:00Z');
     const startDate= period==='week' ? new Date(now.getTime()-((now.getUTCDay()+6)%7)*86400000).toISOString().slice(0,10) : period==='month' ? endDate.slice(0,7)+'-01' : date;
     const list=period==='day'
       ? await env.DB.prepare('SELECT name, score FROM scores WHERE day = ? ORDER BY score DESC, created_at ASC LIMIT 30').bind(date).all()
       : await env.DB.prepare('SELECT name, SUM(score) AS score FROM scores WHERE day>=? AND day<=? GROUP BY lower(name) ORDER BY score DESC LIMIT 30').bind(startDate,endDate).all();
     let you=null; const who=(u.searchParams.get('name')||'').trim();
     if(who.length>=2&&who.length<=20){
       const row=period==='day'?await env.DB.prepare('SELECT name,score,created_at FROM scores WHERE day=? AND name=? COLLATE NOCASE ORDER BY score DESC LIMIT 1').bind(date,who).first():await env.DB.prepare('SELECT name,SUM(score) AS score FROM scores WHERE day>=? AND day<=? AND name=? COLLATE NOCASE GROUP BY lower(name)').bind(startDate,endDate,who).first();
       if(row){const above=period==='day'?await env.DB.prepare('SELECT count(*) AS n FROM scores WHERE day=? AND (score>? OR (score=? AND created_at<?))').bind(date,row.score,row.score,row.created_at).first():await env.DB.prepare('SELECT COUNT(*) AS n FROM (SELECT SUM(score) AS s FROM scores WHERE day>=? AND day<=? GROUP BY lower(name) HAVING s>?)').bind(startDate,endDate,row.score).first(); you={name:row.name,score:row.score,rank:Number(above.n)+1}}
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
