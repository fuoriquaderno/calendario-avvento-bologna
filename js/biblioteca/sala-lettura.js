(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='sala-lettura';area.hidden=true;
 document.querySelector('main .scroll-middle').append(area);
 let vista=null,busy=false,revisione=0;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function h(t){const e=document.createElement('h3');e.textContent=t;return e}
 function b(t,fn){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e}
 function mostra(r){if(!r?.lettura)return;window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Torna alla sala'})}
 async function invia(azione,voce=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_sala_lettura',{p_codice:api.codice,p_azione:azione,p_voce:voce,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});mostra(r)}
  finally{busy=false;await aggiorna()}
 }
 function disegna(){
  const d=api.dati,f=d?.stato_partita?.fase;area.replaceChildren();
  area.hidden=!d||![3,4].includes(d.giorno_corrente)||d.morto||!['g3_biblioteca'].includes(f);if(area.hidden||!vista)return;
  const titolo=document.createElement('h2');titolo.textContent=f==='g3_manoscritti'?'La sala dei manoscritti':'La sala di lettura';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);mostra(r);await aggiorna()}));return}
  if(d.luogo_attuale!=='biblioteca'){area.append(p('Il bibliotecario e i volumi ti aspettano nella biblioteca del convento.'),b('Torna alla biblioteca',()=>invia('torna')));return}
  if(f==='g3_manoscritti'){
   area.append(p('Lasci la sala di lettura e raggiungi l’ingresso della sala dei manoscritti.'),p('Questa parte dell’esplorazione è ancora da costruire. Puoi tornare a consultare i libri e parlare con il bibliotecario.'),b('Torna alla sala di lettura',()=>invia('sala')));return;
  }
  area.append(p('Un vecchio frate è chino su un volume aperto. Intorno a lui, i libri occupano scaffali e tavoli. Quando ti avvicini, solleva lo sguardo.'),p('«Se cerchi un libro, parla piano. Se devi restituirlo, parla ancora più piano: potrei ricordarmi da quanto tempo manca.»'),h('Parla con il bibliotecario'));
  const dialoghi=document.createElement('div');dialoghi.className='dialoghi-bibliotecario';
  for(const q of vista.dialoghi){const visto=vista.stato.dialoghi?.[q.id];const e=b(q.domanda+(visto?' · Già chiesto':''),()=>invia('dialogo',q.id));e.dataset.dialogo=q.id;dialoghi.append(e)}
  area.append(dialoghi,h('I libri della sala'));
  const elenco=document.createElement('ul');elenco.className='tomi-sala-lettura';
  for(const libro of [...vista.tomi].sort((a,b)=>a.titolo.localeCompare(b.titolo,'it'))){const letto=!!vista.stato.libri?.[libro.id];const li=document.createElement('li');const e=b(libro.titolo,()=>invia('libro',libro.id));e.dataset.libro=libro.id;li.append(e);if(letto){const s=document.createElement('span');s.className='tomo-letto';s.textContent='Letto';li.append(s)}elenco.append(li)}
  area.append(elenco,b('Vai alla sala dei manoscritti',()=>invia('manoscritti')));
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++revisione,d=api.dati;
  if(!d||![3,4].includes(d.giorno_corrente)||!['g3_biblioteca'].includes(d.stato_partita?.fase)){area.hidden=true;vista=null;return}
  try{const r=await api.rpc('gioco_sala_lettura',{p_codice:api.codice});if(n!==revisione)return;vista=r;disegna()}
  catch(e){if(n!==revisione)return;area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare la sala',aggiorna))}
 }
 
 window.SalaLettura={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
