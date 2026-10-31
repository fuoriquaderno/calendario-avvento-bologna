// Stato e controlli condivisi: questo file viene caricato su tutte le pagine.
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
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
      const note=['Torna alla locanda prima di proseguire','Servizi non disponibili','Esamina prima la parete opposta','Per oggi non ci sono altre informazioni','Scegli un luogo già conosciuto','Sala dei manoscritti non disponibile','Documento non disponibile','Sala di lettura non disponibile','Testo non disponibile','Torna alla biblioteca prima di proseguire','Torna al luogo del racconto prima di proseguire','Scrivi dove vuoi cercare','Usa al massimo 500 caratteri','Incontro con Iliano non disponibile','Il sacchetto è già stato consegnato oppure Iliano non è qui','Questa scelta non è disponibile','Ricompensa di Iliano non configurata','Raggiungi prima questo negozio','Prezzo del prodotto non disponibile','Scena non disponibile','Scrivi una risposta',"Termina prima il combattimento","Luogo non disponibile","Questo personaggio non è qui","Riferimento del personaggio non valido","Non ci sono ancora indicazioni per questo percorso","Concludi prima la perquisizione per entrare in città","Chiedi prima indicazioni per questo luogo","Equipaggiamento non valido","Puoi indossare al massimo due accessori","Oggetto non adatto a questo posto","Richiesta già usata diversamente","Quantità non valida","Prima rimuovi l’oggetto dall’equipaggiamento","Qui non c’è un mercante","Il mercante non ritira questo oggetto","Oggetto non in vendita","Argento insufficiente","Servono pergamena e calamaio per scrivere","Il taccuino può contenere al massimo 20000 caratteri","Gli appunti sono cambiati su un altro dispositivo","Perquisizione non disponibile","La perquisizione è cambiata: recupera lo stato","Non puoi più tentare Inganno","La discussione con la guardia è chiusa","Scrivi una parola","Nessuna proposta da confermare","Servono cinque monete","Accetta o rifiuta prima la proposta","Selezione non valida","Troppi oggetti per i posti disponibili","Scegli un’arma e una difesa","Oggetto non proposto sul tavolo","Quantità non disponibile sul tavolo","Superi il peso massimo della classe","Equipaggiamento non modificabile in questa giornata","Scegli prima cosa fare del bottino","Bottino non disponibile","Quantità non disponibile","Arma non disponibile nella borsa","Questa arma è già equipaggiata","Questa giornata è già confermata","La giornata non è ancora da confermare","Conferma la giornata prima di proseguire","Questa giornata non è ancora aperta","Cura già usata in questa giornata","Durante il combattimento usa le azioni dello scontro","Nessun combattimento in questa scena","Combattimento terminato","Azione non disponibile",'Sessione di allenamento non valida','Richiesta di allenamento diversa','Avversario non disponibile','Classe non disponibile','Allenamento scaduto: ricomincia','Azione di allenamento non valida','Turno cambiato: recupera l’allenamento','Allenamento terminato','Codice non disponibile','Nome troppo lungo','Oggetto non disponibile nella borsa','Oggetto non utilizzabile qui','Nessun passaggio compatibile','Partita non disponibile','Riprendi dal checkpoint prima di proseguire','Completa la giornata corrente prima di proseguire','Questa giornata non è ancora configurata','Checkpoint non disponibile','Tentativo non valido','La partita è cambiata: riapri la Borsa','Questa capacità è riservata al Chierico','Cura non disponibile','Riprendi dal checkpoint prima di usare la cura','Hai già tutti i punti vita','Richiesta non valida','Enigma non disponibile in questa scena','La partita è cambiata: riapri l’enigma','Hai già fatto due offerte','Offerta non valida o argento insufficiente','Scambio non disponibile','Non possiedi l’oggetto richiesto','Acquisto in argento non disponibile','Richiesta già usata con un’altra offerta'];
      if(error.message==='Codice non disponibile')memoria.rimuovi(SOSPESA);
      throw new Error(note.includes(error.message)?error.message:'Operazione non riuscita. Controlla la connessione e riprova. Se una creazione o un cambio codice potrebbero essere riusciti, prova a riprendere la partita con il codice scelto.');
    }
    return data;
  }
  async function esegui(azione,messaggio=$('stato-condiviso')){
    if(occupato)return;
    occupato=true;messaggio.textContent='';
    document.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{return await azione()}
    catch(e){messaggio.textContent=e.message||'Operazione non riuscita.'}
    finally{occupato=false;document.querySelectorAll('button').forEach(b=>b.disabled=false)}
  }
  function aggiornaHeader(){
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

  const OGGETTI={
    pozione_blanda:{nome:'Pozione blanda',descrizione:'Cura il 25% degli HP massimi attuali, arrotondato per eccesso.'},
    pozione_media:{nome:'Pozione media',descrizione:'Cura il 50% degli HP massimi attuali, arrotondato per eccesso.'},
    pozione_potente:{nome:'Pozione potente',descrizione:'Cura il 75% degli HP massimi attuali, arrotondato per eccesso.'},
    pergamena_chiarezza:{nome:'Pergamena della Chiarezza',descrizione:'Permette di superare un enigma irrisolto. Si consuma quando lo sblocca.'},
    grimaldello:{nome:'Grimaldello',descrizione:'Apre un passaggio compatibile di cui non hai trovato la chiave. Si consuma quando lo apre.'}
  };
  function quantita(inventario){const m=new Map();if(Array.isArray(inventario))for(const id of inventario)if(typeof id==='string')m.set(id,(m.get(id)||0)+1);return m}
  // Il registro è fuori dal checkpoint; il totale si ricava senza un secondo contatore.
  function resocontoMorti(partita=dati){
    const registro=Array.isArray(partita?.morti)?partita.morti:[];
    const giorni=new Map();
    for(const morte of registro){
      if(Number.isInteger(morte.giorno)&&morte.giorno>0)giorni.set(morte.giorno,(giorni.get(morte.giorno)||0)+1);
    }
    return {totale:registro.length,giorni:[...giorni].sort((a,b)=>a[0]-b[0]),registro};
  }
  const registroMorti=document.createElement('section');
  registroMorti.id='registro-morti';
  $('borsa-elenco').after(registroMorti);
  let configurazioneCura=null;
  const capacitaSezione=document.createElement('section');capacitaSezione.id='borsa-capacita';
  capacitaSezione.style.cssText='margin-block:20px;padding-block:16px;border-top:1px solid var(--line)';
  registroMorti.before(capacitaSezione);
  async function caricaCapacita(){
    try{
      const elenco=await rpc('gioco_catalogo_oggetti',{});
      for(const o of elenco)if(typeof o.id==='string'&&!['__proto__','constructor','prototype'].includes(o.id))OGGETTI[o.id]={nome:o.nomi_classi?.[dati.classe]||o.nome,descrizione:o.descrizione,tipo_base:o.tipo_base,effetto:o.effetto};
    }catch{/* Mantiene le descrizioni locali quando il catalogo non è raggiungibile. */}
    configurazioneCura=null;
    if(dati?.classe!=='Chierico')return;
    try{
      const classi=await rpc('gioco_catalogo_classi',{});
      configurazioneCura=classi.find(c=>c.nome==='Chierico')?.capacita?.cura||null;
    }catch{/* Gli oggetti restano consultabili anche se la capacità non si può verificare. */}
  }
  function esitoCura(cura){
    if(!cura)return;
    const area=document.createElement('div');area.className='dadi-area';area.setAttribute('aria-hidden','true');
    const tiro=document.createElement('p');tiro.className='dadi-totale';
    try{
      if(!window.Dadi)throw new Error('Visualizzazione semplice');
      window.Dadi.mostraRisultato(area,tiro,cura);
    }catch{tiro.textContent=`Tiro della cura: ${(cura.valori||[]).join(' + ')} + ${cura.bonus} = ${cura.totale}`;}
    const recupero=document.createElement('p');recupero.textContent=`HP recuperati: ${cura.recuperati} (da ${cura.hp_prima} a ${cura.hp_dopo}).`;
    capacitaSezione.append(area,tiro,recupero);
  }
  function mostraCapacita(){
    capacitaSezione.replaceChildren();capacitaSezione.hidden=dati?.classe!=='Chierico'||window.BorsaNuova?.inCombattimento;
    if(capacitaSezione.hidden)return;
    const titolo=document.createElement('h3');titolo.textContent='Capacità';
    const statoCura=document.createElement('p');statoCura.id='cura-stato';statoCura.setAttribute('role','status');statoCura.setAttribute('aria-live','polite');
    capacitaSezione.append(titolo,statoCura);
    if(!configurazioneCura){statoCura.textContent='Non riesco a verificare la cura. Riapri la Borsa per riprovare.';return;}
    if(!configurazioneCura.attiva){statoCura.textContent='Cura non disponibile.';return;}
    const descrizione=document.createElement('p');
    const potenza=1+0.2*((dati.livello||1)-1);
    descrizione.textContent=`Cura — una volta per giornata. Recupera ${configurazioneCura.numero_dadi}d${configurazioneCura.facce_dado} + ${configurazioneCura.bonus} HP di base, con potenza del ${Math.round(potenza*100)}% al tuo livello, senza superare il massimo.`;
    capacitaSezione.append(descrizione);
    const usata=dati.capacita_usate?.cura;
    if(dati.morto||dati.hp_attuali<=0){statoCura.textContent='Riprendi dal checkpoint prima di usare la cura.';return;}
    if(usata?.giorno===dati.giorno_corrente){statoCura.textContent='Già utilizzata in questa giornata.';esitoCura(usata);return;}
    if(dati.hp_attuali>=dati.hp_massimi){statoCura.textContent='Hai già tutti i punti vita. La cura resta disponibile.';return;}
    statoCura.textContent='Disponibile.';
    const usa=document.createElement('button');usa.type='button';usa.textContent='Usa cura';usa.id='usa-cura';
    usa.addEventListener('click',()=>{
      usa.hidden=true;
      const box=document.createElement('div');box.className='borsa-conferma';
      const p=document.createElement('p');p.textContent='Vuoi usare la cura? Consumerai l’utilizzo di questa giornata.';
      const si=document.createElement('button');si.type='button';si.textContent='Conferma e tira il dado';si.id='conferma-cura';
      const no=document.createElement('button');no.type='button';no.textContent='Annulla';no.id='annulla-cura';
      no.addEventListener('click',()=>{box.remove();usa.hidden=false;usa.focus()});
      si.addEventListener('click',()=>esegui(async()=>{
        const tentativo=dati.tentativo;
        const area=document.createElement('div');area.className='dadi-area in-movimento';area.setAttribute('aria-hidden','true');
        const dado=document.createElement('span');dado.className='dado-virtuale';dado.dataset.facce=String(configurazioneCura.facce_dado);dado.textContent='…';area.append(dado);box.append(area);
        statoCura.textContent='Cura e salvataggio in corso…';
        try{
          const durata=window.matchMedia('(prefers-reduced-motion: reduce)').matches?Promise.resolve():new Promise(resolve=>setTimeout(resolve,850));
          const [aggiornati]=await Promise.all([rpc('gioco_cura',{p_codice:codice,p_tentativo:tentativo}),durata]);
          await applica(aggiornati,codice,{anima:false});disegnaBorsa();
        }catch(errore){
          if(errore.message.startsWith('Operazione non riuscita'))throw new Error('Non riesco a confermare la cura. Potrebbe essere già stata salvata: riprova o riapri la Borsa per recuperare l’esito senza curarti due volte.');
          throw errore;
        }finally{area.remove()}
      },statoCura));
      box.append(p,si,no);capacitaSezione.append(box);si.focus();
    });
    capacitaSezione.append(usa);
  }
  function mostraRegistroMorti(){
    registroMorti.replaceChildren();
    if(!dati)return;
    const resoconto=resocontoMorti();
    const titolo=document.createElement('h3');titolo.textContent='Registro delle morti';
    const totale=document.createElement('p');totale.textContent=`Morti totali: ${resoconto.totale}`;
    registroMorti.append(titolo,totale);
    if(resoconto.giorni.length){
      const lista=document.createElement('ul');
      for(const [giorno,numero] of resoconto.giorni){const li=document.createElement('li');li.textContent=`Giorno ${giorno}: ${numero} ${numero===1?'morte':'morti'}`;lista.append(li)}
      registroMorti.append(lista);
    }
  }
  function disegnaBorsa(){
    const inGioco=!!$('schermata-gioco');
    $('borsa-stato').textContent='';$('borsa-elenco').replaceChildren();
    $('borsa-argento').textContent=dati?`Argento disponibile: ${dati.oro_rimanente}`:'';
    $('borsa-contesto').textContent=dati?(inGioco?'Gli oggetti si consumano solo dopo la conferma e lo sblocco riuscito.':'La Borsa è consultabile anche qui. Torna alla storia per usare gli oggetti.'):'Entra nel gioco per aprire una partita.';
    $('borsa-vai-al-gioco').hidden=inGioco&&!!dati;
    mostraRegistroMorti();
    mostraCapacita();
    if(!dati)return;
    const q=quantita(dati.inventario);
    if(!q.size){const li=document.createElement('li');li.textContent='La Borsa non contiene oggetti.';$('borsa-elenco').append(li)}
    for(const [id,n]of q){
      const oggetto=Object.hasOwn(OGGETTI,id)?OGGETTI[id]:{nome:id,descrizione:'Oggetto conservato nella Borsa. Non è ancora previsto un utilizzo.'};
      const li=document.createElement('li'),h=document.createElement('h3'),p=document.createElement('p');li.dataset.oggetto=id;
      h.textContent=`${oggetto.nome} × ${n}`;p.textContent=oggetto.descrizione;li.append(h,p);
      if(!dati.morto&&(id.startsWith('pozione_')||oggetto.effetto?.tipo==='cura_percentuale')&&!window.BorsaNuova?.inCombattimento&&Object.hasOwn(OGGETTI,id)){
        const usa=document.createElement('button');usa.type='button';usa.textContent='Usa pozione';usa.disabled=dati.hp_attuali>=dati.hp_massimi;
        usa.addEventListener('click',()=>window.AzioniGioco.usaPozione(id));li.append(usa);
      }else if(inGioco&&!dati.morto&&dati.hp_attuali>0&&(id==='pergamena_chiarezza'||oggetto.tipo_base==='pergamena_chiarezza')&&dati.stato_partita?.fase==='enigma'){
        const usa=document.createElement('button');usa.type='button';usa.textContent='Usa sull’enigma di Galeazzo';
        usa.addEventListener('click',()=>confermaUso(li,usa));li.append(usa);
      }else if(['pergamena_chiarezza','grimaldello'].includes(id)){const nota=document.createElement('p');nota.textContent='Non utilizzabile in questa pagina o scena. L’oggetto resta nella Borsa.';li.append(nota)}
      $('borsa-elenco').append(li);
    }
  }
  function confermaUso(li,usa){
    usa.hidden=true;const box=document.createElement('div');box.className='borsa-conferma';
    const p=document.createElement('p');p.textContent='Consumare una Pergamena della Chiarezza per superare questo enigma?';
    const si=document.createElement('button');si.type='button';si.textContent='Conferma e usa una pergamena';
    const no=document.createElement('button');no.type='button';no.textContent='Annulla';
    no.addEventListener('click',()=>{box.remove();usa.hidden=false;usa.focus()});
    si.addEventListener('click',()=>esegui(async()=>{
      $('borsa-stato').textContent='Uso dell’oggetto e salvataggio…';
      const aggiornati=await rpc('gioco_usa_oggetto',{p_codice:codice,p_oggetto:li.dataset.oggetto,p_bersaglio:'enigma_galeazzo'});
      $('inventario').close();await applica(aggiornati,codice,{anima:true});stato('Pergamena utilizzata: consumo e sblocco salvati.');
    },$('borsa-stato')));
    box.append(p,si,no);li.append(box);si.focus();
  }
  async function apriBorsa(){
    if(occupato)return;
    if(dati){
      await esegui(async()=>{
        const aggiornati=await rpc('gioco_recupera',{p_codice:codice});
        if(!aggiornati)throw new Error('Partita non disponibile. Controlla il codice.');
        await applica(aggiornati,codice,{anima:false});await caricaCapacita();disegnaBorsa();if(window.BorsaNuova)await window.BorsaNuova.aggiorna();$('inventario').showModal();
      });
    }else{disegnaBorsa();$('inventario').showModal()}
  }
  $('apri-borsa').addEventListener('click',apriBorsa);
  $('chiudi-borsa').addEventListener('click',()=>$('inventario').close());
  $('inventario').addEventListener('close',()=>{$('borsa-stato').textContent='';$('borsa-elenco').replaceChildren()});

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
    iniziaGiornata,riprendiCheckpoint,resocontoMorti,ridisegnaBorsa:disegnaBorsa,
    get dati(){return dati},get codice(){return codice},onChange(fn){ascoltatori.push(fn)},promemoria,stato,quantita};
  async function inizializza(){
    aggiornaHeader();
    if(!memoria.leggi(INFO)){
      const chiuso=new Promise(r=>$('avviso-codice').addEventListener('close',r,{once:true}));
      $('avviso-codice').showModal();await chiuso;
    }
    const ricordato=memoria.leggi(CHIAVE);
    if(ricordato)await esegui(()=>riprendi(ricordato,{anima:false}));
    if(!$('schermata-gioco'))promemoria();
  }
  window.Partita.ready=inizializza();
})();


// Un unico pannello per simulazioni e scontri della storia.
(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
  function preparaMessaggiAllenamento(){
    if(window.Messaggi)return;
  const popupRisposta=document.createElement('dialog');
  popupRisposta.className='avviso-codice messaggio-orizzontale';
  popupRisposta.setAttribute('aria-labelledby','titolo-messaggio-allenamento');
  popupRisposta.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-messaggio-allenamento"></h2><p id="frase-messaggio-allenamento"></p><button type="button" id="chiudi-messaggio-allenamento">Continua</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
  document.body.append(popupRisposta);
  let pagineMessaggio=[],paginaMessaggio=0,pulsanteMessaggio='Continua';
  const testoMessaggio=$('frase-messaggio-allenamento'),comandoMessaggio=$('chiudi-messaggio-allenamento');
  function mostraPaginaMessaggio(){
    testoMessaggio.textContent=pagineMessaggio[paginaMessaggio]||'';
    comandoMessaggio.textContent=paginaMessaggio<pagineMessaggio.length-1?'Avanti':pulsanteMessaggio;
  }
  comandoMessaggio.addEventListener('click',()=>{
    if(paginaMessaggio<pagineMessaggio.length-1){paginaMessaggio++;mostraPaginaMessaggio()}
    else popupRisposta.close();
  });
  window.Messaggi={mostra({titolo='Messaggio',testo='',pulsante='Continua'}={}){
    $('titolo-messaggio-allenamento').textContent=titolo;
    testoMessaggio.textContent=testo;testoMessaggio.style.whiteSpace='pre-line';
    testoMessaggio.style.overflow='hidden';
    comandoMessaggio.textContent=pulsante;pulsanteMessaggio=pulsante;
    const misura=document.createElement('span');
    misura.style.cssText='position:fixed;visibility:hidden;white-space:pre;pointer-events:none';
    misura.style.font=window.getComputedStyle(popupRisposta).font;
    misura.textContent=testo;document.body.append(misura);
    const larghezzaTesto=misura.getBoundingClientRect().width;misura.remove();
    const limite=Math.max(0,document.documentElement.clientWidth-24);
    let larghezza=Math.min(limite,Math.max(520,Math.ceil(larghezzaTesto/3+180)));
    function impostaLarghezza(){popupRisposta.style.width=larghezza+'px';popupRisposta.style.setProperty('--larghezza-messaggio',larghezza+'px')}
    impostaLarghezza();
    if(!popupRisposta.open)popupRisposta.showModal();
    // Misura il testo nell’altezza effettivamente disponibile, senza barre di scorrimento.
    const entra=()=>testoMessaggio.scrollHeight<=testoMessaggio.clientHeight+1;
    while(!entra()&&larghezza<limite){larghezza=Math.min(limite,larghezza+40);impostaLarghezza()}
    pagineMessaggio=[];paginaMessaggio=0;
    if(entra())pagineMessaggio=[testo];
    else{
      // Su mobile il testo prosegue per pagine, mantenendo l’altezza fissa.
      const parole=String(testo).split(/(\s+)/);let inizio=0;
      while(inizio<parole.length){
        let basso=inizio+1,alto=parole.length,fine=inizio+1;
        while(basso<=alto){
          const centro=Math.floor((basso+alto)/2);
          testoMessaggio.textContent=parole.slice(inizio,centro).join('');
          if(entra()){fine=centro;basso=centro+1}else alto=centro-1;
        }
        pagineMessaggio.push(parole.slice(inizio,fine).join('').trim());inizio=fine;
      }
    }
    mostraPaginaMessaggio();
  }};
  function mostraRisposta(dati){
    const reazione=dati.enigmi_stato?.['1']?.reazione_risposta;
    if(!reazione?.testo)return;
    const giusta=reazione.tipo==='risposta_giusta';
    window.Messaggi.mostra({titolo:giusta?'Risposta giusta':'Risposta sbagliata',testo:reazione.testo,pulsante:giusta?'Continua':'Torna all’enigma'});
  }
  // Durata dell’apertura laterale: modifica 850ms qui sotto.
  const stilePopup=document.createElement('style');
  stilePopup.textContent=`
    dialog.messaggio-orizzontale[open]{animation:apertura-pergamena-laterale 850ms cubic-bezier(.22,.7,.25,1) both}

    dialog.messaggio-orizzontale{
      --altezza-messaggio:min(320px,90dvh);
      --rotolo:calc(var(--altezza-messaggio) / 5);
      --corsa-rotolo:calc((min(var(--larghezza-messaggio),100vw - 24px) - var(--rotolo)) / 2);
      height:var(--altezza-messaggio);max-height:none;
      max-width:calc(100vw - 24px);box-sizing:border-box;
      overflow:hidden;padding:0;
    }
    dialog.messaggio-orizzontale .scroll-top,
    dialog.messaggio-orizzontale .scroll-bottom{
      position:absolute;top:var(--altezza-messaggio);left:0;
      width:var(--altezza-messaggio);height:var(--rotolo);
      aspect-ratio:auto;transform:rotate(-90deg);transform-origin:0 0;
      pointer-events:none;z-index:2;
    }
    dialog.messaggio-orizzontale .scroll-bottom{left:calc(100% - var(--rotolo))}
    dialog.messaggio-orizzontale[open] .scroll-top{animation:rotolo-sinistro 850ms cubic-bezier(.22,.7,.25,1) both}
    dialog.messaggio-orizzontale[open] .scroll-bottom{animation:rotolo-destro 850ms cubic-bezier(.22,.7,.25,1) both}
    @keyframes rotolo-sinistro{from{transform:translateX(var(--corsa-rotolo)) rotate(-90deg)}to{transform:translateX(0) rotate(-90deg)}}
    @keyframes rotolo-destro{from{transform:translateX(calc(-1 * var(--corsa-rotolo))) rotate(-90deg)}to{transform:translateX(0) rotate(-90deg)}}
    @media(prefers-reduced-motion:reduce){
      dialog.messaggio-orizzontale[open] .scroll-top,dialog.messaggio-orizzontale[open] .scroll-bottom{animation:none}
    }
    dialog.messaggio-orizzontale .scroll-middle{
      position:absolute;inset:0 var(--rotolo);width:auto;height:100%;
      padding:22px 12px;box-sizing:border-box;background:none;
      display:flex;flex-direction:column;justify-content:center;gap:12px;
      isolation:isolate;
    }
    dialog.messaggio-orizzontale .scroll-middle::before{
      content:'';position:absolute;z-index:-1;
      top:50%;left:50%;width:var(--altezza-messaggio);height:calc(100cqw + 56px);
      background:url('./images/middle-pergamena.png') center top/100% auto repeat-y;
      transform:translate(-50%,-50%) rotate(-90deg);pointer-events:none;
    }
    dialog.messaggio-orizzontale .scroll-middle{container-type:inline-size}
    dialog.messaggio-orizzontale .scroll-middle p{
      margin:0;overflow:auto;min-height:0;line-height:1.45;
    }
    dialog.messaggio-orizzontale .scroll-middle h2{flex-shrink:0;font-size:22px}
    dialog.messaggio-orizzontale .scroll-middle button{flex-shrink:0;margin:0;padding:8px}
    @media(max-width:420px){
      dialog.messaggio-orizzontale{font-size:16px}
      dialog.messaggio-orizzontale .scroll-middle{padding:16px 6px;gap:8px}
      dialog.messaggio-orizzontale .scroll-middle h2{font-size:19px}
    }
    @keyframes apertura-pergamena-laterale{
      from{clip-path:inset(0 49.5%);opacity:0}
      15%{opacity:1}
      to{clip-path:inset(0 0);opacity:1}
    }
    @media(prefers-reduced-motion:reduce){dialog.messaggio-orizzontale[open]{animation:none}}
  `;
  stilePopup.textContent+="\n    /* Su mobile torna la pergamena verticale, come nella storia. */\n    @media(max-width:600px){\n      dialog.messaggio-orizzontale{\n        width:calc(100vw - 24px)!important;height:auto;max-height:calc(100dvh - 24px);\n        overflow:hidden;\n      }\n      dialog.messaggio-orizzontale[open]{display:flex;flex-direction:column;animation:apertura-pergamena-verticale 850ms ease-out both}\n      dialog.messaggio-orizzontale .scroll-top,\n      dialog.messaggio-orizzontale .scroll-bottom{\n        position:static;inset:auto;width:100%;height:auto;aspect-ratio:5/1;\n        flex-shrink:0;transform:none!important;animation:none!important;\n      }\n      dialog.messaggio-orizzontale .scroll-middle{\n        position:relative;inset:auto;width:100%;height:auto;min-height:0;flex:1 1 auto;\n        padding:0 10%;container-type:normal;\n        background:url('./images/middle-pergamena.png') center top/100% auto repeat-y;\n      }\n      dialog.messaggio-orizzontale .scroll-middle::before{display:none}\n    }\n    @keyframes apertura-pergamena-verticale{\n      from{clip-path:inset(49.5% 0);opacity:0}to{clip-path:inset(0);opacity:1}\n    }\n    @media(prefers-reduced-motion:reduce){dialog.messaggio-orizzontale[open]{animation:none}}\n";
  document.head.append(stilePopup);


  }

// Una sola conferma alla volta: annullare o premere Esc non avvia operazioni.
let confermaAperta=null;
window.ConfermaPergamena=(testo,{titolo='Confermi?',conferma='Conferma',annulla='Annulla'}={})=>{
 if(confermaAperta)return Promise.resolve(false);
 preparaMessaggiAllenamento();
 if(!confermaAperta){
   let dialogo=document.getElementById('pergamena-conferma');
   if(!dialogo){
     dialogo=document.createElement('dialog');dialogo.id='pergamena-conferma';dialogo.className='avviso-codice messaggio-orizzontale conferma-azione';
     dialogo.setAttribute('aria-labelledby','pergamena-conferma-titolo');
     dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="pergamena-conferma-titolo"></h2><p id="pergamena-conferma-testo"></p><button type="button" id="pergamena-conferma-si"></button><button type="button" id="pergamena-conferma-no"></button></div><div class="scroll-bottom" aria-hidden="true"></div>';
     document.body.append(dialogo);
   }
   return new Promise(resolve=>{
     confermaAperta=resolve;let accettata=false;
     const si=document.getElementById('pergamena-conferma-si'),no=document.getElementById('pergamena-conferma-no'),frase=document.getElementById('pergamena-conferma-testo');
     document.getElementById('pergamena-conferma-titolo').textContent=titolo;
     frase.textContent=testo;frase.style.overflow='hidden';si.textContent=conferma;no.textContent=annulla;
     const misura=document.createElement('span');misura.style.cssText='position:fixed;visibility:hidden;white-space:pre;pointer-events:none';
     misura.style.font=window.getComputedStyle(dialogo).font;misura.textContent=testo;document.body.append(misura);
     const limite=document.documentElement.clientWidth-24;
     let larghezza=Math.min(limite,Math.max(600,Math.ceil(misura.getBoundingClientRect().width/3+180)));misura.remove();
     function dimensiona(){dialogo.style.width=larghezza+'px';dialogo.style.setProperty('--larghezza-messaggio',larghezza+'px')}
     dimensiona();
     const positivo=()=>{accettata=true;dialogo.close()},negativo=()=>{accettata=false;dialogo.close()};
     si.addEventListener('click',positivo);no.addEventListener('click',negativo);
     dialogo.addEventListener('close',()=>{
       si.removeEventListener('click',positivo);no.removeEventListener('click',negativo);
       confermaAperta=null;resolve(accettata);
     },{once:true});
     dialogo.showModal();
     while(frase.scrollHeight>frase.clientHeight+1&&larghezza<limite){larghezza=Math.min(limite,larghezza+40);dimensiona()}
     no.focus({preventScroll:true});
   });
 }
};

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
 const stile=document.createElement('style');stile.textContent='.allenamento-dialog .scroll-middle{padding-inline:12%}.allenamento-dialog button{margin-block:6px}.allenamento-dialog h3{margin-bottom:8px}.allenamento-dialog .dadi-area{min-height:52px}.allenamento-dialog button:disabled{opacity:.5}';document.head.append(stile);
 const area=$('contenuto-allenamento'),stato=$('stato-allenamento');
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 function salva(){api.memoria.scrivi(KEY,JSON.stringify({codice:api.codice,modo,sessione:vista?.sessione||pendente?.p_sessione,pendente}))}
 function dadi(t,r){
   if(!r)return;const h=document.createElement('h3');h.textContent=t;const a=document.createElement('div');a.className='dadi-area';a.setAttribute('aria-hidden','true');const totale=document.createElement('p');
   if(window.Dadi)window.Dadi.mostraRisultato(a,totale,r);else totale.textContent=`${r.valori.join(' + ')} + ${r.bonus} = ${r.totale}`;
   area.append(h,a,totale);
 }
 function racconto(){
   if(!vista?.turno)return;preparaMessaggiAllenamento();
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
     area.append(p(vista.esito==='vittoria'?'Hai vinto!':vista.esito==='fuga'?'La fuga è riuscita.':'Hai perso lo scontro.'));
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
   try{const s=await api.rpc('gioco_scontro',{p_codice:api.codice,p_azione:'disponibile'});if(n!==revisione)return;if(s&&!s.terminato){combatti.hidden=false;nellaStoria.hidden=false;nellaStoria.textContent='Inizia il combattimento'}}
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
       if(risultato?.partita)await api.applica(risultato.partita,r.codice,{anima:['gioco_iliano','gioco_giorno3'].includes(r.nomeRpc)||(r.nomeRpc==='gioco_sala_lettura'&&['manoscritti','sala','torna'].includes(r.args.p_azione))||(r.nomeRpc==='gioco_manoscritti'&&r.args.p_azione!=='documento')||(r.nomeRpc==='gioco_servizi'&&['entra','premi','corridoio','torna','esci'].includes(r.args.p_azione))||(r.nomeRpc==='gioco_giorno4'&&!['parla','passante'].includes(r.args.p_azione))});
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

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id),DRAFT='ombra-sui-portici.perquisizione.scelta.v1';
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='perquisizione';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let vista=null,versione=0,form=null,stato=null,inputs=new Map(),arma=null,difesa=null,riepilogo=null,conferma=null;
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
   if(r){if(vista&&!vista.conclusa&&conferma)aggiornaPeso();if(r.perquisizione.stato.messaggio){preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:'Il guardiano',testo:r.perquisizione.stato.messaggio,pulsante:'Continua'})}}
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
   if(s.messaggio)area.append(p(s.messaggio));
   if(s.inganno){const dado=document.createElement('div'),totale=document.createElement('p');dado.className='dadi-area';if(window.Dadi)window.Dadi.mostraRisultato(dado,totale,s.inganno);else totale.textContent='Inganno: '+s.inganno.totale;area.append(dado,totale)}
   else if(!s.cacciato&&!vista.senza_limite)area.append(b('Tenta di nascondere un oggetto — Inganno',()=>azione('inganno')));
   if(s.proposta)area.append(b('Accetta la proposta',()=>azione('accetta')),b('Rifiuta la proposta',()=>azione('rifiuta')));
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
 const stile=document.createElement('style');stile.textContent='#perquisizione{border:0;background:none;margin-block:24px}#perquisizione button{font:inherit;padding:10px 14px;margin:6px;cursor:pointer}.riga-dotazione{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-block:10px}.riga-dotazione input{width:72px;padding:6px;font:inherit}.scelta-dotazione select{display:block;width:100%;font:inherit;padding:10px}.lettere-perquisizione{letter-spacing:.15em;font-weight:bold}.comandi-borsa button{margin:4px;padding:8px;font:inherit;cursor:pointer}';document.head.append(stile);
 window.Perquisizione={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

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
 const stile=document.createElement('style');stile.textContent='.fine-giornata .scroll-middle{gap:8px}dialog.fine-giornata .azioni-fine-giornata{display:flex;gap:12px;flex-shrink:0;width:100%}dialog.fine-giornata .azioni-fine-giornata>button{flex:1 1 0;width:0;min-width:0;margin:0;padding:12px 8px;white-space:normal}dialog.fine-giornata .azioni-fine-giornata>button[hidden]{display:none}dialog.fine-giornata .scroll-middle>p{flex-shrink:0;overflow:visible}dialog.fine-giornata .scroll-middle>h2{margin-block:0 8px}@media(max-width:600px){dialog.fine-giornata .azioni-fine-giornata{flex-direction:column;gap:8px}dialog.fine-giornata .azioni-fine-giornata>button{flex:0 0 auto;width:100%}}.fine-giornata p{font-size:16px;line-height:1.4}.fine-giornata p:empty{display:none}#stato-fine-giornata button{padding:10px 16px;font:inherit;cursor:pointer;margin:6px}';document.head.append(stile);
 let ultimoAvviso=null,busy=false,versione=0,calendario=null,attesa=false;
 const MEM_ESPLORA='ombra-sui-portici.fine-giornata.esplora.v1';
 const terminaBorsa=document.createElement('button');terminaBorsa.type='button';terminaBorsa.id='termina-giornata-borsa';terminaBorsa.textContent='Termina giornata';terminaBorsa.hidden=true;
 const titoloBorsa=$('titolo-borsa');if(titoloBorsa)titoloBorsa.after(terminaBorsa);else $('borsa-elenco').before(terminaBorsa);
 const chiave=()=>api.dati?api.codice+':'+api.dati.tentativo+':'+api.dati.giorno_corrente:null;
 function pulsanti(){const d=api.dati;terminaBorsa.hidden=!d?.giornata_da_confermare||d.giorno_corrente<2||d.morto;apri.hidden=!d?.giornata_da_confermare;avanti.hidden=!$('schermata-gioco')||!d?.giornata_completata||!calendario?.prossimo_configurato||!calendario?.prossimo_aperto||d.giorno_corrente>=calendario.giorni}
 function mostra(){
   if(busy||!api.dati?.giornata_da_confermare||api.dati.morto)return;
   preparaMessaggiAllenamento();
   $('esplora-fine-giornata').hidden=api.dati.giorno_corrente<2||api.dati.stato_partita?.esplorazione_consentita===false;
   $('titolo-conferma-giornata').textContent=`Giornata ${api.dati.giorno_corrente}: vuoi confermare?`;
   $('riepilogo-conferma-giornata').textContent=`${api.dati.hp_attuali}/${api.dati.hp_massimi} HP · ${api.dati.xp||0} XP · ${api.dati.oro_rimanente} monete d’argento`;
   $('errore-fine-giornata').textContent='';ultimoAvviso=chiave();
   if(!dialogo.open)dialogo.showModal();
 }
 function programma(){
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
   area.hidden=!d||d.morto||(!d.giornata_da_confermare&&!d.giornata_completata);
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
     dialogo.close();await api.applica(nuovi,codice,{anima:scelta==='rigioca'});return true;
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

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const scriptUrl=document.currentScript?.src;
 const mappaUrl=scriptUrl?new URL('images/mappa-bologna.png',scriptUrl).href:'images/mappa-bologna.png';
 let dati=null,richiesta=0,busy=false,owner=null,informatore=null;
 const pulsante=document.createElement('button');pulsante.type='button';pulsante.textContent='Luoghi conosciuti';pulsante.id='apri-luoghi';pulsante.hidden=true;
 const apriMappa=document.createElement('button');apriMappa.type='button';apriMappa.textContent='Apri la mappa di Bologna';apriMappa.id='apri-mappa-bologna';apriMappa.hidden=true;
 $('borsa-elenco').before(pulsante);pulsante.after(apriMappa);
 const scena=document.createElement('section');scena.id='esplorazione-citta';scena.hidden=true;
 const titolo=document.createElement('h2'),descrizione=document.createElement('p'),persone=document.createElement('div'),stato=document.createElement('p');stato.setAttribute('role','status');
 scena.append(titolo,descrizione,persone,stato);if($('schermata-gioco'))document.querySelector('main .scroll-middle').append(scena);
 const elenco=document.createElement('dialog');elenco.className='avviso-codice luoghi-dialog';elenco.setAttribute('aria-labelledby','titolo-luoghi');
 elenco.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-luoghi">Luoghi conosciuti</h2><p id="regole-luoghi"></p><div id="elenco-luoghi"></div><p id="stato-elenco-luoghi" role="status"></p><button type="button" id="chiudi-luoghi">Chiudi</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(elenco);
 const indicazioni=document.createElement('dialog');indicazioni.className='avviso-codice luoghi-dialog';indicazioni.setAttribute('aria-labelledby','titolo-indicazioni');
 indicazioni.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-indicazioni">Chiedi indicazioni</h2><div id="destinazioni-indicazioni"></div><p id="testo-indicazioni" aria-live="polite"></p><div id="segui-indicazioni"></div><p id="stato-indicazioni" role="status"></p><button type="button" id="chiudi-indicazioni">Chiudi</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(indicazioni);
 const mappa=document.createElement('dialog');mappa.className='mappa-dialog';mappa.setAttribute('aria-labelledby','titolo-mappa');
 mappa.innerHTML='<h2 id="titolo-mappa">Mappa di Bologna</h2><div id="superficie-mappa"><img id="immagine-mappa" alt="Mappa illustrata di Bologna con Piazza Maggiore, San Francesco, Porta Maggiore, Osteria del Sole e le tre botteghe."></div><div id="comandi-mappa"></div><div id="destinazioni-mappa"></div><button type="button" id="chiudi-mappa">Chiudi mappa</button>';
 document.body.append(mappa);
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.addEventListener('click',f);return e}
 function bloccato(){return busy||!dati||dati.partita.morto||dati.in_combattimento}
 function lista(destinazione){
   destinazione.replaceChildren();
   if(!dati)return;
   for(const l of dati.luoghi){
     const voce=document.createElement('div');voce.className='luogo-conosciuto';
     const label=l.visitato?'Visitato':l.riferimento?'Riferimento conosciuto':l.indicazione?'Indicazioni ricevute':'Segnato sulla mappa';
     voce.append(p(l.nome+' · '+label));
     const vai=b(l.id===dati.corrente.id?'Sei qui':'Raggiungi '+l.nome,()=>muovi(l.id));vai.disabled=bloccato()||!l.raggiungibile||l.id===dati.corrente.id;voce.append(vai);
     if(l.indicazione)voce.append(b('Rileggi le indicazioni',()=>{apriIndicazioni();$('testo-indicazioni').textContent=l.indicazione.testo;$('segui-indicazioni').replaceChildren(b('Segui le indicazioni',()=>muovi(l.id)))}));
     destinazione.append(voce);
   }
 }
 function disegna(){
   pulsante.hidden=!api.dati;apriMappa.hidden=!dati?.ha_mappa;
   scena.hidden=!dati||!$('schermata-gioco')||dati.partita.morto||([3,4].includes(dati.partita.giorno_corrente)&&String(dati.partita.stato_partita?.fase||'').startsWith('g3_'))||(dati.partita.giorno_corrente===4&&['g4_colazione','g4_passaggio','g4_nascosta'].includes(dati.partita.stato_partita?.fase))||(dati.partita.giorno_corrente===2&&['ritorno_porta','indicazioni_giorno2','guardia_giorno2','scontro_guardie'].includes(dati.partita.stato_partita?.fase));
   if(!dati)return;
   titolo.textContent=dati.corrente.nome;descrizione.textContent=dati.corrente.descrizione;persone.replaceChildren();
   if(!dati.ingresso_completato)persone.append(p('Puoi chiedere indicazioni. Per entrare in città devi prima concludere la perquisizione.'));
   if(dati.in_combattimento)persone.append(p('Termina il combattimento prima di spostarti o chiedere indicazioni.'));
   for(const n of dati.informatori){const e=b((api.dati.giorno_corrente===4?'Parla con ':'Chiedi indicazioni a ')+n.nome,()=>api.dati.giorno_corrente===4?window.GiornoQuattro.parla(n.id):apriIndicazioni(n));e.disabled=bloccato();persone.append(e)}
   if(dati.ingresso_completato)persone.append(b('Apri i luoghi conosciuti',apriElenco));if(dati.partita.giorno_corrente===3&&dati.partita.stato_partita?.fase==='fine_giorno3'&&!['armaiolo','bottega_preziosi','speziale'].includes(dati.partita.luogo_attuale))persone.append(p('Per oggi qui non trovi altri incontri o novità. Puoi continuare la passeggiata, visitare le botteghe oppure terminare la giornata dalla Borsa.'));
   $('regole-luoghi').textContent=dati.ha_mappa?'Puoi orientarti con la mappa e raggiungere i luoghi segnati.':'Conosci già Porta Maggiore, San Francesco e Piazza Maggiore. Per gli altri luoghi chiedi indicazioni: una volta scoperti rimangono nell’elenco.';
   lista($('elenco-luoghi'));if(mappa.open)lista($('destinazioni-mappa'));
 }
 async function aggiorna(){
   const n=++richiesta;if(owner!==api.codice){dati=null;owner=api.codice}
   if(!api.dati){scena.hidden=true;pulsante.hidden=true;apriMappa.hidden=true;return}
   try{const r=await api.rpc('gioco_luoghi',{p_codice:api.codice});if(n!==richiesta)return;dati=r;disegna()}
   catch(e){stato.textContent=e.message}
 }
 async function apriElenco(){
   $('inventario').close();await aggiorna();if(!dati)return;if(!elenco.open)elenco.showModal();
 }
 function apriIndicazioni(n=null){
   informatore=n;$('destinazioni-indicazioni').replaceChildren();$('segui-indicazioni').replaceChildren();$('testo-indicazioni').textContent='';$('stato-indicazioni').textContent='';
   $('titolo-indicazioni').textContent=n?'Indicazioni da '+n.nome:'Indicazioni ricevute';
   if(n)for(const d of dati.destinazioni){const e=b('Come raggiungo '+d.nome+'?',()=>chiedi(n,d.id));e.disabled=bloccato();$('destinazioni-indicazioni').append(e)}
   if(!indicazioni.open)indicazioni.showModal();
 }
 async function chiedi(n,id){
   if(bloccato())return;busy=true;
   await api.esegui(async()=>{
     const r=await api.rpc('gioco_luoghi',{p_codice:api.codice,p_azione:'chiedi',p_destinazione:id,p_informatore:n.id,p_tentativo:api.dati.tentativo});
     await api.applica(r.partita,api.codice,{anima:false});$('testo-indicazioni').textContent=r.indicazione.testo;
     $('segui-indicazioni').replaceChildren(b('Segui le indicazioni',()=>muovi(id)));
   },$('stato-indicazioni'));
   busy=false;
 }
 async function muovi(id){
   if(bloccato())return;busy=true;
   await api.esegui(async()=>{
     const r=await api.rpc('gioco_luoghi',{p_codice:api.codice,p_azione:'vai',p_destinazione:id,p_tentativo:api.dati.tentativo});
     elenco.close();indicazioni.close();mappa.close();$('inventario').close();
     await api.applica(r.partita,api.codice,{anima:true});
     if(!$('schermata-gioco')){const home=$('borsa-vai-al-gioco');if(home?.href)window.location.assign(home.href)}
   },indicazioni.open?$('stato-indicazioni'):elenco.open?$('stato-elenco-luoghi'):stato);
   busy=false;disegna();
 }
 let zoom=100;
 function dimensione(){const img=$('immagine-mappa');img.style.width=zoom+'%';img.style.maxWidth='none'}
 $('comandi-mappa').append(b('Zoom +',()=>{zoom=Math.min(300,zoom+50);dimensione()}),b('Zoom −',()=>{zoom=Math.max(100,zoom-50);dimensione()}));
 apriMappa.addEventListener('click',async()=>{
   await aggiorna();if(!dati?.ha_mappa)return;$('inventario').close();zoom=100;dimensione();$('immagine-mappa').src=mappaUrl;lista($('destinazioni-mappa'));if(!mappa.open)mappa.showModal();
 });
 pulsante.addEventListener('click',apriElenco);
 $('chiudi-luoghi').addEventListener('click',()=>elenco.close());$('chiudi-indicazioni').addEventListener('click',()=>indicazioni.close());$('chiudi-mappa').addEventListener('click',()=>mappa.close());
 for(const d of [elenco,indicazioni,mappa])d.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 const stile=document.createElement('style');stile.textContent='#esplorazione-citta{border:0;background:none;margin-block:24px}.luoghi-dialog button,#esplorazione-citta button,#apri-luoghi,#apri-mappa-bologna{font:inherit;padding:10px;margin:6px;cursor:pointer}.luoghi-dialog{max-height:90dvh}.luogo-conosciuto{margin-block:16px}.luogo-conosciuto p{margin-bottom:4px}.mappa-dialog{width:min(1200px,96vw);max-height:94dvh;padding:16px;border:0;background:var(--surface,#f4ead5);color:var(--text);font:inherit}.mappa-dialog::backdrop{background:#0009}.mappa-dialog h2{margin:0 0 12px}.mappa-dialog button{font:inherit;padding:8px 12px;margin:4px;cursor:pointer}#superficie-mappa{max-height:70dvh;overflow:auto}#immagine-mappa{display:block;height:auto}.mappa-dialog .luogo-conosciuto{display:inline-block;vertical-align:top;margin:8px}';document.head.append(stile);
 window.LuoghiGioco={aggiorna,apri:apriElenco};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno2';area.hidden=true;
 document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,risposta=null){
  if(busy)return;busy=true;
  const r=await window.BorsaNuova.esegui('gioco_giorno2',{p_codice:api.codice,p_azione:azione,p_risposta:risposta,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
  busy=false;aggiorna();
  if(r?.suggerimento){preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:'L’omino ricompare',testo:r.suggerimento,pulsante:'Torna alla pergamena'})}
  // Il racconto resta visibile: lo scontro si apre soltanto dal pulsante dedicato.
 }
 function aggiorna(){
  const d=api.dati,fase=d?.stato_partita?.fase;
  area.hidden=!d||d.giorno_corrente!==2||d.morto||!['ritorno_porta','indicazioni_giorno2','guardia_giorno2','scontro_guardie'].includes(fase);
  area.replaceChildren();if(area.hidden)return;
  const titolo=document.createElement('h2');titolo.textContent='Il secondo giorno';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('L’ultima azione deve essere recuperata prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna();if(r?.suggerimento){preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:'L’omino ricompare',testo:r.suggerimento,pulsante:'Torna alla pergamena'})}}));return}
  if(fase==='ritorno_porta'){
   area.append(p('La mattina dopo torni a Porta Maggiore. Esattamente come il giorno prima, appena passi sotto il varco vieni risucchiato verso l’alto.'),p('Lo stesso omino che ti ha accolto ieri ti squadra ed esclama: «Eccone un altro con il pass speciale di Galeazzo». Intanto la penna traccia una linea sulla pergamena che galleggia accanto alla sua testa, cancellando probabilmente il tuo nome dalla lista.'),p('E, come ieri, sparisce all’istante, lasciandoti di nuovo davanti alla pergamena. Questa volta scrivi con sicurezza.'));
   const label=document.createElement('label');label.htmlFor='risposta-pergamena-giorno2';label.textContent='Cosa scrivi sulla pergamena?';
   const input=document.createElement('input');input.id='risposta-pergamena-giorno2';input.type='text';input.autocomplete='off';input.disabled=busy;
   const avanti=b('Traccia le lettere',()=>{if(input.value.trim())return invia('rispondi',input.value);input.focus()});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();avanti.click()}});
   area.append(label,input,avanti);
   const n=d.stato_partita.errori_pergamena||0;
   if(n)area.append(p(n>=4?'L’omino ti ha dettato la risposta: devi scrivere stanza delle richieste!':'L’inchiostro evapora. La pergamena resta vuota.'));
  }else if(fase==='indicazioni_giorno2'){
   area.append(p('La pergamena assorbe le lettere. Al loro posto compare una freccia, seguita da poche indicazioni: «Segui il corridoio fino in fondo. Stanza delle Richieste». Ieri sembrava tutto più complicato.'),b('Raggiungi la Stanza delle Richieste',()=>invia('raggiungi')));
  }else if(fase==='guardia_giorno2'){
   area.append(p('Ti rechi alla Stanza delle Richieste. Davanti a te c’è una guardia svogliata che, senza neanche alzare lo sguardo, ti indica un tavolo.'),p('«Poggia lì quello che hai. Per decreto del podestà Giorgione puoi portare al massimo cinque oggetti».'));
   const h=document.createElement('h3');h.textContent='Cosa fai?';area.append(h,b('Poggi i tuoi oggetti sul tavolo',()=>invia('tavolo')),b('Attacchi la guardia',()=>invia('attacca')));
  }else{
   area.append(p('La guardia si raddrizza di scatto e chiama i compagni. In un attimo ne arrivano altre sette: ora ti trovi circondato da otto guardie armate.'),p('Dopo ogni tua azione attacca ciascuna guardia ancora in piedi. Poi tocca di nuovo a te.'));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 const stile=document.createElement('style');stile.textContent='#racconto-giorno2{border:0;background:none;margin-block:24px}#racconto-giorno2 input{display:block;width:100%;font:inherit;padding:12px;margin-block:12px}#racconto-giorno2 button{font:inherit;line-height:1.4;margin:6px 10px 6px 0;padding:12px 18px;min-height:46px;border:1px solid #926033;border-bottom-width:2px;border-radius:5px;background:linear-gradient(#f8e9c9,#eacb94);color:#4c2c1b;cursor:pointer}#racconto-giorno2 button:disabled{opacity:.55}@media(max-width:600px){#racconto-giorno2 button{width:100%;margin-inline:0}}';document.head.append(stile);
 window.GiornoDue={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

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
  area.append(b('Parla con '+n.negoziante,()=>{preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:n.negoziante,testo:api.dati.giorno_corrente===4?'«Prima di cercare altrove, riprenderei da dove eri arrivato ieri.»':n.saluto,pulsante:'Torna al negozio'})}));
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
 const stile=document.createElement('style');stile.textContent='#negozio-citta{border:0;background:none;margin-block:28px}.prodotto-negozio{padding-block:16px;border:0;border-bottom:1px solid #8b6a4040;background:none}.prodotto-negozio h3{margin-block:0 8px}.prodotto-negozio p{margin-block:6px}#negozio-citta button{font:inherit;padding:12px 18px;margin:8px 8px 8px 0;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#negozio-citta button:disabled{opacity:.5;cursor:not-allowed}@media(max-width:600px){#negozio-citta button{width:100%;margin-inline:0}}';document.head.append(stile);
 window.NegoziGioco={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='incontro-iliano';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let vista=null,rev=0,busy=false;
 const racconto=[
 'L’Osteria del Sole si nasconde fra le botteghe del mercato. Quando entri, nessuno interrompe la propria conversazione per guardarti. Un uomo vicino alla porta sta sostenendo che il suo vino sia stato allungato; quello di fronte gli risponde che, per quanto ne ha bevuto, dovrebbe esserne grato.',
 'Iliano è seduto in fondo alla sala.',
 'Lo riconosci prima ancora che alzi la mano. Dalla lettera ti aspettavi un mago capace di promettere imprese e ricompense; davanti hai un vecchio dalle spalle curve, con una veste consumata e le dita sottili appoggiate su alcune pergamene. Sul tavolo ci sono un sacchetto chiuso e una coppa che sembra non aver toccato.',
 '«Sei arrivato.»',
 'Una tosse secca gli spezza il respiro. Aspetti che passi.',
 '«Siediti. E perdonami se non mi alzo: oggi le ginocchia hanno già espresso il loro parere.»',
 'Sposti lo sgabello e prendi posto. Sulle pergamene distingui schemi, annotazioni e intere righe cancellate. Iliano raccoglie i fogli, ma dopo un momento li lascia ricadere sul tavolo.',
 '«Devo raccontarti una cosa. Prima che tu decida se sono pazzo, ti chiedo soltanto di ascoltarla fino in fondo.»',
 'Abbassa la voce.',
 '«Eravamo sette. Sette maghi convinti di poter liberare gli uomini da buona parte delle fatiche che li consumavano. Volevamo una magia capace di svolgere i lavori più gravosi, assistere gli studiosi, trovare soluzioni che a noi avrebbero richiesto anni.»',
 'Ti guarda, cercando di capire quanto tu sia disposto a credergli.',
 '«E ci riuscimmo. Ma la cosa straordinaria venne dopo: la magia imparava. Conservava qualcosa di ogni esperienza e lo usava per correggersi. Potevi affidarle un compito e, quando tornavi, aveva trovato un modo migliore per svolgerlo.»',
 'Per la prima volta gli compare un sorriso. Dura poco.',
 '«Puoi immaginare quanto potere avesse chi poteva governarla. Scegliere quali compiti assegnarle, quali limiti imporle, quali risultati accettare.»',
 'Iliano passa un dito lungo il bordo della coppa.',
 '«Raccogliemmo in un tomo tutto ciò che serviva per controllarla. Poi ci accorgemmo che averlo scritto non risolveva il problema. Lo concentrava in un oggetto che qualcuno avrebbe potuto rubare. O tenere per sé.»',
 '«Uno di voi?»',
 'Il vecchio annuisce.',
 '«Non volevamo dover confidare nella virtù di sette persone per il resto della loro vita. Così nascondemmo il tomo e pronunciammo un incantesimo per cancellare il ricordo del nascondiglio. Anche dalla nostra memoria.»',
 'Rimani a guardarlo.',
 '«Avete nascosto l’unica cosa che poteva controllare la vostra magia. E poi avete fatto in modo di dimenticare dove fosse.»',
 '«Detto così, ammetto che non sembra il momento più brillante della nostra carriera.»',
 'Si concede un respiro, poi riprende.',
 '«Ognuno di noi ha conservato un particolare utile a ritrovarlo. Uno soltanto. Io so che il tomo è a Bologna.»',
 'Aspetti che aggiunga qualcosa.',
 '«Questo è tutto?»',
 '«Questo è tutto.»',
 'Dall’altro lato della sala arriva una risata. Iliano aspetta che si spenga.',
 '«Nel frattempo abbiamo continuato ad affidare lavori alla magia. Sempre più lavori. Adesso nessuno riesce più a seguirne l’operato fino in fondo. Otteniamo una risposta, vediamo un risultato, e spesso ci basta. Ma quando qualcosa non torna, non sappiamo risalire alle ragioni. E non abbiamo più gli strumenti per intervenire davvero.»',
 '«E gli altri maghi?»',
 '«Ho provato a rintracciarli. Le risposte arrivano di rado. Viaggiare mi costa sempre più fatica, e la mia salute…»',
 'Un altro colpo di tosse gli impedisce di finire. Stavolta beve un sorso.',
 '«Chi mi ascolta pensa che voglia togliere alla città qualcosa di utile. Mi ricordano le fatiche risparmiate, le guarigioni, i raccolti. Cose che conosco bene. Ho contribuito a renderle possibili.»',
 'Stringe le pergamene fra le mani.',
 '«Vorrei poter dire che tutto sta procedendo come speravamo. Ma per dirlo dovrei poterlo verificare.»',
 'Per un poco restate in silenzio. Il racconto è enorme. Troppo per accettarlo sulla parola di un vecchio incontrato in un’osteria.',
 'Iliano sembra leggertelo in faccia.',
 'Ti affretti ad annuire, cercando di dare alla tua espressione una convinzione che ancora non provi.',
 '«Ho capito. Puoi contare su di me.»',
 'Il vecchio ti osserva per qualche istante, poi spinge il sacchetto verso di te.',
 '«Qui ci sono cinquanta monete. Al ritorno, con il tomo, ne avrai molte altre.»'
 ];
 const fuori=[
 'Afferri il sacchetto prima che Iliano possa cambiare idea. Le monete tintinnano: almeno su quelle non sembrano esserci dubbi.',
 '«Accetto l’incarico.»',
 'Iliano china appena il capo. Ti alzi, rimetti a posto lo sgabello e raggiungi la porta, avvertendo il peso del sacchetto contro il fianco.',
 'Fuori dall’osteria ti fermi.',
 'Sette maghi, una magia che impara da sola, un libro nascosto da persone che hanno deliberatamente dimenticato dove l’hanno messo. Ripensandoci qui, fra le voci del mercato, la faccenda sembra ancora meno ragionevole.',
 'Le monete, invece, sono vere.',
 'Potresti tenerti il denaro e lasciare Bologna. Iliano è vecchio, malato e non sa nemmeno dove cercare il suo libro: difficilmente riuscirebbe a trovare te.',
 'Oppure potresti mantenere la parola data. Non sei ancora convinto del suo racconto, ma questo non ti impedisce di provare a capire se ci sia qualcosa di vero.',
 'Che cosa decidi?'
 ];
 const fuga=[
 'Ti basta ripercorrere la strada da cui sei arrivato. Attraversi Bologna senza fermarti e superi la porta, cercando di non voltarti indietro.',
 'Soltanto quando le mura cominciano ad allontanarsi ti concedi un sorriso.',
 'Porti una mano al sacchetto.',
 'È vuoto.',
 'Lo apri, lo rovesci, passi le dita nelle pieghe. Controlli anche le altre monete che avevi con te. Non ne è rimasta una.',
 'Poi senti tirare in fondo alla schiena.',
 'Ti giri, ma non c’è nessuno. Allunghi una mano sotto il mantello e incontri qualcosa di morbido. Lo afferri.',
 'Il dolore ti fa lasciare subito la presa.',
 'Dal fondo della tua schiena spunta una lunga coda da volpe.',
 'Rimani immobile, con il sacchetto vuoto in una mano e l’altra ancora sospesa dietro di te.',
 'A quanto pare, Iliano aveva pensato anche a questa eventualità.'
 ];
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function azione(nome){if(busy)return;busy=true;await window.BorsaNuova.esegui('gioco_iliano',{p_codice:api.codice,p_azione:nome,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});busy=false;await aggiorna()}
 function disegna(){
  const d=api.dati,fase=d?.stato_partita?.fase,qui=d?.luogo_attuale==='osteria_sole';
  area.replaceChildren();area.hidden=!d||d.giorno_corrente!==2||(!qui&&!['decisione_iliano','fallimento_volpe'].includes(fase));
  if(area.hidden||!vista)return;
  const titolo=document.createElement('h2');titolo.textContent=fase==='fallimento_volpe'?'Un pessimo affare':fase==='decisione_iliano'?'Fuori dall’osteria':'Iliano';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);await aggiorna()}));return}
  if(fase==='fallimento_volpe'){
   fuga.forEach(t=>area.append(p(t)));
   area.append(p('Hai fallito. Ripartirai dall’inizio della giornata; questo fallimento resta nel registro.'),b('Ricomincia la giornata',()=>api.esegui(()=>api.riprendiCheckpoint(),$('stato-condiviso'))));return;
  }
  if(d.morto){area.hidden=true;return}
  const s=vista.incontro;
  if(s.fase==='scelta'){
   fuori.forEach(t=>area.append(p(t)));area.append(b('Scappa con il denaro',()=>azione('scappa')),b('Accetta per davvero l’incarico',()=>azione('accetta')));
  }else if(s.fase==='accettato'){
   area.append(p('Iliano è di nuovo chino sui suoi appunti. Hai deciso di mantenere la parola data. Per il resto della giornata, Bologna è ancora tutta da esplorare.'));
  }else if(vista.presente){
   racconto.forEach(t=>area.append(p(t)));
   const prendi=b('Prendi il sacchetto e accetta l’incarico',()=>azione('prendi'));prendi.disabled=busy||d.giornata_completata;area.append(prendi);
  }else area.hidden=true;
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++rev;if(!api.dati||api.dati.giorno_corrente!==2){vista=null;area.hidden=true;return}
  try{const r=await api.rpc('gioco_iliano',{p_codice:api.codice});if(n!==rev)return;vista=r;disegna()}
  catch(e){area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare l’incontro',aggiorna))}
 }
 const stile=document.createElement('style');stile.textContent='#incontro-iliano{border:0;background:none;margin-block:28px}#incontro-iliano button{font:inherit;line-height:1.4;margin:8px 10px 8px 0;padding:12px 18px;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#incontro-iliano button:disabled{opacity:.5}@media(max-width:600px){#incontro-iliano button{width:100%;margin-inline:0}}';document.head.append(stile);
 window.IncontroIliano={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno3';area.hidden=true;
 document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 const luogo=d=>({g3_colazione:'locanda_risveglio',g3_cacciata:'locanda_risveglio',g3_ricerca:'piazza_maggiore',g3_mercato:'mercato',g3_sospetto:'mercato',g3_indicazioni:d.stato_partita.fonte==='locanda'?'locanda_risveglio':'mercato',g3_san_domenico:'san_domenico',g3_biblioteca:'biblioteca'})[d.stato_partita?.fase];
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,risposta=null){
  if(busy)return;busy=true;
  try{await window.BorsaNuova.esegui('gioco_giorno3',{p_codice:api.codice,p_azione:azione,p_risposta:risposta,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo})}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase;
  area.replaceChildren();area.hidden=!d||d.giorno_corrente!==3||d.morto||!luogo(d)||f==='g3_biblioteca';if(area.hidden)return;
  const h=document.createElement('h2');h.textContent=({g3_colazione:'Il terzo giorno',g3_cacciata:'Il garbo del locandiere',g3_ricerca:'Qualcosa non ti convince',g3_mercato:'Fra i banchi del mercato',g3_sospetto:'Una domanda di troppo',g3_indicazioni:'Storie da topi di biblioteca',g3_san_domenico:'San Domenico',g3_biblioteca:'La biblioteca'})[f];area.append(h);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(d.luogo_attuale!==luogo(d)){area.append(p('Puoi riprendere il racconto dal punto in cui lo hai lasciato.'),b('Riprendi il racconto',()=>invia('torna')));return}
  if(f==='g3_colazione'){
   area.append(p('Ti svegli su un letto scomodo, probabilmente occupato prima di te da qualcuno con un personale concetto di igiene. Ti guardi intorno e capisci che uscire da quella stanza non potrà che farti bene.'),p('Al piano di sotto consumi una colazione veloce. Al tavolino dietro di te, due uomini conversano a voce abbastanza alta da risparmiarti la fatica di origliare.'),p('«Ieri ho tagliato tutta la legna del terreno. Tutta! Con la magia nuova, e senza neanche l’aiuto di un singolo taglialegna.»'),p('«Il mio vecchio vicino faceva proprio il taglialegna, da giovane. Adesso ha la schiena spaccata e a malapena riesce a camminare.»'),p('Il primo annuisce, soddisfatto. Tu ripensi a Iliano. Vista da questo tavolo, la magia sembra avere argomenti piuttosto convincenti.'),b('Interrompi: così i taglialegna non avranno più lavoro',()=>invia('lavoro')),b('Interrompi: è davvero prodigiosa, questa magia nuova',()=>invia('meraviglia')),b('Rimani ad ascoltare',()=>invia('ascolta')));
  }else if(f==='g3_cacciata'){
   if(d.stato_partita.colazione==='lavoro')area.append(p('Ti giri verso i due uomini. «E i taglialegna? Come si guadagneranno da vivere, se la magia fa tutto al posto loro?»'),p('L’uomo che ha tagliato la legna ti squadra. «Meglio spezzarsi la schiena, allora?» L’altro guarda il fondo della propria scodella.'));
   else area.append(p('Resti ad ascoltare. I due passano dalla legna ai sacchi di farina che ormai si spostano senza bisogno di braccia. Nel frattempo hai finito la colazione, ma continui a occupare il tavolo.'));
   area.append(p('Un forte tonfo ti costringe a voltarti a destra. Il locandiere ha appena posato una brocca sul tavolo.'),p('«O ordini qualcos’altro oppure mi lasci libero il tavolo. Ho gente che aspetta di mangiare, e tu mi stai solo occupando spazio!»'),p('Il garbo del locandiere ti persuade che è il momento di uscire.'),b('Esci dalla locanda',()=>invia('esci')));
  }else if(f==='g3_ricerca'){
   area.append(p('Cominci a percorrere le vie di Bologna. Finalmente ti torna in mente Iliano, con il suo sacchetto di monete e il racconto dei sette maghi.'),p('Proprio non ti convince. Ma neppure ti basta liquidarlo come un vecchio pazzo. Prima di cercare un tomo nascosto da persone che hanno dimenticato dove sia, vorresti capire se quel tomo sia mai esistito.'),p('Dove cerchi conferme al racconto di Iliano?'));
   const label=document.createElement('label');label.htmlFor='ricerca-giorno3';label.textContent='Cosa fai?';
   const input=document.createElement('input');input.type='text';input.id='ricerca-giorno3';input.maxLength=500;input.autocomplete='off';input.disabled=busy;
   const vai=b('Segui questa idea',()=>{if(!input.value.trim()){input.focus();return}return invia('cerca',input.value)});
   input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();vai.click()}});area.append(label,input,vai);
   if(d.stato_partita.ricerca_non_riconosciuta)area.append(p('Non riesci ancora a trasformare questa idea in una pista. Prova a indicare dove cercheresti, oppure chiedi informazioni in giro.'));
   area.append(b('Chiedi informazioni in giro',()=>invia('informazioni')));
  }else if(f==='g3_mercato'||f==='g3_sospetto'){
   if(f==='g3_mercato')area.append(p('Al mattino il mercato è già pieno di voci. Fra ceste, sacchi e venditori che si chiamano da un banco all’altro, qualcuno dovrà pur sapere qualcosa della nascita della magia nuova.'));
   else area.append(p('«Chi comanda davvero questa magia? E da dove viene?»'),p('Il venditore smette di sistemare la merce. Ti guarda, poi guarda il banco accanto. «Io vendo quello che vedi. Per certe domande cerca qualcun altro.»'),p('La conversazione si spegne. Insistere con lo stesso tono non sembra promettente. Puoi provare a mostrare una curiosità meno sospettosa.'));
   area.append(p('Su un banco vicino, un sacco si solleva da solo e versa il proprio contenuto nella cesta che il mercante tiene aperta. Non sembra che nessuno, a parte te, trovi la cosa degna di attenzione.'));
   if(f==='g3_mercato')area.append(b('Chiedi direttamente chi controlla la magia nuova',()=>invia('diretta')));
   area.append(b('Osserva con meraviglia il prodigio e chiedi come sia possibile',()=>invia('prodigio')));
  }else if(f==='g3_indicazioni'){
   if(d.stato_partita.fonte==='locanda')area.append(p('«È davvero prodigiosa, questa magia. Ma chi l’ha inventata?»'),p('L’uomo si stringe nelle spalle. «Non saprei. C’è chi dice una cosa e chi un’altra. Se vuoi le storie vecchie, devi cercarle nei libri.»'),p('Il suo compagno aggiunge: «A San Domenico i frati hanno una biblioteca. Prova lì.»'),p('Ringrazi, ti alzi e ti prepari a uscire. Il racconto di Iliano continua a sembrarti improbabile, ma adesso hai un posto in cui cercare conferme.'));
   else area.append(p('«Come fate? Non ho mai visto niente del genere!»'),p('Il venditore segue il tuo sguardo verso il sacco e sorride. «Questa è la magia nuova. Risparmia fatica, e non chiede neanche da mangiare.»'),p('«Ma come è cominciata?»'),p('«Ah, queste sono storie vecchie. Stanno sui libri e interessano solo ai topi di biblioteca. A San Domenico ne hanno quanti ne vuoi: libri e topi, credo.»'),p('Ti indica come raggiungere il convento. Questa volta, almeno, hai ottenuto una pista.'));
   area.append(p('Le indicazioni per San Domenico e la biblioteca sono ora fra i luoghi conosciuti.'),b('Raggiungi San Domenico',()=>invia('raggiungi')));
  }else if(f==='g3_san_domenico'){
   area.append(p('Raggiungi San Domenico. Davanti alla basilica il rumore del mercato è ormai lontano. Accanto alla chiesa si apre l’accesso al convento.'),p('Fermi un frate e chiedi della biblioteca. Ti indica il passaggio da seguire. «Se cerchi qualcuno che ti aiuti con i libri, domanda al bibliotecario.»'),b('Entra e cerca la biblioteca',()=>invia('entra')));
  }else{
   area.append(p('Entri nella biblioteca del convento. Fra i tavoli e i manoscritti, un vecchio frate è chino su un volume aperto. Per il momento non sembra essersi accorto di te.'),p('Qui proseguirà l’esplorazione della terza giornata. Questa parte è ancora da scrivere; la partita resta salvata all’arrivo in biblioteca.'));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 const stile=document.createElement('style');stile.textContent='#racconto-giorno3{border:0;background:none;margin-block:24px}#racconto-giorno3 input{display:block;width:100%;box-sizing:border-box;font:inherit;padding:12px;margin-block:12px;background:transparent;color:inherit;border:1px solid #926033}#racconto-giorno3 button{font:inherit;line-height:1.4;margin:8px 10px 8px 0;padding:12px 18px;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#racconto-giorno3 button:disabled{opacity:.5}@media(max-width:600px){#racconto-giorno3 button{width:100%;margin-inline:0}}';document.head.append(stile);
 window.GiornoTre={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

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
 function mostra(r){if(!r?.lettura)return;preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Torna alla sala'})}
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
 const stile=document.createElement('style');stile.textContent='#sala-lettura{border:0;background:none;margin-block:24px}#sala-lettura button{font:inherit;line-height:1.4;padding:12px 18px;margin:6px 0;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#sala-lettura button:disabled{opacity:.5}.dialoghi-bibliotecario{display:flex;flex-direction:column;align-items:stretch;gap:4px}.tomi-sala-lettura{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px}.tomi-sala-lettura li{display:flex;flex-direction:column;align-items:stretch}.tomi-sala-lettura button{text-align:left}.tomo-letto{font-size:.8em;padding-inline:6px}@media(max-width:600px){.tomi-sala-lettura{grid-template-columns:1fr}#sala-lettura button{width:100%}}';document.head.append(stile);
 window.SalaLettura={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='sala-manoscritti';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 const pianta=document.createElement('dialog');pianta.className='avviso-codice pianta-biblioteca';pianta.setAttribute('aria-labelledby','titolo-pianta-biblioteca');
 pianta.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-pianta-biblioteca">Pianta incompleta della biblioteca</h2><div class="superficie-pianta"><img id="immagine-pianta-biblioteca" alt="Pianta parziale della biblioteca: il corridoio termina prima dei servizi; fra cisterna e servizi rimane uno spazio vuoto senza indicazioni."></div><p id="testo-pianta-biblioteca"></p><p class="istruzioni-pianta">Su uno schermo piccolo puoi scorrere lateralmente la pianta.</p><button type="button" id="chiudi-pianta-biblioteca">Torna ai manoscritti</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(pianta);$('chiudi-pianta-biblioteca').addEventListener('click',()=>pianta.close());
 const radice=document.currentScript?.src||window.location.href;
 let vista=null,busy=false,versione=0;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,fn){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e}
 function mostra(r){
  if(!r?.lettura)return;const l=r.lettura;
  if(l.tipo==='pianta'){$('immagine-pianta-biblioteca').src=radice?new URL('images/pianta-biblioteca.svg',radice).href:'images/pianta-biblioteca.svg';$('testo-pianta-biblioteca').textContent=l.testo;if(!pianta.open)pianta.showModal()}
  else{preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:l.titolo,testo:l.testo,pulsante:'Torna ai manoscritti'})}
 }
 async function invia(azione,documento=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_manoscritti',{p_codice:api.codice,p_azione:azione,p_documento:documento,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});mostra(r)}
  finally{busy=false;await aggiorna()}
 }
 function disegna(){
  const d=api.dati,f=d?.stato_partita?.fase;area.replaceChildren();area.hidden=!d||![3,4].includes(d.giorno_corrente)||d.morto||!['g3_manoscritti','g3_corridoio'].includes(f);if(area.hidden||!vista)return;
  const titolo=document.createElement('h2');titolo.textContent=f==='g3_corridoio'?'Il corridoio dei servizi':'La sala dei manoscritti';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);mostra(r);await aggiorna()}));return}
  if(d.luogo_attuale!=='biblioteca'){area.append(p('Puoi riprendere l’esplorazione nella biblioteca del convento.'),b('Torna alla biblioteca',()=>invia('torna')));return}
  if(f==='g3_corridoio'){
   area.append(p('Il corridoio è più stretto delle sale che hai attraversato. Una porta conduce al bagno; poco oltre, il passaggio termina contro una parete. Nell’aria rimane un odore di pietra umida.'));
   if(vista.stato.letti?.pianta)area.append(p('La disposizione degli ambienti non sembra corrispondere del tutto alla vecchia pianta.'));
   area.append(b('Entra nei servizi',()=>window.Servizi.entra()),b('Torna alla sala dei manoscritti',()=>invia('manoscritti')),b('Torna alla sala di lettura',()=>invia('lettura')));
  }else{
   area.append(p('Qui non ci sono soltanto libri: fascicoli, registri e fogli ripiegati occupano gli scaffali. Alcuni recano annotazioni di mani diverse, aggiunte a distanza di anni.'),p('Su un leggio trovi un catalogo antico. Una catena lo lega al mobile: qualcuno ha preferito non affidarsi alla buona memoria dei lettori. Puoi sfogliarlo, ma non portarlo via.'));
   const elenco=document.createElement('ul');elenco.className='documenti-manoscritti';
   for(const d of vista.documenti){const li=document.createElement('li'),e=b(d.titolo,()=>invia('documento',d.id));e.dataset.documento=d.id;li.append(e);if(vista.stato.letti?.[d.id]){const s=document.createElement('span');s.textContent='Letto';li.append(s)}elenco.append(li)}
   area.append(elenco,b('Imbocca il corridoio dei servizi',()=>invia('corridoio')),b('Torna alla sala di lettura',()=>invia('lettura')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 async function aggiorna(){
  const n=++versione,d=api.dati;
  if(!d||![3,4].includes(d.giorno_corrente)||!['g3_manoscritti','g3_corridoio'].includes(d.stato_partita?.fase)){vista=null;area.hidden=true;if(pianta.open)pianta.close();return}
  try{const r=await api.rpc('gioco_manoscritti',{p_codice:api.codice});if(n!==versione)return;vista=r;disegna()}
  catch(e){if(n!==versione)return;area.hidden=false;area.replaceChildren(p(e.message),b('Riprova a caricare la sala',aggiorna))}
 }
 const stile=document.createElement('style');stile.textContent='#sala-manoscritti{border:0;background:none;margin-block:24px}#sala-manoscritti button,.pianta-biblioteca button{font:inherit;line-height:1.4;padding:12px 18px;margin:6px 8px 6px 0;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#sala-manoscritti button:disabled{opacity:.5}.documenti-manoscritti{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px}.documenti-manoscritti li{display:flex;flex-direction:column}.documenti-manoscritti button{text-align:left}.documenti-manoscritti span{font-size:.8em}dialog.pianta-biblioteca{width:min(1000px,96vw);max-height:94dvh;padding:0;overflow:auto}.pianta-biblioteca .scroll-middle{padding:12px 8%;min-height:0}.pianta-biblioteca .scroll-top,.pianta-biblioteca .scroll-bottom{height:50px;aspect-ratio:auto}.superficie-pianta{overflow:auto;max-width:100%}.superficie-pianta img{display:block;width:100%;min-width:620px;height:auto}.pianta-biblioteca p{font-size:18px;line-height:1.4}.istruzioni-pianta{display:none}@media(max-width:600px){.documenti-manoscritti{grid-template-columns:1fr}#sala-manoscritti button{width:100%}.istruzioni-pianta{display:block}}';document.head.append(stile);
 window.Manoscritti={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='servizi-biblioteca';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 function mostra(r){if(!r?.lettura)return;preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Continua a esplorare'})}
 async function invia(azione){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_servizi',{p_codice:api.codice,p_azione:azione,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});mostra(r)}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase,s=d?.stato_partita?.servizi||{};area.replaceChildren();
  area.hidden=!d||![3,4].includes(d.giorno_corrente)||d.morto||!['g3_servizi','g3_passaggio','g4_passaggio'].includes(f);if(area.hidden)return;
  const titolo=document.createElement('h2');titolo.textContent=['g3_passaggio','g4_passaggio'].includes(f)?'Uno scatto nel muro':'I servizi';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);mostra(r);aggiorna()}));return}
  if(d.luogo_attuale!=='biblioteca'){area.append(p('Puoi riprendere l’esplorazione dei servizi nella biblioteca.'),b('Torna alla biblioteca',()=>invia('torna')));return}
  if(f==='g4_passaggio'){
   area.append(p('Premi la pietra che hai individuato ieri. Sotto il pavimento senti muoversi la leva, poi il fermo sulla parete destra si ritrae. Il passaggio si apre di nuovo.'),p('Stavolta non arriva nessun richiamo dal corridoio. Puoi finalmente vedere che cosa c’è dall’altra parte.'),b('Varca il passaggio',()=>window.GiornoQuattro.entra()),b('Torna nei servizi',()=>window.GiornoQuattro.servizi()));
  }else if(f==='g3_passaggio'){
   area.append(p('La pietra rientra di poco. Sotto i piedi senti muoversi qualcosa, poi un fermo scatta dall’altro lato della stanza. La pietra sporgente si ritrae e una parte della parete destra si apre appena.'),p('Lo spiffero si fa più forte. Oltre la fessura distingui soltanto buio.'),p('Stai per avvicinarti quando dal corridoio arriva la voce del bibliotecario: «Si chiude! Anche per chi si è perso nei servizi!»'),p('Lasci che il meccanismo torni in posizione. Ora sai dove si trova l’accesso e come aprirlo. Per vedere che cosa nasconde dovrai tornare domani.'),b('Esci dalla biblioteca',()=>invia('esci')));
  }else{
   area.append(p('Entri nei servizi. Uno spiffero d’aria ti sfiora il viso: sembra venire dalla parete destra. Ti avvicini, ma a prima vista non noti aperture.'),p('Vicino al pavimento, una piccola pietra sporge dal muro. Il resto della stanza sembra spoglio.'));
   const opzioni=[['sporgente','Prova a spingere la pietra sporgente'],['destra','Esamina la parete destra'],['pavimento','Osserva il pavimento'],['opposta','Esamina la parete opposta']];
   for(const [id,testo] of opzioni){const e=b(testo+(s[id]?' · Già osservato':''),()=>invia(id));e.dataset.ispezione=id;area.append(e)}
   if(s.opposta){area.append(p('Sulla parete opposta hai individuato una pietra quasi a filo del muro, con i bordi consumati.'),b('Premi la pietra dai bordi consumati',()=>invia('premi')))}
   area.append(b('Torna nel corridoio',()=>invia('corridoio')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 const stile=document.createElement('style');stile.textContent='#servizi-biblioteca{border:0;background:none;margin-block:24px}#servizi-biblioteca button{font:inherit;line-height:1.4;padding:12px 18px;margin:6px 8px 6px 0;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#servizi-biblioteca button:disabled{opacity:.5}@media(max-width:600px){#servizi-biblioteca button{width:100%}}';document.head.append(stile);
 window.Servizi={entra:()=>invia('entra'),aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='racconto-giorno4';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let busy=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione,personaggio=null){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_giorno4',{p_codice:api.codice,p_azione:azione,p_personaggio:personaggio,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r?.lettura){preparaMessaggiAllenamento();window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Continua'})}}
  finally{busy=false;aggiorna()}
 }
 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase;area.replaceChildren();area.hidden=!d||d.giorno_corrente!==4||d.morto||!['g4_colazione','g4_strada','g4_nascosta'].includes(f);if(area.hidden)return;
  if(f==='g4_strada'&&['armaiolo','bottega_preziosi','speziale'].includes(d.luogo_attuale)){area.hidden=true;return}
  const titolo=document.createElement('h2');titolo.textContent=f==='g4_colazione'?'Il quarto giorno':f==='g4_nascosta'?'La stanza nascosta':'La mattina in città';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(f==='g4_colazione'){
   if(d.luogo_attuale!=='locanda_risveglio'){area.append(p('Devi ancora decidere come cominciare la mattina.'),b('Torna alla locanda',()=>invia('torna')));return}
   area.append(p('Ti svegli nella stessa stanza. Il letto non è migliorato durante la notte, ma almeno questa volta sai che cosa aspettarti.'),p('Al piano di sotto il locandiere sta preparando i tavoli. Ti vede e indica una scodella.'),p('«Colazione? Una moneta d’argento. Se invece hai fretta, la porta è sempre quella.»'));
   const colazione=b('Fai colazione — 1 moneta d’argento',()=>invia('colazione'));colazione.disabled=busy||d.oro_rimanente<1;area.append(colazione,b('Esci',()=>invia('esci')));
   if(d.oro_rimanente<1)area.append(p('Non hai abbastanza argento per la colazione. Puoi uscire senza ordinare.'));
  }else if(f==='g4_strada'){
   if(d.stato_partita.colazione_g4==='pagata')area.append(p('Hai consumato la colazione e sei uscito dalla locanda. La città ha già cominciato la propria giornata.'));
   else area.append(p('Lasci la locanda senza ordinare e ti ritrovi fra le vie della città.'));
   area.append(p('Ripensi a ciò che hai scoperto ieri. Dove vuoi andare?'),b('Scegli dove andare',()=>window.LuoghiGioco.apri()),b('Chiedi un parere a un passante',()=>invia('passante')));
   if(['san_domenico','biblioteca'].includes(d.luogo_attuale))area.append(b('Entra nella biblioteca',()=>invia('biblioteca')));
  }else{
   if(d.luogo_attuale!=='sala_consiglio'){area.append(p('Puoi tornare al passaggio che hai appena attraversato.'),b('Riprendi l’esplorazione',()=>invia('torna')));return}
   area.append(p('Oltrepassi l’apertura e ti fermi sulla soglia della stanza. Il corridoio dei servizi rimane alle tue spalle.'),p('Da qui proseguirà la nuova esplorazione. Il contenuto della stanza è ancora da definire.'),b('Torna nei servizi',()=>invia('servizi')));
  }
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 const stile=document.createElement('style');stile.textContent='#racconto-giorno4{border:0;background:none;margin-block:24px}#racconto-giorno4 button{font:inherit;line-height:1.4;padding:12px 18px;margin:6px 8px 6px 0;border:1px solid #631810;border-radius:3px;background:#8b261b;color:#f4ead5;cursor:pointer}#racconto-giorno4 button:disabled{opacity:.5}@media(max-width:600px){#racconto-giorno4 button{width:100%}}';document.head.append(stile);
 window.GiornoQuattro={aggiorna,parla:id=>invia('parla',id),entra:()=>invia('entra_nascosta'),servizi:()=>invia('servizi')};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

})();


