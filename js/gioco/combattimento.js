// Un solo motore di interfaccia per allenamento e combattimenti della storia.
(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const KEY='ombra-sui-portici.scontri.v2';
 let vista=null,modo='allenamento',elenco=[],busy=false,pendente=null,owner=null;
 const prova=document.createElement('button');prova.type='button';prova.textContent='Allenamento';prova.id='apri-allenamento';
 const combatti=document.createElement('button');combatti.type='button';combatti.textContent='Riprendi combattimento';combatti.hidden=true;
 const livelli=document.createElement('p');livelli.id='progressione-personaggio';
 $('borsa-elenco').after(livelli);livelli.after(prova);prova.after(combatti);
 const nellaStoria=document.createElement('button');nellaStoria.type='button';nellaStoria.hidden=true;nellaStoria.style.cssText='width:100%;padding:12px;font:inherit;cursor:pointer';
 document.querySelector('main .scroll-middle').append(nellaStoria);
 const dialogo=document.createElement('dialog');dialogo.className='avviso-codice borsa-dialog allenamento-dialog';dialogo.setAttribute('aria-labelledby','titolo-allenamento');
 dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-allenamento">Allenamento</h2><p id="regole-scontro"></p><div id="contenuto-allenamento"></div><p id="stato-allenamento" role="status" aria-live="polite"></p><button type="button" id="chiudi-allenamento">Chiudi</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(dialogo);
 
 const area=$('contenuto-allenamento'),stato=$('stato-allenamento');
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 function salva(){api.memoria.scrivi(KEY,JSON.stringify({codice:api.codice,modo,sessione:vista?.sessione||pendente?.p_sessione,pendente}))}
 function dadi(t,r){
   if(!r||(window.Dadi&&!window.Dadi.contestoAttivo('combattimento')))return;const h=document.createElement('h3');h.textContent=t;const a=document.createElement('div');a.className='dadi-area';a.setAttribute('aria-hidden','true');const totale=document.createElement('p');
   if(window.Dadi)window.Dadi.mostraRisultato(a,totale,r,'combattimento');else totale.textContent=`${r.valori.join(' + ')} + ${r.bonus} = ${r.totale}`;
   area.append(h,a,totale);
 }
 function racconto(){
   if(!vista?.turno)return;
   let testo=vista.turno.messaggi.map(m=>m.testo+(m.danni?` (${m.danni} HP di danno)`:'')).join('\n\n');
   if(vista.turno.bonus_percentuale===20)testo='Colpo potente: +20% ai danni.\n\n'+testo;
   window.Messaggi.mostra({titolo:'Il combattimento',testo,pulsante:'Continua'});
 }
 function disegna(){
   area.replaceChildren();$('chiudi-allenamento').disabled=busy;
   $('titolo-allenamento').textContent=modo==='allenamento'?'Allenamento':'Combattimento';
   $('regole-scontro').textContent=modo==='allenamento'?'Questa è una prova: vita, oggetti, cura, XP e morti della partita restano invariati. Hai una pozione di prova per tipo.':'Ogni azione consuma un turno. Chiudere questa finestra non equivale a fuggire: lo scontro resta in corso.';
   if(pendente){area.append(p('La richiesta deve essere confermata prima di agire ancora.'),b('Recupera il risultato',()=>richiedi(pendente)));return}
   if(!vista){
     if(modo==='storia'){area.append(p('Lo scontro non è disponibile in questa scena. Chiudi la finestra per continuare la storia.'));return}
     area.append(p('Scegli l’avversario. Vedi solo i tuoi dadi. Con 1–2 naturali perdi l’azione; con 18–20, se colpisci, +20% danni. Per fuggire devi superare la soglia del nemico con d20 + bonus di fuga della classe.'));
     for(const n of elenco){const h=document.createElement('h3');h.textContent=n.nome;area.append(h,p(n.descrizione),b('Affronta '+n.nome,()=>richiedi({p_codice:api.codice,p_sessione:crypto.randomUUID(),p_azione:'crea',p_avversario:n.codice})))}
     if(!elenco.length)area.append(b('Riprova',()=>apri('allenamento')));return;
   }
   area.append(p(`${vista.giocatore.nome} · ${vista.giocatore.classe} · Livello ${vista.giocatore.livello||1} · ${vista.giocatore.xp||0} XP · ${vista.giocatore.hp}/${vista.giocatore.hp_massimi} HP`),p(vista.avversario.nome));
   if(vista.turno){
     const t= vista.turno;
     dadi(t.azione==='cura'?'Il tuo tiro di cura':t.azione==='fuga'?'Il tuo tiro di fuga':'Il tuo tiro per colpire',t.tiro);
     dadi('Il tuo dado dei danni',t.danno);
     if(t.danni_finali>0)area.append(p('Danno finale: '+t.danni_finali+' HP'+(t.bonus_percentuale===20?' · colpo potente +20%':'')+'.'));
     for(const m of t.messaggi)area.append(p(m.testo+(m.danni?` (${m.danni} HP di danno)`:'')));
     area.append(b('Rileggi il racconto del turno',racconto));
   }
   if(vista.esito==='in_corso'){
     area.append(b('Attacco fisico — tira il d20',()=>azione('fisico')),b('Attacco magico — tira il d20',()=>azione('magico')),b('Tenta la fuga — tira il d20',()=>azione('fuga')));
     for(const a of vista.armi||[])if(a.id!==vista.equipaggiamento?.arma)area.append(b('Cambia arma: '+a.nome+' — usa il turno',()=>azione('cambia_arma',a.id)));
     if(vista.cura_disponibile){const cura=b('Cura del Chierico — usa il turno',()=>azione('cura'));cura.disabled=busy||vista.giocatore.hp>=vista.giocatore.hp_massimi;area.append(cura)}
     for(const o of vista.oggetti||[]){const oggetto=b(`Usa ${o.nome} (${o.quantita}) — usa il turno`,()=>azione('oggetto',o.id));area.append(oggetto)}
   }else{
     area.append(p(vista.esito==='vittoria'?(api.dati?.interazioni?.missione_galeazzo?.attiva?'L’avversario è stordito.':'Hai vinto!'):vista.esito==='fuga'?'La fuga è riuscita.':'Hai perso lo scontro.'));
     if(modo==='allenamento')area.append(p('La partita non è cambiata.'),b('Scegli un nuovo avversario',()=>{vista=null;api.memoria.rimuovi(KEY);disegna()}));
     else if(vista.premio){area.append(p(`Bottino: ${vista.premio.monete} monete d’argento, ${vista.premio.xp} XP.`));for(const id of vista.premio.oggetti||[])area.append(p('Oggetto da scegliere nella Borsa: '+id))}
   }
 }
 async function ricevi(r){
   if(modo==='allenamento')return api.rpc('gioco_allenamento',r);
   const esito=await api.rpc('gioco_scontro',r);
   await api.applica(esito.partita,api.codice,{anima:false});return esito.scontro;
 }
 async function richiedi(r){
   if(busy)return;busy=true;pendente=r;salva();stato.textContent='Azione e salvataggio…';disegna();
   try{
     vista=await ricevi(r);pendente=null;salva();disegna();stato.textContent='';
     if(!['crea','apri','leggi'].includes(r.p_azione)){
       if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)await new Promise(resolve=>setTimeout(resolve,1000));
       racconto();
     }
   }catch(e){
     const nonConsuma=['Hai già tutti i punti vita','Cura già usata in questa giornata','Oggetto non disponibile nella borsa','Oggetto non utilizzabile qui','Questa capacità è riservata al Chierico','Azione non disponibile','Combattimento terminato','La partita è cambiata: riapri la Borsa','Nessun combattimento in questa scena'];
     if(nonConsuma.includes(e.message)){pendente=null;salva()}
     stato.textContent=e.message;
   }finally{busy=false;disegna();if(pendente&&modo==='allenamento')area.append(b('Ricomincia allenamento',()=>{pendente=null;vista=null;api.memoria.rimuovi(KEY);disegna()}))}
 }
 function azione(nome,oggetto=null){
   const r={p_codice:api.codice,p_azione:nome,p_richiesta:crypto.randomUUID(),p_versione:vista.versione,p_oggetto:oggetto};
   if(modo==='allenamento')r.p_sessione=vista.sessione;else r.p_tentativo=api.dati.tentativo;
   return richiedi(r);
 }
 async function apri(scelta){
   if(busy||!api.dati)return;owner=api.codice;modo=scelta;vista=null;pendente=null;
   $('inventario').close();if(!dialogo.open)dialogo.showModal();busy=true;disegna();stato.textContent='Caricamento…';
   try{
     let mem;try{mem=JSON.parse(api.memoria.leggi(KEY))}catch{}
     if(mem?.codice===api.codice&&mem.modo===modo)pendente=mem.pendente;
     if(modo==='allenamento'){
       elenco=await api.rpc('gioco_allenamento',{p_codice:api.codice,p_sessione:null,p_azione:'catalogo'});
       if(!pendente&&mem?.codice===api.codice&&mem.modo===modo&&mem.sessione){
         try{vista=await api.rpc('gioco_allenamento',{p_codice:api.codice,p_sessione:mem.sessione,p_azione:'leggi'})}
         catch(e){if(e.message!=='Allenamento scaduto: ricomincia')throw e;api.memoria.rimuovi(KEY)}
       }
     }else if(!pendente){vista=await ricevi({p_codice:api.codice,p_azione:'apri',p_tentativo:api.dati.tentativo});salva()}
     stato.textContent='';
   }catch(e){stato.textContent=e.message}finally{busy=false;disegna()}
 }
 $('chiudi-allenamento').addEventListener('click',()=>{if(!busy)dialogo.close()});
 dialogo.addEventListener('close',()=>window.Dadi?.pulisci());
 dialogo.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 prova.addEventListener('click',()=>apri('allenamento'));combatti.addEventListener('click',()=>apri('storia'));nellaStoria.addEventListener('click',()=>apri('storia'));
 let revisione=0;
 async function aggiorna(){
   const n=++revisione;prova.hidden=!api.dati;livelli.hidden=!api.dati;
   livelli.textContent=api.dati?`Livello ${api.dati.livello||1} · ${api.dati.xp||0} XP · prossimo livello a ${((api.dati.livello||1)*10)} XP`:'';
   combatti.hidden=true;nellaStoria.hidden=true;
   if(owner&&owner!==api.codice){vista=null;pendente=null;dialogo.close()}
   if(!api.dati)return;
   let sospesa;try{sospesa=JSON.parse(api.memoria.leggi(KEY))}catch{}
   if(sospesa?.codice===api.codice&&sospesa.modo==='storia'&&sospesa.pendente){
     combatti.hidden=false;combatti.textContent='Recupera esito del combattimento';
     nellaStoria.hidden=false;nellaStoria.textContent='Recupera esito del combattimento';
   }else combatti.textContent='Riprendi combattimento';
   if(api.dati.morto)return;
   try{const s=await api.rpc('gioco_scontro',{p_codice:api.codice,p_azione:'disponibile'});if(n!==revisione)return;if(s&&!s.terminato){combatti.hidden=false;nellaStoria.hidden=!$('schermata-gioco')||api.dati.stato_partita?.fase==='g4_fantasma';nellaStoria.textContent='Inizia il combattimento'}}
   catch{/* La borsa resta utilizzabile quando la verifica dello scontro fallisce. */}
 }
 window.AzioniGioco={apriScontro:()=>apri('storia'),async usaPozione(id){
   if(!await window.ConfermaPergamena('Usare una pozione? Si consumerà dopo la conferma della cura.'))return;
   const requestKey='ombra-sui-portici.pozione.v1';let r;
   try{r=JSON.parse(api.memoria.leggi(requestKey))}catch{}
   if(!r||r.p_codice!==api.codice||r.p_tentativo!==api.dati.tentativo)r={p_codice:api.codice,p_tentativo:api.dati.tentativo,p_richiesta:crypto.randomUUID(),p_oggetto:id};
   if(!api.memoria.scrivi(requestKey,JSON.stringify(r))){$('borsa-stato').textContent='Abilita la memoria del sito prima di usare una pozione.';return}
   await api.esegui(async()=>{
     try{const v=await api.rpc('gioco_pozione',r);api.memoria.rimuovi(requestKey);await api.applica(v,api.codice,{anima:false});$('inventario').close();api.stato('Pozione utilizzata. La cura e il consumo sono salvati.')}
     catch(e){if(['Hai già tutti i punti vita','Oggetto non disponibile nella borsa','Durante il combattimento usa le azioni dello scontro'].includes(e.message))api.memoria.rimuovi(requestKey);throw e}
   },$('borsa-stato'));
 }};
 api.onChange(aggiorna);api.ready.then(aggiorna);

})();
