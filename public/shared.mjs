import {BANK} from './questions.mjs';
export {BANK};
export const ROUNDS=7, TIME=25;
export const TIERS={0:'SEM PONTOS',10:'COMUM',15:'CONHECIDA',30:'INCOMUM',60:'RARA',85:'ÉPICA',100:'LENDÁRIA'};
export const MAX_ROUND_ESTIMATE=175;
export const MAX_SCORE_ESTIMATE=ROUNDS*MAX_ROUND_ESTIMATE;
export function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' e ').replace(/\b(d[aeo]s?|um|uma|uns|umas|o|a|os|as)\b/g,' ').replace(/[^a-z0-9+# ]/g,' ').replace(/\s+/g,' ').trim()}
const ALIASES={
 'eua':['estados unidos','estados unidos da america','usa'], 'reino unido':['inglaterra','uk','gra bretanha','gra-bretanha'],
 'tita':['titan'], 'lua':['lua terrestre'], 'brasilia':['distrito federal'],
 'sao paulo':['sp'], 'rio de janeiro':['rj'], 'belo horizonte':['bh'],
 'florianopolis':['floripa'], 'porto alegre':['poa'], 'salvador':['salvador bahia'],
 'jupiter':['jupiter planeta'], 'saturno':['saturno planeta'], 'netuno':['netuno planeta'],
 'cavalo marinho':['cavalo-marinho'], 'peixe palhaco':['nemo','peixe-palhaco'],
 'tubarao':['tubarao branco','tubarao martelo','tubarao baleia'],
 'aguia':['aguia real'], 'violao':['violao acustico'], 'baixo':['contrabaixo','baixo eletrico'],
 'bateria':['bateria musical'], 'teclado':['teclado musical'], 'sanfona':['acordeon','acordeao'],
 'futebol':['futebol de campo'], 'volei':['voleibol'], 'basquete':['basquetebol'],
 'natacao':['nado'], 'atletismo':['corrida atletica'], 'tenis de mesa':['ping pong','pingue pongue'],
 'handebol':['andebol'], 'ginastica artistica':['ginastica olimpica'],
 'mata atlantica':['mata atlantica brasileira'], 'pampa':['pampas'],
 'balé':['ballet','bale classico'], 'hip hop':['hip-hop'],
 'atlantico':['oceano atlantico'], 'pacifico':['oceano pacifico'],
 'indico':['oceano indico'], 'artico':['oceano artico'], 'antartico':['oceano antartico','austral','oceano austral'],
 'vira lata':['vira-lata','srd','sem raca definida'], 'dachshund':['salsicha','teckel'],
 'pastor alemao':['pastor germanico'], 'shih tzu':['shitzu','shihtzu'],
 'pitaia':['pitaya'], 'maracuja':['maracuja azedo'], 'cupuaçu':['cupuassu','cupuacu'],
 'refrigerante':['refri'], 'agua mineral':['agua'], 'agua de coco':['coco gelado'],
 'bicicleta':['bike','bici'], 'motocicleta':['moto'], 'automovel':['carro'],
 'telefone celular':['celular','smartphone'], 'computador':['pc'], 'notebook':['laptop'],
 'programador':['desenvolvedor','dev'], 'medico':['doutor'],
 'linguagem javascript':['js'], 'javascript':['js'], 'python':['py'], 'c++':['cpp'], 'typescript':['ts'],
 'tiranossauro rex':['t rex','trex','tyrannosaurus rex'],
 'velociraptor':['raptor'], 'triceratops':['triceratopo'],
 'homem aranha':['spider man','spiderman'], 'batman':['homem morcego'],
 'super homem':['superman'], 'mulher maravilha':['wonder woman'],
 'capitao america':['captain america'], 'homem de ferro':['iron man'],
 'minecraft':['mine'], 'mario':['super mario'], 'sonic':['sonic the hedgehog'],
 'facebook':['face','fb'], 'instagram':['insta','ig'], 'whatsapp':['zap','wpp','whats'],
 'twitter':['x','twitter x'], 'youtube':['yt'], 'tiktok':['tik tok'],
 'pao de queijo':['pãozinho de queijo'], 'brigadeiro':['brigadeiro de chocolate'],
 'mussarela':['mucarela','muçarela','mozarela'], 'parmesao':['parmigiano'],
 'muçarela':['mussarela','mozarela','mucarela'],
 'smartphone':['celular','telefone celular'], 'televisao':['tv','tevê','teve'],
 'air fryer':['airfryer'], 'jiu jitsu':['jiujitsu'], 'muay thai':['muai thai'],
 'cristo redentor':['cristo'], 'cataratas do iguacu':['iguacu'], 'lençois maranhenses':['lencois maranhenses'],
};
function candidateForms(answer){
 let base=normalize(answer); let forms=new Set([base]);
 for(const alias of (ALIASES[base]||[]))forms.add(normalize(alias));
 for(const prefix of ['planeta','fruta','animal','pais','estado','cidade','capital','flor','ave','queijo','instrumento','esporte','dinossauro','cor','moeda','metal','elemento','linguagem','sobremesa','profissao','doenca','montanha','rio','super heroi','super heroi'])forms.add(`${prefix} ${base}`);
 return [...forms].filter(Boolean)
}
const answerCache=new WeakMap();
function prepared(q){let data=answerCache.get(q);if(data)return data;data=new Map();for(const [answer,pts] of q.a){for(const n of candidateForms(answer)){if(!data.has(n))data.set(n,{answer,pts,n})}}answerCache.set(q,data);return data}
function distance(a,b,limit){if(Math.abs(a.length-b.length)>limit)return limit+1;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let now=[i];for(let j=1;j<=b.length;j++)now.push(Math.min(now[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)));prev=now}return prev[b.length]}
export function getDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export function dailyQuestions(date){let seed=2166136261;for(const c of date)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;return pick(seed)}
export function pick(seed){let list=[...BANK];let s=seed>>>0||1;for(let j=list.length-1;j>0;j--){s=(Math.imul(1664525,s)+1013904223)>>>0;let k=s%(j+1);[list[j],list[k]]=[list[k],list[j]]}return list.slice(0,ROUNDS)}
export function matchAnswer(q,raw){const key=normalize(raw);if(!key)return null;const variants=prepared(q);const exact=variants.get(key);if(exact)return exact;if(key.length<5)return null;let limit=key.length>=11?2:1;const matched=new Map();for(const [spelling,item] of variants){if(Math.abs(spelling.length-key.length)<=limit&&distance(key,spelling,limit)<=limit)matched.set(normalize(item.answer),item);if(matched.size>1)return null}return matched.size===1?[...matched.values()][0]:null}
export function scoreRound(basePoints,remainingMs=0,streakBefore=0){
 const base=Math.max(0,Number(basePoints)||0);
 if(!base)return {base:0,timeBonus:0,comboBonus:0,total:0,streakAfter:0};
 const safeRemaining=Math.max(0,Math.min(TIME*1000,Math.round(Number(remainingMs)||0)));
 const timeBonus=Math.round(base*0.35*(safeRemaining/(TIME*1000)));
 const streakAfter=Math.max(1,Math.round(streakBefore)+1);
 const comboBonus=streakAfter>=2?Math.min((streakAfter-1)*10,50):0;
 return {base,timeBonus,comboBonus,total:base+timeBonus+comboBonus,streakAfter};
}
export function evaluateGame(questions,payload){
 let total=0, streak=0, maxStreak=0, rounds=[];
 for(let i=0;i<questions.length;i++){
   const item=payload?.[i];
   const raw=typeof item==='string'?item:String(item?.answer||'');
   let remainingMs=0;
   if(item&&typeof item==='object'){
     if(Number.isFinite(item.remainingMs)) remainingMs=item.remainingMs;
     else if(Number.isFinite(item.msSpent)) remainingMs=(TIME*1000)-item.msSpent;
   }
   const found=matchAnswer(questions[i],raw);
   const scored=scoreRound(found?.pts||0,remainingMs,streak);
   streak=scored.streakAfter;
   maxStreak=Math.max(maxStreak,streak);
   total+=scored.total;
   rounds.push({
     input:raw,
     answer:found?.answer||null,
     ...scored,
     remainingMs:Math.max(0,Math.min(TIME*1000,Math.round(Number(remainingMs)||0)))
   });
 }
 return {score:total,maxStreak,rounds};
}
export function depthMeters(points){return points*10}
export function depthZone(points){
 const meters=depthMeters(points);
 if(meters<800)return 'ZONA DE LUZ';
 if(meters<1800)return 'ZONA CREPUSCULAR';
 if(meters<3200)return 'ZONA DA MEIA-NOITE';
 if(meters<5000)return 'ABISSO';
 return 'FOSSA OCEÂNICA';
}
