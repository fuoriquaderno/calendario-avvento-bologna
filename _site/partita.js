// Stato e controlli condivisi: questo file viene caricato su tutte le pagine.
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const urlScript=document.currentScript?.src;
  const risorsa=p=>urlScript?new URL(p,urlScript).href:p;
  const client=window.supabase.createClient('https://qjbpacymsqsvxecgzreo.supabase.co','sb_publishable_xGe5aZMIXxd3_v9zY1bVJQ__89AO9Ae');
  const CHIAVE='ombra-sui-portici.codice-segreto.v2';
  const SOSPESA='ombra-sui-portici.creazione.v2';
  const GIORNO='ombra-sui-portici.popup-codice.giorno.v1';
  const INFO='ombra-sui-portici.avviso-codice.v1';
  let codice=null,dati=null,occupato=false;
  const ascoltatori=[];
  const memoria={
    leggi(k){try{return localStorage.getItem(k)}catch{return null}},
    scrivi(k,v){try{localStorage.setItem(k,v);return true}catch{return false}},
    rimuovi(k){try{localStorage.removeItem(k)}catch{}}
  };
  let ultimoGiorno=memoria.leggi(GIORNO)||'';
  const pulisci=v=>v.trim();
  const valido=v=>typeof v==='string'&&Array.from(v.trim()).length>=1&&Array.from(v.trim()).length<=128;
  const giorno=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function stato(testo){$('stato-condiviso').textContent=testo}
  async function rpc(nome,parametri){
    const {data,error}=await client.rpc(nome,parametri);
    if(error){
      const note=['Stanza nascosta non disponibile','Torna alla stanza nascosta prima di proseguire','La prova del topo è già stata effettuata','Effettua prima la prova del topo','Hai già raccolto queste monete','Hai già raccolto questa pozione','Torna alla locanda prima di proseguire','Servizi non disponibili','Esamina prima la parete opposta','Per oggi non ci sono altre informazioni','Scegli un luogo già conosciuto','Sala dei manoscritti non disponibile','Documento non disponibile','Sala di lettura non disponibile','Testo non disponibile','Torna alla biblioteca prima di proseguire','Torna al luogo del racconto prima di proseguire','Scrivi dove vuoi cercare','Usa al massimo 500 caratteri','Incontro con Iliano non disponibile','Il sacchetto è già stato consegnato oppure Iliano non è qui','Questa scelta non è disponibile','Ricompensa di Iliano non configurata','Raggiungi prima questo negozio','Prezzo del prodotto non disponibile','Scena non disponibile','Scrivi una risposta',"Termina prima il combattimento","Luogo non disponibile","Questo personaggio non è qui","Riferimento del personaggio non valido","Non ci sono ancora indicazioni per questo percorso","Concludi prima la perquisizione per entrare in città","Chiedi prima indicazioni per questo luogo","Equipaggiamento non valido","Puoi indossare al massimo due accessori","Oggetto non adatto a questo posto","Richiesta già usata diversamente","Quantità non valida","Prima rimuovi l’oggetto dall’equipaggiamento","Qui non c’è un mercante","Il mercante non ritira questo oggetto","Oggetto non in vendita","Argento insufficiente","Servono pergamena e calamaio per scrivere","Il taccuino può contenere al massimo 20000 caratteri","Gli appunti sono cambiati su un altro dispositivo","Perquisizione non disponibile","La perquisizione è cambiata: recupera lo stato","Non puoi più tentare Inganno","La discussione con la guardia è chiusa","Scrivi una parola","Nessuna proposta da confermare","Servono cinque monete","Accetta o rifiuta prima la proposta","Selezione non valida","Troppi oggetti per i posti disponibili","Scegli un’arma e una difesa","Oggetto non proposto sul tavolo","Quantità non disponibile sul tavolo","Superi il peso massimo della classe","Equipaggiamento non modificabile in questa giornata","Scegli prima cosa fare del bottino","Bottino non disponibile","Quantità non disponibile","Arma non disponibile nella borsa","Questa arma è già equipaggiata","Questa giornata è già confermata","La giornata non è ancora da confermare","Conferma la giornata prima di proseguire","Questa giornata non è ancora aperta","Cura già usata in questa giornata","Durante il combattimento usa le azioni dello scontro","Nessun combattimento in questa scena","Combattimento terminato","Azione non disponibile",'Sessione di allenamento non valida','Richiesta di allenamento diversa','Avversario non disponibile','Classe non disponibile','Allenamento scaduto: ricomincia','Azione di allenamento non valida','Turno cambiato: recupera l’allenamento','Allenamento terminato','Codice non disponibile','Nome troppo lungo','Oggetto non disponibile nella borsa','Oggetto non utilizzabile qui','Nessun passaggio compatibile','Partita non disponibile','Riprendi dal checkpoint prima di proseguire','Completa la giornata corrente prima di proseguire','Questa giornata non è ancora configurata','Checkpoint non disponibile','Tentativo non valido','La partita è cambiata: riapri la Borsa','Questa capacità è riservata al Chierico','Cura non disponibile','Riprendi dal checkpoint prima di usare la cura','Hai già tutti i punti vita','Richiesta non valida','Enigma non disponibile in questa scena','La partita è cambiata: riapri l’enigma','Hai già fatto due offerte','Offerta non valida o argento insufficiente','Scambio non disponibile','Non possiedi l’oggetto richiesto','Acquisto in argento non disponibile','Richiesta già usata con un’altra offerta'];
      if(error.message==='Codice non disponibile')memoria.rimuovi(SOSPESA);
      throw new Error(note.includes(error.message)?error.message:'Operazione non riuscita. Controlla la connessione e riprova. Se una creazione o un cambio codice potrebbero essere riusciti, prova a riprendere la partita con il codice scelto.');
    }
    window.Dadi?.operazione(nome,parametri,data);
    return data;
  }
  async function esegui(azione,messaggio=$('stato-condiviso')){
    if(occupato)return;
    occupato=true;messaggio.textContent='';
    document.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{return await azione()}
    catch(e){messaggio.textContent=e.message||'Operazione non riuscita.'}
    finally{occupato=false;document.querySelectorAll('button').forEach(b=>b.disabled=b.hasAttribute('data-disabilitato'))}
  }
  function aggiornaHeader(){
    const xpHeader=$('xp-personaggio');if(xpHeader)xpHeader.textContent=dati?`${dati.xp??0} XP`:'';
    $('barra-stato').hidden=!dati;
    $('nome-personaggio').textContent=dati?.nome||'';
    $('nome-personaggio').hidden=!dati?.nome;
    $('classe-personaggio').textContent=dati?.classe||'';
    $('hp-personaggio').textContent=dati?`${dati.hp_attuali}hp`:'';
    $('argento-personaggio').textContent=dati?`${dati.oro_rimanente} monete d’argento`:'';
    $('gestione-senza-partita').hidden=!!dati;
    $('gestione-con-partita').hidden=!dati;
    $('codice-da-conservare').value=codice||'';
    $('nome-personaggio-modifica').value=dati?.nome||'';
  }
  async function applica(nuovi,nuovoCodice,opzioni={}){
    const cambiaLuogo=!!dati&&nuovi.luogo_attuale!==dati.luogo_attuale;
    const transizione=(opzioni.anima!==false||cambiaLuogo)&&typeof window.cambiaPergamena==='function';
    const dopoTransizione=[];
    const impostazioni=transizione?{...opzioni,anima:cambiaLuogo?true:opzioni.anima,transizioneGestita:true,dopoTransizione}:opzioni;
    const aggiorna=async()=>{
      dati=nuovi;codice=nuovoCodice;aggiornaHeader();
      if(!memoria.scrivi(CHIAVE,codice))stato('Il browser non può ricordare il codice: copialo e conservalo.');
      for(const fn of ascoltatori)await fn(dati,codice,impostazioni);
    };
    if(transizione)await window.cambiaPergamena(aggiorna);else await aggiorna();
    for(const fn of dopoTransizione)await fn();
  }
  async function riprendi(valore,opzioni={}){
    const candidato=pulisci(valore);
    if(!valido(candidato))throw new Error('Inserisci un codice da 1 a 128 caratteri.');
    const recuperati=await rpc('gioco_recupera',{p_codice:candidato});
    if(!recuperati)throw new Error('Partita non trovata. Controlla il codice: non è stata creata una nuova partita.');
    await applica(recuperati,candidato,opzioni);
  }
  function apriCodice(){
    if(occupato)return;
    aggiornaHeader();$('stato-gestione-codice').textContent='';
    if(!$('dialogo-codice').open)$('dialogo-codice').showModal();
    if(dati){ultimoGiorno=giorno();memoria.scrivi(GIORNO,ultimoGiorno)}
  }
  function promemoria(){
    if(dati&&!occupato&&ultimoGiorno!==giorno()&&!document.querySelector('dialog[open]'))apriCodice();
  }
  $('apri-codice').addEventListener('click',apriCodice);
  $('chiudi-gestione-codice').addEventListener('click',()=>$('dialogo-codice').close());
  $('info-codice').addEventListener('click',()=>{if(!$('avviso-codice').open)$('avviso-codice').showModal()});
  $('chiudi-avviso-codice').addEventListener('click',()=>{memoria.scrivi(INFO,'letto');$('avviso-codice').close()});
  document.querySelectorAll('dialog').forEach(dialogo=>dialogo.addEventListener('cancel',e=>{if(occupato)e.preventDefault()}));
  $('copia-codice').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(codice);$('stato-gestione-codice').textContent='Codice copiato. Conservalo in un luogo privato.'}
    catch{$('codice-da-conservare').select();$('stato-gestione-codice').textContent='Seleziona e copia il codice mostrato.'}
  });
  $('cambia-partita').addEventListener('click',async()=>{
    if(!await window.ConfermaPergamena('Hai conservato il codice? Senza di esso non potrai recuperare la partita.'))return;
    memoria.rimuovi(CHIAVE);memoria.rimuovi(SOSPESA);window.location.reload();
  });
  let confermaCancellazione=false;
  $('cancella-partita').addEventListener('click',async()=>{
    if(occupato||!codice||!dati||confermaCancellazione)return;
    confermaCancellazione=true;
    const codiceDaCancellare=codice,tentativoDaCancellare=dati.tentativo;
    try{
      const confermata=await window.ConfermaPergamena('Cancellerai definitivamente questa partita, compresi progressi, inventario e appunti, su tutti i dispositivi. Il codice non funzionerà più. Potrai riutilizzarlo soltanto creando una nuova partita.',{titolo:'Cancellare questa partita?',conferma:'Cancella definitivamente',annulla:'Mantieni la partita'});
      if(!confermata)return;
      await esegui(async()=>{
        if(codice!==codiceDaCancellare||dati?.tentativo!==tentativoDaCancellare)throw new Error('La partita è cambiata: riapri la Borsa');
        const risultato=await rpc('gioco_cancella_partita',{p_codice:codiceDaCancellare,p_tentativo:tentativoDaCancellare});
        if(risultato?.cancellata!==true)throw new Error('Cancellazione non confermata. Riprova.');
        [CHIAVE,SOSPESA,GIORNO,'ombra-sui-portici.borsa.richiesta.v1','ombra-sui-portici.taccuino.bozza.v1','ombra-sui-portici.scontri.v2','ombra-sui-portici.pozione.v1','ombra-sui-portici.perquisizione.scelta.v1','ombra-sui-portici.fine-giornata.esplora.v1'].forEach(k=>memoria.rimuovi(k));
        window.Dadi?.pulisci();
        window.location.assign(risorsa('./'));
      },$('stato-gestione-codice'));
    }finally{confermaCancellazione=false}
  });
  $('salva-nome-personaggio').addEventListener('click',()=>esegui(async()=>{
    const nome=$('nome-personaggio-modifica').value.trim();
    if(Array.from(nome).length>40)throw new Error('Il nome può contenere al massimo 40 caratteri.');
    const aggiornati=await rpc('gioco_cambia_nome',{p_codice:codice,p_nome:nome});
    await applica(aggiornati,codice,{anima:false});
    $('stato-gestione-codice').textContent='Nome salvato. Il codice resta lo stesso.';
  },$('stato-gestione-codice')));
  $('salva-nuovo-codice').addEventListener('click',()=>esegui(async()=>{
    const nuovo=pulisci($('nuovo-codice-partita').value);
    if(!valido(nuovo))throw new Error('Inserisci un codice da 1 a 128 caratteri.');
    const aggiornati=await rpc('gioco_cambia_codice',{p_codice:codice,p_nuovo_codice:nuovo});
    await applica(aggiornati,nuovo,{anima:false});
    $('nuovo-codice-partita').value='';
    $('stato-gestione-codice').textContent='Codice aggiornato. Copialo: quello precedente non funziona più.';
  },$('stato-gestione-codice')));

  async function iniziaGiornata(numero){
    if(!codice)throw new Error('Partita non disponibile');
    const aggiornati=await rpc('gioco_inizia_giornata',{p_codice:codice,p_giorno:numero});
    await applica(aggiornati,codice,{anima:true});
  }
  async function riprendiCheckpoint(){
    if(!codice||!dati?.tentativo)throw new Error('Tentativo non valido');
    const aggiornati=await rpc('gioco_riprendi_checkpoint',{p_codice:codice,p_tentativo:dati.tentativo});
    await applica(aggiornati,codice,{anima:true});
  }
  window.Partita={rpc,esegui,applica,riprendi,memoria,CHIAVE,SOSPESA,pulisci,valido,
    iniziaGiornata,riprendiCheckpoint,resocontoMorti:(...args)=>window.BorsaBase.resocontoMorti(...args),ridisegnaBorsa:()=>window.BorsaBase.disegna(),
    get dati(){return dati},get codice(){return codice},onChange(fn){ascoltatori.push(fn)},promemoria,stato,risorsa,quantita:(...args)=>window.BorsaBase.quantita(...args),get occupato(){return occupato}};
  async function inizializza(){
    aggiornaHeader();
    if(!memoria.leggi(INFO)&&!$('calendario-avvento')){
      const chiuso=new Promise(r=>$('avviso-codice').addEventListener('close',r,{once:true}));
      $('avviso-codice').showModal();await chiuso;
    }
    const ricordato=memoria.leggi(CHIAVE);
    if(ricordato)await esegui(()=>riprendi(ricordato,{anima:false}));
    if(!$('schermata-gioco'))promemoria();
  }
  let avviata=false,completaAvvio,fallisciAvvio;
  window.Partita.ready=new Promise((resolve,reject)=>{completaAvvio=resolve;fallisciAvvio=reject});
  window.Partita.avvia=()=>{
    if(!avviata){avviata=true;inizializza().then(completaAvvio,fallisciAvvio)}
    return window.Partita.ready;
  };
})();
