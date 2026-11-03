(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno2';area.hidden=true;
 document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,risposta=null){
  if(busy)return;busy=true;
  const r=await window.BorsaNuova.esegui('gioco_giorno2',{p_codice:api.codice,p_azione:azione,p_risposta:risposta,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
  busy=false;aggiorna();
  if(r?.suggerimento){window.Messaggi.mostra({titolo:'L’omino ricompare',testo:r.suggerimento,pulsante:'Torna alla pergamena'})}
  // Il racconto resta visibile: lo scontro si apre soltanto dal pulsante dedicato.
 }
 function aggiorna(){
  const d=api.dati,fase=d?.stato_partita?.fase;
  area.hidden=!d||d.giorno_corrente!==2||d.morto||!['ritorno_porta','indicazioni_giorno2','guardia_giorno2','scontro_guardie'].includes(fase);
  area.replaceChildren();if(area.hidden)return;
  const titolo=document.createElement('h2');titolo.textContent='Il secondo giorno';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('L’ultima azione deve essere recuperata prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna();if(r?.suggerimento){window.Messaggi.mostra({titolo:'L’omino ricompare',testo:r.suggerimento,pulsante:'Torna alla pergamena'})}}));return}
  if(fase==='ritorno_porta'){
   area.append(p('La mattina dopo torni a Porta Maggiore. Esattamente come il giorno prima, appena passi sotto il varco vieni risucchiato verso l’alto.'),p('Lo stesso omino che ti ha accolto ieri ti squadra ed esclama: «Eccone un altro con il pass speciale di Galeazzo». Intanto la penna traccia una linea sulla pergamena che galleggia accanto alla sua testa, cancellando probabilmente il tuo nome dalla lista.'),p('E, come ieri, sparisce all’istante, lasciandoti di nuovo davanti alla pergamena. Questa volta scrivi con sicurezza.'));
   const label=document.createElement('label');label.htmlFor='risposta-pergamena-giorno2';label.textContent='Cosa scrivi sulla pergamena?';
   const input=document.createElement('input');input.id='risposta-pergamena-giorno2';input.type='text';input.autocomplete='off';input.disabled=busy;
   const avanti=b('Traccia le lettere',()=>{if(input.value.trim())return invia('rispondi',input.value);input.focus()});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();avanti.click()}});
   area.append(label,input,avanti);
   const n=d.stato_partita.errori_pergamena||0;
   if(n)area.append(p(n>=4?'L’omino ti ha dettato la risposta: devi scrivere stanza delle richieste!':'L’inchiostro evapora. La pergamena resta vuota.'));
  }else if(fase==='indicazioni_giorno2'){
   area.append(p('La pergamena assorbe le lettere. Al loro posto compare una freccia, seguita da poche indicazioni: «Segui il corridoio fino in fondo. Stanza delle Richieste». Ieri sembrava tutto più complicato.'),b('Raggiungi la Stanza delle Richieste',()=>invia('raggiungi')));
  }else if(fase==='guardia_giorno2'){
   area.append(p('Ti rechi alla Stanza delle Richieste. Davanti a te c’è una guardia svogliata che, senza neanche alzare lo sguardo, ti indica un tavolo.'),p('«Poggia lì quello che hai. Per decreto del podestà Giorgione puoi portare al massimo cinque oggetti».'));
   const h=document.createElement('h3');h.textContent='Cosa fai?';area.append(h,b('Poggi i tuoi oggetti sul tavolo',()=>invia('tavolo')),b('Attacchi la guardia',()=>invia('attacca')));
  }else{
   area.append(p('La guardia si raddrizza di scatto e chiama i compagni. In un attimo ne arrivano altre sette: ora ti trovi circondato da otto guardie armate.'),p('Dopo ogni tua azione attacca ciascuna guardia ancora in piedi. Poi tocca di nuovo a te.'));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 
 window.GiornoDue={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
