// Il favore della guardia: consegna e scelta facoltativa dopo la lettera.
(() => {
 'use strict';const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='missione-guardia';area.hidden=true;main.append(area);
 const nota=document.createElement('p'),ritira=document.createElement('button');nota.hidden=true;nota.id='borsa-lettera-guardia';ritira.type='button';ritira.hidden=true;ritira.textContent='Ritira il fazzoletto di Beatrice';$('borsa-elenco').before(nota,ritira);
 const illustrazione=document.createElement('figure');illustrazione.className='immagine-schermata';
 const immagine=document.createElement('img');immagine.src=api.risorsa('images/beatrice.png');immagine.alt='Beatrice davanti all’ingresso della sua casa, con abiti semplici.';immagine.decoding='async';
 immagine.addEventListener('error',()=>{illustrazione.hidden=true});immagine.addEventListener('load',()=>{illustrazione.hidden=false});illustrazione.append(immagine);
 let busy=false;
 const m=()=>api.dati?.interazioni?.missione_guardia||{};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 function disponibile(){const d=api.dati,s=m();return !!d&&!d.morto&&!d.giornata_completata&&d.giorno_corrente>=2&&d.giorno_corrente<=5&&(d.giorno_corrente>2||d.perquisizione?.conclusa)&&d.perquisizione?.favore_guardiano?.accettato&&!s.conclusa&&!d.interazioni?.missione_galeazzo?.attiva&&(!d.perquisizione.favore_guardiano.compiuto||s.consegnata)}
 async function invia(azione){
  if(busy)return;busy=true;
  try{
   const r=await window.BorsaNuova.esegui('gioco_missione_guardia',{p_codice:api.codice,p_azione:azione,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
   if(r?.missione?.dialogo)window.Messaggi.mostra({...r.missione.dialogo,pulsante:'Continua'});
   if(r&&azione==='indicazioni')window.Messaggi.mostra({titolo:'La casa di Beatrice',testo:r.partita.indicazioni_ricevute.casa_galluzzi.testo,pulsante:'Continua'});
  }finally{busy=false;aggiorna()}
 }
 function azioniLuogo(dest,vista){if(disponibile()&&!m().attiva&&!vista?.in_combattimento&&!vista?.ha_mappa&&!api.dati.indicazioni_ricevute?.casa_galluzzi)dest.append(b('Chiedi dove abita Beatrice dei Galluzzi',()=>invia('indicazioni')))}
 function aggiorna(){
  const d=api.dati,s=m(),attiva=!!s.attiva&&!d?.morto;
  main.classList.toggle('missione-guardia-attiva',attiva);area.hidden=!attiva;area.replaceChildren();
  nota.hidden=!d?.perquisizione?.favore_guardiano?.accettato;
  nota.textContent=s.consegnata||d?.perquisizione?.favore_guardiano?.compiuto?'Lettera della guardia: consegnata a Beatrice.':'Lettera della guardia: da consegnare a Beatrice dei Galluzzi entro il quinto giorno.';
  ritira.hidden=!s.premio_da_ritirare||d?.morto||d?.giornata_completata;ritira.disabled=busy;
  if(!attiva)return;
  area.append(illustrazione);
  const h=document.createElement('h2');h.textContent='Una lettera per Beatrice';area.append(h);
  const sospesa=window.BorsaNuova.pending();if(sospesa){area.append(p('Recupera il risultato prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(s.dialogo){const risposta=p(s.dialogo.testo);risposta.setAttribute('role','status');area.append(risposta)}
  if(s.tiro&&window.Dadi?.contestoAttivo('guardia')){area.append(p('Destrezza: provi a conquistare il favore di Beatrice.'));const a=document.createElement('div'),t=p('');a.className='dadi-area';window.Dadi.mostraRisultato(a,t,s.tiro,'guardia');area.append(a,t)}
  if(s.fase==='lettera'){
   area.append(p('Raggiungi la casa presso la corte dei Galluzzi. Una giovane donna adulta si affaccia all’ingresso. «Cercavi qualcuno?»'),p('È Beatrice, la destinataria della lettera che ti ha affidato la guardia di Porta Maggiore.'),b('Consegna la lettera della guardia',()=>invia('consegna')),b('Torna alla tua giornata — consegnerai la lettera più tardi',()=>invia('lascia')));
  }else if(s.fase==='dopo_lettera'){
   area.append(p('Hai consegnato la lettera e mantenuto la promessa. Potresti salutare e tornare alle tue faccende. Oppure potresti fermarti ancora un momento…'),b('Riprendi la giornata',()=>invia('lascia')),b('Prova a flirtare con Beatrice — tira il d20',()=>invia('flirta')));
  }else if(s.fase==='esito'){
   if(s.premio_da_ritirare)area.append(p('Il fazzoletto è tuo, ma la Borsa è piena. Libera un’unità di peso: potrai ritirarlo anche dalla Borsa.'),b('Prendi il fazzoletto ricamato',()=>invia('ritira')));
   else if(s.premio_ritirato)area.append(p('Hai riposto il fazzoletto ricamato nella Borsa. Potrebbe tornarti utile in un altro incontro.'));
   area.append(b('Riprendi la giornata',()=>invia('lascia')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 ritira.addEventListener('click',()=>invia('ritira'));
 window.MissioneGuardia={aggiorna,azioniLuogo,disponibile};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
