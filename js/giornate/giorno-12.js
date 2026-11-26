(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno12';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,owner=null,quote=['','',''];
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);img.addEventListener('error',()=>figura.hidden=true);img.addEventListener('load',()=>figura.hidden=false);
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno12',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r)risposta(r);else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 function mappa(){window.LuoghiGioco.apri()}
 function illustrazione(nome,alt){const src=api.risorsa('images/'+nome);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function scala(g){
  area.append(p('La scala deve raggiungere la porta con tre gradini ed essere comoda per chi la sale. I blocchi provvisori possono essere riposizionati prima del fissaggio.'));
  if(!g.misurato){area.append(b('Misura l’altezza della soglia con il regolo',()=>invia('misura')));return}
  area.append(p('La soglia è a nove palmi dal terreno. Scegli l’altezza da terra di ciascuna superficie: non la distanza dal gradino precedente.'));
  const form=document.createElement('form');form.className='quote-scala';const selects=[];
  for(let i=0;i<3;i++){const label=document.createElement('label'),select=document.createElement('select');select.id='quota-gradino-'+i;select.required=true;select.disabled=busy;label.htmlFor=select.id;label.textContent=['Primo','Secondo','Terzo'][i]+' gradino: altezza da terra';
   for(let n=0;n<=9;n++){const opt=document.createElement('option');opt.value=n?String(n):'';opt.textContent=n?n+' palmi':'Scegli l’altezza';if(!n)opt.disabled=true;select.append(opt)}select.value=quote[i];select.addEventListener('change',()=>quote[i]=select.value);form.append(label,select);selects.push(select);
  }
  const submit=b('Disponi i blocchi e controlla la scala',()=>{});submit.type='submit';form.append(submit);form.addEventListener('submit',e=>{e.preventDefault();if(selects.some(e=>!e.value))return;quote=selects.map(e=>e.value);invia('disponi',JSON.stringify(quote.map(Number)))});area.append(form);
  if((g.errori_scala||0)>=3)area.append(b('Chiedi un consiglio al costruttore',()=>invia('aiuto')));
 }
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g12||{};const key=api.codice+':'+d?.tentativo;if(key!==owner){owner=key;quote=['','','']}
  const valida=d?.giorno_corrente===12&&!d.morto&&(f.startsWith('g12_')||f==='fine_giorno12');const piena=valida&&!['g12_strada','fine_giorno12'].includes(f);main.classList.toggle('giorno12-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena)illustrazione(f==='g12_locanda'?'locanda.png':f==='g12_torri'?'torri_uguali.png':['g12_briganti','g12_scontro_briganti','g12_dopo_briganti','g12_fuga_briganti'].includes(f)?'porta_maggiore.png':'costruttori.png',f==='g12_torri'?'Due torri simili, con piccole differenze nella muratura.':f==='g12_locanda'?'La locanda.':f.includes('briganti')?'Porta Maggiore, appena oltre le mura.':'La corporazione dei Costruttori, fuori dalle mura.');
  const h=document.createElement('h2');h.textContent=({g12_locanda:'Il dodicesimo giorno',g12_torri:'Simili, ma non uguali',g12_strada:'Una nuova pista',g12_briganti:'Appena fuori Porta Maggiore',g12_scontro_briganti:'Due briganti sulla strada',g12_dopo_briganti:'La strada è libera',g12_fuga_briganti:'Di nuovo alla porta',g12_corporazione:'La Corporazione dei Costruttori',g12_scala:'Tre gradini per una porta',g12_successo:'Il lavoro compiuto',fine_giorno12:'Ospite dei Costruttori'})[f]||'Il dodicesimo giorno';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r)risposta(r);disegna()}));return}
  if(f==='g12_locanda')area.append(p('Ti svegli nella solita locanda. Le macchine di Demetrio, l’arazzo di Samuele, la boccetta di Giosuè e gli appunti di Alano ti hanno dato qualcosa da conservare. Di Goffredo e Fiorenza sai ancora troppo poco. E il nascondiglio del tomo resta da trovare.'),b('Fai colazione',()=>invia('colazione')),b('Esci subito',()=>invia('esci')));
  else if(f==='g12_torri'){
   if(!g.passante_ascoltato)area.append(p('Passi davanti a due torri quasi uguali per altezza e forma. Eppure qualcosa non torna: una finestra appena fuori allineamento, una piccola crepa rattoppata, qualche giunto meno regolare. Ti fermi a confrontarle. Un passante nota il tuo sguardo e ti si avvicina.'),b('Ascolta il passante',()=>invia('ascolta')));
   else if(!g.corporazione_nota)area.append(p('Il passante ti ha raccontato due modi diversi di costruire. Vorresti sapere chi siano gli artigiani della seconda torre.'),b('Chiedi chi sono questi costruttori',()=>invia('chi')));
   else if(!g.indicazioni)area.append(p('Il nome di Goffredo ti ha fatto drizzare le orecchie. Vuoi capire se la corporazione conservi ancora qualcosa del suo lavoro.'),b('Chiedi dove trovarli',()=>invia('dove')));
   else area.append(p('La casa comune dei Costruttori si trova poco fuori Porta Maggiore. Hai ricevuto le indicazioni per raggiungerla.'),...window.LuoghiGioco.conPassante(b('Apri la mappa e raggiungi la corporazione',mappa)));
   area.append(b('Continua a camminare',()=>invia('continua')));
  }else if(f==='g12_strada')area.append(p(g.indicazioni?'Puoi raggiungere la casa comune dei Costruttori appena fuori Porta Maggiore.':g.corporazione_nota?'Il passante delle due torri conosce i costruttori di Goffredo. Puoi tornare a chiedergli dove trovarli.':'Ripensi alle due torri simili e al passante che voleva raccontarti qualcosa. Puoi tornare lì quando vuoi.'),...window.LuoghiGioco.conPassante(b('Apri la mappa e scegli dove andare',mappa)));
  else if(f==='g12_briganti')area.append(p('Passi sotto Porta Maggiore senza essere risucchiato verso l’alto. Non fai in tempo a goderti la tranquillità: appena oltre le mura due uomini ti sbarrano il passo. Uno tiene un coltellaccio, l’altro batte un bastone sul palmo. «La passeggiata si paga.»'),p('Sono in due: dopo ogni tua azione attaccherà ciascun brigante ancora in piedi.'),b('Affronta i briganti',()=>invia('affronta')));
  else if(f==='g12_scontro_briganti')area.append(p('I due briganti si dispongono ai lati della strada. Preparati: finché saranno entrambi in piedi, ognuno avrà la propria occasione per attaccarti.'),b('Inizia lo scontro',()=>window.AzioniGioco.apriScontro()));
  else if(f==='g12_fuga_briganti')area.append(p('Riesci a tornare verso Porta Maggiore. I briganti restano sulla strada della corporazione. Conservi i punti vita rimasti e gli oggetti consumati non tornano nella Borsa. Anche loro mantengono le ferite ricevute.'),b('Torna ad affrontare i briganti',()=>invia('affronta')),...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  else if(f==='g12_dopo_briganti')area.append(p('I briganti non ti sbarrano più la strada. Ti rimetti in cammino verso la casa comune: da poco lontano arriva il suono di un martello.'),b('Prosegui verso i costruttori',()=>invia('prosegui')));
  else if(f==='g12_corporazione'){
   area.append(p('La casa comune sorge poco fuori dalle mura. Un uomo lavora al banco, fra squadra, filo a piombo e martello. Più in là vedi una piccola torre con una porta rialzata e una scala ancora incompleta. Un anziano osserva il lavoro.'));
   if(!g.parlato_anziano)area.append(b('Parla con l’anziano di Goffredo',()=>invia('parla','anziano')));
   if(!g.parlato_artigiano)area.append(b('Parla con l’artigiano al banco',()=>invia('parla','artigiano')));
   for(const [id,t] of [['squadra','Osserva la squadra'],['piombo','Esamina il filo a piombo'],['regolo','Prendi il regolo']])area.append(b(t+(g['visto_'+id]?' · Esaminato':''),()=>invia('strumento',id)));
   if(g.parlato_anziano||g.parlato_artigiano)area.append(b(g.problema?'Torna alla scala':'Chiedi che cosa stanno costruendo',()=>invia('problema')));
   area.append(...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f==='g12_scala'){scala(g);area.append(b('Torna al banco dei costruttori',()=>invia('banco')),...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)))}
  else if(f==='g12_successo')area.append(p('La scala raggiunge la porta. I costruttori ripongono gli attrezzi: per oggi il lavoro è finito. L’anziano ti invita a restare nella casa comune per la notte. Accetti volentieri; domani vorrai capire che cosa custodisca quella torre.'),b('Accetta l’ospitalità e termina il racconto di oggi',()=>invia('fine')));
  else if(f==='fine_giorno12')area.append(p('Hai aiutato la corporazione a completare la scala. Per questa notte sarai ospite dei Costruttori.'),b('Termina giornata',()=>window.FineGiornata.apri()));
  if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==12){disegna();return}try{await api.rpc('gioco_giorno12',{p_codice:api.codice});if(n!==versione)return;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoDodici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
