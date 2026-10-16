import { ADSENSE_CLIENT, AD_SLOTS } from './ads-config.mjs';
// O jogo e o ranking continuam funcionando mesmo sem anuncios.
const validClient = /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT);
const mounted = new Set();
let scriptReady;
function loadScript(){
  if (!scriptReady) {
    scriptReady = new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.async=true;
      s.crossOrigin='anonymous';
      s.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
      s.onload=resolve;s.onerror=reject;
      document.head.append(s);
    });
  }
  return scriptReady;
}
async function maybeMount(){
  if(!validClient)return;
  for(const [location,slot] of Object.entries(AD_SLOTS)){
    if(!/^\d+$/.test(String(slot))||mounted.has(location))continue;
    const el=document.querySelector(`[data-ad-placement="${location}"]`);
    if(!el||!el.closest('.screen:not(.hidden)'))continue;
    el.classList.add('ad-enabled');
    try{
      await loadScript();
      if(!el.closest('.screen:not(.hidden)'))continue;
      const ins=document.createElement('ins');
      ins.className='adsbygoogle';
      ins.style.display='block';
      ins.dataset.adClient=ADSENSE_CLIENT;
      ins.dataset.adSlot=String(slot);
      ins.dataset.adFormat='auto';
      ins.dataset.fullWidthResponsive='true';
      el.querySelector('.ad-mount').append(ins);
      mounted.add(location);
      (window.adsbygoogle=window.adsbygoogle||[]).push({});
    }catch(error){console.warn('Publicidade indisponivel:',error)}
  }
}
if(validClient){
 const observer=new MutationObserver(()=>void maybeMount());
 observer.observe(document.querySelector('main'),{attributes:true,subtree:true,attributeFilter:['class']});
 maybeMount();
}
