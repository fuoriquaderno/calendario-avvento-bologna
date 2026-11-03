(() => {
  'use strict';
  const $=id=>document.getElementById(id),api=window.Partita;
  let classiCaricate=false;
  function mostraRisposta(dati){
    const reazione=dati.enigmi_stato?.['1']?.reazione_risposta;
    if(!reazione?.testo)return;
    const giusta=reazione.tipo==='risposta_giusta';
    window.Messaggi.mostra({titolo:giusta?'Risposta giusta':'Risposta sbagliata',testo:reazione.testo,pulsante:giusta?'Continua':'Torna all’enigma'});
  }
  // Durata dell’apertura laterale: modifica 850ms qui sotto.


  const messaggio=document.createElement('p');messaggio.className='stato-gioco';messaggio.setAttribute('role','status');
  document.querySelector('main .scroll-middle').prepend(messaggio);
  const dettagliClasse=document.createElement('div');
  dettagliClasse.id='dettagli-classe';dettagliClasse.setAttribute('aria-live','polite');
  $('scelta-classe').after(dettagliClasse);
  const statoClassi=document.createElement('p');statoClassi.setAttribute('role','status');
  const riprovaClassi=document.createElement('button');
  riprovaClassi.type='button';riprovaClassi.textContent='Riprova';riprovaClassi.hidden=true;
  dettagliClasse.append(statoClassi,riprovaClassi);
  const schedaClasse=document.createElement('div');dettagliClasse.append(schedaClasse);
  const etichetteBonus={attacco_fisico:'Attacco fisico',difesa_fisica:'Difesa fisica',attacco_magico:'Attacco magico',conoscenza_arcana:'Conoscenza arcana',furtivita:'Furtività',inganno:'Inganno',serrature:'Serrature',religione:'Religione',intuizione:'Intuizione'};
  const nomiOggetti={pergamena_chiarezza:'Pergamena della Chiarezza',grimaldello:'Grimaldello'};
  let catalogoClassi=[];
  function mostraClasse(){
    schedaClasse.replaceChildren();
    const c=catalogoClassi.find(c=>c.nome===$('scelta-classe').value);
    if(!c)return;
    const hp=document.createElement('p');hp.textContent=`Punti vita massimi: ${c.hp_massimi}`;schedaClasse.append(hp);
    const lista=document.createElement('ul');
    for(const [tipo,bonus] of Object.entries(c.modificatori||{})){
      const li=document.createElement('li');li.textContent=`${Object.hasOwn(etichetteBonus,tipo)?etichetteBonus[tipo]:tipo}: ${bonus>0?'+':''}${bonus}`;lista.append(li);
    }
    schedaClasse.append(lista);
    const oggetti=document.createElement('p');
    const dotazione=Array.isArray(c.dotazione_iniziale)?c.dotazione_iniziale:[];
    oggetti.textContent=dotazione.length?'Dotazione iniziale: '+dotazione.map(id=>Object.hasOwn(nomiOggetti,id)?nomiOggetti[id]:id).join(', '):'Nessun oggetto iniziale.';
    schedaClasse.append(oggetti);
  }
  async function caricaClassi(){
    classiCaricate=false;$('scelta-classe').disabled=true;riprovaClassi.hidden=true;
    statoClassi.textContent='Caricamento delle classi…';
    try{
      const elenco=await api.rpc('gioco_catalogo_classi',{});
      if(!Array.isArray(elenco)||!elenco.length||elenco.some(c=>typeof c.nome!=='string'||!Number.isInteger(c.hp_massimi)||c.hp_massimi<=0))throw new Error('Catalogo non disponibile');
      const precedente=$('scelta-classe').value;
      catalogoClassi=elenco;$('scelta-classe').replaceChildren();
      const invito=document.createElement('option');invito.value='';invito.textContent='Scegli una classe…';invito.disabled=true;$('scelta-classe').append(invito);
      for(const c of elenco){const o=document.createElement('option');o.value=c.nome;o.textContent=`${c.nome} — ${c.hp_massimi} HP`;$('scelta-classe').append(o)}
      $('scelta-classe').value=elenco.some(c=>c.nome===precedente)?precedente:'';
      classiCaricate=true;statoClassi.textContent='';mostraClasse();
    }catch{
      statoClassi.textContent='Non riesco a caricare le classi. Controlla la connessione e riprova.';riprovaClassi.hidden=false;
    }finally{$('scelta-classe').disabled=!classiCaricate}
  }
  $('scelta-classe').addEventListener('change',mostraClasse);
  riprovaClassi.addEventListener('click',caricaClassi);
  caricaClassi();
  const accesso=document.createElement('section');accesso.className='accesso-partita';
  accesso.innerHTML='<h2>Hai già una partita?</h2><label for="codice-ripresa">Codice segreto della partita</label><input id="codice-ripresa" type="text" autocomplete="off" autocapitalize="none" spellcheck="false"><button type="button" id="riprendi-partita">Riprendi la partita</button><p>Chi conosce il codice può accedere al salvataggio. Conservalo per giocare anche da un altro dispositivo.</p>';
  $('schermata-login').prepend(accesso);
  $('riprendi-partita').addEventListener('click',()=>api.esegui(()=>api.riprendi($('codice-ripresa').value),messaggio));
  $('codice-ripresa').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('riprendi-partita').click()}});

  const nome=document.createElement('div');
  nome.innerHTML='<label for="nome-nuovo-personaggio">Nome del personaggio (facoltativo)</label><input id="nome-nuovo-personaggio" type="text" autocomplete="off" placeholder="Es. Andrea"><p>Puoi usare un soprannome. Il nome non deve essere unico e non serve per accedere alla partita.</p>';
  const label=document.querySelector('label[for="codice-accesso"]');label.before(nome);label.textContent='Scegli un codice';
  $('codice-accesso').hidden=false;$('codice-accesso').style.display='block';$('codice-accesso').placeholder='Scrivi un codice a tua scelta';
  $('codice-accesso').autocomplete='off';$('codice-accesso').setAttribute('autocapitalize','none');$('codice-accesso').spellcheck=false;
  const genera=document.createElement('button');genera.type='button';genera.textContent='Genera un codice casuale';
  genera.addEventListener('click',()=>$('codice-accesso').value=crypto.randomUUID());$('codice-accesso').after(genera);
  const istruzioni=document.createElement('p');istruzioni.textContent='Puoi scegliere un codice da 1 a 128 caratteri, anche con simboli. Maiuscole e minuscole contano; gli spazi iniziali e finali vengono rimossi. Chi lo indovina può usare il salvataggio e cambiare il codice. I codici semplici sono a tuo rischio.';
  const scrivi=document.createElement('button');scrivi.type='button';scrivi.textContent='Scrivi un codice a tua scelta';
  scrivi.addEventListener('click',()=>{$('codice-accesso').focus();$('codice-accesso').select()});
  genera.after(scrivi);scrivi.after(istruzioni);
  istruzioni.id='istruzioni-codice';$('codice-accesso').setAttribute('aria-describedby',istruzioni.id);
  $('btn-login').textContent='Crea partita';$('btn-login').type='button';
  $('btn-login').addEventListener('click',async()=>{
    await api.esegui(async()=>{
      if(!classiCaricate)throw new Error('Attendi il caricamento delle classi o premi Riprova.');
      let richiesta;try{richiesta=JSON.parse(api.memoria.leggi(api.SOSPESA))}catch{}
      if(!richiesta||!api.valido(richiesta.codice)){
        const codice=api.pulisci($('codice-accesso').value),nome=$('nome-nuovo-personaggio').value.trim();
        if(!api.valido(codice))throw new Error('Scrivi un codice da 1 a 128 caratteri oppure generane uno casuale.');
        if(Array.from(nome).length>40)throw new Error('Il nome può contenere al massimo 40 caratteri.');
        const classe=$('scelta-classe').value;
        if(!catalogoClassi.some(c=>c.nome===classe)){$('scelta-classe').focus();throw new Error('Scegli una classe prima di creare la partita.');}
        richiesta={codice,classe,nome};
        if(!api.memoria.scrivi(api.SOSPESA,JSON.stringify(richiesta)))throw new Error('Abilita la memorizzazione dei dati del sito per creare una partita.');
      }
      const dati=await api.rpc('gioco_crea',{p_codice:richiesta.codice,p_classe:richiesta.classe,p_nome:richiesta.nome||''});
      await api.applica(dati,richiesta.codice,{anima:true});api.memoria.rimuovi(api.SOSPESA);
    },messaggio);
    api.promemoria();
  });
  let erroriIngresso=0;
  $('btn-enigma').type='button';
  $('btn-enigma').addEventListener('click',()=>api.esegui(async()=>{
    if(!$('input-enigma').value.toLowerCase().trim().includes('richieste')){
      // Un invio vuoto non è un tentativo di risposta.
      if(!$('input-enigma').value.trim()){$('input-enigma').focus();return}
      erroriIngresso++;
      $('errore-enigma').style.display='block';
      if(erroriIngresso>=4){
        const frase='L’omino ricompare e ti squadra con aria sprezzante. «Quattro tentativi e ancora niente? Te lo devo proprio dettare: devi scrivere stanza delle richieste!»';
        $('errore-enigma').textContent=frase;
        if(erroriIngresso===4)window.Messaggi.mostra({titolo:'L’omino ricompare',testo:frase,pulsante:'Torna alla pergamena'});
      }
      return;
    }
    erroriIngresso=0;
    await cambiaPergamena(()=>{
      $('errore-enigma').style.display='none';$('enigma-pergamena').style.display='none';
      $('storia-ingresso').style.display='none';$('form-registrazione').style.display='block';
    });
  },messaggio));

  const esito=document.createElement('section');esito.style.cssText='display:none;margin-block:24px;padding:0';$('schermata-gioco').append(esito);
  const morte=document.createElement('section');morte.hidden=true;
  morte.innerHTML='<h2>Sei morto</h2><p id="riepilogo-morte"></p><p>Puoi riprendere dall’inizio della giornata. Storia, monete e oggetti torneranno al checkpoint; ripartirai con tutti i punti vita. Il registro delle morti resterà invariato.</p><button type="button" id="riprova-giornata" style="width:100%;padding:14px;background:var(--accent);color:var(--surface);border:0;cursor:pointer;font:inherit">Riprova dall’inizio della giornata</button>';
  $('schermata-gioco').append(morte);
  $('riprova-giornata').addEventListener('click',()=>api.esegui(()=>api.riprendiCheckpoint(),messaggio));
  const timbro=$('testo-storia').previousElementSibling;
  const testi={paga:'Galeazzo ha ricevuto 25 monete d’argento. Il posto per domani è tuo.',favore:'Galeazzo ti consegna il pass e ti fissa. «Entro il decimo giorno dovrai recuperarmi un piccolo sacchetto che ho nascosto nella casa dei signori Bentivoglio. Si trova sotto una pietra al centro del cortile, vicino al pozzo. Vedi di mantenere la parola.»',enigma:'Hai superato la sfida di Galeazzo.',pergamena:'La Pergamena della Chiarezza ti ha permesso di superare l’enigma di Galeazzo. La pergamena è stata consumata.'};
  let renderizzata=false;
  async function mostra(dati,codice,opzioni={}){
    renderizzata=true;
    const aggiorna=()=>{
      $('schermata-login').style.display='none';$('schermata-gioco').style.display='block';
      const fase=dati.stato_partita?.fase||'galeazzo';
      const morto=dati.morto===true||dati.hp_attuali<=0;
      morte.hidden=!morto||fase==='fallimento_volpe';
      if(morto){
        const numero=api.resocontoMorti(dati).totale;
        $('riepilogo-morte').textContent=`Giorno ${dati.giorno_corrente||1} · Morti totali: ${numero}`;
      }
      $('testo-storia').style.display=!morto&&fase==='galeazzo'?'block':'none';
      $('scelte-storia').style.display=!morto&&fase==='galeazzo'?'flex':'none';
      $('enigma-reale').style.display=!morto&&fase==='enigma'?'block':'none';
      if(timbro)timbro.style.display=!morto&&fase==='galeazzo'?'block':'none';
      $('errore-reale').style.display='none';esito.style.display=!morto&&fase==='attesa_giorno2'?'block':'none';esito.replaceChildren();
      const reazione=dati.enigmi_stato?.['1']?.reazione_risposta;
      if(!morto&&fase==='enigma'&&reazione?.tipo==='risposta_sbagliata'){
        $('errore-reale').textContent=reazione.testo;
        $('errore-reale').style.display='block';
      }
      if(!morto&&fase==='attesa_giorno2'){
        const titolo=document.createElement('h2');titolo.textContent=dati.giornata_completata?'Primo giorno confermato':'Primo giorno: scelte da confermare';
        const testo=document.createElement('p');testo.textContent=testi[dati.stato_partita.scelta]||'La tua scelta è stata salvata.';
        const seguito=document.createElement('p');seguito.textContent=dati.giornata_completata?'Le scelte di questa giornata sono definitive.':'Puoi confermare il risultato oppure rigiocare dall’inizio della giornata.';
        esito.append(titolo,testo,seguito);
        if(reazione?.tipo==='risposta_giusta'&&['enigma','pergamena'].includes(dati.stato_partita.scelta)){
          const frase=document.createElement('p');frase.textContent=reazione.testo;frase.style.fontStyle='italic';
          testo.after(frase);
        }
      }
    };
    if(opzioni.anima===false||opzioni.transizioneGestita)aggiorna();else await cambiaPergamena(aggiorna);
    if(opzioni.anima===true&&!dati.morto&&dati.stato_partita?.fase==='attesa_giorno2'
      &&['enigma','pergamena'].includes(dati.stato_partita.scelta)){
      if(opzioni.dopoTransizione)opzioni.dopoTransizione.push(()=>mostraRisposta(dati));else mostraRisposta(dati);
    }
    if(opzioni.dopoTransizione)opzioni.dopoTransizione.push(()=>window.FineGiornata?.aggiorna());else window.FineGiornata?.aggiorna();
  }
  api.onChange(mostra);
  async function scegli(azione,risposta=null){
    if(!api.codice)return;
    const dati=azione==='rispondi'
      ?await api.rpc('gioco_rispondi_enigma',{p_codice:api.codice,p_enigma:1,p_risposta:risposta,p_tentativo:api.dati.tentativo})
      :await api.rpc('gioco_scegli',{p_codice:api.codice,p_azione:azione,p_risposta:risposta});
    if(dati.risposta_errata){await api.applica(dati,api.codice,{anima:false});mostraRisposta(dati);return}
    await api.applica(dati,api.codice,{anima:true});
  }
  for(const[id,azione]of[['scelta-paga','paga'],['scelta-favore','favore'],['scelta-reale','enigma']]){
    $(id).type='button';$(id).addEventListener('click',()=>api.esegui(()=>scegli(azione),messaggio));
  }
  $('btn-conferma-reale').type='button';$('btn-conferma-reale').addEventListener('click',()=>api.esegui(()=>scegli('rispondi',$('risposta-reale').value),messaggio));
  const tornaScelte=document.createElement('button');
  tornaScelte.type='button';tornaScelte.id='torna-scelte-galeazzo';
  tornaScelte.textContent='Torna alle scelte';
  tornaScelte.style.cssText='width:100%;margin-top:16px;padding:12px;background:transparent;border:1px solid var(--accent);color:var(--text);font:inherit;cursor:pointer';
  $('enigma-reale').append(tornaScelte);
  tornaScelte.addEventListener('click',()=>api.esegui(async()=>{
    const dati=await api.rpc('gioco_torna_scelte',{p_codice:api.codice});
    if(dati.stato_partita?.fase==='galeazzo')$('risposta-reale').value='';
    await api.applica(dati,api.codice,{anima:true});
  },messaggio));
  api.ready.then(async()=>{
    if(api.dati&&!renderizzata)await mostra(api.dati,api.codice,{anima:false});
    if(!api.dati&&api.memoria.leggi(api.SOSPESA))messaggio.textContent='La creazione precedente potrebbe essere riuscita. Prova Riprendi la partita con il codice scelto prima di creare una nuova partita.';
    api.promemoria();
  });
})();
