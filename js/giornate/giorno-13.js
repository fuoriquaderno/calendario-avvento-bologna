(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno13';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,meta={};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);
 img.addEventListener('error',()=>{if(img.dataset.fallback&&img.src!==img.dataset.fallback)img.src=img.dataset.fallback;else figura.hidden=true});img.addEventListener('load',()=>figura.hidden=false);
 function illustrazione(nome,alt,fallback='costruttori.png'){const src=api.risorsa('images/'+nome);img.dataset.fallback=api.risorsa('images/'+fallback);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno13',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){meta=r;risposta(r)}else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 async function usa(azione,testo){if(busy)return;const ok=await window.ConfermaPergamena(testo,{titolo:'Usare l’oggetto?',conferma:'Usa l’oggetto',annulla:'Annulla'});if(ok)await invia(azione)}
 const mappa=()=>window.LuoghiGioco.apri();
 function disegna(){
  const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g13||{},notte=!!g.notte,accesso=!!s.accesso_torre,noti=!!(g.manuali_noti||g.tiro_bibliotecaria||g.riservati);
  const valida=d?.giorno_corrente===13&&!d.morto&&(f.startsWith('g13_')||f==='fine_giorno13');const piena=valida&&!['g13_citta','fine_giorno13'].includes(f);main.classList.toggle('giorno13-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
  if(piena){const manuali=f==='g13_manuali',dentro=['g13_esterna','g13_interna','g13_pre_interno','g13_scontro_interno'].includes(f),sede=f==='g13_sede';illustrazione(manuali?'bibliotecaria.png':dentro?'stanza_goffredo.png':sede?'costruttori.png':'torre_goffredo.png',manuali?'La sala dei manuali e la bibliotecaria.':dentro?'La stanza di Goffredo, con un accesso interno e un modellino.':sede?'La casa comune dei Costruttori.':'La torre di Goffredo e la scala completata.',manuali?'collegio_biblio.png':'costruttori.png');figura.classList.toggle('goffredo-notte',notte&&!manuali&&!dentro)}
  const h=document.createElement('h2');h.textContent=({g13_sede:'Il tredicesimo giorno',g13_manuali:'La sala dei manuali',g13_torre:'La torre di Goffredo',g13_esterna:'Stanze dentro altre stanze',g13_interna:'Il lascito di Goffredo',g13_citta:'Un ritorno alla corporazione',fine_giorno13:'Gli indizi di Goffredo'})[f]||'I custodi della torre';area.append(h);
  const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r){meta=r;risposta(r)}disegna()}));return}
  if(s.dado_g13){const box=document.createElement('div');box.className='tiro-goffredo';const tiro=s.dado_g13;box.append(p('Il tuo ultimo tiro per '+(s.voce_g13==='convinta'||s.voce_g13==='rifiuto'?'convincere la bibliotecaria':'convincere il custode')+': '+(tiro.valori||[]).join(' + ')+(tiro.bonus?' '+(tiro.bonus>0?'+ ':'− ')+Math.abs(tiro.bonus):'')+' = '+tiro.totale));area.append(box)}
  if(f==='g13_sede'){
   area.append(p(notte?'Nella casa comune quasi tutti dormono. La torre è ancora là, oltre il cortile.':'Ti svegli ospite dei Costruttori. Nel cortile qualcuno lavora già; altri discutono della magia nuova. La scala che hai aiutato a costruire arriva finalmente alla porta della torre, ma non sai ancora che cosa custodisca.'));
   if(!notte)for(const [id,t] of [['radicale','Ascolta il muratore che vorrebbe vietare la magia nuova'],['moderato','Parla con la costruttrice al banco'],['mago','Ascolta le notizie sui grandi maghi']])if(!g['parlato_'+id])area.append(b(t,()=>invia('parla',id)));
   area.append(b('Entra nella sala dei manuali',()=>invia('manuali')),b('Avvicinati alla torre',()=>invia('torre')),...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f==='g13_manuali'){
   area.append(p(notte?'La sala è deserta. Sul banco rimangono manuali, fogli e una penna.':g.metodo_riservati==='polvere'?'La bibliotecaria dorme sulla sedia. I manuali restano aperti sul banco.':'Nella sala, custodita quasi come un santuario del mestiere, una bibliotecaria riordina i volumi. Sul banco ci sono alcuni manuali aperti.'));
   const libri=document.createElement('div');libri.className='scelte-goffredo';for(const [id,t] of [['funi','Delle funi e dei nodi'],['attrezzi','Custodia degli strumenti'],['legname','Del legname stagionato']])libri.append(b(t+(g['letto_'+id]?' · Letto':''),()=>invia('libro',id)));area.append(libri);
   if(g.riservati){area.append(b('Consulta Delle giuste proporzioni'+(g.letto_riservato?' · Letto':''),()=>invia('riservato')));if(g.letto_riservato&&!g.nota_presa)area.append(b('Ricopia l’annotazione di Goffredo',()=>invia('copia')));if(g.nota_presa)area.append(p('Hai conservato nella Borsa la nota sulle proporzioni.'))}
   else if(!notte){area.append(b('Parla con la bibliotecaria',()=>invia('bibliotecaria')));if(noti&&!g.tiro_bibliotecaria)area.append(b('Chiedi i manuali riservati — prova di Inganno',()=>invia('tiro_manuali')));if(noti&&meta.ha_fazzoletto)area.append(b('Dona il fazzoletto alla bibliotecaria',()=>usa('fazzoletto','Le donerai il fazzoletto, che non resterà nella Borsa.')));if(noti&&meta.ha_polvere)area.append(b('Usa la polvere soporifera',()=>usa('polvere','Consumerai una dose di polvere per addormentare la bibliotecaria.')))}
   else area.append(p(noti?'L’armadio è chiuso. Il custode notturno della torre ha con sé il mazzo delle chiavi.':'Il custode notturno della torre porta un mazzo di chiavi. Forse una apre anche i mobili di questa sala.'));
   area.append(b('Vai alla torre',()=>invia('torre')),b('Torna nel cortile',()=>invia('sede')));
  }else if(f==='g13_torre'){
   if(accesso)area.append(p('La porta della torre non ti è più preclusa.'),b('Entra nella torre',()=>invia('entra')));
   else if(notte)area.append(p('Un solo custode veglia davanti alla porta. Gli altri si sono ritirati nella casa comune.'),b('Avvicinati al custode notturno',()=>invia('guardia_notte')));
   else{area.append(p('La scala è finita. Mentre sali, un custode si mette davanti alla porta. Dal cortile altri uomini seguono i tuoi movimenti.'));if(!g.rifiuto)area.append(b('Chiedi di entrare',()=>invia('chiedi_accesso')));else{if(!g.inganno_tentato&&!s.allarme_giorno)area.append(b('Fingi un controllo alla scala — prova di Inganno',()=>invia('inganno')));area.append(b('Prova a entrare con la forza',()=>invia('forza')),b('Aspetta la notte',()=>invia('notte')))}}
   if(accesso&&!notte&&g.rifiuto)area.append(b('Aspetta la notte',()=>invia('notte')));
   area.append(b('Torna alla sala dei manuali',()=>invia('manuali')),b('Torna nel cortile',()=>invia('sede')),...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
  }else if(f.startsWith('g13_pre_')){
   const interno=f==='g13_pre_interno',giorno=f==='g13_pre_giorno';area.append(p(interno?'Appena tocchi la porta interna, due guardie escono dall’ombra e alzano le mazze. «Qui non passi.» Dopo ogni tua azione attaccherà ciascuna guardia ancora in piedi.':giorno?'Il custode chiama i compagni. In pochi istanti sei uomini ti circondano: dopo ogni tua azione attaccherà ciascuno di quelli ancora in piedi. Puoi ancora rinunciare prima dello scontro.':'Il custode notturno stringe il bastone. Se vuoi prendere le chiavi e oltrepassare quella porta, dovrai affrontarlo.'),b('Affronta '+(interno?'le due guardie interne':giorno?'i sei custodi':'il custode notturno'),()=>invia('combatti')),b('Indietro',()=>invia(interno?'indietro_interno':'indietro_scontro')));
  }else if(f.startsWith('g13_scontro_'))area.append(p(f==='g13_scontro_interno'?'Le due guardie ti sbarrano il passo. Dopo ogni tua azione attaccherà ciascuna guardia ancora in piedi. Preparati prima di dare inizio allo scontro.':'Il custode ti sbarra il passo. Preparati prima di dare inizio allo scontro.'),b('Inizia lo scontro',()=>window.AzioniGioco.apriScontro()));
  else if(f==='g13_esterna'){
   area.append(p('Sei nella prima stanza di Goffredo. Un banco porta strumenti e piccoli modelli. I disegni alle pareti sembrano descrivere edifici racchiusi in altri edifici. In fondo, una seconda porta nasconde il resto della torre.'));
   for(const [id,t] of [['banco','Esamina il banco'],['disegni','Osserva i disegni']])area.append(b(t+(g['visto_'+id]?' · Esaminato':''),()=>invia('ispeziona',id)));
   area.append(b('Apri la porta interna',()=>invia('porta_interna')),b('Torna ai manuali',()=>invia('manuali')),b('Esci dalla torre',()=>invia('torre')));
  }else if(f==='g13_interna'){
   area.append(p(g.modellino_preso?'Hai riposto il piccolo modellino nella Borsa. Le due guardie non ti sbarrano più la porta.':'Superate le due guardie, scopri una stanza più piccola dentro quella esterna. Al centro, su un piedistallo basso, c’è un modellino dalle pareti annidate. Ti avvicini per osservarlo.'));
   if(!g.modellino_preso)area.append(b('Prendi il modellino — peso zero',()=>invia('modellino')));
   if(g.modellino_preso&&g.nota_presa)area.append(b('Lascia la torre e termina il racconto di oggi',()=>invia('fine')));
   else if(g.modellino_preso)area.append(p('Hai ancora qualcosa da cercare nei manuali della corporazione.'),b('Torna nella sala dei manuali',()=>invia('manuali')));
   area.append(b('Torna nella stanza esterna',()=>invia('indietro_interno')));
  }else if(f==='g13_citta')area.append(p('Puoi tornare alla casa comune dei Costruttori per continuare la ricerca.'),...window.LuoghiGioco.conPassante(b('Apri la mappa e raggiungi i Costruttori',mappa)));
  else if(f==='fine_giorno13')area.append(p('Hai conservato la nota sulle proporzioni e il modellino di Goffredo. Per oggi hai trovato ciò che cercavi.'),b('Termina giornata',()=>window.FineGiornata.apri()));
  if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==13){disegna();return}try{const r=await api.rpc('gioco_giorno13',{p_codice:api.codice});if(n!==versione)return;meta=r;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoTredici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
