(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno9';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0;
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 async function risposta(r){if(!r?.racconto)return;let testo=r.racconto.testo;const tiro=r.partita?.stato_partita?.g9?.tiro;
  if(tiro&&['libero','veleno'].includes(r.partita.stato_partita.voce_g9))testo=`Il tuo tiro di resistenza: ${tiro.valori.join(' + ')}${tiro.bonus?' + '+tiro.bonus:''} = ${tiro.totale}.\n\n`+testo;
  if(r.partita.stato_partita.voce_g9==='tavolo'&&!r.partita.stato_partita.g9?.pozione_presa){
   if(await window.ConfermaPergamena(testo,{titolo:r.racconto.titolo,conferma:'Prendi la pozione',annulla:'Lasciala lì'}))await invia('prendi_pozione');
   return;
  }
  window.Messaggi.mostra({...r.racconto,testo,pulsante:r.partita.morto?'Continua':'Avanti'});
 }
 async function invia(azione,testo=null){
  if(busy)return;busy=true;errore='';disegna();let risultato;
  try{risultato=await window.BorsaNuova.esegui('gioco_giorno9',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(!risultato)errore=window.BorsaNuova.errore||''}
  catch(e){errore=e.message}finally{busy=false;disegna()}
  if(risultato)await risposta(risultato);
 }
 function immagine(nome,alt){const src=api.risorsa('images/'+nome);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function mappa(){window.LuoghiGioco.apri()}
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g9||{};
  const valida=d?.giorno_corrente===9&&!d.morto&&(f.startsWith('g9_')||f==='fine_giorno9');
  const piena=valida&&f!=='g9_strada'&&f!=='fine_giorno9';main.classList.toggle('giorno9-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(f==='g9_inizio')immagine('locanda.png','La locanda');else if(['g9_vicolo','g9_soglia','g9_fuori'].includes(f))immagine('vicolo.png','Due case accostate e un gatto scomparso a metà nella giuntura.');else if(piena)immagine('vecchia.png','La vecchina nella sua casa, con il baule sotto il letto');
  const h=document.createElement('h2');h.textContent=f==='g9_inizio'?'Il nono giorno':f==='g9_strada'?'La casa di Giosuè':f==='g9_incantato'?'Una richiesta del tutto naturale':f==='g9_scontro'?'Vinci la sua resistenza':f==='fine_giorno9'?'La boccetta di Giosuè':'Fra due case';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r)risposta(r);disegna()}));return}
  if(f==='g9_inizio')area.append(p('Ti svegli pensando alle pergamene delle due farmacie. Il vicolo delle Tre Chiavi, una casa rossa e una bianca, una porta senza battente. Oggi andrai a vedere se la casa di Giosuè è ancora lì.'),b('Esci dalla locanda',()=>invia('esci_locanda')));
  else if(f==='g9_strada')area.append(p('Le due metà della pergamena indicano il vicolo delle Tre Chiavi. Hai conservato quelle indicazioni e puoi raggiungerlo anche senza possedere la mappa.'),window.LuoghiGioco.conPassante(b('Apri la mappa e raggiungi il vicolo delle Tre Chiavi',mappa)));
  else if(f==='g9_vicolo'){
   area.append(p('Trovi una casa rossa e una bianca, attaccate l’una all’altra. Dove dovrebbe esserci la piccola casa di Giosuè non sembra rimanere spazio. Qualcosa, nelle due facciate, non combacia.'),b('Osserva le due case',()=>invia('osserva')));
   const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input');label.textContent='Che cosa fai?';input.id='azione-casa-g9';label.htmlFor=input.id;input.type='text';input.maxLength=400;input.required=true;input.disabled=busy;const submit=b('Prova',()=>{});submit.type='submit';form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();invia('cerca_casa',input.value)});area.append(form);
   if((g.errori_casa||0)>=3)area.append(p('Descrivi la tua azione: puoi provare a raggiungere lo spazio che non riesci a vedere.'));
   area.append(b('Torna a girare per la città',mappa));
  }else if(f==='g9_soglia')area.append(p('Allunghi la mano verso la giuntura. Le dita scompaiono prima di toccare i mattoni. Fai un passo: fra le due case appare una porta stretta, senza battente. La vecchina che la apre ti squadra sotto il cappuccio. «Un altro curioso? Vieni dentro, non restare lì impalato.»'),b('Entra nella casa',()=>invia('entra')));
  else if(f==='g9_incantesimo')area.append(p('La stanza è piccola. Un letto basso occupa una parete; sotto intravedi un baule. La vecchina si avvicina, ti sfiora il polso e comincia a sussurrare. Il suo volto sembra improvvisamente rassicurante. Ti accorgi a fatica che stai per annuire a qualunque cosa ti chieda.'),b('Prova a resistere all’incantesimo',()=>invia('resisti')));
  else if(f==='g9_incantato'){
   const tiro=g.tiro;if(tiro)area.append(p(`Il tuo tiro di resistenza: ${tiro.valori.join(' + ')}${tiro.bonus?' + '+tiro.bonus:''} = ${tiro.totale}.`));
   area.append(p('La vecchina ti mette uno straccio in mano. «Comincia dal tavolo.» Ti sembra naturale obbedire: sei qui per aiutarla. Strofini un vassoio d’argento finché nel riflesso scorgi il tuo viso, con gli occhi vuoti, e lei alle tue spalle che muove le labbra.'),p('Ti volti. Sorride, ma continua a sussurrare. Per un istante ti chiedi perché tu stia pulendo casa di una sconosciuta.'),b('Prova a liberarti dall’incantesimo',()=>invia('resisti')));
  }else if(f==='g9_confronto')area.append(p('Ora la riconosci per ciò che è. Se conosceva Giosuè, deve sapere che cosa nascondeva qui. «Non ho niente da dirti» sibila, stringendo il bastone. Devi farle perdere la sicurezza e costringerla a parlare.'),b('Affronta la vecchina',()=>invia('confronto')));
  else if(f==='g9_scontro')area.append(p('La vecchina ti tiene d’occhio e prepara un altro maleficio. Puoi intimidirla, ingannarla, contrastare i suoi incanti o ricorrere a una formula sacra. Devi vincere la sua resistenza; non sai quanto ancora riuscirà a tenerti testa.'),b('Inizia il confronto',()=>window.AzioniGioco.apriScontro()));
  else if(f==='g9_fuori')area.append(p('Sei fuori dalla casa. I punti vita persi, le cure e gli oggetti consumati rimangono quelli dello scontro. Ora che conosci l’ingresso puoi tornare dentro: anche la vecchina conserva la resistenza rimasta.'),b('Rientra nella casa',()=>invia('entra')),window.LuoghiGioco.conPassante(b('Apri la mappa e i luoghi',mappa)));
  else if(f==='g9_confessione'||f==='g9_esplora'){
   if(f==='g9_confessione')area.append(p('La vecchina abbassa il bastone. «Basta. Giosuè lasciava qui certe sue preparazioni. Non le ho toccate.» Esita, poi indica il letto. «Il baule. Guarda nel baule e lasciami in pace.»'));
   else area.append(p('La vecchina rimane in disparte. Puoi cercare fra le poche cose della stanza.'));
   if(g.visto_tavolo&&!g.pozione_presa)area.append(b('Prendi la pozione rimasta sotto lo straccio',()=>invia('prendi_pozione')));
   if(g.boccetta_presa)area.append(b('Lascia la casa e termina il racconto di oggi',()=>invia('fine')));
   for(const [id,t] of [['tavolo','Sposta lo straccio e il vassoio'],['mensola','Controlla i recipienti sulla mensola'],['baule','Apri il baule sotto il letto']])area.append(b(t+(g['visto_'+id]?' · Esaminato':''),()=>invia('esplora',id)));
  }else if(f==='g9_baule')area.append(p('Tiri fuori il baule. Dentro, fra panni ingialliti e piccoli recipienti vuoti, trovi una boccetta chiusa. Sull’etichetta riconosci il nome di Giosuè.'),p('«A volte bisogna ridursi al nulla per trovare la gloria.»'),g.boccetta_presa?p('Hai già preso la boccetta di Giosuè.'):b('Prendi la boccetta — peso 0',()=>invia('prendi')),b('Torna a esplorare la stanza',()=>invia('torna_stanza')));
  else if(f==='g9_ritrovamento')area.append(p('Metti al sicuro la boccetta. Non sai ancora a che cosa serva e decidi di non aprirla. La vecchina non aggiunge nulla: hai ottenuto ciò per cui eri venuto.'),b('Torna a esplorare la stanza',()=>invia('torna_stanza')),b('Lascia la casa e termina il racconto di oggi',()=>invia('fine')));
  else if(f==='fine_giorno9')area.append(p('Hai trovato una preparazione di Giosuè. La conservi chiusa, insieme agli altri indizi.'),window.FineGiornata.pulsante(b));
  if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==9){disegna();return}try{await api.rpc('gioco_giorno9',{p_codice:api.codice});if(n!==versione)return;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoNove={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
