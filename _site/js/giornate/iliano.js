(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='incontro-iliano';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let vista=null,rev=0,busy=false;
 const racconto=[
 'L’Osteria del Sole si nasconde fra le botteghe del mercato. Quando entri, nessuno interrompe la propria conversazione per guardarti. Un uomo vicino alla porta sta sostenendo che il suo vino sia stato allungato; quello di fronte gli risponde che, per quanto ne ha bevuto, dovrebbe esserne grato.',
 'Iliano è seduto in fondo alla sala.',
 'Lo riconosci prima ancora che alzi la mano. Dalla lettera ti aspettavi un mago capace di promettere imprese e ricompense; davanti hai un vecchio dalle spalle curve, con una veste consumata e le dita sottili appoggiate su alcune pergamene. Sul tavolo ci sono un sacchetto chiuso e una coppa che sembra non aver toccato.',
 '«Sei arrivato.»',
 'Una tosse secca gli spezza il respiro. Aspetti che passi.',
 '«Siediti. E perdonami se non mi alzo: oggi le ginocchia hanno già espresso il loro parere.»',
 'Sposti lo sgabello e prendi posto. Sulle pergamene distingui schemi, annotazioni e intere righe cancellate. Iliano raccoglie i fogli, ma dopo un momento li lascia ricadere sul tavolo.',
 '«Devo raccontarti una cosa. Prima che tu decida se sono pazzo, ti chiedo soltanto di ascoltarla fino in fondo.»',
 'Abbassa la voce.',
 '«Eravamo sette. Sette maghi convinti di poter liberare gli uomini da buona parte delle fatiche che li consumavano. Volevamo una magia capace di svolgere i lavori più gravosi, assistere gli studiosi, trovare soluzioni che a noi avrebbero richiesto anni.»',
 'Ti guarda, cercando di capire quanto tu sia disposto a credergli.',
 '«E ci riuscimmo. Ma la cosa straordinaria venne dopo: la magia imparava. Conservava qualcosa di ogni esperienza e lo usava per correggersi. Potevi affidarle un compito e, quando tornavi, aveva trovato un modo migliore per svolgerlo.»',
 'Per la prima volta gli compare un sorriso. Dura poco.',
 '«Puoi immaginare quanto potere avesse chi poteva governarla. Scegliere quali compiti assegnarle, quali limiti imporle, quali risultati accettare.»',
 'Iliano passa un dito lungo il bordo della coppa.',
 '«Raccogliemmo in un tomo tutto ciò che serviva per controllarla. Poi ci accorgemmo che averlo scritto non risolveva il problema. Lo concentrava in un oggetto che qualcuno avrebbe potuto rubare. O tenere per sé.»',
 '«Uno di voi?»',
 'Il vecchio annuisce.',
 '«Non volevamo dover confidare nella virtù di sette persone per il resto della loro vita. Così nascondemmo il tomo e pronunciammo un incantesimo per cancellare il ricordo del nascondiglio. Anche dalla nostra memoria.»',
 'Rimani a guardarlo.',
 '«Avete nascosto l’unica cosa che poteva controllare la vostra magia. E poi avete fatto in modo di dimenticare dove fosse.»',
 '«Detto così, ammetto che non sembra il momento più brillante della nostra carriera.»',
 'Si concede un respiro, poi riprende.',
 '«Ognuno di noi ha conservato un particolare utile a ritrovarlo. Uno soltanto. Io so che il tomo è a Bologna.»',
 'Aspetti che aggiunga qualcosa.',
 '«Questo è tutto?»',
 '«Questo è tutto.»',
 'Dall’altro lato della sala arriva una risata. Iliano aspetta che si spenga.',
 '«Nel frattempo abbiamo continuato ad affidare lavori alla magia. Sempre più lavori. Adesso nessuno riesce più a seguirne l’operato fino in fondo. Otteniamo una risposta, vediamo un risultato, e spesso ci basta. Ma quando qualcosa non torna, non sappiamo risalire alle ragioni. E non abbiamo più gli strumenti per intervenire davvero.»',
 '«E gli altri maghi?»',
 '«Ho provato a rintracciarli. Le risposte arrivano di rado. Viaggiare mi costa sempre più fatica, e la mia salute…»',
 'Un altro colpo di tosse gli impedisce di finire. Stavolta beve un sorso.',
 '«Chi mi ascolta pensa che voglia togliere alla città qualcosa di utile. Mi ricordano le fatiche risparmiate, le guarigioni, i raccolti. Cose che conosco bene. Ho contribuito a renderle possibili.»',
 'Stringe le pergamene fra le mani.',
 '«Vorrei poter dire che tutto sta procedendo come speravamo. Ma per dirlo dovrei poterlo verificare.»',
 'Per un poco restate in silenzio. Il racconto è enorme. Troppo per accettarlo sulla parola di un vecchio incontrato in un’osteria.',
 'Iliano sembra leggertelo in faccia.',
 'Ti affretti ad annuire, cercando di dare alla tua espressione una convinzione che ancora non provi.',
 '«Ho capito. Puoi contare su di me.»',
 'Il vecchio ti osserva per qualche istante, poi spinge il sacchetto verso di te.',
 '«Qui ci sono cinquanta monete. Al ritorno, con il tomo, ne avrai molte altre.»'
 ];
 const fuori=[
 'Afferri il sacchetto prima che Iliano possa cambiare idea. Le monete tintinnano: almeno su quelle non sembrano esserci dubbi.',
 '«Accetto l’incarico.»',
 'Iliano china appena il capo. Ti alzi, rimetti a posto lo sgabello e raggiungi la porta, avvertendo il peso del sacchetto contro il fianco.',
 'Fuori dall’osteria ti fermi.',
 'Sette maghi, una magia che impara da sola, un libro nascosto da persone che hanno deliberatamente dimenticato dove l’hanno messo. Ripensandoci qui, fra le voci del mercato, la faccenda sembra ancora meno ragionevole.',
 'Le monete, invece, sono vere.',
 'Potresti tenerti il denaro e lasciare Bologna. Iliano è vecchio, malato e non sa nemmeno dove cercare il suo libro: difficilmente riuscirebbe a trovare te.',
 'Oppure potresti mantenere la parola data. Non sei ancora convinto del suo racconto, ma questo non ti impedisce di provare a capire se ci sia qualcosa di vero.',
 'Che cosa decidi?'
 ];
 const fuga=[
 'Ti basta ripercorrere la strada da cui sei arrivato. Attraversi Bologna senza fermarti e superi la porta, cercando di non voltarti indietro.',
 'Soltanto quando le mura cominciano ad allontanarsi ti concedi un sorriso.',
 'Porti una mano al sacchetto.',
 'È vuoto.',
 'Lo apri, lo rovesci, passi le dita nelle pieghe. Controlli anche le altre monete che avevi con te. Non ne è rimasta una.',
 'Poi senti tirare in fondo alla schiena.',
 'Ti giri, ma non c’è nessuno. Allunghi una mano sotto il mantello e incontri qualcosa di morbido. Lo afferri.',
 'Il dolore ti fa lasciare subito la presa.',
 'Dal fondo della tua schiena spunta una lunga coda da volpe.',
 'Rimani immobile, con il sacchetto vuoto in una mano e l’altra ancora sospesa dietro di te.',
 'A quanto pare, Iliano aveva pensato anche a questa eventualità.'
 ];
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function azione(nome){if(busy)return;busy=true;await window.BorsaNuova.esegui('gioco_iliano',{p_codice:api.codice,p_azione:nome,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});busy=false;await aggiorna()}
 function disegna(){
  const d=api.dati,fase=d?.stato_partita?.fase,qui=d?.luogo_attuale==='osteria_sole';
  area.replaceChildren();area.hidden=!d||d.giorno_corrente!==2||(!qui&&!['decisione_iliano','fallimento_volpe'].includes(fase));
  if(area.hidden||!vista)return;
  const titolo=document.createElement('h2');titolo.textContent=fase==='fallimento_volpe'?'Un pessimo affare':fase==='decisione_iliano'?'Fuori dall’osteria':'Iliano';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);await aggiorna()}));return}
  if(fase==='fallimento_volpe'){
   fuga.forEach(t=>area.append(p(t)));
   area.append(p('Hai fallito. Ripartirai dall’inizio della giornata; questo fallimento resta nel registro.'),b('Ricomincia la giornata',()=>api.esegui(()=>api.riprendiCheckpoint(),$('stato-condiviso'))));return;
  }
  if(d.morto){area.hidden=true;return}
  const s=vista.incontro;
  if(s.fase==='scelta'){
   fuori.forEach(t=>area.append(p(t)));area.append(b('Scappa con il denaro',()=>azione('scappa')),b('Accetta per davvero l’incarico',()=>azione('accetta')));
  }else if(s.fase==='accettato'){
   area.append(p('Iliano è di nuovo chino sui suoi appunti. Hai deciso di mantenere la parola data. Per il resto della giornata, Bologna è ancora tutta da esplorare.'));
  }else if(vista.presente){
   racconto.forEach(t=>area.append(p(t)));
   const prendi=b('Prendi il sacchetto e accetta l’incarico',()=>azione('prendi'));prendi.disabled=busy||d.giornata_completata;area.append(prendi);
  }else area.hidden=true;
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++rev;if(!api.dati||api.dati.giorno_corrente!==2){vista=null;area.hidden=true;return}
  try{const r=await api.rpc('gioco_iliano',{p_codice:api.codice});if(n!==rev)return;vista=r;disegna()}
  catch(e){area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare l’incontro',aggiorna))}
 }
 
 window.IncontroIliano={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
