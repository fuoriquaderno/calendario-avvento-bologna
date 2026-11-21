(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno17';area.hidden=true;main.append(area);
 let busy=false,errore='',revision=0;
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 function figura(nome,alt){const f=document.createElement('figure');f.className='immagine-schermata';const i=document.createElement('img');i.src=api.risorsa('images/'+nome);i.alt=alt;i.decoding='async';i.addEventListener('error',()=>f.hidden=true);f.append(i);area.append(f)}
 async function invia(azione,testo=null){if(busy)return null;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno17',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r?.racconto?.testo)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'});if(!r)errore=window.BorsaNuova.errore||'';return r}catch(e){errore=e.message;return null}finally{busy=false;disegna();disegnaMappa()}}
 const dentro=()=>api.dati?.interazioni?.dimensione_alternativa===true;

 // La planimetria originale resta intatta: il filtro cambia soltanto l'inchiostro visualizzato.
 const nsMappa='http://www.w3.org/2000/svg',filtri=document.createElementNS(nsMappa,'svg');filtri.setAttribute('aria-hidden','true');filtri.setAttribute('width','0');filtri.setAttribute('height','0');filtri.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
 const defsMappa=document.createElementNS(nsMappa,'defs'),filtroMappa=document.createElementNS(nsMappa,'filter');filtroMappa.setAttribute('id','inchiostro-pianta-chiese');filtroMappa.setAttribute('color-interpolation-filters','sRGB');
 const tintaMappa=document.createElementNS(nsMappa,'feColorMatrix');tintaMappa.setAttribute('type','matrix');tintaMappa.setAttribute('values','0 0 0 0 0.47451 0 0 0 0 0.31373 0 0 0 0 0.17255 0 0 0 1 0');filtroMappa.append(tintaMappa);defsMappa.append(filtroMappa);filtri.append(defsMappa);document.body.append(filtri);
 const mappa=document.createElement('dialog');mappa.className='mappa-dialog sette-chiese-dialog';mappa.setAttribute('aria-labelledby','titolo-mappa-chiese');
 const titolo=document.createElement('h2');titolo.id='titolo-mappa-chiese';titolo.textContent='Le Sette Chiese';const introduzione=p('La pianta mostra il complesso reale. Nella dimensione alternativa i passaggi possono trovarsi altrove.');
 const superficie=document.createElement('div');superficie.className='scorri-mappa-chiese';const piano=document.createElement('div');piano.className='pianta-chiese';const img=document.createElement('img');img.className='immagine-pianta-reale';img.width=960;img.height=1228;img.alt='Planimetria di Santo Stefano: 1 Crocifisso, 2 cripta sottostante, 3 Santo Sepolcro, 4 Vitale e Agricola, 5 cortile di Pilato, 6 Trinità e 7 chiostro.';piano.append(img);superficie.append(piano);
 const scelte=document.createElement('div');scelte.className='scelte-chiese';const elenco=document.createElement('div');elenco.className='elenco-passaggi-chiese';
 const ambienti=[['Chiesa del Crocifisso',569.5/960*100,943/1228*100,1],['Cripta',568/960*100,675.5/1228*100,2],['Santo Sepolcro',382.5/960*100,704.5/1228*100,3],['Santi Vitale e Agricola',189/960*100,743.5/1228*100,4],['Cortile di Pilato',369/960*100,512.5/1228*100,5],['Chiesa della Trinità',381/960*100,380.5/1228*100,6],['Chiostro',643/960*100,368.5/1228*100,7]];
 for(let n=0;n<ambienti.length;n++){const [nome,x,y,numero]=ambienti[n];const cmd=b('',()=>passaggio(n+1));cmd.className='punto-chiesa punto-pianta-reale';cmd.style.left=x+'%';cmd.style.top=y+'%';cmd.setAttribute('aria-label',numero+'. '+nome);cmd.dataset.stanza=String(n+1);cmd.dataset.numeroPianta=String(numero);piano.append(cmd);const list=b(numero+'. '+nome,()=>passaggio(n+1));list.dataset.stanza=String(n+1);list.dataset.numeroPianta=String(numero);elenco.append(list)}
 const notaNumeri=p('La cripta (2) si trova sotto l’altare della prima chiesa.');notaNumeri.className='nota-numeri-chiese';
 const laterale=document.createElement('aside');laterale.className='legenda-pianta-reale';laterale.append(scelte,elenco,notaNumeri);const contenuto=document.createElement('div');contenuto.className='contenuto-pianta-reale';contenuto.append(superficie,laterale);
 const chiudi=b('Chiudi mappa',()=>mappa.close());chiudi.className='chiudi-pianta-reale';mappa.append(titolo,introduzione,contenuto,chiudi);document.body.append(mappa);
 function disegnaMappa(){
 const d=api.dati,s=d?.stato_partita||{},f=s.fase,g=s.g17||{},giorno18=d?.giorno_corrente===18,giorno19=d?.giorno_corrente===19,giorno20=d?.giorno_corrente===20,giorno21=d?.giorno_corrente===21,giorno22=d?.giorno_corrente===22;
 const corrente=(giorno19||giorno20||giorno21||giorno22)?Number(String(d?.luogo_attuale||'').split('_').pop())||1:giorno18&&d?.luogo_attuale==='sette_chiese_2'?2:1;
 const fasi=giorno22?['g22_cortile','g22_ritorno','g22_navata','g22_scatola','g22_ruote','g22_uscita','fine_giorno22']:giorno21?['g21_sole','g21_ritorno','g21_cortile','g21_malta','g21_acqua','g21_chiave','fine_giorno21']:giorno20?['g20_serpente','g20_ritorno','g20_navata','g20_apparizioni','g20_specchi','g20_dopocustode','fine_giorno20']:giorno19?['g19_stella','g19_cripta','g19_chiesa','g19_guardiani','g19_sepolcro','g19_fessura','fine_giorno19']:giorno18?['g18_scala','g18_cripta','g18_immagini','g18_lastra','g18_risolto','g18_stella','fine_giorno18']:['g17_navata','g17_stelle','fine_giorno17'];
 const piccolo=giorno19&&s.g19?.taglia==='piccolo',bloccato=busy||window.Giorno18?.occupato?.()||window.Giorno19?.occupato?.()||window.Giorno20?.occupato?.()||window.Giorno21?.occupato?.()||window.Giorno22?.occupato?.()||d?.morto||!dentro()||!fasi.includes(f)||d?.giornata_completata||piccolo;
 for(const e of [...piano.querySelectorAll('button'),...elenco.querySelectorAll('button')]){const n=Number(e.dataset.stanza);e.disabled=bloccato||n===corrente||n>(giorno22?7:giorno21?6:giorno20?5:giorno19?4:3);e.setAttribute('aria-current',n===corrente?'location':'false')}
 scelte.replaceChildren(p(corrente===6?'Ti trovi nella Trinità (6), la Chiesa del Triangolo di Goffredo.':corrente===5?'Ti trovi nel Cortile di Pilato (5), la Chiesa della Torre di Demetrio.':corrente===4?'Ti trovi in Santi Vitale e Agricola (4), la Chiesa del Sole di Alano.':corrente===3?'Ti trovi nel Santo Sepolcro (3), la Chiesa del Serpente di Giosuè.':corrente===2?'Ti trovi nella cripta (2), la Chiesa del Trifoglio di Samuele.':'Ti trovi nella Chiesa del Crocifisso (1), legata alla stella di Iliano.'));
 if(giorno22){if(s.g22?.passaggio_verificato)scelte.append(p('Il passaggio verso il chiostro (7) è aperto. Lo attraverserai nella prossima giornata.'));}
 else if(giorno21){if(s.g21?.passaggio_verificato)scelte.append(p('Il passaggio verso la Trinità (6) è aperto. Lo attraverserai nella prossima giornata.'));}
 else if(giorno20){if(s.g20?.passaggio_verificato)scelte.append(p('Il passaggio verso il Cortile di Pilato (5) è aperto. Lo attraverserai nella prossima giornata.'));}
 else if(giorno19){if(piccolo)scelte.append(p('Sei ancora minuscolo: non puoi percorrere le chiese.'));if(s.g19?.passaggio_verificato)scelte.append(p('Il passaggio verso Santi Vitale e Agricola (4) è aperto.'));}
 else if(giorno18){if(s.g18?.passaggio_verificato)scelte.append(p('Il passaggio verso il Santo Sepolcro (3) è aperto.'));}
 else if(g.porta_due_aperta)scelte.append(p('Il passaggio verso la cripta (2) è aperto. La attraverserai nella prossima giornata.'));
 if(bloccato&&!piccolo&&!d?.giornata_completata)scelte.append(p('Concludi la scena o lo scontro prima di cercare un passaggio.'));
 }
 async function passaggio(n){
 const controller=api.dati?.giorno_corrente===22?window.Giorno22:api.dati?.giorno_corrente===21?window.Giorno21:api.dati?.giorno_corrente===20?window.Giorno20:api.dati?.giorno_corrente===19?window.Giorno19:api.dati?.giorno_corrente===18?window.Giorno18:null;
 if(controller){if(controller.occupato?.())return;mappa.close();await controller.passaggio(n);disegnaMappa();return}
 if(busy)return;const r=await invia('passaggio',String(n));if(r&&api.dati?.stato_partita?.fase==='g17_stelle')mappa.close();
 }
 function apriMappa(){if(!dentro())return;img.src=api.risorsa('images/map_reale.png');disegnaMappa();$('inventario')?.close();if(!mappa.open)mappa.showModal()}
 window.SetteChiese={apri:apriMappa,aggiorna:disegnaMappa};
 // Tutte le stelle principali hanno lo stesso bersaglio invisibile. Nessun indice indica la soluzione.
 const stelle=[[.067,.552],[.138,.598],[.179,.674],[.219,.743],[.195,.809],[.278,.867],[.328,.794],[.318,.242],[.381,.229],[.393,.281],[.331,.3],[.446,.288],[.493,.326],[.528,.383],[.168,.353],[.19,.3],[.234,.323],[.218,.376],[.249,.431],[.258,.515],[.32,.58],[.375,.565],[.425,.547],[.483,.579],[.516,.636],[.56,.672],[.621,.657],[.66,.602],[.807,.146],[.752,.241],[.742,.359],[.842,.36],[.859,.24],[.738,.488],[.78,.547],[.82,.503],[.869,.535],[.908,.461]];

 let osservatoreCielo=null,zoomCielo=1;
 function parete(){
  const ns='http://www.w3.org/2000/svg',colore='#79502c',W=1448,H=1086;
  const crea=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
  const scroll=document.createElement('div');scroll.className='scorri-cielo17';scroll.style.cssText='width:100%;overflow:auto;margin:18px 0';
  const cielo=document.createElement('div');cielo.className='cielo17';cielo.style.cssText='position:relative;min-width:0;width:100%;line-height:0';
  const svg=crea('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,preserveAspectRatio:'xMidYMid meet',role:'group','aria-label':'Cielo stellato: premi una delle stelle grandi e piene.'});svg.classList.add('cielo-stelle-svg17');svg.style.cssText='display:block;width:100%;height:auto;max-width:none;background:transparent';
  const sagoma='M0 -11 L2 -4 L8 -8 L4 -2 L11 0 L4 2 L8 8 L2 4 L0 11 L-2 4 L-8 8 L-4 2 L-11 0 L-4 -2 L-8 -8 L-2 -4 Z';
  const cornice=crea('path',{d:'M52 20 Q24 20 20 52 L15 302 L21 546 L16 826 L22 1035 Q23 1066 53 1068 L363 1073 L720 1067 L1088 1071 L1394 1067 Q1424 1067 1428 1035 L1432 782 L1427 540 L1431 285 L1426 52 Q1426 22 1394 20 L1080 17 L723 22 L365 17 Z',fill:'none',stroke:colore,'stroke-width':2,'stroke-opacity':.65,'aria-hidden':'true','pointer-events':'none'});svg.append(cornice);
  const figure=[];let seed=20261121;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const decorative=[];
  for(let tentativo=0;decorative.length<40&&tentativo<1200;tentativo++){
   const x=.045+random()*.91,y=.045+random()*.91;
   if(stelle.some(([sx,sy])=>Math.hypot((x-sx)*W,(y-sy)*H)<48)||decorative.some(([sx,sy])=>Math.hypot((x-sx)*W,(y-sy)*H)<65))continue;
   decorative.push([x,y]);const g=crea('g',{transform:'translate('+(x*W)+' '+(y*H)+')','aria-hidden':'true','pointer-events':'none'}),stella=crea('path',{d:sagoma,fill:'none',stroke:colore,'stroke-width':.8,'stroke-opacity':.6,'vector-effect':'non-scaling-stroke'});stella.classList.add('stella-decorativa17');g.append(stella);svg.append(g);figure.push({stella,piccola:true});
  }
  stelle.forEach(([x,y],n)=>{
   const g=crea('g',{transform:'translate('+(x*W)+' '+(y*H)+')',role:'button',tabindex:busy?-1:0,'aria-disabled':busy?'true':'false','aria-label':'Premi la stella '+(n+1),'data-stella':n+1});g.classList.add('stella-cliccabile17');g.style.cursor=busy?'default':'pointer';
   const bersaglio=crea('circle',{cx:0,cy:0,r:24,fill:'transparent',stroke:'none','pointer-events':'all'}),stella=crea('path',{d:sagoma,fill:colore,stroke:colore,'stroke-width':.8,'vector-effect':'non-scaling-stroke','pointer-events':'none'});stella.classList.add('stella-piena17');
   const premi=()=>{if(!busy)invia('stella',JSON.stringify({x,y}))};g.addEventListener('click',premi);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();premi()}});g.append(bersaglio,stella);svg.append(g);figure.push({stella,bersaglio,piccola:false});
  });
  cielo.append(svg);scroll.append(cielo);
  const comandi=document.createElement('div');comandi.className='comandi-cielo17';comandi.setAttribute('aria-label','Ingrandimento del cielo stellato');
  const livello=document.createElement('span');livello.setAttribute('aria-live','polite');
  const meno=b('−',()=>cambiaZoom(Math.max(1,zoomCielo-.5))),adatta=b('Adatta',()=>cambiaZoom(1)),piu=b('+',()=>cambiaZoom(Math.min(3,zoomCielo+.5)));
  meno.setAttribute('aria-label','Riduci il cielo stellato');piu.setAttribute('aria-label','Ingrandisci il cielo stellato');
  function cambiaZoom(valore){zoomCielo=valore;cielo.style.width=(zoomCielo*100)+'%';livello.textContent=Math.round(zoomCielo*100)+'%';meno.disabled=zoomCielo<=1;piu.disabled=zoomCielo>=3;if(zoomCielo===1){scroll.scrollLeft=0;scroll.scrollTop=0}dimensiona()}
  comandi.append(meno,adatta,piu,livello);area.append(comandi,scroll);
  const dimensiona=()=>{const scala=Math.min(W/720,W/(svg.getBoundingClientRect?.().width||W));for(const {stella,bersaglio,piccola} of figure){stella.setAttribute('transform','scale('+(scala*(piccola ? 0.3 : 1))+')');if(bersaglio)bersaglio.setAttribute('r',String(16*scala))}};
  cambiaZoom(zoomCielo);if(typeof ResizeObserver!=='undefined'){osservatoreCielo=new ResizeObserver(dimensiona);osservatoreCielo.observe(svg)}
 }
 function disegna(){if(osservatoreCielo){osservatoreCielo.disconnect();osservatoreCielo=null}const d=api.dati,s=d?.stato_partita||{},g=s.g17||{},f=s.fase||'',valido=d?.giorno_corrente===17&&(f.startsWith('g17_')||f==='fine_giorno17');area.replaceChildren();area.hidden=!valido;main.classList.toggle('giorno17-attivo',!!valido);if(!valido)return;
 figura(['g17_piazza','g17_soglia','g17_guardiano','g17_ritorno_soglia','g17_ingresso'].includes(f)?'santo.stefano.png':'chiesa1.png',dentro()?'La prima chiesa con l’altare e le icone.':'Santo Stefano nella piazza deserta.');
 const h=document.createElement('h2');h.textContent=({g17_piazza:'La soglia di Santo Stefano',g17_soglia:'Un altro ingresso',g17_guardiano:'Il custode della soglia',g17_ritorno_soglia:'Ancora davanti alla soglia',g17_ingresso:'Oltre il custode',g17_navata:'La chiesa della Stella',g17_effigi:'Le figure delle icone',g17_stelle:'Un cielo inciso nella pietra',fine_giorno17:'La via verso la cripta'})[f]||'Il diciassettesimo giorno';area.append(h);
 if(d.morto){area.append(p('Il combattimento ti ha sopraffatto. Il cammino si interrompe qui. Puoi ripartire dal checkpoint della giornata; il fallimento rimane nel registro.'),b('Riparti dal checkpoint',()=>api.esegui(()=>api.riprendiCheckpoint(),area)));return}
 const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera l’esito dell’ultima azione prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r?.racconto)window.Messaggi.mostra(r.racconto);disegna()}));return}
 if(f==='g17_piazza')area.append(p('La piazza è deserta. I monaci si sono ritirati e nessuno ti ferma quando raggiungi il lato destro del portone. Ripensi alle parole di Iliano: «A destra dell’entrata che sei solito passare». Questa volta puoi portare a termine il rito.'),b('Traccia i sette cerchi e pronuncia la formula',()=>invia('rito')));
 else if(f==='g17_soglia')area.append(p('Sulla pietra brilla ancora il segno che hai tracciato. Dietro il portone riconosci un ingresso che un momento fa non esisteva. Dall’altra parte arriva un soffio d’aria fredda.'),b('Avvicinati all’ingresso',()=>invia('avvicinati')));
 else if(f==='g17_guardiano')area.append(p('Il custode occupa tutta la soglia. La stella sul suo petto richiama il sigillo di Iliano, ma la figura non si fa da parte. Stringe l’arma e avanza. Iliano ti aveva assicurato che il rito ti avrebbe fatto riconoscere come autorizzato: i guardiani avrebbero dovuto lasciarti passare. Perché questo ti sta attaccando?'),b('Affronta il custode',()=>window.AzioniGioco.apriScontro()));
 else if(f==='g17_ritorno_soglia')area.append(p('Ti sei sottratto al custode, ma la figura continua a sorvegliare il passaggio. Le ferite che gli hai inflitto non sono scomparse.'),b('Torna ad affrontare il custode',()=>invia('riprendi_guardiano')));
 else if(f==='g17_ingresso')area.append(p('Il custode cade e il segno sul suo petto si spegne. La soglia è libera. Stringi la pergamena di Iliano e fai un passo verso la penombra.'),b('Entra nella dimensione alternativa',()=>invia('entra')));
 else if(f==='g17_navata'){
 area.append(p('La navata somiglia a quella che conosci, ma i suoni non arrivano da Bologna. Sulla pergamena di Iliano ora distingui sette ambienti e i passaggi che dovrebbero collegarli.'),p('L’altare è rialzato sopra una breve scala. Lungo le pareti trovi nicchie, piccoli reliquiari e due icone di santi. Puoi esaminare la chiesa oppure cercare una via per proseguire.'),b(g.altare_esaminato?'Riesamina l’altare':'Ispeziona sotto l’altare',()=>invia('altare')),b('Esamina le reliquie e le nicchie',()=>invia('reliquie')),b(g.icone_risvegliate?'Torna alle icone':'Guarda dietro le icone dei santi',()=>invia('icone')),b('Apri la mappa delle Sette Chiese',apriMappa));
 if(d.inventario?.includes('fermaglio_stella'))area.append(p('Il Fermaglio della Stella è nella Borsa: puoi indossarlo come accessorio insieme alla tua armatura.'),b('Apri la Borsa',()=>$('apri-borsa').click()));
 }else if(f==='g17_effigi')area.append(p('Le figure dipinte si muovono fuori dalle loro cornici. Sono due e non hanno più l’espressione immobile dei santi: intrecciano gesti con le dita e preparano altri incanti.'),b('Difenditi dalle due effigi',()=>window.AzioniGioco.apriScontro()));
 else if(f==='g17_stelle'){
 area.append(p('Il passaggio verso la seconda stanza è nascosto da una parete. Nel cielo inciso riconosci diversi gruppi di stelle. Alcune stelle sporgono appena dalla pietra.'),p('Premi una delle stelle grandi e piene. Le piccole stelle vuote sono decorative. Il cielo si adatta allo schermo. Usa + per ingrandirlo e Adatta per tornare alla vista completa.'));parete();
 if(g.aiuto_stelle){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Rileggi l’indizio';details.append(summary,p('Iliano rappresenta memoria e orientamento. Cerca la stella che indica il nord.'));area.append(details)}
 area.append(b('Torna a esplorare la chiesa',()=>invia('torna')),b('Consulta la mappa delle Sette Chiese',apriMappa));
 }else if(f==='fine_giorno17')area.append(p('Più avanti lungo la parete si è aperto un passaggio e una scala scende verso la cripta. Sulla mappa l’accesso è segnato altrove: la pianta rimane invariata e non corrisponde a ciò che vedi. Il cielo di pietra si è fermato attorno alla stella che hai premuto.'),p('Hai attraversato la prima chiesa e trovato un riferimento dove la mappa non bastava. La seconda stanza ti aspetta nella prossima giornata.'),b('Consulta la mappa delle Sette Chiese',apriMappa));
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 }
 async function aggiorna(){if(!dentro()&&mappa.open)mappa.close();const n=++revision;disegna();disegnaMappa();if(api.dati?.giorno_corrente!==17)return;try{await api.rpc('gioco_giorno17',{p_codice:api.codice});if(n!==revision)return;errore=''}catch(e){if(n!==revision)return;errore=e.message}disegna();disegnaMappa()}
 window.GiornoDiciassette={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
