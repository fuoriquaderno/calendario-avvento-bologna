// Missione laterale: lo stato e i tiri sono verificati sul server.
(() => {
 'use strict';const api=window.Partita,$=id=>document.getElementById(id);
 const main=document.querySelector('main .scroll-middle');if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='missione-galeazzo';area.hidden=true;main.append(area);
 const promemoria=document.createElement('p');promemoria.id='borsa-missione-galeazzo';promemoria.hidden=true;$('borsa-elenco').before(promemoria);
 const illustrazione=document.createElement('figure');illustrazione.className='immagine-schermata';
 const immagine=document.createElement('img');immagine.src=api.risorsa('images/pozzo.png');immagine.alt='Un cortile con il pozzo al centro, fra gli archi di casa Bentivoglio.';immagine.decoding='async';
 immagine.addEventListener('error',()=>{illustrazione.hidden=true});immagine.addEventListener('load',()=>{illustrazione.hidden=false});illustrazione.append(immagine);
 let busy=false,bozza='',azioneDelTiro=null;
 const descrizioniTiro={
  seduci:'Inganno: provi a lusingare la padrona.',
  convinci:'Inganno: chiedi di visitare il cortile.',
  serratura:'Serrature: cerchi di aprire il portone.',
  silenzio:'Furtività: attraversi la casa in silenzio.',
  pietra:'Furtività: cerchi mentre la padrona tiene gli occhi chiusi.',
  esci:'Furtività: provi a uscire senza farti notare.',
  complicita:'Inganno: cerchi di ottenere la complicità della giovane.'
 };
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const m=()=>api.dati?.interazioni?.missione_galeazzo||{};
 const possiede=id=>Array.isArray(api.dati?.inventario)&&api.dati.inventario.some(o=>o===id);
 function percorsoFallito(p){return m().percorsi_falliti?.[p]===api.dati?.giorno_corrente}
 function bloccata(){return percorsoFallito('giorno')&&percorsoFallito('notte')}
 function disponibile(){const d=api.dati;return !!d&&!d.interazioni?.missione_guardia?.attiva&&!bloccata()&&!d.morto&&!d.giornata_completata&&d.giorno_corrente>=2&&d.giorno_corrente<=10&&String(d.interazioni?.['1'])==='2'&&!m().completata&&(d.giorno_corrente>2||d.perquisizione?.conclusa)}
 async function invia(azione,voce=null){
  if(busy)return;busy=true;azioneDelTiro=azione;
  try{
   const r=await window.BorsaNuova.esegui('gioco_missione_galeazzo',{p_codice:api.codice,p_azione:azione,p_voce:voce,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
   if(r){if(['seduci','convinci','fazzoletto','parole','complicita'].includes(azione)&&r.missione?.dialogo)window.Messaggi.mostra({...r.missione.dialogo,pulsante:'Continua'});if(azione==='parole')bozza='';if(azione==='indicazioni')window.Messaggi.mostra({titolo:'La casa dei Bentivoglio',testo:r.partita.indicazioni_ricevute.casa_bentivoglio.testo,pulsante:'Continua'})}
  }finally{busy=false;aggiorna()}
 }
 function azioniLuogo(dest,vista){
  if(!disponibile()||m().attiva||vista?.in_combattimento)return;
  if(!vista?.ha_mappa&&!api.dati.indicazioni_ricevute?.casa_bentivoglio)dest.append(b('Chiedi a un passante dove si trova casa Bentivoglio',()=>invia('indicazioni')));
 }
 function aggiorna(){
  const d=api.dati,s=m(),attiva=!!s.attiva&&!d?.morto;
  promemoria.hidden=!d||String(d.interazioni?.['1'])!=='2';promemoria.textContent=bloccata()?'Favore a Galeazzo: oggi non puoi riprovare. Torna a casa Bentivoglio domani.':s.completata?'Favore a Galeazzo: compiuto.':s.sacchetto?'Sacchetto di Galeazzo: da consegnare fuori Porta Maggiore.':'Favore a Galeazzo: recupera e consegna il sacchetto entro il decimo giorno.';
  main.classList.toggle('missione-galeazzo-attiva',attiva);area.hidden=!attiva;area.replaceChildren();if(!attiva)return;
  if(!['consegna','conclusa'].includes(s.fase))area.append(illustrazione);
  const h=document.createElement('h2');h.textContent=s.fase==='consegna'||s.fase==='conclusa'?'Galeazzo fuori Porta Maggiore':'Il favore a Galeazzo';area.append(h);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato prima di proseguire.'),b('Recupera il risultato',async()=>{azioneDelTiro=sospesa.args?.p_azione||null;await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(s.dialogo){const dialogo=p(s.dialogo.testo);dialogo.setAttribute('role','status');area.append(dialogo)}
  if(s.messaggio){const msg=p(s.messaggio);msg.setAttribute('role','status');area.append(msg)}
  if(s.tiro&&(!window.Dadi||window.Dadi.contestoAttivo('missione'))){const etichetta=p(descrizioniTiro[azioneDelTiro]||({furtivita:'Il tuo tiro di Furtività.',inganno:'Il tuo tiro di Inganno.',serrature:'Il tuo tiro per aprire la serratura.'})[s.tiro.abilita]||'Il tuo tiro per questa azione.');area.append(etichetta);const a=document.createElement('div'),totale=p('');a.className='dadi-area';if(window.Dadi)window.Dadi.mostraRisultato(a,totale,s.tiro,'missione');else totale.textContent=`Tiro: ${s.tiro.totale}`;area.append(a,totale)}
  if(s.fuori){
   area.append(p(bloccata()?'Sei fuori dalla casa. Hai fallito entrambi i percorsi: potrai riprovare domani.':'Sei fuori dalla casa. Il percorso fallito è chiuso per oggi, ma puoi ancora tentare l’altro.'));if(!bloccata())area.append(b('Prova l’altro percorso',()=>invia('rientra')));area.append(b('Riprendi la tua giornata',()=>invia('lascia')));return;
  }
  switch(s.fase){
   case 'scelta':
    area.append(p('Raggiungi casa Bentivoglio. Oltre il portone si trova il cortile con il pozzo. Galeazzo vuole il piccolo sacchetto nascosto sotto una delle pietre.'),p('Puoi entrare adesso oppure aspettare che scenda la notte.'));
    if(!percorsoFallito('giorno'))area.append(b('Entra di giorno',()=>invia('giorno')));
    else area.append(p('La padrona ti ha già mandato via. Puoi ritentare di notte.'));
    if(!percorsoFallito('notte'))area.append(b('Aspetta la notte',()=>invia('notte')));else area.append(p('Hai già fallito il percorso notturno: potrai riprovarlo domani.'));break;
   case 'padrona':
    area.append(p('La padrona di casa ti accoglie sulla soglia e attende una spiegazione. Alle sue spalle intravedi il corridoio che porta al cortile.'));
    if(!s.sociali?.includes('seduci'))area.append(b('Flirta con lei — prova di Inganno',()=>invia('seduci')));
    if(!s.sociali?.includes('convinci'))area.append(b('Racconta di essere un viaggiatore incuriosito dalla bellezza del cortile — prova di Inganno',()=>invia('convinci')));
    if(possiede('fazzoletto_portico'))area.append(b('Offri il fazzoletto ricamato',()=>invia('fazzoletto')));
    if(possiede('polvere_soporifera'))area.append(b('Usa una dose di polvere soporifera',()=>invia('polvere')));break;
   case 'serratura':
    area.append(p('La casa è silenziosa e il portone è chiuso. Puoi provare a forzare la serratura. Hai due tentativi: d20 più bonus Serrature.'),p(`Tentativi effettuati: ${s.tentativi_serratura||0}/2.`),b('Prova ad aprire la serratura — tira il d20',()=>invia('serratura')));
    if(possiede('grimaldello'))area.append(b('Usa un grimaldello — si consuma',()=>invia('grimaldello')));break;
   case 'corridoio':area.append(p('Ti infili nel corridoio buio. Devi raggiungere il cortile senza svegliare chi dorme nelle stanze vicine.'),b('Avanza in silenzio — Furtività',()=>invia('silenzio')));break;
   case 'cortile':{
    area.append(p(s.modo==='seduci'&&!s.cortile_libero?'La padrona ti accompagna in cortile. La inviti a chiudere gli occhi, ma ogni volta che ti chini potrebbe riaprirli.':s.modo==='convinci'&&!s.cortile_libero?'La padrona ti mostra il cortile. Ti avvicini al pozzo e osservi le pietre, cercando di non attirare troppo la sua attenzione.':'Raggiungi il cortile. Accanto al pozzo ci sono nove pietre che potresti sollevare.'),p('Scegli una pietra. Quelle già controllate restano segnate.'));
    const grid=document.createElement('div');grid.className='galeazzo-pietre';
    for(let i=1;i<=9;i++){const visto=s.pietre?.[i];const e=b(`Pietra ${i}`+(visto?' · '+visto:''),()=>invia('pietra',String(i)));if(visto){e.disabled=true;e.setAttribute('data-disabilitato','')}grid.append(e)}area.append(grid);break;
   }
   case 'scontro':
    area.append(p(s.scontro_fase==='mg_scontro_ingresso'?'Il portone si apre dall’interno. Un uomo di casa ti sorprende con le mani sulla serratura.':s.scontro_fase==='mg_scontro_rumore'?'Un rumore tradisce i tuoi passi. Un servitore ti sbarra la strada.':s.scontro_fase==='mg_scontro_uscita'?'La giovane chiama suo padre. Lo senti arrivare prima ancora di vederlo.':'Non riesci a cercare indisturbato. Un uomo di casa entra nel cortile e ti affronta.'),p('Puoi stordirlo per proseguire. Se fuggi, ti ritroverai fuori dalla casa.'),b('Inizia il combattimento',()=>window.AzioniGioco.apriScontro()));break;
   case 'uscita':area.append(p('Hai recuperato il sacchetto. Ora devi uscire senza farti notare.'),b('Cerca di uscire — Furtività',()=>invia('esci')));break;
   case 'figlia':{
    area.append(p('Mentre stai per uscire, una giovane donna adulta compare nel corridoio e ti ferma. È la figlia del padrone di casa. Provi a conquistarne la complicità con qualche parola gentile.'));
    if((s.tentativi_parole||0)<3){
     const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('textarea');label.textContent='Che cosa le dici?';label.htmlFor='parole-figlia';input.id='parole-figlia';input.rows=3;input.maxLength=500;input.required=true;input.value=bozza;input.addEventListener('input',()=>{bozza=input.value});
     const invio=b('Parlale',()=>{});invio.type='submit';form.append(label,input,invio);form.addEventListener('submit',async e=>{e.preventDefault();if(input.value.trim())await invia('parole',input.value.trim())});area.append(form);
    }else area.append(b('Tenta di convincerla — Inganno',()=>invia('complicita')));
    if(possiede('fazzoletto_portico'))area.append(b('Offri il fazzoletto ricamato',()=>invia('fazzoletto')));
    if(possiede('polvere_soporifera'))area.append(b('Usa una dose di polvere soporifera',()=>invia('polvere')));break;
   }
   case 'salvo':area.append(p('Sei fuori dalla casa con il sacchetto al sicuro. Galeazzo ti aspetta fuori Porta Maggiore.'),b('Vai a consegnare il sacchetto a Galeazzo',()=>invia('galeazzo')));break;
   case 'consegna':area.append(p('Galeazzo ti aspetta fuori Porta Maggiore. Il suo sguardo corre subito al sacchetto.'),b('Consegna il sacchetto',()=>invia('consegna')));break;
   case 'conclusa':
    area.append(p('«Chi l’avrebbe detto che un simile allocco sarebbe riuscito a entrare in casa Bentivoglio.»'),p('Decidi di non rispondere: potrebbe ancora trovare il modo di fartela pagare. E poi non vale la pena perdere tempo con un simile verme strisciante.'),p('Gli lanci il sacchetto quasi in faccia, ti giri e te ne vai, sperando di non rivedere più quel muso da topo.'),p('Hai mantenuto la parola.'),b('Riprendi la giornata da dove eri rimasto',()=>invia('riprendi')));return;
  }
  if(s.fase!=='scontro')area.append(b('Torna alla tua giornata — potrai riprendere il favore più tardi',()=>invia('lascia')));
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 window.MissioneGaleazzo={aggiorna,azioniLuogo,disponibile};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
