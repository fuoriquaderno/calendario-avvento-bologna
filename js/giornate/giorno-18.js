(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno18';area.hidden=true;main.append(area);
 let busy=false,errore='',bozza='',chiave='',revision=0,cambioIscrizioni=false,rotazionePrima=0;
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const mappa=()=>window.SetteChiese?.apri();
 async function invia(azione,testo=null){
 if(busy)return null;if(azione==='distogli'){cambioIscrizioni=true;rotazionePrima=Number(api.dati?.stato_partita?.g18?.rotazione||0)}busy=true;errore='';disegna();
 try{const r=await window.BorsaNuova.esegui('gioco_giorno18',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(!r)errore=window.BorsaNuova.errore||'Non è stato possibile completare l’azione. Riprova.';if(r?.racconto?.testo&&azione!=='distogli')window.Messaggi.mostra({...r.racconto,pulsante:'Continua'});if(r?.partita?.stato_partita?.g18?.risolto)bozza='';return r}catch(e){errore=e.message;return null}finally{
 const ridotta=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(cambioIscrizioni&&!errore&&!ridotta){
 const vecchio=area.querySelectorAll('.immagini-samuele18')[0];
 if(vecchio?.animate){try{await vecchio.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-in',fill:'forwards'}).finished}catch{}}
 }
 const rivela=cambioIscrizioni&&!errore;cambioIscrizioni=false;busy=false;disegna();
 if(rivela&&!ridotta){const nuovo=area.querySelectorAll('.immagini-samuele18')[0];nuovo?.animate?.([{opacity:0},{opacity:1}],{duration:220,easing:'ease-out',fill:'both'})}
 window.SetteChiese?.aggiorna?.()
 }
 }
 async function passaggio(n){if(busy)return null;return invia('passaggio',String(n))}
 function figura(nome,alt){const f=document.createElement('figure');f.className='immagine-schermata';const i=document.createElement('img');i.src=api.risorsa('images/'+nome);i.alt=alt;i.decoding='async';i.addEventListener('error',()=>f.hidden=true);f.append(i);area.append(f)}
 function esplora(g){
 area.append(b('Leggi il libro sul leggio',()=>invia('esplora','leggio')),b('Guarda sotto le panche',()=>invia('esplora','panche')),b('Osserva le immagini alle pareti',()=>invia('esplora','immagini')),b('Esamina sotto l’altare',()=>invia('esplora','altare')));
 if(g.panche_viste&&!g.pozione_presa)area.append(b('Prendi la pozione potente',async()=>{if(busy)return;if(await window.ConfermaPergamena('Vuoi prendere la pozione potente trovata sotto la panca? Occupa il peso previsto nella Borsa.',{titolo:'La pozione sotto la panca',conferma:'Prendi la pozione',annulla:'Lasciala lì'}))await invia('pozione')}));
 area.append(window.SetteChiese.comandoNavigazione(b('Risali nella Chiesa della Stella',()=>passaggio(1))),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 }
 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},g=s.g18||{},f=s.fase||'',valido=d?.giorno_corrente===18&&(f.startsWith('g18_')||f==='fine_giorno18');
 area.replaceChildren();area.hidden=!valido;main.classList.toggle('giorno18-attivo',!!valido);if(!valido)return;
 const k=api.codice+':'+d.tentativo;if(k!==chiave){chiave=k;bozza='';errore=''}
 const sotto=d.luogo_attuale==='sette_chiese_2';figura(sotto?'chiesa2.png':'chiesa1.png',sotto?'La Chiesa del Trifoglio nella cripta: altare centrale, leggio, panche e quattro immagini sacre alle pareti.':'La Chiesa della Stella.');
 const h=document.createElement('h2');h.textContent=({g18_scala:'La scala sotto l’altare',g18_cripta:'La Chiesa del Trifoglio',g18_immagini:'Le immagini alle pareti',g18_lastra:'La lastra sotto l’altare',g18_risolto:'Uno scatto dall’alto',g18_stella:'Di nuovo nella Chiesa della Stella',g18_ombre:'Le ombre di inchiostro',fine_giorno18:'Il passaggio verso la terza chiesa'})[f]||'La cripta';area.append(h);
 if(d.morto){area.append(p('La tua avventura si è interrotta. Puoi ripartire dal checkpoint della giornata.'),b('Riparti dal checkpoint',()=>api.esegui(()=>api.riprendiCheckpoint(),area)));return}
 if(d.giornata_completata){area.append(p('La giornata 18 è confermata. Il passaggio verso il Santo Sepolcro è aperto.'));return}
 if(f==='g18_scala')area.append(p('Il cielo di pietra ha rivelato una scala. Prima di proseguire verso gli altri ambienti, puoi scendere sotto l’altare e scoprire che cosa custodisce la cripta.'),window.SetteChiese.comandoNavigazione(b('Scendi nella cripta',()=>passaggio(2))),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 else if(f==='g18_cripta'){
 area.append(p('Alla base del leggio riconosci un trifoglio inciso: il sigillo di Samuele. Questa è la Chiesa del Trifoglio. Le volte sono basse e le colonne dividono la cripta in piccoli spazi raccolti. Un altare occupa il centro; accanto c’è un leggio con un libro aperto. Alle pareti sono appese quattro immagini sacre, ciascuna con un’iscrizione.'),p('Non senti passi né rumori della città. La scala verso la Chiesa della Stella rimane alle tue spalle.'));esplora(g);
 }else if(f==='g18_immagini'){
 area.append(p('Da sinistra distingui una madre con il bambino, un santo con un libro in mano, un crocifisso e una santa con un ramo. Sotto ogni immagine è incisa una frase.'));
 const elenco=document.createElement('div');elenco.className='immagini-samuele18';
 const ns='http://www.w3.org/2000/svg',rotazione=(cambioIscrizioni?rotazionePrima:Number(g.rotazione||0))%3;
 const mobili=['Ogni ombra attende la propria luce.','Chi cerca una via interroghi il silenzio.','Nessuna soglia trattiene chi sa ascoltare.'];
 const immagini=[['La madre con il bambino',225,0],['Il santo con il libro',535,null],['Il crocifisso',1515,1],['La santa con il ramo',1815,2]];
 immagini.forEach(([nome,x,posizione],n)=>{
 const scheda=document.createElement('figure');scheda.className='immagine-iscritta18';
 const ritaglio=document.createElementNS(ns,'svg');ritaglio.classList.add('ritaglio-icona18');ritaglio.setAttribute('viewBox',(n*543+60)+' 20 430 660');ritaglio.setAttribute('role','img');ritaglio.setAttribute('aria-label',nome);ritaglio.setAttribute('preserveAspectRatio','xMidYMid meet');
 const disegno=document.createElementNS(ns,'image');disegno.setAttribute('href',api.risorsa('images/icone_cripta.png'));disegno.setAttribute('width','2172');disegno.setAttribute('height','724');ritaglio.append(disegno);
 const frase=document.createElement('figcaption');frase.className='iscrizione-visiva18';frase.textContent=posizione===null?'La memoria custodisce ciò che il tempo disperde.':mobili[(posizione+rotazione)%3];
 scheda.append(ritaglio,frase);elenco.append(scheda);
 });area.append(elenco);
 if(!g.risolto)area.append(b('Sfiora una cornice',()=>invia('tocca')));
 area.append(b('Distogli lo sguardo e guarda di nuovo',()=>invia('distogli')),b('Avvicinati all’altare',()=>invia('esplora','altare')),b('Torna a esplorare la cripta',()=>invia('torna')));
 }else if(f==='g18_lastra'){
 area.append(p('Sotto l’altare trovi una lastra liscia e uno stilo di ferro. La voce continua a ripetere: «Scrivi: ogni porta si apre a chi la chiama».'),p('Puoi incidere una frase sulla pietra.'));
 const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('textarea');label.htmlFor='iscrizione-samuele18';label.textContent='Che cosa scrivi sulla lastra?';input.id='iscrizione-samuele18';input.maxLength=500;input.rows=3;input.value=bozza;input.disabled=busy;input.required=true;input.addEventListener('input',()=>bozza=input.value);const submit=b('Incidi la frase',()=>{});submit.type='submit';form.addEventListener('submit',e=>{e.preventDefault();const valore=input.value.trim();if(valore&&!busy){bozza=valore;invia('scrivi',valore)}});form.append(label,input,submit);area.append(form);
 if(g.aiuto_usato){const aiuto=window.MenuPergamena("giorno18-suggerimento",'Rileggi il suggerimento');aiuto.append(p('«Verba volant, scripta manent»: le parole volano, gli scritti rimangono.'));area.append(aiuto)}
 area.append(b('Torna alle immagini',()=>invia('esplora','immagini')),b('Torna a esplorare la cripta',()=>invia('torna')));
 }else if(f==='g18_risolto'){
 area.append(p('La voce tace. Sulla lastra è comparsa un’annotazione firmata da Samuele: «Avevamo dato alla magia molte risposte possibili. Non avevamo previsto che imparasse a scegliere le proprie».'),p('Hai sentito uno scatto metallico provenire dalla Chiesa della Stella. Devi risalire per capire che cosa sia successo.'),window.SetteChiese.comandoNavigazione(b('Risali nella Chiesa della Stella',()=>passaggio(1))),b('Rimani a esplorare la cripta',()=>invia('torna')));
 }else if(f==='g18_stella'){
 area.append(p(g.risolto?'Risali nella navata. Qui tutto sembra immobile, ma lo scatto che hai sentito proveniva proprio da questa chiesa.':'La navata è silenziosa. La scala della cripta rimane aperta; la parete verso il Santo Sepolcro attende ancora.'),window.SetteChiese.comandoNavigazione(b('Controlla il passaggio verso il Santo Sepolcro',()=>passaggio(3))),window.SetteChiese.comandoNavigazione(b('Scendi nella cripta',()=>passaggio(2))),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 }else if(f==='g18_ombre'){
 area.append(p('Due figure fatte di lettere e inchiostro si muovono fra le colonne. Le immagini sono rimaste appese, ma i segni staccati dalla pietra si addensano in mani pronte a scagliare incanti.'),b('Inizia il combattimento',()=>window.AzioniGioco.apriScontro()));
 }else if(f==='fine_giorno18'){
 area.append(p('Hai verificato che il passaggio dalla Chiesa della Stella al Santo Sepolcro è aperto. Lo attraverserai nella prossima giornata.'),window.FineGiornata.pulsante(b),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 if(sotto){area.append(b('Rileggi l’annotazione sotto l’altare',()=>invia('esplora','altare')),b('Guarda sotto le panche',()=>invia('esplora','panche')));if(g.panche_viste&&!g.pozione_presa)area.append(b('Prendi la pozione potente',()=>invia('pozione')))}
 }
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 window.SetteChiese.posizionaNavigazione(area);
 }
 let ultimoErrore='';async function aggiorna(){const n=++revision;disegna();if(api.dati?.giorno_corrente!==18)return;try{const r=await api.rpc('gioco_giorno18',{p_codice:api.codice});if(n!==revision)return;const fase=api.dati?.stato_partita?.fase;if(api.dati?.stato_partita?.fase!==fase)disegna();ultimoErrore=''}catch(e){if(n===revision&&e.message!==ultimoErrore){ultimoErrore=e.message;errore=e.message;disegna()}}}
 window.Giorno18={passaggio,occupato:()=>busy,aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
