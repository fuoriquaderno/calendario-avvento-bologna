(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno8';area.hidden=true;main.append(area);
 let busy=false,versione=0,ultimo=null,errore='';
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const farmacie={farmacia_serpente:{nome:'Farmacia del Serpente',immagine:'simbolo_serpente.png',descrizione:'L’insegna raffigura lo stesso serpente che hai visto sui verbali del Consiglio Arcano. Dietro il banco il farmacista riordina alcune ampolle.'},farmacia_ordine:{nome:'Alla Bilancia',immagine:'farmacia_sx.png',descrizione:'Ogni vaso è allineato al successivo. Il farmacista ti squadra da dietro il banco e raddrizza un’etichetta che pareva già dritta.'},farmacia_erbe:{nome:'All’Erba Storta',immagine:'farmacia_dx.png',descrizione:'Mazzi di erbe pendono sopra il banco, fra vasi diversi e ricette sparse. Il farmacista lavora al mortaio senza preoccuparsi troppo dell’ordine.'}};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 const documento=document.createElement('dialog');documento.className='avviso-codice luoghi-dialog confronto-giorno8';documento.setAttribute('aria-labelledby','titolo-confronto-g8');
 const top=document.createElement('div');top.className='scroll-top';top.setAttribute('aria-hidden','true');const centro=document.createElement('div');centro.className='scroll-middle';const bottom=document.createElement('div');bottom.className='scroll-bottom';bottom.setAttribute('aria-hidden','true');
 const titoloDocumento=document.createElement('h2');titoloDocumento.id='titolo-confronto-g8';titoloDocumento.textContent='Le due metà della pergamena';
 const tabella=document.createElement('table');tabella.className='frammenti-giorno8';const head=document.createElement('tr');for(const t of ['Alla Bilancia','All’Erba Storta']){const th=document.createElement('th');th.scope='col';th.textContent=t;head.append(th)}const thead=document.createElement('thead');thead.append(head);tabella.append(thead);const tbody=document.createElement('tbody');
 for(const coppia of [['La mia casa si trova nel vicolo delle Tre','Chiavi, lontano dal rumore della bottega.'],['Cercatela fra due case,','una rossa e una bianca.'],['La riconoscerete dalla porta','senza battente.']]){const r=document.createElement('tr');for(const t of coppia){const cella=document.createElement('td');cella.textContent=t;r.append(cella)}tbody.append(r)}tabella.append(tbody);
 const chiudiDocumento=b('Chiudi',()=>documento.close());centro.append(titoloDocumento,p('Le righe continuano da una metà all’altra. Lo strappo e i resti del sigillo appartengono allo stesso foglio.'),tabella,chiudiDocumento);documento.append(top,centro,bottom);document.body.append(documento);
 function mostraRisposta(r){
  if(r?.confronto){if(!documento.open)documento.showModal();return}
  if(!r?.racconto)return;const tiro=r.partita?.stato_partita?.g8?.tiro_gatto,voce=r.partita?.stato_partita?.voce_g8;
  let testo=r.racconto.testo;
  if(tiro&&['gatto_schivato','gatto_graffio'].includes(voce))testo=`Il tuo tiro di Destrezza: ${tiro.valori.join(' + ')}${tiro.bonus>0?' + '+tiro.bonus:tiro.bonus<0?' − '+Math.abs(tiro.bonus):''} = ${tiro.totale}.\n\n`+testo;
  window.Messaggi.mostra({...r.racconto,testo,pulsante:'Continua'});
 }
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';try{const r=await window.BorsaNuova.esegui('gioco_giorno8',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){ultimo=r.racconto;mostraRisposta(r)}}catch(e){errore=e.message}finally{busy=false;disegna()}}
 function ritorni(){const e=document.createElement('div');e.className='ritorni-giorno8';e.append(b('Torna al banco',()=>invia('torna')),window.LuoghiGioco.conPassante(b('Apri la mappa e i luoghi',()=>window.LuoghiGioco.apri())));area.append(e)}
 function fine(g){if(g.visto_ordine&&g.visto_erbe){const box=document.createElement('div');box.className='ritorni-giorno8';box.append(b('Confronta le due pergamene',()=>invia('confronta')),b('Hai raccolto le indicazioni — termina il racconto di oggi',()=>invia('fine')));area.append(box)}}
 function esplorazioni(d,g){
  const prefix=d.luogo_attuale==='farmacia_serpente'?'serpente':d.luogo_attuale==='farmacia_ordine'?'ordine':'erbe';
  const opzioni=prefix==='serpente'?[['scaffali','Osserva gli scaffali'],['mortaio','Guarda nel mortaio'],['vasi','Esamina le ampolle']]:prefix==='ordine'?[['registro','Sfoglia il registro'],['bilancia','Osserva la bilancia'],['pergamena','Leggi la vecchia pergamena incorniciata']]:[['mortaio','Guarda il preparato nel mortaio'],['erbe','Scosta i mazzi di erbe'],['pergamena','Leggi la vecchia pergamena appesa']];
  for(const [id,t] of opzioni)area.append(b(t+(g[prefix+'_'+id]?' · Esaminato':''),()=>invia('esamina',id)));
  if(prefix==='erbe'){
   const gatto=b(g.gatto_risolto?'Il gatto dorme · Già incontrato':'Avvicinati al gatto sulle ricette',()=>invia('esamina','gatto'));if(g.gatto_risolto){gatto.disabled=true;gatto.setAttribute('data-disabilitato','')}area.append(gatto);
  }
 }
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g8||{},farmacia=farmacie[d?.luogo_attuale];
  const valida=d?.giorno_corrente===8&&!d.morto&&(f.startsWith('g8_')||f==='fine_giorno8');
  const piena=valida&&(f==='g8_inizio'||!!farmacia)&&f!=='fine_giorno8';main.classList.toggle('giorno8-attivo',!!piena);main.classList.toggle('giorno8-commercio',!!(piena&&f==='g8_acquisti'));area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena){const nome=f==='g8_inizio'?'locanda.png':farmacia?.immagine;if(nome){const src=api.risorsa('images/'+nome);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=farmacia?.nome||'La locanda';area.append(figura)}}
  const h=document.createElement('h2');h.textContent=f==='g8_inizio'?'L’ottavo giorno':f==='fine_giorno8'?'Un indirizzo da cercare domani':farmacia?.nome||'Le tracce degli altri maghi';area.append(h);
  const sospesa=window.BorsaNuova.pending();if(sospesa){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);if(r)mostraRisposta(r);await aggiorna()}));return}
  if(f==='g8_inizio'){
   area.append(p('Ti svegli alla locanda. Hai raccolto notizie e indizi su alcuni dei sette maghi, ma proprio non sai come andare avanti. Decidi di girare la città in cerca di indizi.'),b(d.luogo_attuale==='locanda_risveglio'?'Esci dalla locanda':'Torna alla locanda',()=>invia(d.luogo_attuale==='locanda_risveglio'?'esci':'torna_locanda')));return;
  }
  if(f==='fine_giorno8'){area.append(p('Le due pergamene ti hanno dato il nome di un vicolo e i particolari di una casa. Domani andrai a cercarla.'),b('Riguarda le due metà',()=>{if(!documento.open)documento.showModal()}),window.FineGiornata.pulsante(b));return}
  if(!farmacia){area.append(p('Hai raccolto notizie e indizi su alcuni dei sette maghi, ma non sai ancora come proseguire. Percorri le vie di Bologna e osserva ciò che incontri.'),window.LuoghiGioco.conPassante(b('Scegli dove andare sulla mappa',()=>window.LuoghiGioco.apri())));fine(g);return}
  if(g.arrivo)area.append(p('Prima di arrivare alla destinazione, passi davanti a una farmacia. Sull’insegna riconosci il serpente visto sulla copertina dei verbali. Ti fermi ed entri nella bottega.'));
  if(f==='g8_farmacia'){
   area.append(p(farmacia.descrizione),b('Compra qualcosa',()=>invia('acquisti')),b('Esplora la farmacia',()=>invia('esplora')),b('Parla con il farmacista',()=>invia('parla')),window.LuoghiGioco.conPassante(b('Apri la mappa e i luoghi',()=>window.LuoghiGioco.apri())));
   if(g.rivali_note&&d.luogo_attuale==='farmacia_serpente')area.append(p('Ora conosci le due botteghe di cui ti ha parlato il farmacista. Puoi raggiungerle dalla mappa.'));
  }else if(f==='g8_esplora'){
   area.append(p(d.luogo_attuale==='farmacia_serpente'?'Osservi gli strumenti e i recipienti della bottega.':d.luogo_attuale==='farmacia_ordine'?'Puoi osservare il registro, la bilancia e un vecchio foglio nella cornice.':'Fra il disordine riconosci il mortaio, i mazzi di erbe, un vecchio foglio appeso e il gatto che occupa le ricette.'));esplorazioni(d,g);ritorni();
  }else if(f==='g8_acquisti'){area.append(p('Puoi acquistare i rimedi esposti oppure vendere gli oggetti che il farmacista è disposto a ritirare.'));ritorni();const negozio=document.getElementById('negozio-citta');if(negozio&&area.nextElementSibling!==negozio)area.after(negozio)}
  else if(f==='g8_gatto'){area.append(p('Il gatto dorme disteso sulle ricette. Un orecchio si muove quando ti avvicini, ma non sembra intenzionato a lasciare il posto.'),b('Scaccialo — prova di Destrezza',()=>invia('scaccia')),b('Accarezzalo',()=>invia('accarezza')),b('Lascialo dormire',()=>invia('lascia_gatto')));ritorni()}
  else if(f==='g8_carezze'){area.append(p('Avvicini la mano. Dove lo accarezzi?'));for(const [id,t] of [['zampe','Sulle zampe'],['coda','Sulla coda'],['testa','Sulla testa'],['pancia','Sulla pancia']])area.append(b(t,()=>invia('carezza',id)));ritorni()}
  if(s.voce_g8?.startsWith('gatto_')&&g.tiro_gatto){const box=document.createElement('div'),totale=p('');box.className='dadi-area';if(window.Dadi)window.Dadi.mostraRisultato(box,totale,g.tiro_gatto);area.append(p('Il tuo tiro per schivare il graffio'),box,totale)}
  if(ultimo&&s.voce_g8)area.append(b('Rileggi l’ultima risposta',()=>mostraRisposta({racconto:ultimo,partita:d})));
  fine(g);if(errore||window.BorsaNuova.errore)area.append(p(errore||window.BorsaNuova.errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==8){ultimo=null;disegna();return}try{const r=await api.rpc('gioco_giorno8',{p_codice:api.codice});if(n!==versione)return;ultimo=r.racconto;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoOtto={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
