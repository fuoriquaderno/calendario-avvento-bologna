(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno7';main.append(area);
 let busy=false,haTaccuino=false,versione=0,errore='',bozza='';
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const immagine=document.createElement('figure');immagine.className='immagine-schermata';const img=document.createElement('img');img.alt='Le arche presso San Francesco';img.src=api.risorsa('images/glossatori.png');immagine.append(img);img.addEventListener('error',()=>immagine.hidden=true);img.addEventListener('load',()=>immagine.hidden=false);
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno7',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){haTaccuino=r.ha_taccuino;if(azione==='parola'||azione==='gesto')bozza='';mostraRisposta(r)}}catch(e){errore=e.message}finally{busy=false;disegna()}}
 function rispostaBreve(s){
  const arca=s.g7?.ultima_arca,rolandino=arca==='rolandino',v=s.voce_g7;
  if(s.fase==='g7_altra_arca'){const risposte=rolandino?{
    lastra:'Ti chini e provi a premere la lastra con entrambe le mani. Sotto il bordo senti un piccolo vuoto: per un momento credi che possa ruotare. Togli la terra dalla giuntura, ma trovi una zeppa di pietra saldata nella malta. È una vecchia riparazione; la lastra rimane ferma.',
    rilievo:'Segui con le dita il piccolo rilievo. Due linee si incrociano e sembrano indicare il punto sotto di te. Ti abbassi, cerchi un segno corrispondente, poi guardi di nuovo verso l’alto: la presunta freccia è soltanto ciò che resta di una decorazione spezzata.',
    fessura:'Porti l’occhio alla fessura sul retro. C’è qualcosa di scuro incastrato in fondo. Lo raggiungi con un rametto e riesci a trascinarlo fuori: è un ciuffo di fibre secche, forse portate da un uccello. Oltre trovi soltanto pietra e polvere.'
   }:{
    crepa:'Passi un dito lungo la crepa e senti qualcosa muoversi. Tiri piano: dalla pietra esce un sottile frammento di legno. Dietro sembra esserci un foro, ma ripulendolo scopri che è poco profondo. Il legno si era soltanto incastrato nella muratura.',
    incisione:'Liberi dalla polvere l’incisione e provi a seguire i segni. Alcuni sembrano lettere, altri numeri. Li osservi da più lati finché riconosci una parte del nome già riportato sull’arca. Il resto è consumato e non nasconde pulsanti né aperture.',
    riflesso:'Ti sposti lentamente per ritrovare il lampo. Eccolo: poco sopra una colonnina. Ti sollevi quanto basta e scopri una scheggia lucida fra due pietre. Riflette il cielo, ma non ha la superficie dorata che ricordi. Quando il sole passa dietro una nube, si spegne.'
   };return risposte[v]?{titolo:rolandino?'La tomba di Rolandino':'La tomba di Odofredo',testo:risposte[v]}:null}
  if(s.fase==='g7_enigma'&&v==='parola_giusta')return{titolo:'La parola giusta',testo:'La parola dev’essere proprio «ricorda». La pronunci, ma non succede nulla. La pietra rimane immobile.'};
  if(s.fase==='g7_enigma'&&v==='errore_gesto')return{titolo:'La pietra non si muove',testo:'Provi, ma non accade nulla.'};
  const testi={coperchio:'Sul coperchio distingui una fessura scura. La percorri con le dita: è una giuntura, sigillata da polvere e malta. Non si muove.',colonna:'Dietro una colonnina noti un segno inciso. Sembra una freccia, ma è soltanto una scheggiatura della pietra.',nicchia:'Nella nicchia trovi una scodella vuota e alcuni gusci. Qualcuno ha abitato qui a lungo, ma non ha lasciato nulla che ti serva.',panca:'Sollevi la panca. Sotto ci sono polvere e segni di piccole zampe; nessun nascondiglio.',errore:'Pronunci la parola, ma la pietra rimane immobile. Puoi osservare ancora le lettere e riprovare.',annotato:'Hai trascritto nel taccuino: «Verba volant, scripta manent.» Hai segnato anche il nome di Samuele, ricamato sotto la frase.'};
  const validi={g7_ispezione:['coperchio','colonna'],g7_stanza:['nicchia','panca'],g7_enigma:['errore'],g7_arazzo:['annotato']};
  return validi[s.fase]?.includes(v)?{titolo:v==='annotato'?'Appunto salvato':v==='errore'?'La pietra non si muove':'La tua esplorazione',testo:testi[v]}:null;
 }
 function mostraRisposta(r){const msg=r?.partita&&rispostaBreve(r.partita.stato_partita||{});if(msg)window.Messaggi.mostra({...msg,pulsante:'Continua'})}
 function separa(){const e=document.createElement('div');e.className='ritorni-giorno7';area.append(e);return e}
 function aiutoSocial(){
  const box=document.createElement('div');box.className='aiuto-giorno7';
  box.append(p('Ti sei bloccato? Trovi un suggerimento sulle pagine degli Spisotti.'));
  for(const [titolo,url] of [['Facebook','https://www.facebook.com/profile.php?id=61594558125926'],['Instagram','https://www.instagram.com/glispisotti/']]){
   const a=document.createElement('a');a.textContent=titolo;a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin:6px 18px 6px 0;color:inherit';box.append(a);
  }
  area.append(box);
 }
 function campo(azione='parola'){
  const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');input.id=azione==='gesto'?'azione-giorno7':'parola-giorno7';input.maxLength=azione==='gesto'?500:150;input.required=true;input.autocomplete='off';input.value=bozza;input.disabled=busy;label.htmlFor=input.id;label.textContent=azione==='gesto'?'Che cosa fai?':'Quale parola ricomponi?';input.addEventListener('input',()=>bozza=input.value);const submit=b(azione==='gesto'?'Prova':'Pronuncia la parola',()=>{});submit.type='submit';form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();if(input.value.trim())invia(azione,input.value.trim())});area.append(form);
 }
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},g=s.g7||{},f=s.fase||'';
  const valida=d?.giorno_corrente===7&&!d.morto&&(f.startsWith('g7_')||f==='fine_giorno7');
  const sulPosto=d?.luogo_attuale==='tombe_glossatori',piena=valida&&sulPosto&&f!=='fine_giorno7';main.classList.toggle('giorno7-attivo',piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena){
   const sotterraneo=['g7_ratto','g7_stanza','g7_arazzo'].includes(f),src=api.risorsa('images/'+(sotterraneo?'topo_ninja.png':'glossatori.png'));
   if(img.getAttribute('src')!==src){immagine.hidden=false;img.src=src}
   img.alt=sotterraneo?'La stanza sotto le tombe: il ratto con il bastone, gli oggetti e l’arazzo di Samuele':'Le arche presso San Francesco';
   area.append(immagine);
  }
  const h=document.createElement('h2');h.textContent=f==='fine_giorno7'?'Le parole di Samuele':f==='g7_arche'?'Il settimo giorno — sotto le arche':f==='g7_enigma'?'Le lettere consumate':f==='g7_ratto'?'Il custode sotto le arche':f==='g7_arazzo'?'L’arazzo sulla parete':'Sotto le tombe dei maestri';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);await aggiorna()}));return}
  if(f==='fine_giorno7'){area.append(p('Hai copiato nel taccuino la frase trovata sull’arazzo. Non sai ancora dove ti servirà, ma ora puoi conservarla.'),b('Termina giornata',()=>window.FineGiornata.apri()));return}
  if(!sulPosto||f==='g7_citta'){
   area.append(p(g.visto_arazzo&&!g.annotato?'La scritta rimane nella stanza sotto le arche. Ti serve qualcosa per annotare la frase sull’arazzo: hai la sensazione che ti sarà utile. Ricordi di aver visto un taccuino in vendita da qualche parte.':'Puoi girare per la città e tornare alle arche quando vuoi.'),...window.LuoghiGioco.conPassante(b('Apri la mappa e i luoghi',()=>window.LuoghiGioco.apri())),b('Torna alle tombe e riprendi l’esplorazione',()=>invia('torna')));
   if(s.ratto_sconfitto)area.append(p('Il passaggio è aperto e il ratto è stato sconfitto. Non dovrai affrontarlo di nuovo.'));
   return;
  }
  if(f==='g7_arche'){
   area.append(p('Torni sotto le arche con più calma. Il diario parlava di guizzi dorati: osserva quale delle tombe conserva la decorazione che potrebbe averli prodotti.'),b('Osserva la tomba di Rolandino',()=>invia('arca','rolandino')),b('Osserva la tomba di Odofredo',()=>invia('arca','odofredo')),b('Osserva la tomba degli Accursi',()=>invia('arca','accursio')));
  }else if(f==='g7_altra_arca'){
   const arca=g.ultima_arca,v=s.voce_g7,rolandino=arca==='rolandino';
   const introduzione=rolandino?'Ti avvicini alla tomba di Rolandino. Una lastra alla base sembra appena fuori asse. Sotto il bordo del tetto distingui un piccolo rilievo; sul retro, una stretta fessura scompare fra due pietre.':'Giri intorno alla tomba di Odofredo. Una crepa percorre la base, accanto a un’incisione quasi cancellata. Più in alto qualcosa brilla per un istante, poi scompare quando cambi posizione.';
   area.append(p(introduzione));
   const opzioni=rolandino?[['lastra','Prova a muovere la lastra'],['rilievo','Segui il rilievo sotto il tetto'],['fessura','Guarda nella fessura sul retro']]:[['crepa','Esplora la crepa alla base'],['incisione','Ripulisci l’incisione'],['riflesso','Cerca l’origine del riflesso']];
   for(const [id,titolo] of opzioni)area.append(b(titolo+(g[arca+'_'+id]?' · Esaminato':''),()=>invia('esamina_altra',id)));
   separa().append(b('Torna a osservare le altre arche',()=>invia('arche')));
  }else if(f==='g7_ispezione'){
   const v=s.voce_g7;area.append(p('Le tessere della tomba degli Accursi rimandano piccoli lampi dorati. Ti chini a osservare il sepolcro: sul coperchio una linea scura attira l’attenzione, mentre la base si perde nell’ombra.'),b('Esamina la fessura sul coperchio'+(g.esaminato_coperchio?' · Esaminato':''),()=>invia('esamina','coperchio')),b('Guarda dietro la colonna'+(g.esaminato_colonna?' · Esaminato':''),()=>invia('esamina','colonna')),b('Ispeziona la base dell’arca',()=>invia('esamina','base')));
   separa().append(b('Torna a osservare le altre arche',()=>invia('arche')));
  }else if(f==='g7_enigma'){
   area.append(p('Alla base dell’arca trovi una piccola cornice piena di lettere. Alcune sono profonde e marcate; altre hanno perso quasi tutto il rilievo, come se molte dita le avessero sfiorate. Sotto leggi: «Da ciò che il tempo consuma, ricomponi una sola parola.»'));
   const lettere=document.createElement('div');lettere.className='lettere-giorno7';lettere.setAttribute('aria-label','Lettere incise: le lettere meno marcate sono anche descritte nel testo seguente.');
   for(const [lettera,consumata] of [['M',0],['D',1],['V',0],['R',1],['S',0],['A',1],['T',0],['I',1],['N',0],['O',1],['L',0],['R',1],['E',0],['C',1],['P',0]]){const e=document.createElement(consumata?'span':'strong');e.textContent=lettera;lettere.append(e)}area.append(lettere,p('Le lettere più consumate sono D, R, A, I, O, R, C. Le altre hanno ancora un’incisione netta.'));if(g.parola_trovata)area.append(p('Hai riconosciuto la parola, ma la pietra non si è mossa.'));campo(g.parola_trovata?'gesto':'parola');
   if((!g.parola_trovata&&(g.errori||0)>=3)||(g.parola_trovata&&(g.errori_gesto||0)>=3))aiutoSocial();
  }else if(f==='g7_accesso')area.append(p('La cornice vibra. Una lastra ai piedi dell’arca arretra, scoprendo una stretta scala che scende sotto terra. Dal buio arriva un fruscio.'),b('Scendi nella stanza',()=>invia('entra')));
  else if(f==='g7_ratto')area.append(p('Appena metti piede nella stanza, qualcosa balza da dietro una panca. È un ratto enorme, ritto sulle zampe posteriori. Impugna un bastone nodoso con una precisione inquietante. Ruota l’arma, ti squadra e si mette di traverso fra te e la parete in fondo.'),b('Inizia il combattimento',()=>window.AzioniGioco.apriScontro()));
  else if(f==='g7_fuga')area.append(p('Risali la scala e lasci il ratto nella stanza. Il passaggio rimane aperto. Puoi riprendere fiato prima di affrontarlo di nuovo.'),b('Torna nella stanza',()=>invia('entra')));
  else if(f==='g7_stanza'){
   const v=s.voce_g7;area.append(p('Il ratto non ti sbarra più il passo. La stanza è bassa e asciutta: una nicchia nel muro, una vecchia panca e un arazzo impolverato sulla parete opposta.'),b('Guarda nella nicchia'+(g.visto_nicchia?' · Esaminata':''),()=>invia('esplora','nicchia')),b('Sposta la panca'+(g.visto_panca?' · Esaminata':''),()=>invia('esplora','panca')),b('Osserva l’arazzo',()=>invia('esplora','arazzo')));
  }else if(f==='g7_arazzo'){
   if(g.annotato)area.append(p('La frase dell’arazzo è conservata nel tuo taccuino.'));
   else{
    area.append(p('Sposti la polvere dal tessuto. Tra i fili scoloriti compare una frase latina; sotto, una firma: Samuele.'),p('«Verba volant, scripta manent.»'));
    if(haTaccuino)area.append(p('La frase sembra troppo intenzionale per essere soltanto un ornamento. Puoi conservarla nei tuoi appunti.'),b('Copia la frase nel taccuino',()=>invia('annota')));
    else area.append(p('Ti serve qualcosa per annotare la frase sull’arazzo, hai la sensazione che ti sarà utile. Ricordi di aver visto un taccuino in vendita da qualche parte.'));
   }
   separa().append(b('Torna a ispezionare la stanza',()=>invia('stanza')));
  }
  const ultima=rispostaBreve(s);if(ultima)area.append(b('Rileggi l’ultima osservazione',()=>window.Messaggi.mostra({...ultima,pulsante:'Continua'})));
  if(g.annotato)area.append(b('Lascia le arche — termina il racconto di oggi',()=>invia('fine')));
  if(f!=='g7_ratto')separa().append(b('Esci e gira per la città',()=>invia('esci')));
  if(errore||window.BorsaNuova.errore)area.append(p(errore||window.BorsaNuova.errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==7){disegna();return}try{const r=await api.rpc('gioco_giorno7',{p_codice:api.codice});if(n!==versione)return;haTaccuino=r.ha_taccuino;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoSette={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
