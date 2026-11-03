(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const mappaUrl=api.risorsa('images/mappa-bologna.png');
 let dati=null,richiesta=0,busy=false,owner=null,informatore=null;
 const pulsante=document.createElement('button');pulsante.type='button';pulsante.textContent='Luoghi conosciuti';pulsante.id='apri-luoghi';pulsante.hidden=true;
 const apriMappa=document.createElement('button');apriMappa.type='button';apriMappa.textContent='Apri la mappa di Bologna';apriMappa.id='apri-mappa-bologna';apriMappa.hidden=true;
 $('borsa-elenco').before(pulsante);pulsante.after(apriMappa);
 const scena=document.createElement('section');scena.id='esplorazione-citta';scena.hidden=true;
 const titolo=document.createElement('h2'),descrizione=document.createElement('p'),persone=document.createElement('div'),stato=document.createElement('p');stato.setAttribute('role','status');
 scena.append(titolo,descrizione,persone,stato);if($('schermata-gioco'))document.querySelector('main .scroll-middle').append(scena);
 const elenco=document.createElement('dialog');elenco.className='avviso-codice luoghi-dialog';elenco.setAttribute('aria-labelledby','titolo-luoghi');
 elenco.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-luoghi">Luoghi conosciuti</h2><p id="regole-luoghi"></p><div id="elenco-luoghi"></div><p id="stato-elenco-luoghi" role="status"></p><button type="button" id="chiudi-luoghi">Chiudi</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(elenco);
 const indicazioni=document.createElement('dialog');indicazioni.className='avviso-codice luoghi-dialog';indicazioni.setAttribute('aria-labelledby','titolo-indicazioni');
 indicazioni.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-indicazioni">Chiedi indicazioni</h2><div id="destinazioni-indicazioni"></div><p id="testo-indicazioni" aria-live="polite"></p><div id="segui-indicazioni"></div><p id="stato-indicazioni" role="status"></p><button type="button" id="chiudi-indicazioni">Chiudi</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(indicazioni);
 const mappa=document.createElement('dialog');mappa.className='mappa-dialog';mappa.setAttribute('aria-labelledby','titolo-mappa');
 mappa.innerHTML='<h2 id="titolo-mappa">Mappa di Bologna</h2><div id="superficie-mappa"><img id="immagine-mappa" alt="Mappa illustrata di Bologna con Piazza Maggiore, San Francesco, Porta Maggiore, Osteria del Sole e le tre botteghe."></div><div id="comandi-mappa"></div><div id="destinazioni-mappa"></div><button type="button" id="chiudi-mappa">Chiudi mappa</button>';
 document.body.append(mappa);
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.addEventListener('click',f);return e}
 function bloccato(){return busy||!dati||dati.partita.morto||dati.in_combattimento}
 function lista(destinazione){
   destinazione.replaceChildren();
   if(!dati)return;
   for(const l of dati.luoghi){
     const voce=document.createElement('div');voce.className='luogo-conosciuto';
     const label=l.visitato?'Visitato':l.riferimento?'Riferimento conosciuto':l.indicazione?'Indicazioni ricevute':'Segnato sulla mappa';
     voce.append(p(l.nome+' · '+label));
     const vai=b(l.id===dati.corrente.id?'Sei qui':'Raggiungi '+l.nome,()=>muovi(l.id));vai.disabled=bloccato()||!l.raggiungibile||l.id===dati.corrente.id;voce.append(vai);
     if(l.indicazione)voce.append(b('Rileggi le indicazioni',()=>{apriIndicazioni();$('testo-indicazioni').textContent=l.indicazione.testo;$('segui-indicazioni').replaceChildren(b('Segui le indicazioni',()=>muovi(l.id)))}));
     destinazione.append(voce);
   }
 }
 function disegna(){
   pulsante.hidden=!api.dati;apriMappa.hidden=!dati?.ha_mappa;
   scena.hidden=!dati||!$('schermata-gioco')||dati.partita.morto||([3,4].includes(dati.partita.giorno_corrente)&&String(dati.partita.stato_partita?.fase||'').startsWith('g3_'))||(dati.partita.giorno_corrente===4&&['g4_colazione','g4_passaggio','g4_nascosta','g4_esplora','g4_fantasma','g4_dopocustode'].includes(dati.partita.stato_partita?.fase))||(dati.partita.giorno_corrente===2&&['ritorno_porta','indicazioni_giorno2','guardia_giorno2','scontro_guardie'].includes(dati.partita.stato_partita?.fase));
   if(!dati)return;
   titolo.textContent=dati.corrente.nome;descrizione.textContent=dati.corrente.descrizione;persone.replaceChildren();
   if(!dati.ingresso_completato)persone.append(p('Puoi chiedere indicazioni. Per entrare in città devi prima concludere la perquisizione.'));
   if(dati.in_combattimento)persone.append(p('Termina il combattimento prima di spostarti o chiedere indicazioni.'));
   for(const n of dati.informatori){const e=b((api.dati.giorno_corrente===4?'Parla con ':'Chiedi indicazioni a ')+n.nome,()=>api.dati.giorno_corrente===4?window.GiornoQuattro.parla(n.id):apriIndicazioni(n));e.disabled=bloccato();persone.append(e)}
   if(dati.ingresso_completato)persone.append(b('Apri i luoghi conosciuti',apriElenco));if(dati.partita.giorno_corrente===3&&dati.partita.stato_partita?.fase==='fine_giorno3'&&!['armaiolo','bottega_preziosi','speziale'].includes(dati.partita.luogo_attuale))persone.append(p('Per oggi qui non trovi altri incontri o novità. Puoi continuare la passeggiata, visitare le botteghe oppure terminare la giornata dalla Borsa.'));
   $('regole-luoghi').textContent=dati.ha_mappa?'Puoi orientarti con la mappa e raggiungere i luoghi segnati.':'Conosci già Porta Maggiore, San Francesco e Piazza Maggiore. Per gli altri luoghi chiedi indicazioni: una volta scoperti rimangono nell’elenco.';
   lista($('elenco-luoghi'));if(mappa.open)lista($('destinazioni-mappa'));
 }
 async function aggiorna(){
   const n=++richiesta;if(owner!==api.codice){dati=null;owner=api.codice}
   if(!api.dati){scena.hidden=true;pulsante.hidden=true;apriMappa.hidden=true;return}
   try{const r=await api.rpc('gioco_luoghi',{p_codice:api.codice});if(n!==richiesta)return;dati=r;disegna()}
   catch(e){stato.textContent=e.message}
 }
 async function apriElenco(){
   $('inventario').close();await aggiorna();if(!dati)return;if(!elenco.open)elenco.showModal();
 }
 function apriIndicazioni(n=null){
   informatore=n;$('destinazioni-indicazioni').replaceChildren();$('segui-indicazioni').replaceChildren();$('testo-indicazioni').textContent='';$('stato-indicazioni').textContent='';
   $('titolo-indicazioni').textContent=n?'Indicazioni da '+n.nome:'Indicazioni ricevute';
   if(n)for(const d of dati.destinazioni){const e=b('Come raggiungo '+d.nome+'?',()=>chiedi(n,d.id));e.disabled=bloccato();$('destinazioni-indicazioni').append(e)}
   if(!indicazioni.open)indicazioni.showModal();
 }
 async function chiedi(n,id){
   if(bloccato())return;busy=true;
   await api.esegui(async()=>{
     const r=await api.rpc('gioco_luoghi',{p_codice:api.codice,p_azione:'chiedi',p_destinazione:id,p_informatore:n.id,p_tentativo:api.dati.tentativo});
     await api.applica(r.partita,api.codice,{anima:false});$('testo-indicazioni').textContent=r.indicazione.testo;
     $('segui-indicazioni').replaceChildren(b('Segui le indicazioni',()=>muovi(id)));
   },$('stato-indicazioni'));
   busy=false;
 }
 async function muovi(id){
   if(bloccato())return;busy=true;
   await api.esegui(async()=>{
     const r=await api.rpc('gioco_luoghi',{p_codice:api.codice,p_azione:'vai',p_destinazione:id,p_tentativo:api.dati.tentativo});
     elenco.close();indicazioni.close();mappa.close();$('inventario').close();
     await api.applica(r.partita,api.codice,{anima:true});
     if(!$('schermata-gioco')){const home=$('borsa-vai-al-gioco');if(home?.href)window.location.assign(home.href)}
   },indicazioni.open?$('stato-indicazioni'):elenco.open?$('stato-elenco-luoghi'):stato);
   busy=false;disegna();
 }
 let zoom=100;
 function dimensione(){const img=$('immagine-mappa');img.style.width=zoom+'%';img.style.maxWidth='none'}
 $('comandi-mappa').append(b('Zoom +',()=>{zoom=Math.min(300,zoom+50);dimensione()}),b('Zoom −',()=>{zoom=Math.max(100,zoom-50);dimensione()}));
 apriMappa.addEventListener('click',async()=>{
   await aggiorna();if(!dati?.ha_mappa)return;$('inventario').close();zoom=100;dimensione();$('immagine-mappa').src=mappaUrl;lista($('destinazioni-mappa'));if(!mappa.open)mappa.showModal();
 });
 pulsante.addEventListener('click',apriElenco);
 $('chiudi-luoghi').addEventListener('click',()=>elenco.close());$('chiudi-indicazioni').addEventListener('click',()=>indicazioni.close());$('chiudi-mappa').addEventListener('click',()=>mappa.close());
 for(const d of [elenco,indicazioni,mappa])d.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 
 window.LuoghiGioco={aggiorna,apri:apriElenco};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
