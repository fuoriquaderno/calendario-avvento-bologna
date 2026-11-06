(() => {
 'use strict';
 const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const area=document.createElement('section');area.id='stanza-nascosta';area.hidden=true;document.querySelector('main .scroll-middle').append(area);
 let busy=false,vistaVerbali=false,paginaVerbali=null,bozzaRisposta="",figuraNascosta=false;
 function p(t){const e=document.createElement('p');e.textContent=t;return e}
 function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e}
 async function invia(azione){
  if(busy)return;busy=true;
  try{const r=await window.BorsaNuova.esegui('gioco_stanza_nascosta',{p_codice:api.codice,p_azione:azione,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r?.lettura){if(vistaVerbali&&azione.startsWith('leggi:'))paginaVerbali=r.lettura;else window.Messaggi.mostra({titolo:r.lettura.titolo,testo:r.lettura.testo,pulsante:'Continua'})}if(r&&azione.startsWith('prova:'))bozzaRisposta='';}
  finally{busy=false;aggiorna()}
 }
 
 function gestisciFigura(){
  const figura=$('immagine-schermata');if(!figura)return;
  if(vistaVerbali){figura.hidden=true;figuraNascosta=true}
  else if(figuraNascosta){figuraNascosta=false;window.ImmagineSchermata?.aggiorna(api.dati)}
 }
 async function cambiaVista(apri){
  window.Dadi?.pulisci();
  const cambia=()=>{vistaVerbali=apri;paginaVerbali=null;aggiorna()};
  if(window.cambiaPergamena)await window.cambiaPergamena(cambia);else cambia();
  area.scrollIntoView?.({block:'start',behavior:'smooth'});
 }
 function linkSocial(testo,url){const a=document.createElement('a');a.textContent=testo;a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.style.cssText='display:inline-block;margin:4px 20px 4px 0';return a}

 
 let ritratto=null,proprietarioRitratto=null;
 function apriRitratto(){
  proprietarioRitratto={codice:api.codice,tentativo:api.dati?.tentativo};
  if(!ritratto){
   ritratto=document.createElement('dialog');ritratto.id='ritratto-demetrio';ritratto.className='avviso-codice ritratto-demetrio';ritratto.setAttribute('aria-labelledby','titolo-ritratto-demetrio');
   ritratto.style.cssText='width:min(760px,calc(100% - 24px));max-height:90vh;max-height:90dvh;overflow-y:auto;overflow-x:hidden';
   const alto=document.createElement('div'),centro=document.createElement('div'),basso=document.createElement('div');alto.className='scroll-top';centro.className='scroll-middle';basso.className='scroll-bottom';alto.setAttribute('aria-hidden','true');basso.setAttribute('aria-hidden','true');
   const titolo=document.createElement('h2');titolo.id='titolo-ritratto-demetrio';titolo.textContent='Un’illustrazione fra i ritratti';
   const contenuto=document.createElement('div');contenuto.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:24px;align-items:center';
   const figura=document.createElement('figure');figura.style.margin='0';
   const img=document.createElement('img');img.src=api.risorsa('images/torredemetrio.png');img.alt='Una torre di Bologna nell’illustrazione di Demetrio';img.style.cssText='width:100%;height:auto;display:block';
   const segnaposto=p('Illustrazione in preparazione');segnaposto.hidden=true;segnaposto.setAttribute('role','status');
   img.addEventListener('error',()=>{img.hidden=true;segnaposto.hidden=false});img.addEventListener('load',()=>{img.hidden=false;segnaposto.hidden=true});figura.append(img,segnaposto);
   contenuto.append(figura,p('Una torre di Bologna, sei sicuro di averla già vista.'));
   ritratto.addEventListener('close',async()=>{
    if(!img.complete||img.naturalWidth<=0||api.dati?.interazioni?.illustrazione_demetrio_vista)return;
    if(api.codice!==proprietarioRitratto?.codice||api.dati?.tentativo!==proprietarioRitratto?.tentativo)return;
    await window.BorsaNuova.esegui('gioco_osserva_ritratto',{p_codice:api.codice,p_tentativo:api.dati.tentativo,p_richiesta:crypto.randomUUID()});
    aggiorna();
   });
   const chiudi=b('Torna ai libri',()=>ritratto.close());centro.append(titolo,contenuto,chiudi);ritratto.append(alto,centro,basso);document.body.append(ritratto);
  }
  if(!ritratto.open)ritratto.showModal();
 }

 function aggiorna(){
  const d=api.dati,f=d?.stato_partita?.fase,s=d?.stato_partita?.stanza_nascosta||{};area.replaceChildren();
  area.hidden=!d||d.giorno_corrente!==4||d.morto||!['g4_nascosta','g4_esplora','g4_fantasma','g4_dopocustode','g4_tomi','fine_giorno4'].includes(f);if(area.hidden)return;
  if(f!=='g4_tomi'){vistaVerbali=false;paginaVerbali=null;bozzaRisposta=''}
  gestisciFigura();
  const titolo=document.createElement('h2');titolo.textContent=f==='g4_fantasma'?'Il custode degli scaffali':f==='g4_esplora'?'Fra polvere e pietre':'La stanza nascosta';area.append(titolo);
  const sospesa=window.BorsaNuova.pending();
  if(sospesa){area.append(p('Recupera il risultato dell’ultima azione prima di proseguire.'),b('Recupera il risultato',async()=>{await window.BorsaNuova.esegui(sospesa.nomeRpc,sospesa.args);aggiorna()}));return}
  if(f==='fine_giorno4'){
   titolo.textContent='Iliano diceva la verità';
   area.append(p('Nei verbali hai trovato le prove: i sette hanno creato la magia nuova e un tomo per controllarla. Il tomo è nascosto e nessuno dei maghi possiede da solo tutti i particolari per ritrovarlo.'),p('Richiudi il volume. Per oggi hai scoperto abbastanza.'),b('Termina giornata',()=>window.FineGiornata.apri()));return;
  }
  if(d.luogo_attuale!=='sala_consiglio'){area.append(p('Puoi riprendere l’esplorazione oltre il passaggio della biblioteca.'),b('Torna alla stanza nascosta',()=>invia('torna')));return}
  if(f==='g4_fantasma'){
   area.append(p('Appena tocchi un libro, l’aria si raffredda. Fra gli scaffali prende forma una figura trasparente, con una mano ancora tesa verso il volume.'),p('Il volto dello spirito si contrae. Le dita attraversano il ripiano e si allungano verso di te. Non sembra disposto a lasciarti consultare la raccolta.'),b('Inizia il combattimento',()=>window.AzioniGioco.apriScontro()));return;
  }
  if(!s.tiro_topo){
   area.append(p('Scaffalature polverose occupano le pareti. I dorsi dei vecchi tomi sono segnati dal tempo; alcuni volumi giacciono di traverso, come se l’ultimo lettore non li avesse rimessi a posto.'),p('Muovi un passo. Un topolino ti attraversa la strada proprio mentre stai abbassando il piede.'),p('Prova di agilità: d20 con il bonus di Furtività. Cerca di evitarlo.'),b('Evita il topo — tira il d20',()=>invia('topo')));return;
  }
  const dado=document.createElement('div'),totale=document.createElement('p');dado.className='dadi-area';
  if(window.Dadi)window.Dadi.mostraRisultato(dado,totale,s.tiro_topo,'topo');else totale.textContent=`Prova del topo: ${s.tiro_topo.totale}`;
  if(!vistaVerbali&&(!window.Dadi||window.Dadi.contestoAttivo('topo')))area.append(dado,totale,p(s.tiro_topo.successo?'Sposti il piede in tempo. Il topo scompare sotto uno scaffale senza protestare.':'Gli pesti la coda. Il topo si volta e ti morde prima di scappare sotto uno scaffale. Perdi 1 HP.'));
  if(f==='g4_tomi'){
   const letto=id=>!!s.letti?.[id];
   const libro=(id,t)=>b(t+(letto(id)?' · Letto':''),()=>invia('leggi:'+id));
   if(vistaVerbali){
    titolo.textContent='Verbali del Consiglio Arcano dello Studio';
    const figura=document.createElement('figure'),img=document.createElement('img');
    figura.style.cssText='margin:20px auto;max-width:460px';
    img.src=api.risorsa('images/verbali.png');img.alt='La copertina dei verbali, con sette sigilli disposti in cerchio sul fermaglio.';
    img.style.cssText='display:block;width:100%;height:auto;max-height:none;object-fit:contain';figura.append(img);area.append(figura);
    if(!s.verbali_aperti){
     area.append(p('In alto vedi un simbolo che riconosci subito: era nella lettera che ti aveva mandato Iliano, un sigillo raffigurante la stella.'),p('Sulla copertina leggi: «Sette furono le voci. Una sola la volontà.»'),p('Provi ad aprire il libro, ma il fermaglio è chiuso. Premi uno dei sette sigilli: si illumina, senza aprire il tomo. Quando ne schiacci un altro, il primo si spegne e si accende il secondo.'));
     const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('textarea'),nota=p('Descrivi come cerchi di aprire il libro. Puoi usare una frase, non serve una parola precisa.');
     label.htmlFor='azione-sigilli';label.textContent='Che fai?';input.id='azione-sigilli';input.rows=3;input.maxLength=500;input.required=true;input.value=bozzaRisposta;input.disabled=busy;
     input.style.cssText='display:block;width:100%;box-sizing:border-box;margin-block:12px;padding:12px;font:inherit;color:inherit;background:#f4ead566;border:1px solid #926033;border-radius:4px';
     nota.id='istruzioni-sigilli';input.setAttribute('aria-describedby',nota.id);
     input.addEventListener('input',()=>{bozzaRisposta=input.value});
     const prova=b('Prova ad aprire il tomo',()=>{});prova.type='submit';
     form.addEventListener('submit',async e=>{e.preventDefault();if(!busy&&input.value.trim())await invia('prova:'+input.value.trim())});form.append(label,input,nota,prova);area.append(form);
     const errori=s.errori_sigilli||0;
     if(errori){const esito=p('Il fermaglio resta chiuso.');esito.setAttribute('role','status');area.append(esito,p('Descrivi il gesto che vuoi compiere sui sigilli: non devi indovinare una parola segreta.'))}
     if(errori>=3){
      if(s.aiuto_sigilli)area.append(p('«Il fermaglio non attende sette persone, ma un gesto che le rappresenti tutte.»'));
      else area.append(b('Leggi l’appunto del bibliotecario',()=>invia('aiuto')));
     }
     area.append(p('Preferisci conoscere la soluzione? La pubblichiamo la sera sulle pagine degli Spisotti. Attenzione: contiene spoiler.'),linkSocial('Gli Spisotti su Facebook','https://www.facebook.com/profile.php?id=61594558125926'),linkSocial('Gli Spisotti su Instagram','https://www.instagram.com/glispisotti/'));
    }else{
     area.append(p('I sette sigilli si illuminano insieme. Il fermaglio è aperto: puoi leggere i verbali.'));
     area.append(libro('esperimenti','I primi esperimenti'));
     if(letto('esperimenti'))area.append(libro('riuscita','La magia nuova'));
     if(letto('riuscita'))area.append(libro('apprendimento','Imparare dagli errori'));
     if(letto('apprendimento'))area.append(libro('occultamento','Il patto dei sette'));
     if(paginaVerbali){const h=document.createElement('h3');h.textContent=paginaVerbali.titolo;area.append(h,p(paginaVerbali.testo))}
     if(letto('occultamento')&&letto('consiglio')&&d.interazioni?.illustrazione_demetrio_vista)area.append(b('Hai trovato la conferma: concludi l’esplorazione',()=>invia('concludi')));else if(letto('occultamento'))area.append(p('Prima di andare via, osserva anche l’illustrazione accanto al ritratto di Demetrio.'),b('Torna agli altri libri',()=>cambiaVista(false)));
    }
    area.append(b('Riponi i verbali e torna agli altri libri',()=>cambiaVista(false)));
   }else{
    titolo.textContent='I tomi del Consiglio';area.append(p('Ora puoi consultare i volumi sugli scaffali.'));
    const elenco=document.createElement('ul');elenco.className='tomi-sala-lettura';
    const volumi=[['verbali','Verbali del Consiglio Arcano dello Studio'],['consiglio','Ritratti del Consiglio Arcano dello Studio'],['venti','Trattato dei piccoli venti'],['inchiostri','Della durata degli inchiostri incantati'],['luce','Della luce che veglia']];
    for(const [id,t] of volumi){const li=document.createElement('li');li.append(id==='verbali'?b(t+(letto('occultamento')?' · Letto':''),()=>cambiaVista(true)):libro(id,t));if(id==='consiglio'&&letto(id)){
     const link=document.createElement('a');link.href=api.risorsa('images/torredemetrio.png');link.textContent='Osserva l’illustrazione di Demetrio';link.style.cssText='display:block;margin:8px 0 16px';
     link.addEventListener('click',e=>{e.preventDefault();apriRitratto()});li.append(link);
    }elenco.append(li)}area.append(elenco);
    if(letto('luce'))area.append(s.pergamena_presa?p('Hai riposto la pergamena della luce vigile nella Borsa.'):b('Prendi la pergamena della luce vigile — peso 1',()=>invia('pergamena')));
    if(letto('occultamento')&&letto('consiglio')&&d.interazioni?.illustrazione_demetrio_vista)area.append(b('Hai trovato la conferma: concludi l’esplorazione',()=>invia('concludi')));else if(letto('occultamento'))area.append(p('Prima di andare via, osserva anche l’illustrazione accanto al ritratto di Demetrio.'));
    area.append(b('Torna davanti agli scaffali',()=>invia('scaffali')));
   }
  

}else if(f==='g4_esplora'){
   area.append(p('Ti tieni lontano dai libri e osservi il resto della stanza. Vicino alla base di uno scaffale noti una pietra del pavimento leggermente sollevata. Quando la sfiori, si muove.'));
   const azioniEsplorazione=document.createElement('div');azioniEsplorazione.className='azioni-esplorazione-stanza';
   for(const [id,t] of [['sgabello','Raddrizza lo sgabello'],['cassa','Apri la vecchia cassa'],['solleva','Solleva la pietra allentata'],['arazzo','Scosta il drappo'],['brocca','Solleva la brocca incrinata']]){
    const esaminato=id==='solleva'?s.pietra_sollevata:s.esaminati?.[id];
    const comando=b(t+(esaminato?' · Esaminato':''),()=>invia(id));
    if(id==='solleva'&&s.pietra_sollevata){comando.disabled=true;comando.setAttribute('data-disabilitato','')}
    azioniEsplorazione.append(comando);
   }
   area.append(azioniEsplorazione);
   if(s.pietra_sollevata){
    area.append(p('Sotto la pietra trovi un piccolo incavo: due monete d’argento e un’ampolla ancora chiusa. È una pozione curativa media.'));
    if(!s.monete_prese)area.append(b('Prendi le 2 monete d’argento',()=>invia('monete')));else area.append(p('Hai raccolto le due monete.'));
    if(!s.pozione_presa)area.append(b('Prendi la pozione curativa media',()=>invia('pozione')));else area.append(p('Hai raccolto la pozione.'));
   }
   const ritorni=document.createElement('div');ritorni.className='ritorni-esplorazione';ritorni.style.cssText='margin-top:32px;padding-top:8px';
   ritorni.append(b('Torna davanti agli scaffali',()=>invia('scaffali')),b('Torna nei servizi',()=>invia('uscita')));area.append(ritorni);
  }else{
   if(d.stato_partita.custode_sconfitto)area.append(p('Il custode si è dissolto. L’aria torna immobile e gli scaffali non sembrano più sorvegliati.'));
   else area.append(p('Ora puoi guardarti intorno. Davanti a te rimangono gli scaffali e i loro vecchi tomi.'));
   area.append(b('Esplora la stanza',()=>invia('esplora')),b(d.stato_partita.custode_sconfitto?'Consulta i libri':'Prendi un libro dagli scaffali',()=>invia('libri')));
  }
  if(f!=='g4_tomi'&&f!=='g4_esplora')area.append(b('Torna nei servizi',()=>invia('uscita')));
  if(window.BorsaNuova.errore)area.append(p(window.BorsaNuova.errore));
 }
 
 window.StanzaNascosta={aggiorna,apriRitratto};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
