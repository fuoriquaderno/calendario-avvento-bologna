(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno4';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,personaggio=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_giorno4',{p_codice:api.codice,p_azione:azione,p_personaggio:personaggio,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r?.lettura){window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Continua'})}}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase;area.replaceChildren();area.hidden=!d||d.giorno_corrente!==4||d.morto||!['g4_colazione','g4_strada'].includes(f);if(area.hidden)return;
  if(f==='g4_strada'&&['armaiolo','bottega_preziosi','speziale'].includes(d.luogo_attuale)){area.hidden=true;return}
  const titolo=document.createElement('h2');titolo.textContent=f==='g4_colazione'?'Il quarto giorno':f==='g4_nascosta'?'La stanza nascosta':'La mattina in città';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(f==='g4_colazione'){
   if(d.luogo_attuale!=='locanda_risveglio'){area.append(p('Devi ancora decidere come cominciare la mattina.'),b('Torna alla locanda',()=>invia('torna')));return}
   area.append(p('Ti svegli nella stessa stanza. Il letto non è migliorato durante la notte, ma almeno questa volta sai che cosa aspettarti.'),p('Al piano di sotto il locandiere sta preparando i tavoli. Ti vede e indica una scodella.'),p('«Colazione? Siediti, che è pronta. Se invece hai fretta, la porta è sempre quella.»'));
   const colazione=b('Fai colazione',()=>invia('colazione'));colazione.disabled=busy;area.append(colazione,b('Esci',()=>invia('esci')));

  }else if(f==='g4_strada'){
   if(d.stato_partita.colazione_g4==='pagata')area.append(p('Finisci la colazione e ti alzi. Il locandiere ti ferma: «Una moneta d’argento. Non crederai che fosse offerta?» Paghi e lasci la locanda. La città ha già cominciato la propria giornata.'));
   else area.append(p('Lasci la locanda senza ordinare e ti ritrovi fra le vie della città.'));
   area.append(p('Ripensi a ciò che hai scoperto ieri. Dove vuoi andare?'),b('Scegli dove andare',()=>window.LuoghiGioco.apri()),b('Chiedi un parere a un passante',()=>invia('passante')));
   if(['san_domenico','biblioteca'].includes(d.luogo_attuale))area.append(b('Entra nella biblioteca',()=>invia('biblioteca')));
  }else{
   if(d.luogo_attuale!=='sala_consiglio'){area.append(p('Puoi tornare al passaggio che hai appena attraversato.'),b('Riprendi l’esplorazione',()=>invia('torna')));return}
   area.append(p('Oltrepassi l’apertura e ti fermi sulla soglia della stanza. Il corridoio dei servizi rimane alle tue spalle.'),p('Da qui proseguirà la nuova esplorazione. Il contenuto della stanza è ancora da definire.'),b('Torna nei servizi',()=>invia('servizi')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 
 window.GiornoQuattro={aggiorna,parla:id=>invia('parla',id),entra:()=>invia('entra_nascosta'),servizi:()=>invia('servizi')};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
