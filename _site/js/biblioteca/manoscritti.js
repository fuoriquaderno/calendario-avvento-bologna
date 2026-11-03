(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='sala-manoscritti';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 const pianta=document.createElement('dialog');pianta.className='avviso-codice pianta-biblioteca';pianta.setAttribute('aria-labelledby','titolo-pianta-biblioteca');
 pianta.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-pianta-biblioteca">Pianta incompleta della biblioteca</h2><div class="superficie-pianta"><img id="immagine-pianta-biblioteca" alt="Pianta parziale della biblioteca: il corridoio termina prima dei servizi; fra cisterna e servizi rimane uno spazio vuoto senza indicazioni."></div><p id="testo-pianta-biblioteca"></p><p class="istruzioni-pianta">Su uno schermo piccolo puoi scorrere lateralmente la pianta.</p><button type="button" id="chiudi-pianta-biblioteca">Torna ai manoscritti</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(pianta);$('chiudi-pianta-biblioteca').addEventListener('click',()=>pianta.close());
 
 let vista=null,busy=false,versione=0;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,fn){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e}
 function mostra(r){
  if(!r?.lettura)return;const l=r.lettura;
  if(l.tipo==='pianta'){$('immagine-pianta-biblioteca').src=api.risorsa('images/pianta-biblioteca.svg');$('testo-pianta-biblioteca').textContent=l.testo;if(!pianta.open)pianta.showModal()}
  else{window.Messaggi.mostra({titolo:l.titolo,testo:l.testo,pulsante:'Torna ai manoscritti'})}
 }
 async function invia(azione,documento=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_manoscritti',{p_codice:api.codice,p_azione:azione,p_documento:documento,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});mostra(r)}
  finally{busy=false;await aggiorna()}
 }
 function disegna(){
  const d=api.dati,f=d?.stato_partita?.fase;area.replaceChildren();area.hidden=!d||![3,4].includes(d.giorno_corrente)||d.morto||!['g3_manoscritti','g3_corridoio'].includes(f);if(area.hidden||!vista)return;
  const titolo=document.createElement('h2');titolo.textContent=f==='g3_corridoio'?'Il corridoio dei servizi':'La sala dei manoscritti';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);mostra(r);await aggiorna()}));return}
  if(d.luogo_attuale!=='biblioteca'){area.append(p('Puoi riprendere l’esplorazione nella biblioteca del convento.'),b('Torna alla biblioteca',()=>invia('torna')));return}
  if(f==='g3_corridoio'){
   area.append(p('Il corridoio è più stretto delle sale che hai attraversato. Una porta conduce al bagno; poco oltre, il passaggio termina contro una parete. Nell’aria rimane un odore di pietra umida.'));
   if(vista.stato.letti?.pianta)area.append(p('La disposizione degli ambienti non sembra corrispondere del tutto alla vecchia pianta.'));
   area.append(b('Entra nei servizi',()=>window.Servizi.entra()),b('Torna alla sala dei manoscritti',()=>invia('manoscritti')),b('Torna alla sala di lettura',()=>invia('lettura')));
  }else{
   area.append(p('Qui non ci sono soltanto libri: fascicoli, registri e fogli ripiegati occupano gli scaffali. Alcuni recano annotazioni di mani diverse, aggiunte a distanza di anni.'),p('Su un leggio trovi un catalogo antico. Una catena lo lega al mobile: qualcuno ha preferito non affidarsi alla buona memoria dei lettori. Puoi sfogliarlo, ma non portarlo via.'));
   const elenco=document.createElement('ul');elenco.className='documenti-manoscritti';
   for(const d of vista.documenti){const li=document.createElement('li'),e=b(d.titolo,()=>invia('documento',d.id));e.dataset.documento=d.id;li.append(e);if(vista.stato.letti?.[d.id]){const s=document.createElement('span');s.textContent='Letto';li.append(s)}elenco.append(li)}
   area.append(elenco,b('Imbocca il corridoio dei servizi',()=>invia('corridoio')),b('Torna alla sala di lettura',()=>invia('lettura')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++versione,d=api.dati;
  if(!d||![3,4].includes(d.giorno_corrente)||!['g3_manoscritti','g3_corridoio'].includes(d.stato_partita?.fase)){vista=null;area.hidden=true;if(pianta.open)pianta.close();return}
  try{const r=await api.rpc('gioco_manoscritti',{p_codice:api.codice});if(n!==versione)return;vista=r;disegna()}
  catch(e){if(n!==versione)return;area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare la sala',aggiorna))}
 }
 
 window.Manoscritti={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
