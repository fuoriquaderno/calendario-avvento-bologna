// Tiri dimostrativi: i valori effettivi arrivano da Supabase, non dall'animazione.
(() => {
  'use strict';
  const api=window.Partita,$=id=>document.getElementById(id);
  const PENDING='ombra-sui-portici.dadi.prova.in-sospeso.v1';
  const LAST='ombra-sui-portici.dadi.prova.ultimo.v1';
  const FACCE=[4,6,8,10,12,20,100];
  let impegnato=false,codiceVisualizzato=null;
  const pannello=document.createElement('section');pannello.className='dadi-prova';
  pannello.innerHTML='<h3>Prova i dadi</h3><p>Questi tiri non modificano punti vita, oggetti o storia.</p><div class="dadi-campi"><label>Dado<select id="dadi-facce"><option value="4">d4</option><option value="6">d6</option><option value="8">d8</option><option value="10">d10</option><option value="12">d12</option><option value="20" selected>d20</option><option value="100">d100</option></select></label><label>Quanti<select id="dadi-numero"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label><label>Bonus<input id="dadi-bonus" type="number" value="0" min="-20" max="20" step="1"></label></div><button type="button" id="dadi-lancia">Tira i dadi</button><button type="button" id="dadi-abbandona" hidden>Annulla il tiro di prova in sospeso</button><div id="dadi-area" class="dadi-area" aria-hidden="true"></div><p id="dadi-risultato" class="dadi-totale" role="status" aria-live="polite"></p><p id="dadi-stato" class="dadi-stato" role="status" aria-live="polite"></p>';
  $('borsa-contesto').before(pannello);
  function leggi(k){try{return JSON.parse(api.memoria.leggi(k))}catch{return null}}
  function richiestaValida(r){return r&&typeof r.codice==='string'&&typeof r.richiesta==='string'&&/^[0-9a-f-]{36}$/i.test(r.richiesta)&&FACCE.includes(r.facce)&&Number.isInteger(r.numero)&&r.numero>=1&&r.numero<=6&&Number.isInteger(r.bonus)&&r.bonus>=-20&&r.bonus<=20}
  function sospesa(){const r=leggi(PENDING);return richiestaValida(r)&&r.codice===api.codice?r:null}
  function campi(r){$('dadi-facce').value=String(r.facce);$('dadi-numero').value=String(r.numero);$('dadi-bonus').value=String(r.bonus)}
  function bloccaCampi(bloccati){for(const id of ['dadi-facce','dadi-numero','dadi-bonus'])$(id).disabled=bloccati}
  function segnaposto(numero,facce){
    $('dadi-area').replaceChildren();
    for(let i=0;i<numero;i++){const dado=document.createElement('span');dado.className='dado-virtuale';dado.dataset.facce=String(facce);dado.textContent='…';$('dadi-area').append(dado)}
  }
  function risultatoValido(t){return t&&Number.isInteger(t.numero)&&t.numero>=1&&t.numero<=6&&FACCE.includes(t.facce)&&Number.isInteger(t.bonus)&&Array.isArray(t.valori)&&t.valori.length===t.numero&&t.valori.every(n=>Number.isInteger(n)&&n>=1&&n<=t.facce)&&t.totale===t.valori.reduce((a,b)=>a+b,0)+t.bonus}
  function mostraRisultato(area,testo,tiro){
    if(!risultatoValido(tiro))throw new Error('Risultato dei dadi non valido. Riprova a recuperare lo stesso tiro.');
    area.replaceChildren();
    for(const valore of tiro.valori){const dado=document.createElement('span');dado.className='dado-virtuale';dado.dataset.facce=String(tiro.facce);dado.textContent=String(valore);area.append(dado)}
    const bonus=tiro.bonus>0?` + ${tiro.bonus}`:tiro.bonus<0?` − ${Math.abs(tiro.bonus)}`:'';
    testo.textContent=`${tiro.numero}d${tiro.facce}${bonus}: ${tiro.valori.join(' + ')}${bonus} = ${tiro.totale}`;
  }
  function aggiorna(){
    if(impegnato)return;
    pannello.hidden=!api.dati;
    if(!api.dati)return;
    if(codiceVisualizzato!==api.codice){$('dadi-area').replaceChildren();$('dadi-risultato').textContent='';$('dadi-stato').textContent='';codiceVisualizzato=api.codice}
    const r=sospesa();bloccaCampi(!!r);$('dadi-abbandona').hidden=!r;
    $('dadi-lancia').textContent=r?'Recupera lo stesso tiro':'Tira i dadi';
    if(r){campi(r);$('dadi-stato').textContent='Un tiro potrebbe essere già stato salvato. Recuperalo per vedere lo stesso risultato, senza tirare di nuovo.'}
    else{
      const ultimo=leggi(LAST);
      if(ultimo?.codice===api.codice&&risultatoValido(ultimo.tiro))mostraRisultato($('dadi-area'),$('dadi-risultato'),ultimo.tiro);
    }
  }
  $('dadi-abbandona').addEventListener('click',()=>{
    if(impegnato)return;
    api.memoria.rimuovi(PENDING);$('dadi-stato').textContent='Tiro di prova abbandonato. Non cambia nulla nella partita.';aggiorna();
  });
  $('dadi-lancia').addEventListener('click',async()=>{
    if(impegnato||!api.codice)return;
    await api.esegui(async()=>{
      impegnato=true;
      let r=sospesa();
      try{
        if(!r){
          r={codice:api.codice,richiesta:crypto.randomUUID(),facce:Number($('dadi-facce').value),numero:Number($('dadi-numero').value),bonus:Number($('dadi-bonus').value)};
          if(!richiestaValida(r))throw new Error('Scegli da 1 a 6 dadi e un bonus intero da −20 a +20.');
          if(!api.memoria.scrivi(PENDING,JSON.stringify(r)))throw new Error('Abilita la memoria del sito per conservare il tiro in caso di interruzione.');
        }
        campi(r);bloccaCampi(true);segnaposto(r.numero,r.facce);
        $('dadi-risultato').textContent='';$('dadi-stato').textContent='Tiro in corso…';
        $('dadi-area').classList.add('in-movimento');
        const durata=window.matchMedia('(prefers-reduced-motion: reduce)').matches?Promise.resolve():new Promise(resolve=>setTimeout(resolve,850));
        const [tiro]=await Promise.all([api.rpc('gioco_prova_dadi',{p_codice:r.codice,p_richiesta:r.richiesta,p_facce:r.facce,p_numero:r.numero,p_bonus:r.bonus}),durata]);
        if(tiro?.richiesta!==r.richiesta||tiro.numero!==r.numero||tiro.facce!==r.facce||tiro.bonus!==r.bonus)
          throw new Error('Il risultato non corrisponde al tiro richiesto. Recupera lo stesso tiro.');
        mostraRisultato($('dadi-area'),$('dadi-risultato'),tiro);
        if(api.memoria.scrivi(LAST,JSON.stringify({codice:r.codice,tiro})))api.memoria.rimuovi(PENDING);
        $('dadi-stato').textContent='Tiro di prova salvato. Nessun effetto sulla partita.';
      }catch(errore){
        $('dadi-area').replaceChildren();
        throw errore;
      }finally{
        $('dadi-area').classList.remove('in-movimento');impegnato=false;
        const rimanente=sospesa();bloccaCampi(!!rimanente);$('dadi-abbandona').hidden=!rimanente;
        $('dadi-lancia').textContent=rimanente?'Recupera lo stesso tiro':'Tira i dadi';
      }
    },$('dadi-stato'));
  });
  api.onChange(aggiorna);api.ready.then(aggiorna);
  // La parte visiva può essere riusata nelle scene con un risultato deciso dal server.
  window.Dadi={mostraRisultato};
})();
