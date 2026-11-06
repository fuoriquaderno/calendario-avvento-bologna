(() => {
 'use strict';const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno5';area.hidden=true;main.append(area);let busy=false;
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 async function invia(azione,numero=null){if(busy)return;busy=true;try{await window.BorsaNuova.esegui('gioco_giorno5',{p_codice:api.codice,p_azione:azione,p_numero:numero,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo})}finally{busy=false;aggiorna()}}
 async function cerca(azione,testo=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_cerca_torre',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r?.lettura)window.Messaggi.mostra({...r.lettura,pulsante:'Continua'})}finally{busy=false;aggiorna()}
 }
 function scelte(){area.append(b('Prova i prototipi',()=>invia('prototipi')),b('Parla con il figlio di Demetrio',()=>invia('figlio')),b('Guardati intorno',()=>invia('esplora')))}
 function aggiorna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',torre=d?.luogo_attuale==='torre_demetrio',attiva=d?.giorno_corrente===5&&!d.morto&&f.startsWith('g5_')&&(f==='g5_colazione'||torre);
  main.classList.toggle('giorno5-attivo',!!attiva);area.replaceChildren();area.hidden=!attiva&&!(d?.giorno_corrente===5&&!d.morto&&f==='g5_strada'&&!['armaiolo','bottega_preziosi','speziale'].includes(d.luogo_attuale));if(area.hidden)return;
  if(attiva){const src=api.risorsa(f==='g5_colazione'?'images/locanda.png':'images/demetrio.png');if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=f==='g5_colazione'?'La locanda al mattino.':'Il tavolo dei prototipi di Demetrio, con il dado e il disco dai cinque fori.';area.append(figura)}
  const h=document.createElement('h2');h.textContent=f==='g5_colazione'?'Il quinto giorno':f==='g5_strada'?'La pista della torre':f==='g5_risposta_figlio'?'La risposta del figlio':f==='g5_diario'?'Il diario di Demetrio':'I marchingegni di Demetrio';area.append(h);
  const sospesa=window.BorsaNuova.pending();if(sospesa){area.append(p('Recupera il risultato prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(s.risposta_g5&&['g5_strada','g5_dado','g5_disco','g5_risposta_figlio'].includes(f)&&!(f==='g5_dado'&&s.dado_aperto)&&!(f==='g5_disco'&&s.disco_aperto)){const risposta=p(s.risposta_g5);risposta.setAttribute('role','status');area.append(risposta)}
  if(f==='g5_colazione'&&d.luogo_attuale!=='locanda_risveglio'){area.append(p('Devi ancora decidere come cominciare la mattina.'),b('Torna alla locanda',()=>invia('torna')));return}
  if(f==='g5_colazione')area.append(p('Ti svegli alla locanda. Al piano di sotto senti il rumore delle scodelle e il locandiere che chiama qualcuno dalla cucina. Puoi fermarti a fare colazione oppure uscire subito.'),b('Fai colazione',()=>invia('colazione')),b('Esci subito',()=>invia('esci')));
  else if(f==='g5_strada'){
   const conosce=!!d.interazioni?.illustrazione_demetrio_vista;
   const indicazioni=d.indicazioni_ricevute?.torre_demetrio,n=s.tentativi_destinazione||0;
   if(torre){
    area.append(p('Riconosci la torre dell’illustrazione. Ti fermi davanti all’ingresso della casa in cui abitava Demetrio.'),b('Bussa alla porta',()=>invia('bussa')));
   }else if(!conosce){
    h.textContent='Una pista da cercare';
    if(d.interazioni?.indizio_torre_demetrio||s.stanza_nascosta?.letti?.consiglio)area.append(b('Osserva l’illustrazione di Demetrio',()=>window.StanzaNascosta.apriRitratto()));
    area.append(p('Prima di scegliere la prossima tappa, vuoi rivedere i libri consultati ieri.'),b('Scegli dove andare',()=>window.LuoghiGioco.apri()));
    if(['biblioteca','san_domenico'].includes(d.luogo_attuale))area.append(b('Rileggi i ritratti del Consiglio Arcano',()=>cerca('rileggi')));
   }else if(indicazioni){
    area.append(p(indicazioni.testo),b('Segui le indicazioni',()=>cerca('segui')));
   }else{
    if(n===0&&!s.risposta_g5)area.append(p(s.colazione_g5==='pagata'?(s.colazione_ieri==='pagata'?'Paghi la colazione e lasci la locanda. Tutto sommato, di questi tempi una moneta d’argento per un pasto non è male.':'Finisci la colazione e ti alzi. Il locandiere ti ferma: «Una moneta d’argento. Non crederai che fosse offerta?» Paghi e lasci la locanda. La città ha già cominciato la propria giornata.'):'Esci dalla locanda senza fermarti a mangiare.'),p('Ripensi all’illustrazione accanto a Demetrio nei ritratti del Consiglio Arcano. Riconosci il luogo?'));
    area.append(b('Riguarda l’illustrazione',()=>window.StanzaNascosta.apriRitratto()));
    if(n<3){
     const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');
     label.htmlFor='destinazione-demetrio';label.textContent='Dove vuoi andare?';input.id='destinazione-demetrio';input.type='text';input.maxLength=200;input.required=true;input.autocomplete='off';input.style.cssText='display:block;width:100%;box-sizing:border-box;font:inherit;padding:12px;margin-block:12px;background:transparent;color:inherit;border:1px solid #926033';
     const vai=b('Vai',()=>{});vai.type='submit';form.append(label,input,vai);form.addEventListener('submit',e=>{e.preventDefault();if(input.value.trim())cerca('cerca',input.value.trim())});area.append(form,p('Tentativi rimasti: '+(3-n)));
    }else area.append(b('Mostra il disegno a un passante',()=>invia('indicazioni')));
   }
  }else if(f==='g5_incontro')area.append(p('Bussi. Ti apre un uomo di mezza età, in abiti da lavoro. Quando chiedi di Demetrio, scuote il capo.'),p('«Sono suo figlio. Ho ereditato la passione per i marchingegni magici, ma non ho mai saputo costruirne di belli e raffinati come i suoi.»'),p('Ti invita a entrare e ti conduce in una stanza. Su un tavolo sono allineati piccoli congegni.'),b('Seguilo nella stanza',()=>invia('entra')));
  else if(f==='g5_tavolo'){area.append(p('«Sono prototipi. I nobili di Bologna chiedevano a mio padre di costruire marchingegni per proteggere le loro case. Prima di installarli, lui provava tutto qui.»'),p('Il figlio ti guarda con un sorriso divertito. «Vuoi provare?»'),b('Prova i prototipi',()=>invia('prototipi')),b('Guardati intorno',()=>invia('esplora')))}
  else if(f==='g5_prototipi'){area.append(p('Fra ingranaggi, molle e piccoli fermagli spiccano un dado a dodici facce e un disco circondato da bastoncini.'),b(s.dado_aperto?'Riguarda il dado aperto':'Prendi il dado a dodici facce',()=>invia('dado')));if(s.dado_aperto)area.append(b('Prova il disco',()=>invia('disco')));area.append(b('Parla con il figlio di Demetrio',()=>invia('figlio')),b('Esplora la stanza',()=>invia('esplora')))}
  else if(f==='g5_dado'){
   if(!s.dado_aperto)area.append(p('Il congegno ha la forma di un dado a dodici facce. Le facce sono numerate e divise in quattro colori: rosso, blu, verde e giallo. Ogni colore ricopre tre facce. Il figlio ti invita a toccare un numero.'));
   if(!s.dado_aperto){const griglia=document.createElement('div');griglia.className='prototipi-numeri';for(let i=1;i<=12;i++)griglia.append(b(String(i),()=>invia('dado',i)));area.append(griglia)}
   else area.append(p('Il dado si apre. All’interno leggi: «Ci sono numeri che non si dividono: di quelli ci si può fidare.»'),b('Prova l’altro prototipo',()=>invia('disco')));
   area.append(b('Parla con il figlio di Demetrio',()=>invia('figlio')),b('Esplora la stanza',()=>invia('esplora')));
  }else if(f==='g5_disco'){
   if(!s.disco_aperto)area.append(p('Il disco porta venti piccoli bastoncini numerati, disposti a raggera. Lo sollevi: la luce attraversa cinque piccoli fori. Quale bastoncino togli?'));
   if(!s.disco_aperto){const griglia=document.createElement('div');griglia.className='prototipi-numeri';for(let i=1;i<=20;i++)griglia.append(b(String(i),()=>invia('disco',i)));area.append(griglia)}else area.append(p('Sul disco compare una scritta: «Uno e sé stesso: nessun altro può dividerlo senza lasciare un resto.»'));
   area.append(b('Parla con il figlio di Demetrio',()=>invia('figlio')),b('Esplora la stanza',()=>invia('esplora')));
  }else if(f==='g5_figlio'){area.append(p('«Mio padre aveva una predilezione per i numeri primi. Nei suoi marchingegni la risposta era sempre uno di quelli. Ma per capire quale, bisognava osservare bene il congegno.»'),p('«Un numero primo è un numero intero maggiore di uno che si divide esattamente soltanto per uno e per sé stesso. Due, tre, cinque, sette, undici… Il quattro invece si divide anche per due. E uno non è un numero primo.»'));scelte()}
  else if(f==='g5_esplora'){area.append(p('Alle pareti sono appesi strumenti sottili, ruote dentate e sagome di legno. Su uno scaffale riposano scatole incompiute; una lente ingrandisce una molla tanto piccola che quasi non riesci a vederla.'),p('Fra fogli pieni di calcoli e disegni trovi un quaderno consumato. Non contiene progetti: è il diario di Demetrio.'),b('Apri il diario',()=>invia('diario')),b('Torna ai prototipi',()=>invia('prototipi')))}
  else if(f==='g5_diario'){area.append(p('Sfogli appunti di lavoro e osservazioni personali. Una pagina racconta di un litigio con Samuele.'),p('«Ancora una discussione con Samuele. Una lingua così tagliente dovrebbe tenerla chiusa in una delle mie scatole. Mentre mi rivolgeva l’ennesima cattiveria, guizzi dorati gli correvano sul viso: venivano dalla tomba di un capostipite dei suoi compagni di malalingua. Perfino da morto, quello sembrava volergli dare manforte.»'),p('La pagina non precisa dove si trovassero. Ti soffermi su quel dettaglio, cercando di immaginare la scena.'),b('Riguarda i prototipi',()=>invia('prototipi')));if(!s.samuele_chiesto)area.append(b('Chiedi al figlio notizie di Samuele e dei riflessi',()=>invia('samuele')))}
  else if(f==='g5_risposta_figlio'){area.append(b('Rileggi la pagina del diario',()=>invia('diario')),b('Torna ai prototipi',()=>invia('prototipi')))}
  if(s.diario_letto&&s.dado_aperto&&s.disco_aperto&&['g5_diario','g5_risposta_figlio','g5_prototipi','g5_dado','g5_disco','g5_figlio','g5_esplora'].includes(f))area.append(b('Saluta ed esci',()=>invia('fine')));

  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 window.GiornoCinque={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
