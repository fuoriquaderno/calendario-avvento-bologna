(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno3';area.hidden=true;
 document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 const luogo=d=>({g3_colazione:'locanda_risveglio',g3_cacciata:'locanda_risveglio',g3_ricerca:'piazza_maggiore',g3_mercato:'mercato',g3_sospetto:'mercato',g3_indicazioni:d.stato_partita.fonte==='locanda'?'locanda_risveglio':'mercato',g3_san_domenico:'san_domenico',g3_biblioteca:'biblioteca'})[d.stato_partita?.fase];
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,risposta=null){
  if(busy)return;busy=true;
  try{await window.BorsaNuova.esegui('gioco_giorno3',{p_codice:api.codice,p_azione:azione,p_risposta:risposta,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo})}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase;
  area.replaceChildren();area.hidden=!d||d.giorno_corrente!==3||d.morto||!luogo(d)||f==='g3_biblioteca';if(area.hidden)return;
  const h=document.createElement('h2');h.textContent=({g3_colazione:'Il terzo giorno',g3_cacciata:'Il garbo del locandiere',g3_ricerca:'Qualcosa non ti convince',g3_mercato:'Fra i banchi del mercato',g3_sospetto:'Una domanda di troppo',g3_indicazioni:'Storie da topi di biblioteca',g3_san_domenico:'San Domenico',g3_biblioteca:'La biblioteca'})[f];area.append(h);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(d.luogo_attuale!==luogo(d)){area.append(p('Puoi riprendere il racconto dal punto in cui lo hai lasciato.'),b('Riprendi il racconto',()=>invia('torna')));return}
  if(f==='g3_colazione'){
   area.append(p('Ti svegli su un letto scomodo, probabilmente occupato prima di te da qualcuno con un personale concetto di igiene. Ti guardi intorno e capisci che uscire da quella stanza non potrà che farti bene.'),p('Al piano di sotto consumi una colazione veloce. Al tavolino dietro di te, due uomini conversano a voce abbastanza alta da risparmiarti la fatica di origliare.'),p('«Ieri ho tagliato tutta la legna del terreno. Tutta! Con la magia nuova, e senza neanche l’aiuto di un singolo taglialegna.»'),p('«Il mio vecchio vicino faceva proprio il taglialegna, da giovane. Adesso ha la schiena spaccata e a malapena riesce a camminare.»'),p('Il primo annuisce, soddisfatto. Tu ripensi a Iliano. Vista da questo tavolo, la magia sembra avere argomenti piuttosto convincenti.'),b('Interrompi: così i taglialegna non avranno più lavoro',()=>invia('lavoro')),b('Interrompi: è davvero prodigiosa, questa magia nuova',()=>invia('meraviglia')),b('Rimani ad ascoltare',()=>invia('ascolta')));
  }else if(f==='g3_cacciata'){
   if(d.stato_partita.colazione==='lavoro')area.append(p('Ti giri verso i due uomini. «E i taglialegna? Come si guadagneranno da vivere, se la magia fa tutto al posto loro?»'),p('L’uomo che ha tagliato la legna ti squadra. «Meglio spezzarsi la schiena, allora?» L’altro guarda il fondo della propria scodella.'));
   else area.append(p('Resti ad ascoltare. I due passano dalla legna ai sacchi di farina che ormai si spostano senza bisogno di braccia. Nel frattempo hai finito la colazione, ma continui a occupare il tavolo.'));
   area.append(p('Un forte tonfo ti costringe a voltarti a destra. Il locandiere ha appena posato una brocca sul tavolo.'),p('«O ordini qualcos’altro oppure mi lasci libero il tavolo. Ho gente che aspetta di mangiare, e tu mi stai solo occupando spazio!»'),p('Il garbo del locandiere ti persuade che è il momento di uscire.'),b('Esci dalla locanda',()=>invia('esci')));
  }else if(f==='g3_ricerca'){
   area.append(p('Cominci a percorrere le vie di Bologna. Finalmente ti torna in mente Iliano, con il suo sacchetto di monete e il racconto dei sette maghi.'),p('Proprio non ti convince. Ma neppure ti basta liquidarlo come un vecchio pazzo. Prima di cercare un tomo nascosto da persone che hanno dimenticato dove sia, vorresti capire se quel tomo sia mai esistito.'),p('Dove cerchi conferme al racconto di Iliano?'));
   const label=document.createElement('label');label.htmlFor='ricerca-giorno3';label.textContent='Cosa fai?';
   const input=document.createElement('input');input.type='text';input.id='ricerca-giorno3';input.maxLength=500;input.autocomplete='off';input.disabled=busy;
   const vai=b('Segui questa idea',()=>{if(!input.value.trim()){input.focus();return}return invia('cerca',input.value)});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();vai.click()}});area.append(label,input,vai);
   if(d.stato_partita.ricerca_non_riconosciuta)area.append(p('Non riesci ancora a trasformare questa idea in una pista. Prova a indicare dove cercheresti, oppure chiedi informazioni in giro.'));
   area.append(b('Chiedi informazioni in giro',()=>invia('informazioni')));
  }else if(f==='g3_mercato'||f==='g3_sospetto'){
   if(f==='g3_mercato')area.append(p('Al mattino il mercato è già pieno di voci. Fra ceste, sacchi e venditori che si chiamano da un banco all’altro, qualcuno dovrà pur sapere qualcosa della nascita della magia nuova.'));
   else area.append(p('«Chi comanda davvero questa magia? E da dove viene?»'),p('Il venditore smette di sistemare la merce. Ti guarda, poi guarda il banco accanto. «Io vendo quello che vedi. Per certe domande cerca qualcun altro.»'),p('La conversazione si spegne. Insistere con lo stesso tono non sembra promettente. Puoi provare a mostrare una curiosità meno sospettosa.'));
   area.append(p('Su un banco vicino, un sacco si solleva da solo e versa il proprio contenuto nella cesta che il mercante tiene aperta. Non sembra che nessuno, a parte te, trovi la cosa degna di attenzione.'));
   if(f==='g3_mercato')area.append(b('Chiedi direttamente chi controlla la magia nuova',()=>invia('diretta')));
   area.append(b('Osserva con meraviglia il prodigio e chiedi come sia possibile',()=>invia('prodigio')));
  }else if(f==='g3_indicazioni'){
   if(d.stato_partita.fonte==='locanda')area.append(p('«È davvero prodigiosa, questa magia. Ma chi l’ha inventata?»'),p('L’uomo si stringe nelle spalle. «Non saprei. C’è chi dice una cosa e chi un’altra. Se vuoi le storie vecchie, devi cercarle nei libri.»'),p('Il suo compagno aggiunge: «A San Domenico i frati hanno una biblioteca. Prova lì.»'),p('Ringrazi, ti alzi e ti prepari a uscire. Il racconto di Iliano continua a sembrarti improbabile, ma adesso hai un posto in cui cercare conferme.'));
   else area.append(p('«Come fate? Non ho mai visto niente del genere!»'),p('Il venditore segue il tuo sguardo verso il sacco e sorride. «Questa è la magia nuova. Risparmia fatica, e non chiede neanche da mangiare.»'),p('«Ma come è cominciata?»'),p('«Ah, queste sono storie vecchie. Stanno sui libri e interessano solo ai topi di biblioteca. A San Domenico ne hanno quanti ne vuoi: libri e topi, credo.»'),p('Ti indica come raggiungere il convento. Questa volta, almeno, hai ottenuto una pista.'));
   area.append(p('Le indicazioni per San Domenico e la biblioteca sono ora fra i luoghi conosciuti.'),b('Raggiungi San Domenico',()=>invia('raggiungi')));
  }else if(f==='g3_san_domenico'){
   area.append(p('Raggiungi San Domenico. Davanti alla basilica il rumore del mercato è ormai lontano. Accanto alla chiesa si apre l’accesso al convento.'),p('Fermi un frate e chiedi della biblioteca. Ti indica il passaggio da seguire. «Se cerchi qualcuno che ti aiuti con i libri, domanda al bibliotecario.»'),b('Entra e cerca la biblioteca',()=>invia('entra')));
  }else{
   area.append(p('Entri nella biblioteca del convento. Fra i tavoli e i manoscritti, un vecchio frate è chino su un volume aperto. Per il momento non sembra essersi accorto di te.'),p('Qui proseguirà l’esplorazione della terza giornata. Questa parte è ancora da scrivere; la partita resta salvata all’arrivo in biblioteca.'));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 
 window.GiornoTre={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
