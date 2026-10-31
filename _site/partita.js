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
      const note=["Termina prima il combattimento","Luogo non disponibile","Questo personaggio non è qui","Riferimento del personaggio non valido","Non ci sono ancora indicazioni per questo percorso","Concludi prima la perquisizione per entrare in città","Chiedi prima indicazioni per questo luogo","Equipaggiamento non valido","Puoi indossare al massimo due accessori","Oggetto non adatto a questo posto","Richiesta già usata diversamente","Quantità non valida","Prima rimuovi l’oggetto dall’equipaggiamento","Qui non c’è un mercante","Il mercante non ritira questo oggetto","Oggetto non in vendita","Argento insufficiente","Servono pergamena e calamaio per scrivere","Il taccuino può contenere al massimo 20000 caratteri","Gli appunti sono cambiati su un altro dispositivo","Perquisizione non disponibile","La perquisizione è cambiata: recupera lo stato","Non puoi più tentare Inganno","La discussione con la guardia è chiusa","Scrivi una parola","Nessuna proposta da confermare","Servono cinque monete","Accetta o rifiuta prima la proposta","Selezione non valida","Troppi oggetti per i posti disponibili","Scegli un’arma e una difesa","Oggetto non proposto sul tavolo","Quantità non disponibile sul tavolo","Superi il peso massimo della classe","Equipaggiamento non modificabile in questa giornata","Scegli prima cosa fare del bottino","Bottino non disponibile","Quantità non disponibile","Arma non disponibile nella borsa","Questa arma è già equipaggiata","Questa giornata è già confermata","La giornata non è ancora da confermare","Conferma la giornata prima di proseguire","Questa giornata non è ancora aperta","Cura già usata in questa giornata","Durante il combattimento usa le azioni dello scontro","Nessun combattimento in questa scena","Combattimento terminato","Azione non disponibile",'Sessione di allenamento non valida','Richiesta di allenamento diversa','Avversario non disponibile','Classe non disponibile','Allenamento scaduto: ricomincia','Azione di allenamento non valida','Turno cambiato: recupera l’allenamento','Allenamento terminato','Codice non disponibile','Nome troppo lungo','Oggetto non disponibile nella borsa','Oggetto non utilizzabile qui','Nessun passaggio compatibile','Partita non disponibile','Riprendi dal checkpoint prima di proseguire','Completa la giornata corrente prima di proseguire','Questa giornata non è ancora configurata','Checkpoint non disponibile','Tentativo non valido','La partita è cambiata: riapri la Borsa','Questa capacità è riservata al Chierico','Cura non disponibile','Riprendi dal checkpoint prima di usare la cura','Hai già tutti i punti vita','Richiesta non valida','Enigma non disponibile in questa scena','La partita è cambiata: riapri l’enigma','Hai già fatto due offerte','Offerta non valida o argento insufficiente','Scambio non disponibile','Non possiedi l’oggetto richiesto','Acquisto in argento non disponibile','Richiesta già usata con un’altra offerta'];
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
    dati=nuovi;codice=nuovoCodice;aggiornaHeader();
    if(!memoria.scrivi(CHIAVE,codice))stato('Il browser non può ricordare il codice: copialo e conservalo.');
    for(const fn of ascoltatori)await fn(dati,codice,opzioni);
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
      for(const o of elenco)if(typeof o.id==='string'&&!['__proto__','constructor','prototype'].includes(o.id))OGGETTI[o.id]={nome:o.nomi_classi?.[dati.classe]||o.nome,descrizione:o.descrizione};
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
      if(!dati.morto&&id.startsWith('pozione_')&&!window.BorsaNuova?.inCombattimento&&Object.hasOwn(OGGETTI,id)){
        const usa=document.createElement('button');usa.type='button';usa.textContent='Usa pozione';usa.disabled=dati.hp_attuali>=dati.hp_massimi;
        usa.addEventListener('click',()=>window.AzioniGioco.usaPozione(id));li.append(usa);
      }else if(inGioco&&!dati.morto&&dati.hp_attuali>0&&id==='pergamena_chiarezza'&&dati.stato_partita?.fase==='enigma'){
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
      const aggiornati=await rpc('gioco_usa_oggetto',{p_codice:codice,p_oggetto:'pergamena_chiarezza',p_bersaglio:'enigma_galeazzo'});
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
   try{const s=await api.rpc('gioco_scontro',{p_codice:api.codice,p_azione:'disponibile'});if(n!==revisione)return;if(s&&!s.terminato){combatti.hidden=false;nellaStoria.hidden=false;nellaStoria.textContent='Combattimento: '+s.nome}}
   catch{/* La borsa resta utilizzabile quando la verifica dello scontro fallisce. */}
 }
 window.AzioniGioco={async usaPozione(id){
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
       if(risultato?.partita)await api.applica(risultato.partita,r.codice,{anima:false});
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
 function selezione(){const oggetti=[];for(const [id,input] of inputs){const n=Number(input.value);if(Number.isInteger(n)&&n>=0&&n<=7)for(let j=0;j<n;j++)oggetti.push(id);else return null}return {oggetti,arma:arma.value,difesa:difesa.value}}
 function aggiornaPeso(){
   const s=selezione();if(!s){riepilogo.textContent='Scegli quantità intere da 0 a 7.';conferma.disabled=true;return false}
   const totale=[...s.oggetti,s.arma,s.difesa].filter(Boolean),pesi=new Map(vista.catalogo.map(o=>[o.id,o.peso]));
   const peso=totale.reduce((n,id)=>n+(pesi.get(id)??1),vista.peso_dotazione),quantita=api.quantita(totale);
   const eccesso=[...quantita].some(([id,n])=>{const o=vista.catalogo.find(o=>o.id===id);return !o||(o.disponibili!==-1&&n>o.disponibili)});
   const ok=s.oggetti.length<=vista.posti&&peso<=vista.capacita&&!eccesso&&s.arma&&s.difesa;
   riepilogo.textContent=`Posti: ${s.oggetti.length}/${vista.posti} · Peso: ${peso}/${vista.capacita}`+(eccesso?' · Hai scelto più copie di quelle sul tavolo.':'');conferma.disabled=!ok;
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
   area.append(p('Scegli fino a cinque oggetti, un’arma e una difesa. La dotazione di classe è aggiuntiva, ma tutto quello che porti contribuisce al peso. Gli oggetti non scelti resteranno sul tavolo.'));
   if(vista.dotazione_classe.length)area.append(p('Dotazione di classe: '+vista.dotazione_descritta.join(', ')));
   const pendente=window.BorsaNuova.pending();if(pendente){area.append(p('C’è una richiesta da recuperare.'),b('Recupera la richiesta',async()=>{await window.BorsaNuova.esegui(pendente.nomeRpc,pendente.args);await aggiorna()}));return}
   const s=vista.stato;
   if(s.messaggio)area.append(p(s.messaggio));
   if(s.inganno){const dado=document.createElement('div'),totale=document.createElement('p');dado.className='dadi-area';if(window.Dadi)window.Dadi.mostraRisultato(dado,totale,s.inganno);else totale.textContent='Inganno: '+s.inganno.totale;area.append(dado,totale)}
   else if(!s.cacciato)area.append(b('Tenta di nascondere un oggetto — Inganno',()=>azione('inganno')));
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
   const titolo=document.createElement('h3');titolo.textContent='Oggetti da portare';form.append(titolo,p('Ogni copia occupa un posto. La mappa pesa zero, ma devi sceglierla.'));
   for(const o of vista.catalogo){
     const r=document.createElement('label');r.className='riga-dotazione';
     const testo=document.createElement('span');testo.textContent=`${o.nome} · peso ${o.peso}`+(o.tipo==='arma'||o.tipo==='difesa'?' · riserva':'');
     const input=document.createElement('input');input.type='number';input.min='0';input.max=String(o.disponibili===-1?7:Math.min(7,o.disponibili));input.value=String(q.get(o.id)||0);input.setAttribute('aria-label','Quantità di '+o.nome);input.addEventListener('input',aggiornaPeso);inputs.set(o.id,input);r.append(testo,input);form.append(r);
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
 apri.type='button';apri.textContent='Conferma o rigioca la giornata';avanti.type='button';avanti.textContent='Inizia la prossima giornata';
 stato.setAttribute('role','status');area.append(testo,apri,avanti,stato);main.append(area);
 const dialogo=document.createElement('dialog');dialogo.className='avviso-codice messaggio-orizzontale fine-giornata';
 dialogo.style.width='840px';dialogo.style.setProperty('--larghezza-messaggio','840px');dialogo.setAttribute('aria-labelledby','titolo-conferma-giornata');
 dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-conferma-giornata"></h2><p id="riepilogo-conferma-giornata"></p><p>Puoi confermare le scelte oppure ripartire dal checkpoint. Dopo la conferma questa giornata non sarà più rigiocabile.</p><button type="button" id="conferma-fine-giornata">Conferma e concludi la giornata</button><button type="button" id="rigioca-fine-giornata">Rigioca dall’inizio</button><p id="errore-fine-giornata" role="status"></p></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(dialogo);
 const stile=document.createElement('style');stile.textContent='.fine-giornata .scroll-middle{gap:8px}.fine-giornata p{font-size:16px;line-height:1.4}.fine-giornata p:empty{display:none}#stato-fine-giornata button{padding:10px 16px;font:inherit;cursor:pointer;margin:6px}';document.head.append(stile);
 let ultimoAvviso=null,busy=false,versione=0,calendario=null,attesa=false;
 const chiave=()=>api.dati?api.codice+':'+api.dati.tentativo+':'+api.dati.giorno_corrente:null;
 function pulsanti(){const d=api.dati;apri.hidden=!d?.giornata_da_confermare;avanti.hidden=!$('schermata-gioco')||!d?.giornata_completata||!calendario?.prossimo_configurato||!calendario?.prossimo_aperto||d.giorno_corrente>=calendario.giorni}
 function mostra(){
   if(busy||!api.dati?.giornata_da_confermare||api.dati.morto)return;
   preparaMessaggiAllenamento();
   $('titolo-conferma-giornata').textContent=`Giornata ${api.dati.giorno_corrente}: vuoi confermare?`;
   $('riepilogo-conferma-giornata').textContent=`${api.dati.hp_attuali}/${api.dati.hp_massimi} HP · ${api.dati.xp||0} XP · ${api.dati.oro_rimanente} monete d’argento`;
   $('errore-fine-giornata').textContent='';ultimoAvviso=chiave();
   if(!dialogo.open)dialogo.showModal();
 }
 function programma(){
   if(attesa||!api.dati?.giornata_da_confermare||api.dati.morto||ultimoAvviso===chiave())return;
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
   if(opzioni.anima!==true)programma();
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
 dialogo.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 apri.addEventListener('click',mostra);
 avanti.addEventListener('click',()=>api.esegui(()=>api.iniziaGiornata(api.dati.giorno_corrente+1),stato));
 api.onChange(aggiorna);api.ready.then(()=>aggiorna());
 window.FineGiornata={aggiorna:programma};
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
   scena.hidden=!dati||!$('schermata-gioco')||dati.partita.morto;
   if(!dati)return;
   titolo.textContent=dati.corrente.nome;descrizione.textContent=dati.corrente.descrizione;persone.replaceChildren();
   if(!dati.ingresso_completato)persone.append(p('Puoi chiedere indicazioni. Per entrare in città devi prima concludere la perquisizione.'));
   if(dati.in_combattimento)persone.append(p('Termina il combattimento prima di spostarti o chiedere indicazioni.'));
   for(const n of dati.informatori){const e=b('Chiedi indicazioni a '+n.nome,()=>apriIndicazioni(n));e.disabled=bloccato();persone.append(e)}
   if(dati.ingresso_completato)persone.append(b('Apri i luoghi conosciuti',apriElenco));
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
 window.LuoghiGioco={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();

})();
