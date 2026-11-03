(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='servizi-biblioteca';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 function mostra(r){if(!r?.lettura)return;window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Continua a esplorare'})}
 async function invia(azione){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_servizi',{p_codice:api.codice,p_azione:azione,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});mostra(r)}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase,s=d?.stato_partita?.servizi||{};area.replaceChildren();
  area.hidden=!d||![3,4].includes(d.giorno_corrente)||d.morto||!['g3_servizi','g3_passaggio','g4_passaggio'].includes(f);if(area.hidden)return;
  const titolo=document.createElement('h2');titolo.textContent=['g3_passaggio','g4_passaggio'].includes(f)?'Uno scatto nel muro':'I servizi';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);mostra(r);aggiorna()}));return}
  if(d.luogo_attuale!=='biblioteca'){area.append(p('Puoi riprendere l’esplorazione dei servizi nella biblioteca.'),b('Torna alla biblioteca',()=>invia('torna')));return}
  if(f==='g4_passaggio'){
   area.append(p('Premi la pietra che hai individuato ieri. Sotto il pavimento senti muoversi la leva, poi il fermo sulla parete destra si ritrae. Il passaggio si apre di nuovo.'),p('Stavolta non arriva nessun richiamo dal corridoio. Puoi finalmente vedere che cosa c’è dall’altra parte.'),b('Varca il passaggio',()=>window.GiornoQuattro.entra()),b('Torna nei servizi',()=>window.GiornoQuattro.servizi()));
  }else if(f==='g3_passaggio'){
   area.append(p('La pietra rientra di poco. Sotto i piedi senti muoversi qualcosa, poi un fermo scatta dall’altro lato della stanza. La pietra sporgente si ritrae e una parte della parete destra si apre appena.'),p('Lo spiffero si fa più forte. Oltre la fessura distingui soltanto buio.'),p('Stai per avvicinarti quando dal corridoio arriva la voce del bibliotecario: «Si chiude! Anche per chi si è perso nei servizi!»'),p('Lasci che il meccanismo torni in posizione. Ora sai dove si trova l’accesso e come aprirlo. Per vedere che cosa nasconde dovrai tornare domani.'),b('Esci dalla biblioteca',()=>invia('esci')));
  }else{
   area.append(p('Entri nei servizi. Uno spiffero d’aria ti sfiora il viso: sembra venire dalla parete destra. Ti avvicini, ma a prima vista non noti aperture.'),p('Vicino al pavimento, una piccola pietra sporge dal muro. Il resto della stanza sembra spoglio.'));
   const opzioni=[['sporgente','Prova a spingere la pietra sporgente'],['destra','Esamina la parete destra'],['pavimento','Osserva il pavimento'],['opposta','Esamina la parete opposta']];
   for(const [id,testo] of opzioni){const e=b(testo+(s[id]?' · Già osservato':''),()=>invia(id));e.dataset.ispezione=id;area.append(e)}
   if(s.opposta){area.append(p('Sulla parete opposta hai individuato una pietra quasi a filo del muro, con i bordi consumati.'),b('Premi la pietra dai bordi consumati',()=>invia('premi')))}
   area.append(b('Torna nel corridoio',()=>invia('corridoio')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 
 window.Servizi={entra:()=>invia('entra'),aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
