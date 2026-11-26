(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno11';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0;const risposte={diego:'',rodrigo:'',alonso:''};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 const libri=[['stelle','De motu stellarum · latino'],['mercanti','Libro di mercatantie · volgare italiano'],['campi','De las medidas de los campos · castigliano'],['euclide','Elementa — Euclide · latino'],['erbe','Von Kräutern und Wurzeln · tedesco'],['abaci','Liber abaci — Leonardo Pisano · latino'],['uccelli','De natura avium · latino'],['salute','Regimiento de la salud · castigliano'],['acque','Delle acque e dei canali · volgare italiano'],['stagioni','Des saisons et des semailles · francese']];
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno11',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r)risposta(r);else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 function mappa(){window.LuoghiGioco.apri()}
 function illustrazione(nome,alt){const src=api.risorsa('images/'+nome);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function enigma(g){
  area.append(p('«Uno di noi dice sempre la verità, uno mente sempre e uno a volte dice il vero, a volte mente. Se capisci chi siamo, ti indicheremo la biblioteca.»'));
  const frasi=document.createElement('div');frasi.className='frasi-studenti';
  for(const t of ['Diego: «Rodrigo è quello che a volte mente e a volte dice la verità.»','Rodrigo: «Alonso mente sempre.»','Alonso: «Diego dice sempre la verità.»'])frasi.append(p(t));area.append(frasi);
  const form=document.createElement('form');form.className='ruoli-studenti';const selects=[];
  for(const [id,nome] of [['diego','Diego'],['rodrigo','Rodrigo'],['alonso','Alonso']]){
   const label=document.createElement('label'),select=document.createElement('select');select.id='ruolo-'+id;select.required=true;select.disabled=busy;label.htmlFor=select.id;label.textContent=nome;
   for(const [value,text] of [['','Scegli il ruolo'],['sincero','Dice sempre la verità'],['bugiardo','Mente sempre'],['incostante','A volte mente, a volte dice il vero']]){const opt=document.createElement('option');opt.value=value;opt.textContent=text;if(!value)opt.disabled=true;select.append(opt)}
   select.value=risposte[id];select.addEventListener('change',()=>risposte[id]=select.value);form.append(label,select);selects.push(select);
  }
  const submit=b('Assegna i tre ruoli',()=>{});submit.type='submit';form.append(submit);form.addEventListener('submit',e=>{e.preventDefault();if(selects.some(s=>!s.value))return;for(const s of selects)risposte[s.id.slice(6)]=s.value;invia('rispondi',JSON.stringify(risposte))});area.append(form);
  if((g.errori||0)>=3)area.append(b('Chiedi un aiuto agli studenti',()=>invia('aiuto')));
  if((g.errori||0)>=6)area.append(b('Chiedi di spiegare il ragionamento',()=>invia('spiegazione')));
 }
 function biblioteca(g){
  area.append(p('Gli scaffali raccolgono manoscritti in lingue diverse. Alcuni titoli ti sono familiari; per altri puoi aiutarti con i disegni e le poche parole che riconosci. Puoi prendere i volumi e sfogliarli al banco.'));
  const incontro=document.createElement('section');incontro.setAttribute('aria-label','Lo studioso in biblioteca');
  const domande=[['alano','Chiedi se conosceva Alano'],['magia','Chiedi che cosa pensa della magia nuova'],['consiglio','Chiedi del Consiglio Arcano']];
  if(!g.studioso_incontrato)incontro.append(p('A un banco vicino, un anziano studioso alza gli occhi dalle sue carte e osserva i libri che hai preso.'),b('Avvicinati allo studioso',()=>invia('studioso')));
  else{
   const rimaste=domande.filter(([id])=>!g['studioso_'+id]);
   if(rimaste.length){incontro.append(p('Lo studioso ti ascolta. Che cosa vuoi chiedergli?'));for(const [id,t] of rimaste)incontro.append(b(t,()=>invia('domanda_studioso',id)))}
   else incontro.append(p('Lo studioso torna alle proprie carte, lasciandoti consultare i volumi.'));
  }
  area.append(incontro);
  const elenco=document.createElement('div');elenco.className='libri-collegio';
  for(const [id,titolo] of libri){const box=document.createElement('div');box.className='tomo-collegio';box.append(b(titolo+((g.letti||[]).includes(id)?' · Letto':''),()=>invia('libro',id)));
   if((g.letti||[]).includes(id)&&((id==='mercanti'&&!g.monete_mercanti_prese)||(id==='erbe'&&!g.polvere_erbe_presa))){
    const monete=id==='mercanti';
    box.append(b(monete?'Prendi le tre monete d’argento':'Prendi la polvere soporifera',async()=>{
     if(busy)return;
     if(await window.ConfermaPergamena(monete?'Prendere le tre monete trovate nella tasca del libro?':'Prendere la polvere soporifera? Occupa il peso previsto nella Borsa.',{titolo:monete?'Le monete nel libro':'Il segnalibro nascosto',conferma:monete?'Prendi le monete':'Prendi la polvere',annulla:monete?'Lasciale lì':'Lasciala lì'}))await invia('prendi_ritrovamento',id);
    }));
   }
   if(id==='euclide'&&g.appunti_visibili){box.append(b('Esamina il libricino rimasto dietro il volume',()=>invia('appunti')));if(g.appunti_letti&&!g.pagina_presa)box.append(b('Prendi la pagina di Alano — peso 0',()=>invia('prendi_pagina')))}
   elenco.append(box);
  }area.append(elenco);
  if(g.pagina_presa)area.append(p('Hai conservato la pagina di Alano nella Borsa.'),b('Termina il racconto di oggi',()=>invia('fine')));
 }
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g11||{};const valida=d?.giorno_corrente===11&&!d.morto&&(f.startsWith('g11_')||f==='fine_giorno11');
  const piena=valida&&!['g11_citta','fine_giorno11'].includes(f);main.classList.toggle('giorno11-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena)illustrazione(f==='g11_biblioteca'?'collegio_biblio.png':'collegio_interno.png',f==='g11_biblioteca'?'La biblioteca del Collegio di Spagna':'Il cortile del Collegio di Spagna');
  const h=document.createElement('h2');h.textContent=({g11_cortile:'Gli studenti del Collegio',g11_enigma:'Tre voci, tre ruoli',g11_indicazioni:'Finalmente un’indicazione',g11_biblioteca:'La biblioteca del Collegio',g11_citta:'Fra le vie di Bologna',fine_giorno11:'Gli appunti di Alano'})[f]||'L’undicesimo giorno';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r)risposta(r);disegna()}));return}
  if(f==='g11_cortile'){
   area.append(p('La mattina dopo torni al Collegio. Il custode ti riconosce e ti lascia passare. Nel cortile gli studenti discutono, leggono e si chiamano da un portico all’altro. Ti avvicini per chiedere dove sia la biblioteca.'));
   for(const [id,t] of [['mantello','Chiedi allo studente dal lungo mantello'],['pozzo','Chiedi allo studente accanto al pozzo'],['portico','Chiedi allo studente sotto il portico']])area.append(b(t+(g['visto_'+id]?' · Già incontrato':''),()=>invia('studente',id)));
   if(['mantello','pozzo','portico'].filter(id=>g['visto_'+id]).length>=2)area.append(p('Tre studenti hanno seguito la scena e sembrano divertirsi parecchio. Uno di loro ti fa cenno di avvicinarti.'),b('Avvicinati ai tre studenti',()=>invia('trio')));
  }else if(f==='g11_enigma')enigma(g);
  else if(f==='g11_indicazioni')area.append(p('I tre ti hanno finalmente indicato un percorso: segui il portico e imbocca il corridoio in fondo. Da una porta aperta intravedi scaffali e banchi da lettura.'),b('Segui le indicazioni ed entra in biblioteca',()=>invia('entra_biblioteca')));
  else if(f==='g11_biblioteca')biblioteca(g);
  else if(f==='g11_citta')area.append(p(g.pagina_presa?'Hai già conservato la pagina di Alano. Puoi tornare al Collegio per concludere il racconto di oggi.':g.enigma_risolto?'Ora sai come raggiungere la biblioteca del Collegio. Puoi tornarci quando vuoi.':'Hai ottenuto accesso al Collegio di Spagna. La sua biblioteca ti aspetta, se riesci a ottenere indicazioni dagli studenti.'));
  else if(f==='fine_giorno11')area.append(p('Hai trovato gli appunti di Alano e conservato una pagina: «La soluzione è sempre la scienza.» Per ora non sai a quale prova potrà servirti.'),b('Termina giornata',()=>window.FineGiornata.apri()));
  if(f!=='fine_giorno11')area.append(...window.LuoghiGioco.conPassante(b('Apri la mappa e i luoghi',mappa)));if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==11){disegna();return}try{await api.rpc('gioco_giorno11',{p_codice:api.codice});if(n!==versione)return;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoUndici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
