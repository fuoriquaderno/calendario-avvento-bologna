(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno15';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,meta={},tessera=null;
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);
 img.addEventListener('error',()=>{if(img.dataset.fallback&&img.src!==img.dataset.fallback)img.src=img.dataset.fallback;else figura.hidden=true});img.addEventListener('load',()=>figura.hidden=false);
 function illustrazione(nome,alt,fallback='costruttori.png'){const src=api.risorsa('images/'+nome);img.dataset.fallback=api.risorsa('images/'+fallback);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno15',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){meta=r;risposta(r)}else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}

 const nomi=['Bianca','Rosa','Marco','Marta','Elio','Livia','Pietro','Agnese'];
 const indizi=["La madre del figlio di mio padre.","Il figlio di mio nonno paterno che ha generato mio fratello.","Il padre della sorella di mia madre.","La madre della madre di mio fratello.","Il padre del padre di mio fratello.","La madre del padre di mio fratello.","La madre della figlia di mia zia materna.","La figlia della sorella della madre di mio fratello."];
 const mappa=()=>window.LuoghiGioco.apri();
 function titolo(t){const e=document.createElement('h3');e.textContent=t;return e}
 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g15||{},valida=d?.giorno_corrente===15&&!d.morto&&f.startsWith('g15_'),piena=valida&&f!=='g15_citta';
 main.classList.toggle('giorno15-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
 if(piena)illustrazione('allieva_fiorenza.png','L’allieva di Fiorenza al banco delle riparazioni.','mercato.png');
 const h=document.createElement('h2');h.textContent=({g15_banco:'Il quindicesimo giorno',g15_puzzle:'I legami della luna',g15_legami_risolti:'Il medaglione ricomposto',g15_protezione:'Un incanto di protezione',g15_parte_pronta:'Legami che proteggono',g15_citta:'L’appuntamento con l’allieva'})[f]||'Fiorenza';area.append(h);
 const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r){meta=r;risposta(r)}disegna()}));return}
 if(f==='g15_banco')area.append(p('Torni al banco come pattuito. L’allieva di Fiorenza ti fa spazio fra gli strumenti e appoggia sul panno un medaglione lunare smontato. Sottili fili uniscono le sue tessere.'),p('«Fiorenza diceva che un legame può sostenere oppure stringere troppo. Prima di affidarti ciò che cerchi, vorrei vedere come ricomponi questi.»'),b('Esamina il medaglione',()=>invia('inizia')));
 else if(f==='g15_puzzle'){
 area.append(p('I cartigli parlano tutti con la voce di Ada. Ricomponi i legami scegliendo una tessera con il nome e poi il cartiglio corrispondente. Puoi cambiare posizione alle tessere prima di verificare.'));
 const riferimento=document.createElement('details');riferimento.open=true;const sommario=document.createElement('summary');sommario.textContent='La famiglia di Ada';riferimento.append(sommario,p('Ada e suo fratello Neri sono figli di Livia e Marco. Livia e Marta sono le due figlie di Agnese ed Elio. Marco è figlio di Pietro e Rosa. Bianca è l’unica figlia di Marta.'),p('Le parentele indicate sono di sangue; Ada e Neri hanno gli stessi genitori.'));area.append(riferimento);
 const scelte=g.tessere||{},usate=Object.values(scelte),pezzi=document.createElement('div');pezzi.className='tessere-fiorenza';pezzi.setAttribute('role','group');pezzi.setAttribute('aria-label','Tessere con i nomi della famiglia');
 for(const nome of nomi){const btn=b(nome+(usate.includes(nome)?' · Collocata':''),()=>{tessera=tessera===nome?null:nome;disegna()});btn.setAttribute('aria-pressed',String(tessera===nome));pezzi.append(btn)}area.append(titolo('Scegli una tessera'),pezzi,p(tessera?'Ora scegli il cartiglio per '+tessera+'.':'Tocca un nome per scegliere la tessera. Per liberare un cartiglio occupato, toccalo senza una tessera selezionata.'));
 const medaglione=document.createElement('div');medaglione.className='medaglione-fiorenza';const luna=document.createElement('div');luna.className='luna-fiorenza';luna.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M66 8A42 42 0 1 0 66 92A45 45 0 0 1 66 8Z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';luna.append(p('Ada'));medaglione.append(luna);
 for(let i=0;i<indizi.length;i++){const posto=b('',async()=>{if(!tessera&&!scelte[i]){errore='Scegli prima una tessera con un nome.';disegna();return}const nome=tessera||'';await invia('colloca',JSON.stringify({posto:i,nome}));tessera=null;disegna()});posto.className='cartiglio-fiorenza';posto.setAttribute('aria-label','Cartiglio '+(i+1)+': '+indizi[i]+' Tessera: '+(scelte[i]||'vuoto'));const frase=document.createElement('span');frase.textContent=indizi[i];const nome=document.createElement('strong');nome.textContent=scelte[i]||'Colloca una tessera';posto.append(frase,nome);medaglione.append(posto)}area.append(medaglione,p('Tessere collocate: '+Object.keys(scelte).length+' / 8'),b('Verifica i legami',()=>invia('verifica')),b('Libera tutti i cartigli',async()=>{await invia('svuota');tessera=null;disegna()}),b('Apri la mappa',mappa));
 }else if(f==='g15_legami_risolti')area.append(p('L’ultimo filo si tende senza forzare. Le tessere tornano a combaciare e una luce tenue percorre il bordo lunare. L’allieva solleva il medaglione: ora i legami reggono insieme.'),p('«Riconoscere i legami è un inizio. Ora vediamo che cosa affideresti alla loro protezione.»'),b('Ascolta la sua domanda',()=>invia('protezione')));
 else if(f==='g15_protezione'){
 area.append(p('«Un uomo mi ha chiesto un amuleto per proteggere sua figlia quando attraversa la città. Vuole essere certo che non le accada nulla. Tu quale incanto prepareresti?»'));
 const valutazione=s.risposta_g15;if(valutazione?.testo){const feedback=p(valutazione.testo);feedback.setAttribute('role','status');area.append(feedback)}
 if(g.aiuto_incanto)area.append(titolo('Un aiuto dall’allieva'),p('«Prova a immaginare un incanto che tenga lontano il pericolo senza decidere al posto della ragazza. Che cosa potrebbe fare l’amuleto?»'));
 const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('textarea'),submit=document.createElement('button');label.textContent=g.chiarimento?'Precisa come funziona il tuo incanto':'Descrivi il tuo incanto';input.id='incanto-fiorenza';label.htmlFor=input.id;input.maxLength=700;input.required=true;input.rows=4;input.disabled=busy;submit.type='submit';submit.textContent='Proponi l’incanto';submit.disabled=busy;form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();const testo=input.value.trim();if(testo)invia('incanto',testo)});area.append(form,b('Apri la mappa',mappa));
 }else if(f==='g15_parte_pronta'){
 if(s.risposta_g15?.testo)area.append(p(s.risposta_g15.testo));else area.append(p('Hai ricomposto il medaglione e proposto una protezione che lascia libera la ragazza.'));
 area.append(p('L’allieva ripone gli strumenti e ti invita a restare al suo banco. Hai superato entrambe le prove.'),b('Apri la mappa',mappa));
 }else if(f==='g15_citta')area.append(p('L’allieva di Fiorenza ti aspetta al mercato. Puoi tornare al suo banco per riprendere da dove avevi lasciato.'),b('Apri la mappa',mappa));
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==15){disegna();return}try{const r=await api.rpc('gioco_giorno15',{p_codice:api.codice});if(n!==versione)return;meta=r;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoQuindici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
