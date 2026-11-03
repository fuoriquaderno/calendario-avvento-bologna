(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='negozio-citta';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let vista=null,rev=0,busy=false;
 const etichette={attacco_principale:'Per colpire',difesa_fisica:'Difesa fisica',difesa_magica:'Difesa magica'};
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.addEventListener('click',f);return e}
 function h(t,livello='h3'){const e=document.createElement(livello);e.textContent=t;return e}
 function nome(o){return o.nomi_classi?.[api.dati?.classe]||o.nome}
 async function azione(tipo,id,prezzo){
  if(busy)return;
  if(!await window.ConfermaPergamena((tipo==='compra'?'Comprare':'Vendere')+' '+id.nome+' per '+prezzo+' monete d’argento?'))return;
  busy=true;
  await window.BorsaNuova.esegui('gioco_negozio',{p_codice:api.codice,p_azione:tipo,p_negozio:vista.negozio.id,p_oggetto:id.id,p_quantita:1,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
  busy=false;await aggiorna();
 }
 function disegna(){
  area.replaceChildren();area.hidden=!vista?.negozio||api.dati?.morto;if(area.hidden)return;
  const n=vista.negozio;area.append(h(n.nome,'h2'),p(n.negoziante),p('Argento disponibile: '+vista.partita.oro_rimanente+' monete'));
  area.append(b('Parla con '+n.negoziante,()=>{window.Messaggi.mostra({titolo:n.negoziante,testo:api.dati.giorno_corrente===4?'«Prima di cercare altrove, riprenderei da dove eri arrivato ieri.»':n.saluto,pulsante:'Torna al negozio'})}));
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('C’è un’operazione da recuperare.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);await aggiorna()}));return}
  if(vista.bloccato)area.append(p(vista.partita.giornata_completata?'Puoi guardare l’assortimento. Dopo la conferma della giornata non puoi modificare i tuoi acquisti.':'Non puoi commerciare durante un combattimento.'));
  area.append(h('Compra'));
  for(const o of vista.prodotti){
   const r=document.createElement('article');r.className='prodotto-negozio';
   r.append(h(nome(o)),p(o.descrizione));
   const bonus=Object.entries(o.bonus||{}).map(([k,v])=>(etichette[k]||k)+' '+(v>0?'+':'')+v).join(' · ');if(bonus)r.append(p(bonus));
   r.append(p('Peso: '+o.peso+' · Acquisto: '+o.prezzo_acquisto+' · Vendita: '+o.prezzo_vendita+' monete'));
   const compra=b('Compra — '+o.prezzo_acquisto+' monete',()=>azione('compra',{id:o.id,nome:nome(o)},o.prezzo_acquisto));
   compra.disabled=busy||vista.bloccato||vista.partita.oro_rimanente<o.prezzo_acquisto;r.append(compra);
   if(vista.partita.oro_rimanente<o.prezzo_acquisto)r.append(p('Ti mancano '+(o.prezzo_acquisto-vista.partita.oro_rimanente)+' monete.'));
   area.append(r);
  }
  area.append(h('Vendi'));
  if(!vista.vendibili.length)area.append(p('Non hai oggetti che questo negoziante possa ritirare.'));
  const eq=vista.partita.equipaggiamento,indossati=[eq.arma,eq.difesa,...eq.accessori];
  for(const o of vista.vendibili){
   const r=document.createElement('div');r.className='prodotto-negozio';r.append(p(nome(o)+' × '+o.quantita));
   const indossate=indossati.filter(id=>id===o.id).length;
   const vendi=b('Vendi una copia — '+o.prezzo_vendita+' monete',()=>azione('vendi',{id:o.id,nome:nome(o)},o.prezzo_vendita));vendi.disabled=busy||vista.bloccato||o.quantita<=indossate;r.append(vendi);
   if(o.quantita<=indossate)r.append(p('Rimuovi prima l’oggetto dall’equipaggiamento nella borsa.'));area.append(r);
  }
  area.append(b('Esci verso Piazza Maggiore',async()=>{await window.BorsaNuova.esegui('gioco_luoghi',{p_codice:api.codice,p_azione:'vai',p_destinazione:'piazza_maggiore',p_tentativo:api.dati.tentativo});await aggiorna()}));
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++rev;if(!api.dati){vista=null;area.hidden=true;return}
  try{const r=await api.rpc('gioco_negozio',{p_codice:api.codice});if(n!==rev)return;vista=r;disegna()}
  catch(e){area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare il negozio',aggiorna))}
 }
 
 window.NegoziGioco={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
