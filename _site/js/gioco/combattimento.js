// Un solo motore di interfaccia per allenamento e combattimenti della storia.
(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const KEY='ombra-sui-portici.scontri.v2';
 let vista=null,modo='allenamento',elenco=[],busy=false,pendente=null,owner=null,menuOggetti=false,menuBersagli=false,oggettoAperto=null,catalogoOggetti=[];
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

 function oggettiUtilizzabili(){
   const oggetti=[...(vista?.oggetti||[])];
   if(vista?.facchino&&vista.corda_disponibile){
     const quantita=(api.dati?.inventario||[]).filter(id=>id==='corda_gancio'||catalogoOggetti.find(o=>o.id===id)?.tipo_base==='corda_gancio').length;
     oggetti.push({id:'corda_gancio',nome:'Corda corta e gancio',quantita:Math.max(1,quantita),azione:'corda'});
   }
   return oggetti;
 }
 function racconto(){
   if(!vista?.turno)return;
   let testo=vista.turno.messaggi.map(m=>m.testo+(m.danni?` (${(vista.scontro_resistenza||vista.facchino)&&m.tipo==='attacco_inferto'?'Resistenza ridotta di '+m.danni:m.danni+' HP di danno'})`:'')).join('\n\n');
   if(vista.turno.bonus_percentuale===20)testo='Colpo potente: +20% ai danni.\n\n'+testo;
   window.Messaggi.mostra({titolo:vista.facchino?'Disattivare il facchino':vista.scontro_resistenza?'La resistenza della vecchina':'Il combattimento',testo,pulsante:'Continua'});
 }
 function disegna(){
   area.replaceChildren();$('chiudi-allenamento').disabled=busy;
   $('titolo-allenamento').textContent=modo==='allenamento'?'Allenamento':vista?.facchino?'Disattivare il facchino':vista?.scontro_resistenza?'La resistenza della vecchina':'Combattimento';
   $('regole-scontro').textContent=modo==='allenamento'?'Questa è una prova: vita, oggetti, cura, XP e morti della partita restano invariati. Hai una pozione di prova per tipo.':vista?.facchino?'Ogni azione consuma un turno. Devi sciogliere l’incanto senza distruggere il facchino. Chiudere la finestra non equivale a fuggire.':vista?.scontro_resistenza?'Ogni azione consuma un turno. Devi vincere la sua resistenza, non ucciderla. Poi lei reagisce con un maleficio. Chiudere la finestra non equivale a fuggire.':'Ogni azione consuma un turno. Chiudere questa finestra non equivale a fuggire: lo scontro resta in corso.';
   if(pendente){area.append(p('La richiesta deve essere confermata prima di agire ancora.'),b('Recupera il risultato',()=>richiedi(pendente)));return}
   if(!vista){
     if(modo==='storia'){area.append(p('Lo scontro non è disponibile in questa scena. Chiudi la finestra per continuare la storia.'));return}
     area.append(p('Scegli l’avversario. Vedi solo i tuoi dadi. Con 1–2 naturali perdi l’azione e usi anche quella successiva per recuperare l’arma o la concentrazione; con 18–20, se colpisci, +20% danni. Per fuggire devi superare la soglia del nemico con d20 + bonus di fuga della classe.'));
     for(const n of elenco){const h=document.createElement('h3');h.textContent=n.nome;area.append(h,p(n.descrizione),b('Affronta '+n.nome,()=>richiedi({p_codice:api.codice,p_sessione:crypto.randomUUID(),p_azione:'crea',p_avversario:n.codice})))}
     if(!elenco.length)area.append(b('Riprova',()=>apri('allenamento')));return;
   }
   area.append(p(`${vista.giocatore.nome} · ${vista.giocatore.classe} · Livello ${vista.giocatore.livello||1} · ${vista.giocatore.xp||0} XP · ${vista.giocatore.hp}/${vista.giocatore.hp_massimi} HP`),p(vista.avversario.nome));

   if(vista.cerbero){for(const testa of vista.teste_cerbero||[]){
     if(!testa.attiva)area.append(p(testa.nome+': rimane inerte e non attacca più.'));
     else if(testa.turni_distratta>0)area.append(p(testa.nome+': salterà il prossimo attacco.'));
   }}
   if(vista.cerbero&&vista.esito==='in_corso'&&!vista.recupero_necessario&&menuBersagli){
     area.append(p('Dove indirizzi il tuo attacco?'));
     const tipo=vista.giocatore.classe==='Mago'?'magico':'fisico';
     area.append(b('Attacca il corpo — tira il d20',()=>{menuBersagli=false;return azione(tipo,'corpo')}));
     for(const testa of vista.teste_cerbero||[])if(testa.attiva)area.append(b('Attacca la '+testa.nome.toLowerCase()+' — tira il d20',()=>{menuBersagli=false;return azione(tipo,testa.id)}));
     area.append(b('Torna alle azioni',()=>{menuBersagli=false;disegna()}));return;
   }
   if(vista.esito==='in_corso'&&!vista.recupero_necessario&&menuOggetti){
     const titolo=document.createElement('h3');titolo.textContent='Oggetti utilizzabili';area.append(titolo,p('Scegli un oggetto per leggere la descrizione. Aprire o chiudere questo elenco non consuma il turno.'));
     for(const o of oggettiUtilizzabili()){
       const scheda=document.createElement('details'),nome=document.createElement('summary');scheda.className='scheda-oggetto-scontro';scheda.open=oggettoAperto===o.id;nome.textContent=o.nome+' × '+o.quantita;
       const dato=catalogoOggetti.find(x=>x.id===o.id),descrizione=o.descrizione||dato?.descrizione||'Oggetto utilizzabile durante questo scontro.';
       const usa=b('Utilizza — usa il turno',()=>{menuOggetti=false;menuBersagli=false;oggettoAperto=null;return azione(o.azione||'oggetto',o.azione==='corda'?null:o.id)});
       usa.disabled=busy||(dato?.effetto?.tipo==='cura_percentuale'&&vista.giocatore.hp>=vista.giocatore.hp_massimi);
       scheda.append(nome,p(descrizione));
       if(Array.isArray(o.bersagli)){
         for(const testa of o.bersagli){
           const etichetta=testa.id==='avversario'?'Utilizza':'Usa su: '+testa.nome;
           scheda.append(b(o.id==='tortellino_legno'?etichetta:etichetta+' — tira il d20',()=>{
             menuOggetti=false;menuBersagli=false;oggettoAperto=null;
             return azione('oggetto',o.id+':'+testa.id);
           }));
         }
       }else{
         if(o.azione==='corda')scheda.append(p('Provi a immobilizzare il facchino: tiri il d20 e usi il turno.'));
         scheda.append(usa);
       }
       scheda.addEventListener('toggle',()=>{if(scheda.open){oggettoAperto=o.id;for(const altra of area.querySelectorAll('.scheda-oggetto-scontro'))if(altra!==scheda)altra.open=false}else if(oggettoAperto===o.id)oggettoAperto=null});area.append(scheda);
     }
     if(!oggettiUtilizzabili().length)area.append(p('Non hai oggetti utilizzabili in questo scontro.'));
     area.append(b('Torna alle azioni',()=>{menuOggetti=false;menuBersagli=false;oggettoAperto=null;disegna()}));return;
   }
   if(vista.turno){
     const t= vista.turno;
     dadi(t.azione==='cura'?'Il tuo tiro di cura':t.azione==='fuga'?'Il tuo tiro di fuga':t.azione==='corda'?'Il tuo tiro per legarlo':t.azione==='oggetto'?'Il tuo tiro di abilità':vista.facchino?'Il tuo tiro per disattivarlo':'Il tuo tiro per colpire',t.tiro);
     dadi(vista.facchino?'Il tuo dado per sciogliere l’incanto':'Il tuo dado dei danni',t.danno);
     if(t.danni_finali>0)area.append(p(((vista.scontro_resistenza||vista.facchino)?'Resistenza ridotta di ':'Danno finale: ')+t.danni_finali+((vista.scontro_resistenza||vista.facchino)?'':' HP')+(t.bonus_percentuale===20?' · colpo potente +20%':'')+'.'));
     for(const m of t.messaggi)area.append(p(m.testo+(m.danni?` (${(vista.scontro_resistenza||vista.facchino)&&m.tipo==='attacco_inferto'?'Resistenza ridotta di '+m.danni:m.danni+' HP di danno'})`:'')));
     area.append(b('Rileggi il racconto del turno',racconto));
   }
   if(vista.esito==='in_corso'&&vista.recupero_necessario){
     const magia=vista.scontro_resistenza||vista.recupero_necessario==='magico';
     area.append(p(magia?'Devi ritrovare la concentrazione. Questa azione lascia all’avversario un altro attacco.':'Devi riprendere l’arma. Questa azione lascia all’avversario un altro attacco.'),b(magia?'Ritrova la concentrazione — usa il turno':'Riprendi l’arma — usa il turno',()=>azione('recupero')));
   }else if(vista.esito==='in_corso'){
     const classe=vista.giocatore.classe;
     const attacco=vista.facchino?({Guerriero:['Blocca gli snodi — tira il d20','fisico'],Ladro:['Allenta i giunti — tira il d20','fisico'],Mago:['Sciogli i legami magici — tira il d20','magico'],Chierico:['Interrompi i movimenti — tira il d20','fisico']})[classe]:vista.scontro_resistenza?
       ({Guerriero:['Intimidirla — tira il d20','fisico'],Ladro:['Ingannarla — tira il d20','inganno'],Mago:['Contrastare i suoi incanti — tira il d20','magico'],Chierico:['Pronunciare una formula sacra — tira il d20','religione']})[classe]:
       ({Guerriero:['Attacco fisico — tira il d20','fisico'],Ladro:['Attacco fisico — tira il d20','fisico'],Mago:['Attacco magico — tira il d20','magico'],Chierico:['Attacco fisico — tira il d20','fisico']})[classe];
     if(attacco)area.append(vista.cerbero?b('Attacca — scegli il bersaglio',()=>{menuBersagli=true;menuOggetti=false;disegna()}):b(attacco[0],()=>azione(attacco[1])));
     area.append(b('Tenta la fuga — tira il d20',()=>azione('fuga')));
     for(const a of vista.armi||[])if(a.id!==vista.equipaggiamento?.arma)area.append(b('Cambia arma: '+a.nome+' — usa il turno',()=>azione('cambia_arma',a.id)));
     if(vista.giocatore.classe==='Chierico'&&vista.cura_disponibile){const cura=b('Magia curativa — tira il d12 e usa il turno',()=>azione('cura'));cura.disabled=busy||vista.giocatore.hp>=vista.giocatore.hp_massimi;area.append(cura)}
     const oggetti=b('Usa un oggetto',()=>{menuOggetti=true;oggettoAperto=null;disegna()});oggetti.disabled=busy||!oggettiUtilizzabili().length;area.append(oggetti);
   }else{
     area.append(p(vista.esito==='vittoria'?(vista.facchino_distruzione?'Il facchino è distrutto. Il padrone chiama le guardie e vieni arrestato.':vista.facchino?'Hai disattivato il facchino senza romperlo.':vista.scontro_resistenza?'La vecchina cede. Ora è pronta a parlare.':api.dati?.interazioni?.missione_galeazzo?.attiva?'L’avversario è stordito.':'Hai vinto!'):vista.esito==='fuga'?'La fuga è riuscita.':vista.facchino?'Il facchino si rompe. Il padrone chiama le guardie e vieni arrestato.':'Hai perso lo scontro.'));
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
     const nonConsuma=['Azione non disponibile per la tua classe','Hai già tutti i punti vita','Cura già usata in questa giornata','Oggetto non disponibile nella borsa','Oggetto non utilizzabile qui','Questa capacità è riservata al Chierico','Azione non disponibile','Combattimento terminato','Il facchino è già legato','La partita è cambiata: riapri la Borsa','Nessun combattimento in questa scena'];
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
   if(busy||!api.dati)return;owner=api.codice;modo=scelta;vista=null;pendente=null;menuOggetti=false;menuBersagli=false;oggettoAperto=null;
   $('inventario').close();if(!dialogo.open)dialogo.showModal();busy=true;disegna();stato.textContent='Caricamento…';
   try{
     try{const cat=await api.rpc('gioco_catalogo_oggetti',{});catalogoOggetti=Array.isArray(cat)?cat:[]}catch{catalogoOggetti=[]}
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
   if(owner&&owner!==api.codice){vista=null;pendente=null;menuOggetti=false;menuBersagli=false;oggettoAperto=null;dialogo.close()}
   if(!api.dati)return;
   let sospesa;try{sospesa=JSON.parse(api.memoria.leggi(KEY))}catch{}
   if(sospesa?.codice===api.codice&&sospesa.modo==='storia'&&sospesa.pendente){
     combatti.hidden=false;combatti.textContent='Recupera esito del combattimento';
     nellaStoria.hidden=false;nellaStoria.textContent='Recupera esito del combattimento';
   }else combatti.textContent='Riprendi combattimento';
   if(api.dati.morto)return;
   try{const s=await api.rpc('gioco_scontro',{p_codice:api.codice,p_azione:'disponibile'});if(n!==revisione)return;if(s&&!s.terminato){combatti.hidden=false;nellaStoria.hidden=!$('schermata-gioco')||['g4_fantasma','g16_facchino_prova','g16_facchino_attacco','g17_guardiano','g17_effigi'].includes(api.dati.stato_partita?.fase);nellaStoria.textContent='Inizia il combattimento'}}
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
