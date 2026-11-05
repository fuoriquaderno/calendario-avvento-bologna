// Consultazione della Borsa, capacità di cura e registro delle morti.
(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);
 const {rpc,esegui,applica,stato}=api;
 let dati=api.dati,codice=api.codice;
 api.onChange((nuovi,nuovoCodice)=>{dati=nuovi;codice=nuovoCodice});
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
    if(!cura||(window.Dadi&&!window.Dadi.contestoAttivo('cura')))return;
    const area=document.createElement('div');area.className='dadi-area';area.setAttribute('aria-hidden','true');
    const tiro=document.createElement('p');tiro.className='dadi-totale';
    try{
      if(!window.Dadi)throw new Error('Visualizzazione semplice');
      window.Dadi.mostraRisultato(area,tiro,cura,'cura');
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
    if(api.occupato)return;
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


 window.BorsaBase={disegna:disegnaBorsa,resocontoMorti,quantita};
})();
