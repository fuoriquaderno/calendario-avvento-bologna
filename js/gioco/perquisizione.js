(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id),DRAFT='ombra-sui-portici.perquisizione.scelta.v1';
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='perquisizione';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let vista=null,versione=0,form=null,stato=null,inputs=new Map(),arma=null,difesa=null,riepilogo=null,conferma=null;
 let propostaInCorso=false,timerProposta=null;
 async function apriProposta(){
   const s=vista?.stato;if(propostaInCorso||!s?.proposta||area.hidden||window.BorsaNuova.pending())return;
   if(api.occupato){programmaProposta();return}
   const aperto=document.querySelector('dialog[open]');
   if(aperto){aperto.addEventListener('close',programmaProposta,{once:true});return}
   propostaInCorso=true;
   const codiceProposta=api.codice,tentativoProposta=api.dati?.tentativo,versioneProposta=vista.versione;
   try{
     const accetta=await window.ConfermaPergamena(s.messaggio||'La guardia attende una risposta.',{titolo:s.proposta==='prometto'?'Il favore della guardia':'La proposta della guardia',conferma:'Accetta la proposta',annulla:'Rifiuta la proposta'});
     if(area.hidden||api.codice!==codiceProposta||api.dati?.tentativo!==tentativoProposta||vista?.versione!==versioneProposta||vista?.stato?.proposta!==s.proposta)return;
     await azione(accetta?'accetta':'rifiuta');
   }finally{propostaInCorso=false}
 }
 function programmaProposta(){
   if(timerProposta!==null||propostaInCorso)return;
   timerProposta=setTimeout(()=>{timerProposta=null;apriProposta()},100);
 }
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.addEventListener('click',f);return e}
 function leggiBozza(){try{const r=JSON.parse(api.memoria.leggi(DRAFT));return r?.codice===api.codice&&r?.tentativo===api.dati.tentativo?r.selezione:null}catch{return null}}
 function limiteCopie(){return vista?.senza_limite?vista.capacita+2:7}
 function selezione(){const oggetti=[];for(const [id,input] of inputs){const n=Number(input.value);if(Number.isInteger(n)&&n>=0&&n<=limiteCopie())for(let j=0;j<n;j++)oggetti.push(id);else return null}return {oggetti,arma:arma.value,difesa:difesa.value}}
 function aggiornaPeso(){
   const s=selezione();if(!s){riepilogo.textContent='Scegli quantità intere da 0 a '+limiteCopie()+'.';conferma.disabled=true;return false}
   const totale=[...s.oggetti,s.arma,s.difesa].filter(Boolean),pesi=new Map(vista.catalogo.map(o=>[o.id,o.peso]));
   const peso=totale.reduce((n,id)=>n+(pesi.get(id)??1),vista.peso_dotazione),quantita=api.quantita(totale);
   const eccesso=[...quantita].some(([id,n])=>{const o=vista.catalogo.find(o=>o.id===id);return !o||(o.disponibili!==-1&&n>o.disponibili)});
   const ok=s.oggetti.length<=vista.posti&&peso<=vista.capacita&&!eccesso&&s.arma&&s.difesa;
   riepilogo.textContent=(vista.senza_limite?`Oggetti: ${s.oggetti.length} · Peso: ${peso}/${vista.capacita}`:`Posti: ${s.oggetti.length}/${vista.posti} · Peso: ${peso}/${vista.capacita}`)+(eccesso?' · Hai scelto più copie di quelle sul tavolo.':'');conferma.disabled=!ok;
   api.memoria.scrivi(DRAFT,JSON.stringify({codice:api.codice,tentativo:api.dati.tentativo,selezione:s}));return !!ok;
 }
 async function azione(azione,extra={}){
   const args={p_codice:api.codice,p_azione:azione,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo,p_versione:vista.versione,...extra};
   const r=await window.BorsaNuova.esegui('gioco_perquisizione',args);
   if(r){if(vista&&!vista.conclusa&&conferma)aggiornaPeso();if(r.perquisizione.stato.proposta){programmaProposta()}else if(r.perquisizione.stato.messaggio){window.Messaggi.mostra({titolo:'Il guardiano',testo:r.perquisizione.stato.messaggio,pulsante:'Continua'})}}
   else if(window.BorsaNuova.pending())await aggiorna();
   else if(stato)stato.textContent=window.BorsaNuova.errore;
 }
 function disegna(){
   area.replaceChildren();inputs=new Map();
   const h=document.createElement('h2');h.textContent=vista.conclusa?'Perquisizione conclusa':'La perquisizione';area.append(h);
   if(vista.conclusa){area.append(p('Il controllo è terminato. La tua dotazione è registrata nella Borsa.'));return}
   area.append(p(vista.senza_limite?'Le otto guardie sono a terra. Scegli gli oggetti che vuoi portare: resta soltanto il limite di peso della classe. Scegli anche un’arma e una difesa.':'Scegli fino a cinque oggetti, un’arma e una difesa. La dotazione di classe è aggiuntiva, ma tutto quello che porti contribuisce al peso. Gli oggetti non scelti resteranno sul tavolo.'));
   if(vista.dotazione_classe.length)area.append(p('Dotazione di classe: '+vista.dotazione_descritta.join(', ')));
   const pendente=window.BorsaNuova.pending();if(pendente){area.append(p('C’è una richiesta da recuperare.'),b('Recupera la richiesta',async()=>{await window.BorsaNuova.esegui(pendente.nomeRpc,pendente.args);await aggiorna()}));return}
   const s=vista.stato;
   if(s.messaggio&&!s.proposta)area.append(p(s.messaggio));
   if(!s.proposta&&s.inganno&&(!window.Dadi||window.Dadi.contestoAttivo('perquisizione'))){const dado=document.createElement('div'),totale=document.createElement('p');dado.className='dadi-area';if(window.Dadi)window.Dadi.mostraRisultato(dado,totale,s.inganno,'perquisizione');else totale.textContent='Inganno: '+s.inganno.totale;area.append(dado,totale)}
   else if(!s.proposta&&!s.inganno&&!s.cacciato&&!vista.senza_limite)area.append(b('Tenta di nascondere un oggetto — Inganno',()=>azione('inganno')));
   if(s.proposta){area.append(p('La guardia attende la tua risposta alla proposta.'),b('Rileggi la proposta della guardia',apriProposta));programmaProposta()}
   else if(!s.dialogo_chiuso){
     const lettere=document.createElement('p');lettere.className='lettere-perquisizione';lettere.textContent=vista.lettere;
     const label=document.createElement('label');label.htmlFor='parola-perquisizione';label.textContent='Come reagisci? Componi una parola di 7 o 8 lettere. Non devi usarle tutte.';
     const parola=document.createElement('input');parola.id='parola-perquisizione';parola.type='text';parola.autocomplete='off';parola.style.cssText='width:100%;padding:10px;font:inherit';
     const invia=b('Rivolgiti alla guardia',()=>{if(parola.value.trim())return azione('parola',{p_parola:parola.value})});
     parola.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();invia.click()}});
     area.append(lettere,label,parola,invia,p(`Risposte non riconosciute: ${s.errori||0}/3`));
   }
   const bozza=leggiBozza()||s.selezione||{oggetti:[],arma:'',difesa:''},q=api.quantita(bozza.oggetti);
   form=document.createElement('div');form.className='scelta-dotazione';area.append(form);
   const titolo=document.createElement('h3');titolo.textContent='Oggetti da portare';form.append(titolo,p(vista.senza_limite?'Puoi scegliere oltre sette oggetti, rispettando peso e disponibilità sul tavolo.':'Ogni copia occupa un posto. La mappa pesa zero, ma devi sceglierla.'));
   for(const o of vista.catalogo){
     const r=document.createElement('label');r.className='riga-dotazione';
     const testo=document.createElement('span');testo.textContent=`${o.nome} · peso ${o.peso}`+(o.tipo==='arma'||o.tipo==='difesa'?' · riserva':'');
     const input=document.createElement('input');input.type='number';input.min='0';input.max=String(o.disponibili===-1?limiteCopie():Math.min(limiteCopie(),o.disponibili));input.value=String(q.get(o.id)||0);input.setAttribute('aria-label','Quantità di '+o.nome);input.addEventListener('input',aggiornaPeso);inputs.set(o.id,input);r.append(testo,input);form.append(r);
   }
   function scelta(tipo,valore){
     const label=document.createElement('label');label.textContent=tipo==='arma'?'Arma equipaggiata':'Difesa equipaggiata';
     const select=document.createElement('select');select.setAttribute('aria-label',label.textContent);let option=document.createElement('option');option.value='';option.textContent='Scegli';select.append(option);
     for(const o of vista.catalogo.filter(o=>o.tipo===tipo)){option=document.createElement('option');option.value=o.id;option.textContent=`${o.nome} · peso ${o.peso} · bonus ${Object.values(o.bonus).length?Math.max(...Object.values(o.bonus)):0}`;select.append(option)}
     select.value=valore||'';select.addEventListener('change',aggiornaPeso);label.append(select);form.append(label);return select;
   }
   arma=scelta('arma',bozza.arma);difesa=scelta('difesa',bozza.difesa);riepilogo=document.createElement('p');riepilogo.setAttribute('aria-live','polite');
   conferma=b('Conferma gli oggetti da portare',async()=>{if(aggiornaPeso()&&await window.ConfermaPergamena('Confermare la dotazione? La dotazione di classe resta con te; gli altri oggetti non scelti resteranno sul tavolo.'))return azione('conferma',{p_selezione:selezione()})});
   stato=document.createElement('p');stato.setAttribute('role','status');form.append(riepilogo,conferma,stato);aggiornaPeso();
 }
 async function aggiorna(){
   const n=++versione,d=api.dati;area.hidden=!d||d.giorno_corrente!==2||!['perquisizione','dopo_perquisizione'].includes(d.stato_partita?.fase)||(d.luogo_attuale&&d.luogo_attuale!=='porta_maggiore');
   if(area.hidden)return;
   try{const r=await api.rpc('gioco_perquisizione',{p_codice:api.codice});if(n!==versione)return;vista=r.perquisizione;disegna()}
   catch(e){area.replaceChildren(p(e.message),b('Riprova a caricare la perquisizione',aggiorna))}
 }
 
 window.Perquisizione={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
