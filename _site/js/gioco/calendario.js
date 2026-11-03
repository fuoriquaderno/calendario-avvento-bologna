// Le caselle mostrano lo stato del salvataggio; i passaggi di giornata sono sempre confermati dal server.
(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id),area=$('calendario-avvento');if(!area)return;
 const caselle=Array.from({length:25},(_,i)=>({n:i+1,pulsante:$('casella-'+(i+1)),stato:$('stato-casella-'+(i+1)),data:$('data-casella-'+(i+1))}));
 let calendario=null,caricamento=null,versione=0,busy=false;
 function dataGiorno(n){const d=new Date(calendario.inizio+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n-1);return {iso:d.toISOString().slice(0,10),testo:new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'long',timeZone:'Europe/Rome'}).format(d)}}
 function statoGiorno(n){
  if(!calendario)return {tipo:'caricamento',testo:'Da aprire',bloccato:true};
  const d=api.dati,corrente=d?.giorno_corrente||1;
  if(d&&(n<corrente||n===corrente&&d.giornata_completata))return {tipo:'conclusa',testo:'Conclusa',bloccato:false};
  if(d&&n===corrente)return {tipo:'in_corso',testo:d.morto?'Da riprendere':d.giornata_da_confermare?'Da confermare':'In corso',bloccato:false};
  if(n>calendario.giorni_aperti)return {tipo:'chiusa',testo:'Da aprire',bloccato:true};
  if(n>calendario.giorni||!calendario.giornate_configurate.includes(n))return {tipo:'non_pronta',testo:'In arrivo',bloccato:true};
  if(!d&&n===1||d?.giornata_completata&&n===corrente+1)return {tipo:'disponibile',testo:'Apri',bloccato:false};
  return {tipo:'vincolata',testo:'Da sbloccare',bloccato:true};
 }
 function disegna(){
  const d=api.dati;$('calendario-accesso').hidden=!!d;$('calendario-ripresa').hidden=!d;
  if(d){$('calendario-benvenuto').textContent=(d.nome?d.nome+', ':'')+(d.giornata_completata?`hai concluso la giornata ${d.giorno_corrente}.`:`la tua avventura ti aspetta alla giornata ${d.giorno_corrente}.`);$('calendario-continua').textContent=d.giornata_completata?'Torna alla storia':`Riprendi la giornata ${d.giorno_corrente}`}
  for(const c of caselle){
   const s=statoGiorno(c.n),p=c.pulsante;p.dataset.stato=s.tipo;p.disabled=busy||s.bloccato;p.setAttribute('aria-disabled',String(s.bloccato));c.stato.textContent=s.testo;
   if(s.bloccato)p.setAttribute('data-disabilitato','');else p.removeAttribute('data-disabilitato');
   if(s.tipo==='in_corso')p.setAttribute('aria-current','step');else p.removeAttribute('aria-current');
   let data='';if(calendario){const giorno=dataGiorno(c.n);c.data.textContent=giorno.testo;c.data.setAttribute('datetime',giorno.iso);data=', '+giorno.testo}
   const istruzione=s.tipo==='vincolata'?', completa prima le giornate precedenti':'';
   p.setAttribute('aria-label',`Giorno ${c.n}${data}: ${s.testo}${istruzione}`);
  }
 }
 async function carica(){
  if(calendario)return calendario;
  if(!caricamento)caricamento=api.rpc('gioco_calendario_avvento',{}).then(c=>{
   if(!c||!Number.isInteger(c.giorni)||!Number.isInteger(c.giorni_aperti)||!Array.isArray(c.giornate_configurate)||!/^\d{4}-\d{2}-\d{2}$/.test(c.inizio))throw Error('Calendario non disponibile');
   calendario=c;return c;
  }).finally(()=>{caricamento=null});
  return caricamento;
 }
 async function aggiorna(){
  const n=++versione;disegna();
  try{await carica();if(n!==versione)return;$('calendario-riprova').hidden=true;$('calendario-stato').textContent=api.dati?'Scegli la giornata da continuare.':calendario.giorni_aperti<1?'La prima casella si apre il '+dataGiorno(1).testo+'.':'La tua avventura comincia dalla casella 1.';disegna()}
  catch{if(n!==versione)return;$('calendario-stato').textContent='Non riesco a caricare le caselle. Riprova fra poco.';$('calendario-riprova').hidden=false}
 }
 async function apri(n){
  if(busy||statoGiorno(n).bloccato)return;
  if(statoGiorno(n).tipo==='conclusa'){window.Messaggi.mostra({titolo:`Giornata ${n} conclusa`,testo:'Hai già confermato questa giornata. Le sue scelte restano definitive; puoi continuare la tua avventura dalla casella in corso o dalla prossima disponibile.',pulsante:'Torna al calendario'});return}
  if(!api.dati||n===api.dati.giorno_corrente){window.location.assign(area.dataset.gioco);return}
  busy=true;disegna();
  try{await api.esegui(()=>api.iniziaGiornata(n),$('calendario-stato'));if(api.dati?.giorno_corrente===n)window.location.assign(area.dataset.gioco)}finally{busy=false;disegna()}
 }
 for(const c of caselle)c.pulsante.addEventListener('click',()=>apri(c.n));
 $('calendario-riprova').addEventListener('click',()=>{calendario=null;aggiorna()});
 $('form-riprendi-calendario').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;try{await api.esegui(()=>api.riprendi($('codice-calendario').value,{anima:false}),$('errore-calendario'))}finally{busy=false;disegna()}});
 window.CalendarioAvvento={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
