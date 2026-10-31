// Indizi reali: tiro e acquisti vengono decisi e salvati sul server.
(() => {
  'use strict';
  const api=window.Partita,$=id=>document.getElementById(id);
  if(!$('enigma-reale'))return;
  const PENDING='ombra-sui-portici.indizio.in-sospeso.v1';
  let vista=null,revisione=0;
  const pannello=document.createElement('section');pannello.className='indizio-enigma';
  pannello.innerHTML='<h3>Un suggerimento?</h3><p id="indizio-stato" role="status" aria-live="polite"></p><div id="indizio-dado" class="dadi-area" aria-hidden="true"></div><p id="indizio-tiro" aria-live="polite"></p><p id="indizio-rivelato" class="indizio-rivelato"></p><div id="indizio-offerte"></div><div id="indizio-comandi"></div>';
  $('risposta-reale').before(pannello);
  const rifiutiMostrati=new Set();
  const popupRifiuto=document.createElement('dialog');
  popupRifiuto.className='avviso-codice';
  popupRifiuto.setAttribute('aria-labelledby','titolo-rifiuto-offerta');
  popupRifiuto.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-rifiuto-offerta">Offerta rifiutata</h2><p id="frase-rifiuto-offerta"></p><p id="tentativi-rifiuto-offerta"></p><button type="button" id="chiudi-rifiuto-offerta">Torna all’enigma</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
  document.body.append(popupRifiuto);
  $('chiudi-rifiuto-offerta').addEventListener('click',()=>popupRifiuto.close());
  function mostraRifiuto(offerta,enigma){
    if(rifiutiMostrati.has(offerta.richiesta))return;
    rifiutiMostrati.add(offerta.richiesta);
    $('titolo-rifiuto-offerta').textContent=enigma.nome_personaggio?`${enigma.nome_personaggio} rifiuta l’offerta`:'Offerta rifiutata';
    $('frase-rifiuto-offerta').textContent=offerta.messaggio_rifiuto||'L’offerta non è sufficiente.';
    const rimaste=Math.max(0,2-(enigma.offerte||[]).length);
    $('tentativi-rifiuto-offerta').textContent=rimaste?'Non hai speso monete. Puoi fare un’ultima offerta.':'Non hai speso monete. Hai esaurito le due offerte: non puoi più comprare questo indizio in argento.';
    if(window.Messaggi){
      window.Messaggi.mostra({titolo:$('titolo-rifiuto-offerta').textContent,
        testo:$('frase-rifiuto-offerta').textContent+'\n\n'+$('tentativi-rifiuto-offerta').textContent,
        pulsante:'Torna all’enigma'});
    }else if(!popupRifiuto.open)popupRifiuto.showModal();
  }
  const stile=document.createElement('style');stile.textContent='.indizio-enigma{margin:20px 0;padding-block:16px;border-block:1px solid var(--line)}.indizio-enigma button{width:100%;padding:10px;margin-block:8px;cursor:pointer;font:inherit}.indizio-rivelato:not(:empty){padding:12px;border-left:3px solid var(--accent);font-style:italic}.indizio-enigma input{width:100%;padding:10px;margin-block:8px}.indizio-enigma p:empty{display:none}';document.head.append(stile);
  function leggi(){try{return JSON.parse(api.memoria.leggi(PENDING))}catch{return null}}
  function sospesa(){const r=leggi();return r&&r.codice===api.codice&&r.tentativo===api.dati?.tentativo&&r.enigma===1&&['tiro','offerta','oggetto'].includes(r.azione)?r:null}
  function creaBottone(testo,azione){const b=document.createElement('button');b.type='button';b.textContent=testo;b.addEventListener('click',azione);return b}
  function disegna(){
    $('indizio-comandi').replaceChildren();$('indizio-offerte').replaceChildren();
    $('indizio-rivelato').textContent=vista?.indizio||'';
    if(!vista)return;
    const r=sospesa();
    if(r&&(vista.indizio||(r.azione==='tiro'&&vista.tiro)||(r.azione==='offerta'&&(vista.offerte||[]).some(o=>o.richiesta===r.richiesta))))api.memoria.rimuovi(PENDING);
    if(vista.tiro){
      try{window.Dadi.mostraRisultato($('indizio-dado'),$('indizio-tiro'),vista.tiro)}
      catch{$('indizio-tiro').textContent=`Tiro ${vista.tiro.valori?.[0]}, modificatore ${vista.tiro.bonus}, totale ${vista.tiro.totale}.`}
      $('indizio-tiro').textContent+=vista.tiro.successo?' — Indizio ottenuto.':' — Nessun indizio ottenuto con il tiro.';
    }else{$('indizio-dado').replaceChildren();$('indizio-tiro').textContent=''}
    for(const o of vista.offerte||[]){const p=document.createElement('p');p.textContent=`Offerta di ${o.cifra} monete: ${o.accettata?'accettata e pagata':'rifiutata'}.`+(o.accettata?'':` ${o.messaggio_rifiuto||''}`);$('indizio-offerte').append(p)}
    if(vista.indizio)return;
    const daRiprovare=sospesa();
    if(daRiprovare){$('indizio-comandi').append(creaBottone('Recupera la richiesta in sospeso',()=>eseguiRichiesta(daRiprovare)));return;}
    if(!vista.tiro){
      const p=document.createElement('p');p.textContent=`Un solo tentativo: d100 ${vista.bonus>=0?'+':'−'} ${Math.abs(vista.bonus)}. Devi superare ${vista.soglia}.`;
      $('indizio-comandi').append(p,creaBottone('Tenta Intuizione',()=>nuovaRichiesta('tiro')));
    }
    if(vista.acquisto_argento){
      const rimaste=2-(vista.offerte||[]).length;
      const p=document.createElement('p');p.textContent=rimaste>0?`Puoi offrire argento per l’indizio. Offerte rimaste: ${rimaste}. Se accettata, pagherai esattamente la cifra proposta.`:'Hai esaurito le due offerte in argento.';
      $('indizio-comandi').append(p);
      if(rimaste>0){
        const label=document.createElement('label');label.htmlFor='offerta-indizio';label.textContent='La tua offerta in monete d’argento';
        const input=document.createElement('input');input.type='number';input.id='offerta-indizio';input.min='1';input.step='1';input.max=String(api.dati.oro_rimanente);
        $('indizio-comandi').append(label,input,creaBottone('Fai un’offerta',()=>{
          const cifra=Number(input.value);
          if(!Number.isInteger(cifra)||cifra<1||cifra>api.dati.oro_rimanente){$('indizio-stato').textContent='Inserisci una cifra intera positiva che possiedi. Il tentativo non è stato consumato.';return;}
          nuovaRichiesta('offerta',cifra);
        }));
      }
    }
    if(vista.oggetto_richiesto){
      const id=vista.oggetto_richiesto,nome=({grimaldello:'Grimaldello',pergamena_chiarezza:'Pergamena della Chiarezza'})[id]||id;
      const p=document.createElement('p');p.textContent=`In cambio dell’indizio viene richiesto: ${nome}.`;$('indizio-comandi').append(p);
      if((api.dati.inventario||[]).includes(id))$('indizio-comandi').append(creaBottone(`Scambia un oggetto: ${nome}`,()=>{if(window.confirm(`Cedere una copia di ${nome} per ottenere soltanto l’indizio?`))nuovaRichiesta('oggetto')}));
      else{const nota=document.createElement('p');nota.textContent='Non possiedi l’oggetto richiesto.';$('indizio-comandi').append(nota)}
    }
  }
  async function aggiorna(){
    const n=++revisione;
    if(!api.dati||api.dati.morto||api.dati.stato_partita?.fase!=='enigma'){vista=null;return;}
    try{
      const e=await api.rpc('gioco_leggi_enigma',{p_codice:api.codice,p_enigma:1});
      if(n!==revisione)return;
      vista=e;$('testo-enigma-galeazzo').textContent=e.testo;disegna();
    }catch(errore){if(n===revisione){vista=null;$('indizio-comandi').replaceChildren(creaBottone('Riprova a caricare l’enigma',aggiorna));$('indizio-stato').textContent=errore.message}}
  }
  function nuovaRichiesta(azione,offerta=null){
    if(sospesa()){disegna();return;}
    const r={codice:api.codice,tentativo:api.dati.tentativo,enigma:1,azione,offerta,richiesta:crypto.randomUUID()};
    if(!api.memoria.scrivi(PENDING,JSON.stringify(r))){$('indizio-stato').textContent='Abilita la memoria del sito per conservare la richiesta in caso di interruzione.';return;}
    return eseguiRichiesta(r);
  }
  async function eseguiRichiesta(r){
    let rifiutoDaMostrare=null;
    await api.esegui(async()=>{
      $('indizio-stato').textContent=r.azione==='tiro'?'Tiro e salvataggio…':'Proposta e salvataggio…';
      if(r.azione==='tiro'){
        $('indizio-dado').replaceChildren();const dado=document.createElement('span');dado.className='dado-virtuale';dado.dataset.facce='100';dado.textContent='…';$('indizio-dado').append(dado);$('indizio-dado').classList.add('in-movimento');
      }
      try{
        const durata=r.azione==='tiro'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?new Promise(resolve=>setTimeout(resolve,850)):Promise.resolve();
        const [esito]=await Promise.all([api.rpc('gioco_indizio',{p_codice:r.codice,p_enigma:r.enigma,p_azione:r.azione,p_tentativo:r.tentativo,p_richiesta:r.richiesta,p_offerta:r.offerta}),durata]);
        api.memoria.rimuovi(PENDING);vista=esito.enigma;
        await api.applica(esito.partita,r.codice,{anima:false});disegna();
        const offerta=r.azione==='offerta'?(esito.enigma.offerte||[]).find(o=>o.richiesta===r.richiesta):null;
        if(offerta&&!offerta.accettata){
          $('indizio-stato').textContent=offerta.messaggio_rifiuto||'Offerta rifiutata. Nessuna moneta spesa.';
          rifiutoDaMostrare={offerta,enigma:esito.enigma};
        }else if(offerta){$('indizio-stato').textContent=`Offerta accettata. Hai pagato ${offerta.cifra} monete d’argento.`;}
        else{$('indizio-stato').textContent='Esito salvato.';}
      }catch(errore){
        if(['Offerta non valida o argento insufficiente','Hai già fatto due offerte','Scambio non disponibile','Non possiedi l’oggetto richiesto','Acquisto in argento non disponibile','La partita è cambiata: riapri l’enigma'].includes(errore.message))api.memoria.rimuovi(PENDING);
        disegna();throw errore;
      }finally{$('indizio-dado').classList.remove('in-movimento')}
    },$('indizio-stato'));
    if(rifiutoDaMostrare)mostraRifiuto(rifiutoDaMostrare.offerta,rifiutoDaMostrare.enigma);
  }
  api.onChange(aggiorna);api.ready.then(aggiorna);
})();
