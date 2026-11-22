/* Conteggi dai salvataggi esistenti. Nessun cookie o identificatore aggiuntivo. */
(()=>{
'use strict';
const api=window.Partita;if(!api)return;
let dati=null,scadenza=0,inCorso=null;
const formato=new Intl.NumberFormat('it-IT');
function valida(r){
 const valori=[r?.partite_salvate,...['tenere','distruggere','iliano'].map(k=>r?.scelte?.[k])];
 if(valori.some(n=>!Number.isSafeInteger(n)||n<0)||valori.slice(1).reduce((a,b)=>a+b,0)>r.partite_salvate)throw new Error('Conteggi non disponibili');
 return r;
}
function carica(){
 if(dati&&Date.now()<scadenza)return Promise.resolve(dati);
 if(!inCorso)inCorso=api.rpc('gioco_statistiche',{}).then(valida).then(r=>{dati=r;scadenza=Date.now()+60000;return r;}).finally(()=>{inCorso=null;});
 return inCorso;
}
async function aggiornaFooter(){
 const box=document.getElementById('contatore-partite');if(!box)return;
 const numero=box.querySelector('[data-numero-partite]'),stato=box.querySelector('[data-stato-partite]');
 try{const r=await carica();numero.textContent=formato.format(r.partite_salvate);stato.textContent='';box.removeAttribute('title');}
 catch{numero.textContent='—';stato.textContent='Conteggio non disponibile';box.title='Ricarica la pagina per riprovare.';}
}
async function mostraFinali(area){
 area.replaceChildren();const titolo=document.createElement('h2');titolo.textContent='Le scelte di chi ha giocato';const stato=document.createElement('p');stato.textContent='Caricamento dei conteggi…';area.append(titolo,stato);
 try{
  const r=await carica();if(area.isConnected===false)return;
  const totale=r.scelte.tenere+r.scelte.distruggere+r.scelte.iliano;
  stato.textContent=totale===0?'Non ci sono ancora scelte confermate.':formato.format(totale)+(totale===1?' scelta confermata.':' scelte confermate.');
  const lista=document.createElement('ul');lista.className='elenco-scelte-finali';
  for(const[id,nome]of [['tenere','Tenere per sé il tomo'],['distruggere','Distruggere la magia nuova'],['iliano','Consegnare il tomo a Iliano']]){
   const voce=document.createElement('li'),etichetta=document.createElement('span'),numero=document.createElement('strong');
   etichetta.textContent=nome;numero.textContent=formato.format(r.scelte[id]);voce.append(etichetta,numero);lista.append(voce);
  }
  area.append(lista);
 }catch{if(area.isConnected===false)return;stato.textContent='I conteggi non sono disponibili in questo momento.';const riprova=document.createElement('button');riprova.type='button';riprova.textContent='Riprova a caricare i conteggi';riprova.addEventListener('click',()=>mostraFinali(area));area.append(riprova);}
}
window.StatisticheGioco={carica,mostraFinali};
aggiornaFooter();
})();
