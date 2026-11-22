/* Recupero degli oggetti lasciati cadere nel pozzo: disponibile nel giorno 24. */
(()=>{
'use strict';const api=window.Partita,bag=document.getElementById('borsa-extra');if(!api||!bag)return;
const area=document.createElement('section');area.id='oggetti-sul-fondo-pozzo';area.hidden=true;bag.append(area);
let busy=false,version=0,objects=[],error='';
const eligible=()=>api.dati?.giorno_corrente===24&&!api.dati?.morto&&!api.dati?.giornata_completata&&api.dati?.interazioni?.stanza_tomo_raggiunta===true;
function render(){area.replaceChildren();area.hidden=!eligible()||(!objects.length&&!error);if(area.hidden)return;const h=document.createElement('h3'),p=document.createElement('p');h.textContent='Sul fondo del pozzo';p.textContent='Fra le pietre riconosci gli oggetti che avevi lasciato cadere. Puoi riporli nella Borsa.';area.append(h,p);for(const o of objects){const btn=document.createElement('button');btn.type='button';btn.textContent='Recupera '+o.nome+(o.quantita>1?' · '+o.quantita+' disponibili':'');btn.disabled=busy;btn.addEventListener('click',()=>prendi(o.id));area.append(btn);}if(error){const msg=document.createElement('p');msg.textContent=error;msg.setAttribute('role','alert');area.append(msg);}}
async function prendi(id){if(busy||!eligible())return;busy=true;error='';render();try{const r=await window.BorsaNuova.esegui('gioco_oggetti_pozzo',{p_codice:api.codice,p_azione:'prendi',p_oggetto:id,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r)objects=r.oggetti||[];else error=window.BorsaNuova.errore||'Non è stato possibile recuperare l’oggetto.';}catch(e){error=e.message;}finally{busy=false;await aggiorna();}}
async function aggiorna(){const n=++version;if(!eligible()){objects=[];error='';render();return;}render();try{const r=await api.rpc('gioco_oggetti_pozzo',{p_codice:api.codice});if(n!==version)return;objects=r.oggetti||[];}catch(e){if(n===version)error=e.message;}if(n===version)render();}
api.onChange(aggiorna);api.ready.then(aggiorna);window.OggettiPozzo={aggiorna};
})();
