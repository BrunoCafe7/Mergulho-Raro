import {BANK} from './questions.mjs';
export {BANK};
export const ROUNDS=7, TIME=25;
export const TIERS={0:'SEM PONTOS',10:'COMUM',15:'CONHECIDA',30:'INCOMUM',60:'RARA',85:'ÉPICA',100:'LENDÁRIA'};
export function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(d[aeo]s?|um|uma|uns|umas)\b/g,' ').replace(/[^a-z0-9+# ]/g,' ').replace(/\s+/g,' ').trim()}
export function getDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
export function dailyQuestions(date){let seed=2166136261;for(const c of date)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;return pick(seed)}
export function pick(seed){let list=[...BANK];let s=seed>>>0||1;for(let j=list.length-1;j>0;j--){s=(Math.imul(1664525,s)+1013904223)>>>0;let k=s%(j+1);[list[j],list[k]]=[list[k],list[j]]}return list.slice(0,ROUNDS)}
export function matchAnswer(q,raw){let key=normalize(raw);if(!key)return null;let keys=q.a.map(([answer,pts])=>({answer,pts,n:normalize(answer)}));let hit=keys.find(e=>e.n===key);if(hit)return hit;
// Aceita pequenos erros de digitação, mas só quando a correspondência é inequívoca.
const distance=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 3;let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let now=[i];for(let j=1;j<=b.length;j++)now.push(Math.min(now[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)));prev=now}return prev[b.length]};
if(key.length<5)return null;let hits=keys.filter(e=>Math.abs(e.n.length-key.length)<= (key.length>9?2:1) && distance(key,e.n)<=(key.length>9?2:1));const unique=new Map(hits.map(e=>[e.n,e]));return unique.size===1?[...unique.values()][0]:null}
