(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno10';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,ordine=[];
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 const fogli={copia:'Sulle righe già tracciate si copia il testo, lasciando liberi i margini.',stendi:'Si distende la pergamena sul banco, fissandone gli angoli perché non si arricci.',righe:'Sul foglio ben disteso si tracciano le righe che guideranno la scrittura.'};
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno10',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){if(azione==='ordine')ordine=[];risposta(r)}else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 function mappa(){window.LuoghiGioco.apri()}
 function illustrazione(nome,alt){const src=api.risorsa('images/'+nome);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function campo(titolo,pulsante,azione){const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');input.id='risposta-giorno10';input.type='text';input.required=true;input.maxLength=300;input.disabled=busy;label.htmlFor=input.id;label.textContent=titolo;const submit=b(pulsante,()=>{});submit.type='submit';form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();invia(azione,input.value)});area.append(form)}
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g10||{};const valida=d?.giorno_corrente===10&&!d.morto&&(f.startsWith('g10_')||f==='fine_giorno10');
  const piena=valida&&!['g10_strada','fine_giorno10'].includes(f);main.classList.toggle('giorno10-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida){ordine=[];return}
  if(f==='g10_inizio')illustrazione('locanda.png','La locanda');
  else if(f==='g10_portone')illustrazione('collegio_esterno.png','L’ingresso del Collegio di Spagna');
  else if(f==='g10_bibliotecario')illustrazione('biblioteca.png','Il bibliotecario di San Domenico');
  else if(['g10_copista','g10_fogli','g10_copista_pronto'].includes(f))illustrazione('grande_indice.png','Pergamene e penna sul banco del copista');
  else if(f==='g10_cortile')illustrazione('collegio_interno.png','Il cortile del Collegio di Spagna, con il pozzo e la torretta');
  const h=document.createElement('h2');h.textContent=({g10_inizio:'Il decimo giorno',g10_strada:'Altri libri, altre tracce',g10_portone:'Il portone del Collegio',g10_bibliotecario:'Una lettera di presentazione',g10_copista:'La bottega del copista',g10_fogli:'Tre fogli da riordinare',g10_copista_pronto:'Il fascicolo ricomposto',g10_cortile:'Dentro il Collegio',fine_giorno10:'Una porta finalmente aperta'})[f]||'Il decimo giorno';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r)risposta(r);disegna()}));return}
  if(f==='g10_inizio')area.append(p('Ti svegli alla locanda. Hai trovato prove, indizi e oggetti che ancora non sai come usare. Degli altri maghi del Consiglio ti rimane molto da scoprire. Forse non hai ancora consultato tutti i libri che Bologna custodisce.'),b('Esci dalla locanda',()=>invia('esci')));
  else if(f==='g10_strada'){
   area.append(p(g.lettera?'Hai con te la lettera del bibliotecario. Ora il custode del Collegio dovrebbe lasciarti passare.':g.fascicolo?'La copia è pronta. Devi riportarla al bibliotecario di San Domenico.':g.favore?'Il bibliotecario aspetta il fascicolo affidato al copista.':g.erudito?'Il custode accetterebbe una lettera del bibliotecario di San Domenico.':g.collegio_noto?'Un passante ti ha indicato il Collegio degli Spagnoli. Puoi raggiungerlo dalla mappa.':'Potresti chiedere dove consultare altri libri antichi, oltre a quelli di San Domenico.'));
   if(!g.collegio_noto)area.append(b('Chiedi a un passante dove trovare altri libri',()=>invia('passante')));
   area.append(window.LuoghiGioco.conPassante(b('Apri la mappa e scegli dove andare',mappa)));
  }else if(f==='g10_portone'){
   area.append(p('Il portone del Collegio è sorvegliato. Dietro l’ingresso intravedi un passaggio, ma il custode ti ferma prima che tu possa avvicinarti.'));
   if(!g.custode)area.append(b('Chiedi di consultare la biblioteca',()=>invia('custode')));
   else if(!g.erudito)campo('A chi potresti chiedere una lettera di presentazione?','Proponi un nome','erudito');
   else area.append(p('Una lettera del bibliotecario di San Domenico sarà sufficiente. Sai già dove trovarlo.'));
   area.append(window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f==='g10_bibliotecario'){
   if(g.lettera)area.append(p('Hai già ricevuto la lettera con il sigillo del bibliotecario. Non ti resta che presentarla al custode del Collegio.'));
   else if(g.fascicolo)area.append(p('Il bibliotecario solleva gli occhi dai suoi appunti. Hai con te il fascicolo ricopiato che stava aspettando.'),b('Consegna il fascicolo',()=>invia('consegna')));
   else if(g.favore)area.append(p('«Il fascicolo è ancora dal copista. Riportamelo e scriverò la tua lettera.»'));
   else area.append(p('Ritrovi il bibliotecario al suo banco. Gli spieghi che vorresti consultare i libri del Collegio degli Spagnoli e che per entrare ti serve qualcuno che garantisca per te.'),b('Chiedi una lettera di presentazione',()=>invia('favore')));
   area.append(window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f==='g10_copista')area.append(p('Nella bottega il copista cerca di trattenere con un gomito una pila di fogli, mentre ne sfoglia un’altra. Sul banco riconosci il nome della biblioteca di San Domenico.'),b('Chiedi il fascicolo del bibliotecario',()=>invia('copista')),window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  else if(f==='g10_fogli'){
   area.append(p('I tre fogli descrivono un procedimento. Sceglili nell’ordine in cui dovrebbero essere letti.'));
   for(const [id,testo] of Object.entries(fogli)){const button=b(testo,()=>{if(!ordine.includes(id)&&ordine.length<3){ordine.push(id);disegna()}});button.disabled=busy||ordine.includes(id);area.append(button)}
   const lista=document.createElement('ol');lista.className='ordine-fogli-g10';for(const id of ordine){const li=document.createElement('li');li.textContent=fogli[id];lista.append(li)}area.append(lista);
   const consegna=b('Mostra l’ordine al copista',()=>invia('ordine',ordine.join(',')));consegna.disabled=busy||ordine.length!==3;area.append(consegna,b('Ricomincia l’ordine',()=>{ordine=[];disegna()}));
   if((g.errori_ordine||0)>=3)area.append(b('Chiedi un aiuto al copista',()=>invia('aiuto')));
   area.append(window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f==='g10_copista_pronto')area.append(p('Il copista ti ha consegnato il fascicolo, con i fogli nuovamente in ordine. Lo conservi con cura: devi riportarlo al bibliotecario di San Domenico.'),window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  else if(f==='g10_cortile')area.append(p('Il custode legge la lettera, controlla il sigillo e si scosta. «Puoi passare. E bada a rispettare i libri.» Attraversi l’ingresso e ti ritrovi nel cortile: due ordini di archi, un pozzo e, sopra i tetti, una piccola torretta.'),p('Hai ottenuto l’accesso al Collegio. Domani cercherai la biblioteca e proverai a scoprire che cosa custodiscono i suoi volumi.'),b('Termina il racconto di oggi',()=>invia('fine')));
  else if(f==='fine_giorno10')area.append(p('Il Collegio ti ha aperto le porte grazie alla lettera del bibliotecario.'+(d.giornata_completata?'':' Puoi concludere la giornata oppure continuare a girare per la città.')),window.FineGiornata.pulsante(b));
  if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==10){disegna();return}try{await api.rpc('gioco_giorno10',{p_codice:api.codice});if(n!==versione)return;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoDieci={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
