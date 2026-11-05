(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const main=document.querySelector('main .scroll-middle');
 const area=document.createElement('section');area.hidden=true;area.id='stato-fine-giornata';area.style.cssText='margin-block:24px;border:0;background:none';
 const testo=document.createElement('p'),apri=document.createElement('button'),avanti=document.createElement('button'),stato=document.createElement('p');
 apri.type='button';apri.textContent='Termina giornata';avanti.type='button';avanti.textContent='Inizia la prossima giornata';
 stato.setAttribute('role','status');area.append(testo,apri,avanti,stato);main.append(area);
 const dialogo=document.createElement('dialog');dialogo.className='avviso-codice messaggio-orizzontale fine-giornata';
 dialogo.style.width='840px';dialogo.style.setProperty('--larghezza-messaggio','840px');dialogo.setAttribute('aria-labelledby','titolo-conferma-giornata');
 dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-conferma-giornata"></h2><p id="riepilogo-conferma-giornata"></p><p>Puoi confermare le scelte oppure ripartire dal checkpoint. Dopo la conferma questa giornata non sarà più rigiocabile.</p><div class="azioni-fine-giornata"><button type="button" id="conferma-fine-giornata">Salva la giornata</button><button type="button" id="rigioca-fine-giornata">Rigioca la giornata</button><button type="button" id="esplora-fine-giornata">Gira per la città</button></div><p id="errore-fine-giornata" role="status"></p></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(dialogo);
 
 let ultimoAvviso=null,busy=false,versione=0,calendario=null,attesa=false;
 const MEM_ESPLORA='ombra-sui-portici.fine-giornata.esplora.v1';
 const terminaBorsa=document.createElement('button');terminaBorsa.type='button';terminaBorsa.id='termina-giornata-borsa';terminaBorsa.textContent='Termina giornata';terminaBorsa.hidden=true;
 const titoloBorsa=$('titolo-borsa');if(titoloBorsa)titoloBorsa.after(terminaBorsa);else $('borsa-elenco').before(terminaBorsa);
 const chiave=()=>api.dati?api.codice+':'+api.dati.tentativo+':'+api.dati.giorno_corrente:null;
 function pulsanti(){const d=api.dati;terminaBorsa.hidden=!d?.giornata_da_confermare||d.giorno_corrente<2||d.morto;apri.hidden=!d?.giornata_da_confermare;avanti.hidden=!$('schermata-gioco')||!d?.giornata_completata||!calendario?.prossimo_configurato||!calendario?.prossimo_aperto||d.giorno_corrente>=calendario.giorni}
 function mostra(){
   if(busy||!api.dati?.giornata_da_confermare||api.dati.morto)return;
   
   $('esplora-fine-giornata').hidden=api.dati.giorno_corrente<2||api.dati.stato_partita?.esplorazione_consentita===false;
   $('titolo-conferma-giornata').textContent=`Giornata ${api.dati.giorno_corrente}: vuoi confermare?`;
   $('riepilogo-conferma-giornata').textContent=`${api.dati.hp_attuali}/${api.dati.hp_massimi} HP · ${api.dati.xp||0} XP · ${api.dati.oro_rimanente} monete d’argento`;
   $('errore-fine-giornata').textContent='';ultimoAvviso=chiave();
   if(!dialogo.open)dialogo.showModal();
 }
 function programma(){
   if(!$('schermata-gioco'))return;
   if(attesa||!api.dati?.giornata_da_confermare||api.dati.morto||ultimoAvviso===chiave()||api.memoria.leggi(MEM_ESPLORA)===chiave())return;
   attesa=true;
   setTimeout(async()=>{
     attesa=false;
     if(!api.dati?.giornata_da_confermare||api.dati.morto||ultimoAvviso===chiave())return;
     // Prima si legge la reazione dell’enigma, poi si sceglie la conclusione della giornata.
     try{const loot=await api.rpc('gioco_bottino',{p_codice:api.codice});if(loot.bottini.length){testo.textContent='Scegli prima cosa fare del bottino nella Borsa.';return}}catch{return}
     const aperto=document.querySelector('dialog[open]');
     if(aperto&&aperto!==dialogo){aperto.addEventListener('close',programma,{once:true});return}
     mostra();
   },0);
 }
 async function aggiorna(dati,codice,opzioni={}){
   const n=++versione,d=api.dati;
   area.hidden=!$('schermata-gioco')||!d||d.morto||(!d.giornata_da_confermare&&!d.giornata_completata);
   pulsanti();
   if(!d?.giornata_da_confermare&&dialogo.open)dialogo.close();
   if(!d)return;
   if(d.giornata_da_confermare)testo.textContent=`La giornata ${d.giorno_corrente} è terminata, ma le scelte sono ancora da confermare.`;
   else if(d.giornata_completata)testo.textContent=`La giornata ${d.giorno_corrente} è confermata.`;
   if(opzioni.anima!==true&&!opzioni.transizioneGestita)programma();
   try{
     const c=await api.rpc('gioco_calendario',{p_codice:api.codice});if(n!==versione)return;calendario=c;pulsanti();
     if(d.giornata_completata){
       if(d.giorno_corrente>=c.giorni)testo.textContent='Hai confermato l’ultima giornata. L’avventura è conclusa.';
       else if(!c.prossimo_aperto)testo.textContent+=` La giornata ${c.prossimo_numero} non è ancora aperta.`;
       else if(!c.prossimo_configurato)testo.textContent+=' Il prossimo giorno non è ancora presente in questa versione del gioco.';
     }
   }catch(e){stato.textContent=e.message}
 }
 async function scegli(scelta){
   if(busy)return;busy=true;const codice=api.codice,tentativo=api.dati.tentativo;
   const esito=await api.esegui(async()=>{
     const nuovi=await api.rpc('gioco_concludi_giornata',{p_codice:codice,p_tentativo:tentativo,p_scelta:scelta});
     dialogo.close();await api.applica(nuovi,codice,{anima:scelta==='rigioca'||nuovi.espulsione_galeazzo===true||!!nuovi.arresto_guardia});if(nuovi.arresto_guardia)window.Messaggi.mostra({titolo:'Arrestato per furto',testo:nuovi.arresto_guardia==='flirt'?'La stessa guardia di Porta Maggiore ti ferma. «Sei in arresto per furto.» Al tuo sguardo incredulo si avvicina e aggiunge: «Non è mica bello tentare di rubare la donna altrui.» Capisci che Beatrice gli ha raccontato del tuo tentativo di flirt e che l’accusa è una vendetta. Riparti dall’inizio della giornata.':'La guardia di Porta Maggiore ti sbarra la strada. «Sei in arresto per furto.» Poi abbassa la voce: «La parola data va mantenuta, altrimenti ne paghi le conseguenze.» Capisci che si è inventata l’accusa perché non hai consegnato la lettera entro il quinto giorno. Riparti dall’inizio della giornata 5.',pulsante:'Riprova la giornata'});else if(nuovi.espulsione_galeazzo)window.Messaggi.mostra({titolo:'Il pass è stato revocato',testo:'Le guardie ti fermano: Galeazzo ha fatto revocare il tuo pass speciale. Non hai mantenuto la parola e vieni cacciato dalla città. Riparti dall’inizio della giornata 10: puoi ancora recuperare il sacchetto e consegnarlo.',pulsante:'Riprova la giornata 10'});return true;
   },$('errore-fine-giornata'));
   busy=false;
   if(!esito)stato.textContent=$('errore-fine-giornata').textContent;
 }
 $('conferma-fine-giornata').addEventListener('click',()=>scegli('conferma'));
 $('rigioca-fine-giornata').addEventListener('click',()=>scegli('rigioca'));
 $('esplora-fine-giornata').addEventListener('click',async()=>{
  if(busy||!api.dati?.giornata_da_confermare||api.dati.giorno_corrente<2||api.dati.stato_partita?.esplorazione_consentita===false)return;
  ultimoAvviso=chiave();api.memoria.scrivi(MEM_ESPLORA,chiave());dialogo.close();await window.LuoghiGioco?.apri();
 });
 terminaBorsa.addEventListener('click',()=>{$('inventario').close();mostra()});
 dialogo.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 apri.addEventListener('click',mostra);
 avanti.addEventListener('click',()=>api.esegui(()=>api.iniziaGiornata(api.dati.giorno_corrente+1),stato));
 api.onChange(aggiorna);api.ready.then(()=>aggiorna());
 window.FineGiornata={aggiorna:programma,apri:mostra};
})();
