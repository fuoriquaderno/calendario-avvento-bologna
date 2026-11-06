(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno6';area.hidden=true;main.append(area);
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);
 img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 let busy=false,versione=0,racconto=null,chiaveRacconto=null,erroreLettura='',bozzaDove='',bozzaIndice='';
 const immagini={locanda_risveglio:'locanda.png',osteria_sole:'locanda.png',piazza_maggiore:'piazza_maggiore.png',mercato:'mercato.png',biblioteca:'biblioteca.png',san_domenico:'san_domenico.png'};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const link=(t,url)=>{const e=document.createElement('a');e.textContent=t;e.href=url;e.target='_blank';e.rel='noopener noreferrer';return e};
 async function invia(azione,testo=null){
  if(busy)return;busy=true;
  try{
   const r=await window.BorsaNuova.esegui('gioco_giorno6',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
   if(r?.lettura)window.Messaggi.mostra({...r.lettura,pulsante:'Continua'});
   if(r&&azione==='cerca')bozzaDove='';if(r&&azione==='ricerca')bozzaIndice='';
  }finally{busy=false;disegna()}
 }
 function campo(azione){
  const indice=azione==='ricerca',form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');
  const id=indice?'ricerca-grande-indice':'destinazione-giorno6';
  form.className=indice?'ricerca-grande-indice':'destinazione-giorno6';label.htmlFor=id;label.textContent=indice?'Che cosa scrivi sulla pergamena?':'Dove vuoi cercare?';
  input.id=id;input.type='text';input.maxLength=300;input.required=true;input.autocomplete='off';input.value=indice?bozzaIndice:bozzaDove;input.disabled=busy;
  input.addEventListener('input',()=>{if(indice)bozzaIndice=input.value;else bozzaDove=input.value});
  const invio=b(indice?'Interroga il Grande Indice':'Vai a cercare',()=>{});invio.type='submit';form.append(label,input,invio);
  form.addEventListener('submit',e=>{e.preventDefault();if(!busy&&input.value.trim())invia(azione,input.value.trim())});area.append(form);
 }
 function appunti(g){
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Rileggi ciò che hai raccolto';details.append(summary,b('Rileggi il passo del diario',()=>invia('diario')));
  if(g.nomi)details.append(b('Rileggi i nomi dei maestri',()=>invia('rileggi_nomi')));
  if(g.passante)details.append(link('Consulta il Grande Indice fuori dal gioco','https://www.google.com/'));
  area.append(details);
 }
 function social(g){
  if((g.tentativi||0)+(g.errori_indice||0)<3)return;
  const box=document.createElement('div');box.className='aiuto-giorno6';box.append(b('Rileggi i particolari della ricerca',()=>invia('aiuto')),p('Sulle pagine degli Spisotti trovi un indizio la mattina del 6 dicembre e la soluzione in serata. Attenzione: la soluzione contiene spoiler.'),link('Facebook','https://www.facebook.com/profile.php?id=61594558125926'),link('Instagram','https://www.instagram.com/glispisotti/'));area.append(box);
 }
 function opzioniIndagine(d,g){
  if(['locanda_risveglio','osteria_sole'].includes(d.luogo_attuale)){
   if(!g.studenti)area.append(p('Due gruppi di studenti discutono a un tavolo. Non sembrano affatto d’accordo.'),b('Ascolta la discussione fra gli studenti',()=>invia('studenti')));
   else if(!g.nomi)area.append(b('Chiedi agli studenti di legge dei loro grandi maestri',()=>invia('maestri')));
  }
  if(['biblioteca','san_domenico'].includes(d.luogo_attuale)&&!g.biblioteca)area.append(b('Cerca un confronto fra i libri',()=>invia('biblioteca')));
  if(d.luogo_attuale==='san_francesco')area.append(b('Osserva i monumenti accanto alla chiesa',()=>invia('osserva')));
  if(d.luogo_attuale==='bottega_indice')area.append(b('Entra nella bottega e usa il Grande Indice',()=>invia('entra_indice')));
  else if(d.luogo_attuale!=='tombe_glossatori')area.append(b('Passeggia per la città',()=>invia('passeggia')));
  if(g.indice_conosciuto&&d.luogo_attuale!=='bottega_indice')area.append(b('Raggiungi la bottega di scrittura',()=>invia('vai_indice')));
  if(g.tombe_scoperte&&d.luogo_attuale!=='tombe_glossatori')area.append(b('Raggiungi il luogo individuato',()=>invia('vai_tombe')));
  area.append(b('Apri la mappa e i luoghi',()=>window.LuoghiGioco.apri()));
 }
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g6||{};
  const valida=d?.giorno_corrente===6&&!d.morto&&(f.startsWith('g6_')||f==='fine_giorno6');
  const piena=valida&&['g6_colazione','g6_dialogo','g6_abbaglio','g6_passante','g6_indice','g6_risultati','g6_tombe'].includes(f);
  main.classList.toggle('giorno6-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena&&immagini[d.luogo_attuale]){const src=api.risorsa('images/'+immagini[d.luogo_attuale]);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt='';area.append(figura)}
  const titolo=document.createElement('h2');titolo.textContent=f==='g6_colazione'?'Il sesto giorno':f==='fine_giorno6'?'Un luogo da esplorare con calma':racconto?.titolo||'Sulle tracce di Samuele';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();if(sospesa){area.append(p('Recupera il risultato prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);await aggiorna()}));return}
  if(f==='fine_giorno6'){area.append(p('Hai raggiunto le tombe dei glossatori, ma oggi non hai trovato una traccia di Samuele. Tornerai domani con più calma.'),b('Termina giornata',()=>window.FineGiornata.apri()));return}
  if(f==='g6_colazione'){
   if(d.luogo_attuale!=='locanda_risveglio'){area.append(p('Devi ancora decidere come cominciare la mattina.'),b('Torna alla locanda',()=>invia('torna_locanda')));return}
   area.append(p('Ti svegli alla locanda con le parole del diario ancora in mente. Al piano di sotto senti i primi clienti e il locandiere che prepara le scodelle.'),b('Fai colazione',()=>invia('colazione')),b('Esci subito',()=>invia('esci')));return;
  }
  if(racconto?.testo){const testo=p(racconto.testo);testo.setAttribute('role','status');area.append(testo)}
  if(erroreLettura){area.append(p(erroreLettura),b('Ricarica il racconto',aggiorna))}
  if(f==='g6_tombe'){area.append(b('Torna domani — termina il racconto di oggi',()=>invia('fine')));return}
  if(f==='g6_abbaglio')area.append(b('Riprendi a camminare',()=>invia('continua')));
  else if(f==='g6_passante'){
   area.append(link('Prova il Grande Indice fuori dal gioco','https://www.google.com/'));
   area.append(b('Chiedi se c’è un Grande Indice anche a Bologna',()=>invia('bottega')),b('Continua la ricerca per conto tuo',()=>invia('continua')));
  }else if(f==='g6_indice'||f==='g6_risultati'){
   if(f==='g6_indice')area.append(p('Nella bottega trovi una pergamena distesa e una penna. Il foglio è vuoto. Puoi scrivere ciò che vuoi cercare: la magia nuova proverà a risponderti.'));
   campo('ricerca');
   if(g.tombe_scoperte)area.append(b('Raggiungi il luogo trovato',()=>invia('vai_tombe')));
   area.append(b('Riprendi la ricerca in città',()=>invia('continua')));
  }else if(f==='g6_dialogo'){
   if(s.voce_g6==='studenti'&&!g.nomi)area.append(b('Chiedi agli studenti di legge dei loro grandi maestri',()=>invia('maestri')));
   if(s.voce_g6==='bottega')area.append(b('Raggiungi la bottega di scrittura',()=>invia('vai_indice')));
   if(g.tombe_scoperte)area.append(b('Raggiungi il luogo individuato',()=>invia('vai_tombe')));
   area.append(b('Riprendi la ricerca',()=>invia('continua')));
  }else{
   if(!g.in_cammino&&!g.studenti&&!g.biblioteca){
    if(s.colazione_g6==='pagata')area.append(p(s.colazione_ieri==='pagata'?'Paghi la colazione e lasci la locanda. Tutto sommato, di questi tempi una moneta d’argento per un pasto non è male.':'Finisci la colazione e ti alzi. Il locandiere ti ferma: «Una moneta d’argento. Non crederai che fosse offerta?» Paghi e lasci la locanda.'));
    area.append(p('Demetrio ricordava dei guizzi dorati sul viso di Samuele e un capostipite dei suoi «compagni di malalingua». Da dove vuoi cominciare?'));
   }
   opzioniIndagine(d,g);
  }
  campo('cerca');appunti(g);social(g);
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++versione,d=api.dati;
  if(d?.giorno_corrente!==6){racconto=null;chiaveRacconto=null;disegna();return}
  const voce=d.stato_partita?.voce_g6||'',key=api.codice+':'+d.tentativo+':'+voce;
  if(!voce){racconto=null;chiaveRacconto=key;erroreLettura='';disegna();return}
  if(key===chiaveRacconto){disegna();return}
  racconto=null;
  try{const r=await api.rpc('gioco_giorno6',{p_codice:api.codice});if(n!==versione)return;racconto=r.racconto;chiaveRacconto=key;erroreLettura=''}
  catch(e){if(n!==versione)return;erroreLettura=e.message}
  disegna();
 }
 window.GiornoSei={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
