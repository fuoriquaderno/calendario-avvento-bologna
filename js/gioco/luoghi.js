(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const mappaUrl=api.risorsa('images/mappa-bologna-senza-nomi.png');
 let dati=null,richiesta=0,busy=false,owner=null,informatore=null;
 const pulsante=document.createElement('button');pulsante.type='button';pulsante.textContent='Mappa e luoghi';pulsante.id='apri-luoghi';pulsante.hidden=true;
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
 mappa.innerHTML='<h2 id="titolo-mappa">Bologna</h2><p id="regole-mappa"></p><div class="strumenti-mappa"><div id="comandi-mappa"></div><span id="scala-mappa" aria-live="polite">100%</span></div><div class="contenuto-mappa"><div id="superficie-mappa" tabindex="0" role="region" aria-label="Mappa scorrevole di Bologna"><div id="piano-mappa"><img id="immagine-mappa" alt="Veduta illustrata di Bologna senza etichette." draggable="false"><div id="punti-mappa"></div></div></div><aside id="scheda-luogo-mappa" aria-live="polite"></aside></div><div id="altri-luoghi-mappa"></div><div id="azioni-mappa"></div><p id="stato-mappa" role="status"></p><button type="button" id="chiudi-mappa">Chiudi mappa</button>';
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
   pulsante.hidden=!api.dati;apriMappa.hidden=true;
   scena.hidden=(dati?.partita.giorno_corrente===5&&String(dati.partita.stato_partita?.fase||'').startsWith('g5_')&&(dati.partita.stato_partita.fase==='g5_colazione'||dati.partita.luogo_attuale==='torre_demetrio'))||!dati||!$('schermata-gioco')||dati.partita.morto||([3,4].includes(dati.partita.giorno_corrente)&&String(dati.partita.stato_partita?.fase||'').startsWith('g3_'))||(dati.partita.giorno_corrente===4&&['g4_colazione','g4_passaggio','g4_nascosta','g4_esplora','g4_fantasma','g4_dopocustode'].includes(dati.partita.stato_partita?.fase))||(dati.partita.giorno_corrente===2&&['ritorno_porta','indicazioni_giorno2','guardia_giorno2','scontro_guardie'].includes(dati.partita.stato_partita?.fase));
   if(!dati)return;
   titolo.textContent=dati.corrente.nome;descrizione.textContent=dati.corrente.descrizione;persone.replaceChildren();
   if(!dati.ingresso_completato)persone.append(p('Puoi chiedere indicazioni. Per entrare in città devi prima concludere la perquisizione.'));
   if(dati.in_combattimento)persone.append(p('Termina il combattimento prima di spostarti o chiedere indicazioni.'));
   for(const n of dati.informatori){const e=b((api.dati.giorno_corrente===4?'Parla con ':'Chiedi indicazioni a ')+n.nome,()=>api.dati.giorno_corrente===4?window.GiornoQuattro.parla(n.id):apriIndicazioni(n));e.disabled=bloccato();persone.append(e)}
   if(dati.ingresso_completato)persone.append(b('Apri la mappa e i luoghi',apriElenco));if(dati.partita.giorno_corrente===3&&dati.partita.stato_partita?.fase==='fine_giorno3'&&!['armaiolo','bottega_preziosi','speziale'].includes(dati.partita.luogo_attuale))persone.append(p('Per oggi qui non trovi altri incontri o novità. Puoi continuare la passeggiata, visitare le botteghe oppure terminare la giornata dalla Borsa.'));
   window.MissioneGaleazzo?.azioniLuogo(persone,dati);window.MissioneGuardia?.azioniLuogo(persone,dati);
   $('regole-luoghi').textContent=dati.ha_mappa?'Puoi orientarti con la mappa e raggiungere i luoghi segnati.':'Conosci già Porta Maggiore, San Francesco e Piazza Maggiore. Per gli altri luoghi chiedi indicazioni: una volta scoperti rimangono nell’elenco.';
   lista($('elenco-luoghi'));window.MissioneGaleazzo?.azioniLuogo($('elenco-luoghi'),dati);window.MissioneGuardia?.azioniLuogo($('elenco-luoghi'),dati);if(mappa.open)disegnaMappa();
 }
 async function aggiorna(){
   const n=++richiesta;if(owner!==api.codice){dati=null;owner=api.codice}
   if(!api.dati){if(mappa.open)mappa.close();scena.hidden=true;pulsante.hidden=true;apriMappa.hidden=true;return}
   try{const r=await api.rpc('gioco_luoghi',{p_codice:api.codice});if(n!==richiesta)return;dati=r;disegna()}
   catch(e){stato.textContent=e.message}
 }
 async function apriElenco(){return apriCartina()}

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
   },indicazioni.open?$('stato-indicazioni'):mappa.open?$('stato-mappa'):elenco.open?$('stato-elenco-luoghi'):stato);
   busy=false;disegna();
 }
 let zoom=1,selezionati=[],trascinamento=null;
 const viewport=$('superficie-mappa'),piano=$('piano-mappa'),punti=$('punti-mappa'),scheda=$('scheda-luogo-mappa');
 function schedaLuogo(l){
  selezionati=[l.id];scheda.replaceChildren();
  const h=document.createElement('h3');h.textContent=l.nome;
  const corrente=l.id===dati.corrente.id;
  const vai=b(corrente?'Sei qui':'Raggiungi',()=>muovi(l.id));vai.disabled=bloccato()||!l.raggiungibile||corrente;
  if(vai.disabled)vai.setAttribute('data-disabilitato','');
  scheda.append(h,p(corrente?'Ti trovi qui.':l.visitato?'Hai già visitato questo luogo.':l.indicazione?'Sai come raggiungerlo.':'Segnato sulla tua mappa.'),vai);
  if(l.indicazione)scheda.append(b('Rileggi le indicazioni',()=>{apriIndicazioni();$('testo-indicazioni').textContent=l.indicazione.testo}));
 }
 function scegliGruppo(gruppo){
  if(gruppo.length===1){schedaLuogo(gruppo[0]);return}
  selezionati=gruppo.map(l=>l.id);scheda.replaceChildren(p('In questa zona ci sono più luoghi. Quale vuoi raggiungere?'));
  for(const l of gruppo)scheda.append(b(l.nome+(l.id===dati.corrente.id?' · Sei qui':''),()=>schedaLuogo(l)));
 }
 function disegnaMappa(){
  if(!dati)return;
  $('regole-mappa').textContent=dati.ha_mappa?'La mappa mostra i luoghi pubblici e quelli che hai scoperto. I luoghi segreti restano nascosti.':'Non hai la mappa nella Borsa: riconosci soltanto i riferimenti sicuri e i luoghi già conosciuti.';
  punti.replaceChildren();const gruppi=[],larghezza=piano.clientWidth||900;
  for(const l of dati.luoghi){
   const x=Number(l.mappa_x),y=Number(l.mappa_y);
   if(l.mappa_x==null||l.mappa_y==null||!Number.isFinite(x)||!Number.isFinite(y))continue;
   const vicino=gruppi.find(g=>Math.hypot((x-g.x)*larghezza/100,(y-g.y)*larghezza*2/300)<42);
   if(vicino)vicino.luoghi.push(l);else gruppi.push({x,y,luoghi:[l]});
  }
  for(const g of gruppi){
   const nomi=g.luoghi.map(l=>l.nome).join(', '),comando=b('',()=>scegliGruppo(g.luoghi));
   comando.className='punto-mappa';comando.style.left=g.x+'%';comando.style.top=g.y+'%';
   comando.setAttribute('aria-label',g.luoghi.length>1?g.luoghi.length+' luoghi: '+nomi:nomi);comando.title=nomi;
   if(g.luoghi.some(l=>l.id===dati.corrente.id)){comando.classList.add('punto-mappa-attuale');comando.setAttribute('aria-current','location')}
   const simbolo=document.createElement('span');simbolo.className='punto-mappa-simbolo';simbolo.textContent=g.luoghi.length>1?String(g.luoghi.length):'●';simbolo.setAttribute('aria-hidden','true');
   const nome=document.createElement('span');nome.className='punto-mappa-nome';nome.textContent=g.luoghi.length>1?'Più luoghi':nomi;comando.append(simbolo,nome);punti.append(comando);
  }
  const extra=dati.luoghi.filter(l=>l.mappa_x==null||l.mappa_y==null);
  $('altri-luoghi-mappa').replaceChildren();
  if(extra.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Altri luoghi conosciuti';details.append(summary);for(const l of extra)details.append(b(l.nome,()=>schedaLuogo(l)));$('altri-luoghi-mappa').append(details)}
  const validi=dati.luoghi.filter(l=>selezionati.includes(l.id));
  if(validi.length===1)schedaLuogo(validi[0]);else if(validi.length>1)scegliGruppo(validi);else{selezionati=[];scheda.replaceChildren(p('Tocca un punto per leggere il nome e scegliere se raggiungerlo.'))}
  const azioni=$('azioni-mappa');azioni.replaceChildren();window.MissioneGaleazzo?.azioniLuogo(azioni,dati);window.MissioneGuardia?.azioniLuogo(azioni,dati);
 }
 function dimensione(nuovo){
  const centroX=(viewport.scrollLeft+viewport.clientWidth/2)/zoom,centroY=(viewport.scrollTop+viewport.clientHeight/2)/zoom;
  zoom=Math.min(4,Math.max(1,nuovo));piano.style.width=(zoom*100)+'%';
  viewport.scrollLeft=centroX*zoom-viewport.clientWidth/2;viewport.scrollTop=centroY*zoom-viewport.clientHeight/2;
  $('scala-mappa').textContent=Math.round(zoom*100)+'%';disegnaMappa();
 }
 async function apriCartina(){
  $('inventario').close();await aggiorna();if(!dati)return;
  selezionati=[];piano.style.width='100%';zoom=1;$('scala-mappa').textContent='100%';$('immagine-mappa').src=mappaUrl;
  if(!mappa.open)mappa.showModal();viewport.scrollLeft=0;viewport.scrollTop=0;disegnaMappa();
 }
 $('comandi-mappa').append(b('−',()=>dimensione(zoom-.5)),b('Intera mappa',()=>dimensione(1)),b('+',()=>dimensione(zoom+.5)));
 $('comandi-mappa').children[0].setAttribute('aria-label','Riduci la mappa');$('comandi-mappa').children[2].setAttribute('aria-label','Ingrandisci la mappa');
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button'))return;trascinamento={x:e.clientX,y:e.clientY,sx:viewport.scrollLeft,sy:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('trascina-mappa')});
 viewport.addEventListener('pointermove',e=>{if(!trascinamento)return;viewport.scrollLeft=trascinamento.sx-e.clientX+trascinamento.x;viewport.scrollTop=trascinamento.sy-e.clientY+trascinamento.y});
 function fineTrascinamento(){trascinamento=null;viewport.classList.remove('trascina-mappa')}
 viewport.addEventListener('pointerup',fineTrascinamento);viewport.addEventListener('pointercancel',fineTrascinamento);viewport.addEventListener('lostpointercapture',fineTrascinamento);
 window.addEventListener('resize',()=>{if(mappa.open)disegnaMappa()});
 apriMappa.addEventListener('click',apriCartina);

 pulsante.addEventListener('click',apriElenco);
 $('chiudi-luoghi').addEventListener('click',()=>elenco.close());$('chiudi-indicazioni').addEventListener('click',()=>indicazioni.close());$('chiudi-mappa').addEventListener('click',()=>mappa.close());
 for(const d of [elenco,indicazioni,mappa])d.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 
 window.LuoghiGioco={aggiorna,apri:apriElenco};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
