(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const REQ='ombra-sui-portici.borsa.richiesta.v1',DRAFT='ombra-sui-portici.taccuino.bozza.v1';
 let catalogo=[],borsa=null,revision=0,busy=false,notesVersion=null,notesBase='',notesOwner=null,ultimoErrore='';
 const info=document.createElement('section'),extra=document.createElement('section');
 info.id='borsa-peso-equip';extra.id='borsa-extra';$('borsa-elenco').before(info);$('borsa-elenco').after(extra);
 const peso=document.createElement('p'),equip=document.createElement('p'),bonus=document.createElement('p'),msg=document.createElement('p'),riprendi=document.createElement('button');
 msg.setAttribute('role','status');riprendi.type='button';riprendi.textContent='Recupera la richiesta in sospeso';riprendi.hidden=true;info.append(peso,equip,bonus,msg,riprendi);
 const loot=document.createElement('section'),shop=document.createElement('section'),notes=document.createElement('section');extra.append(loot,shop,notes);
 const titolo=document.createElement('h3');titolo.textContent='Taccuino';
 const nota=document.createElement('textarea');nota.id='taccuino-testo';nota.maxLength=20000;nota.rows=8;nota.setAttribute('aria-label','Appunti personali');nota.style.cssText='width:100%;font:inherit;padding:12px;resize:vertical';
 const salva=document.createElement('button');salva.type='button';salva.textContent='Salva appunti';
 const caricaNote=document.createElement('button');caricaNote.type='button';caricaNote.textContent='Ricarica appunti salvati';
 const statoNote=document.createElement('p');statoNote.setAttribute('role','status');notes.append(titolo,nota,salva,caricaNote,statoNote);
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.addEventListener('click',f);return e}
 function nome(id){const o=catalogo.find(o=>o.id===id);return o?.nomi_classi?.[api.dati?.classe]||o?.nome||id}
 function leggi(k){try{return JSON.parse(api.memoria.leggi(k))}catch{return null}}
 function pending(){const r=leggi(REQ);return r?.codice===api.codice&&r?.tentativo===api.dati?.tentativo?r:null}
 function intestazione(){
   const r=pending();riprendi.hidden=!r;
   if(r)msg.textContent='Una richiesta deve essere recuperata prima di fare altre modifiche.';
 }
 async function esegui(nomeRpc,args){
   ultimoErrore='';if(busy){ultimoErrore='Attendi il risultato dell’operazione in corso.';return}const vecchia=pending();
   if(vecchia&&JSON.stringify(vecchia.args)!==JSON.stringify(args)){intestazione();ultimoErrore=msg.textContent;return}
   const r=vecchia||{nomeRpc,args,codice:api.codice,tentativo:api.dati.tentativo};
   if(!api.memoria.scrivi(REQ,JSON.stringify(r))){msg.textContent='Abilita la memoria del sito prima di modificare la borsa.';return}
   busy=true;let risultato;
   await api.esegui(async()=>{
     try{
       risultato=await api.rpc(r.nomeRpc,r.args);api.memoria.rimuovi(REQ);
       if(risultato?.partita)await api.applica(risultato.partita,r.codice,{anima:['gioco_giorno6','gioco_cerca_torre','gioco_giorno5','gioco_missione_guardia','gioco_missione_galeazzo','gioco_iliano','gioco_giorno3'].includes(r.nomeRpc)||(r.nomeRpc==='gioco_sala_lettura'&&['manoscritti','sala','torna'].includes(r.args.p_azione))||(r.nomeRpc==='gioco_manoscritti'&&r.args.p_azione!=='documento')||(r.nomeRpc==='gioco_servizi'&&['entra','premi','corridoio','torna','esci'].includes(r.args.p_azione))||(r.nomeRpc==='gioco_giorno4'&&!['parla','passante'].includes(r.args.p_azione))||(r.nomeRpc==='gioco_stanza_nascosta'&&['esplora','scaffali','libri','uscita','torna'].includes(r.args.p_azione))});
       if($('inventario').open)await aggiorna();
     }catch(e){if(!e.message.startsWith('Operazione non riuscita'))api.memoria.rimuovi(REQ);throw e}
   },msg);
   busy=false;if(!risultato)ultimoErrore=msg.textContent;intestazione();return risultato;
 }
 riprendi.addEventListener('click',()=>{const r=pending();if(r)return esegui(r.nomeRpc,r.args)});
 function args(azione,id=null,quantita=1,eq=null){return {p_codice:api.codice,p_azione:azione,p_oggetto:id,p_quantita:quantita,p_equip:eq,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo}}
 async function cambia(tipo,id,aggiungi=true){
   const eq=JSON.parse(JSON.stringify(borsa.partita.equipaggiamento));
   if(tipo==='accessorio'){if(aggiungi)eq.accessori.push(id);else eq.accessori.splice(eq.accessori.indexOf(id),1)}
   else eq[tipo]=eq[tipo]===id?null:id;
   return esegui('gioco_borsa',args('equipaggia',null,1,eq));
 }
 function comandi(){
   if(!borsa)return;
   peso.textContent=`Peso: ${borsa.peso}/${borsa.capacita}`+(borsa.peso>borsa.capacita?' — alleggerisci la borsa prima di aggiungere altro.':'');
   const eq=borsa.partita.equipaggiamento;
   equip.textContent=`Arma: ${eq.arma?nome(eq.arma):'nessuna'} · Difesa: ${eq.difesa?nome(eq.difesa):'nessuna'} · Accessori (${eq.accessori.length}/2): ${eq.accessori.map(nome).join(', ')||'nessuno'}`;
   const nomiBonus={attacco_fisico:'Attacco fisico',attacco_magico:'Attacco magico',difesa_fisica:'Difesa fisica',difesa_magica:'Difesa magica',intuizione:'Intuizione',inganno:'Inganno',fuga:'Fuga',furtivita:'Furtività',serrature:'Serrature',religione:'Religione',conoscenza_arcana:'Conoscenza arcana'};
   bonus.textContent='Bonus totali di classe ed equipaggiamento: '+(Object.entries(borsa.bonus).filter(([,n])=>n!==0).map(([k,n])=>`${nomiBonus[k]||k} ${n>0?'+':''}${n}`).join(' · ')||'nessuno');
   for(const li of document.querySelectorAll('#borsa-elenco > li[data-oggetto]')){
     const id=li.dataset.oggetto,o=catalogo.find(o=>o.id===id),n=api.quantita(borsa.partita.inventario).get(id)||0;
     const quanti=(eq.arma===id?1:0)+(eq.difesa===id?1:0)+eq.accessori.filter(x=>x===id).length;
     const box=document.createElement('div');box.className='comandi-borsa';
     box.append(p(`Peso per copia: ${o?.peso??1}`+(quanti?` · Equipaggiati: ${quanti}`:'')));
     if(!borsa.in_combattimento&&!borsa.partita.morto&&!borsa.partita.giornata_completata){
       if(o?.tipo==='arma'||o?.tipo==='difesa')box.append(b(eq[o.tipo]===id?'Rimuovi dall’equipaggiamento':'Equipaggia',()=>cambia(o.tipo,id)));
       if(o?.tipo==='accessorio'){
         if(eq.accessori.length<2&&quanti<n)box.append(b('Indossa un accessorio',()=>cambia('accessorio',id,true)));
         if(quanti)box.append(b('Rimuovi un accessorio',()=>cambia('accessorio',id,false)));
       }
       if(n>quanti){
         const q=document.createElement('input');q.type='number';q.min='1';q.max=String(n-quanti);q.value='1';q.setAttribute('aria-label','Quantità di '+nome(id));q.style.width='80px';
         function numero(){const v=Number(q.value);if(!Number.isInteger(v)||v<1||v>n-quanti){msg.textContent='Scegli una quantità valida.';return null}return v}
         box.append(q,b('Lascia',async()=>{const qta=numero();if(qta&&await window.ConfermaPergamena(`Abbandonare definitivamente ${qta} × ${nome(id)}?`))return esegui('gioco_borsa',args('lascia',id,qta))}));
         if(borsa.mercante&&o?.prezzo_vendita>0)box.append(b(`Vendi (${o.prezzo_vendita} monete ciascuno)`,async()=>{const qta=numero();if(qta&&await window.ConfermaPergamena(`Vendere ${qta} × ${nome(id)}?`))return esegui('gioco_borsa',args('vendi',id,qta))}));
       }
     }
     li.append(box);
   }
 }
 function mostraBottino(dati){
   loot.replaceChildren();
   for(const s of dati.bottini){
     const h=document.createElement('h3');h.textContent='Bottino: '+s.nome;loot.append(h,p('Scegli cosa portare. Gli oggetti restano qui finché non decidi.'));
     for(const [id,n] of api.quantita(s.oggetti))loot.append(p(`${nome(id)} × ${n}`),b('Prendi una copia',()=>esegui('gioco_bottino',{p_codice:api.codice,p_azione:'prendi',p_scontro:s.scontro,p_oggetto:id,p_quantita:1,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo})));
     loot.append(b('Lascia il bottino rimanente',async()=>{if(await window.ConfermaPergamena('Lasciare definitivamente gli oggetti rimasti in questo bottino?'))return esegui('gioco_bottino',{p_codice:api.codice,p_azione:'rinuncia',p_scontro:s.scontro,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo})}));
   }
 }
 async function aggiorna(){
   if(!api.dati){info.hidden=true;extra.hidden=true;return}info.hidden=false;extra.hidden=false;const n=++revision;
   try{
     const [bag,cat,bottino,appunti]=await Promise.all([
       api.rpc('gioco_borsa',{p_codice:api.codice}),api.rpc('gioco_catalogo_oggetti',{}),api.rpc('gioco_bottino',{p_codice:api.codice}),api.rpc('gioco_taccuino',{p_codice:api.codice})]);
     if(n!==revision)return;borsa=bag;catalogo=cat;
     // Il ridisegno rimuove i controlli delle righe precedenti.
     api.ridisegnaBorsa();comandi();mostraBottino(bottino);shop.replaceChildren();
     if(bag.mercante){const h=document.createElement('h3');h.textContent='Dal mercante';shop.append(h);for(const [id,prezzo] of Object.entries(bag.catalogo_mercante))shop.append(b(`Compra ${nome(id)} — ${prezzo} monete`,async()=>{if(await window.ConfermaPergamena(`Comprare ${nome(id)} per ${prezzo} monete?`))return esegui('gioco_borsa',args('compra',id))}))}
     const bozza=leggi(DRAFT),cambiato=notesOwner!==api.codice;
     const sporco=!cambiato&&nota.value!==notesBase;
     if(!sporco){const locale=bozza?.codice===api.codice;notesVersion=locale?bozza.versione:appunti.versione;notesBase=locale?(bozza.base??appunti.testo):appunti.testo;nota.value=locale?bozza.testo:appunti.testo;notesOwner=api.codice}
     notes.hidden=!appunti.scrivibile&&!appunti.testo&&!(bozza?.codice===api.codice);
     nota.readOnly=!appunti.scrivibile;salva.disabled=!appunti.scrivibile;
     if(!appunti.scrivibile)statoNote.textContent='Gli appunti restano leggibili. Per scrivere servono pergamena e calamaio.';
     else if(appunti.versione!==notesVersion)statoNote.textContent='Gli appunti sono cambiati altrove. Conserva la tua bozza prima di ricaricarli.';
     else statoNote.textContent=nota.value!==notesBase?'Bozza non salvata.':'Appunti salvati.';
     intestazione();
   }catch(e){msg.textContent=e.message}
 }
 nota.addEventListener('input',()=>{api.memoria.scrivi(DRAFT,JSON.stringify({codice:api.codice,testo:nota.value,versione:notesVersion,base:notesBase}));statoNote.textContent='Bozza non salvata.'});
 caricaNote.addEventListener('click',async()=>{if(nota.value!==notesBase&&!await window.ConfermaPergamena('Scartare la bozza locale e ricaricare gli appunti salvati?'))return;api.memoria.rimuovi(DRAFT);notesOwner=null;return aggiorna()});
 salva.addEventListener('click',()=>api.esegui(async()=>{
   const testo=nota.value;const r=await api.rpc('gioco_taccuino',{p_codice:api.codice,p_testo:testo,p_versione:notesVersion});
   notesVersion=r.versione;notesBase=testo;
   if(nota.value===testo){api.memoria.rimuovi(DRAFT);statoNote.textContent='Appunti salvati.'}
   else api.memoria.scrivi(DRAFT,JSON.stringify({codice:api.codice,testo:nota.value,versione:notesVersion,base:notesBase}));
 },statoNote));
 window.BorsaNuova={aggiorna,esegui,nome,pending,get errore(){return ultimoErrore},get inCombattimento(){return borsa?.in_combattimento===true}};
})();
