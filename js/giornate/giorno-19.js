(() => {
 'use strict';const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno19';area.hidden=true;main.append(area);
 const nomi=[['matteo','Matteo'],['marco','Marco'],['luca','Luca'],['giovanni','Giovanni']];
 let busy=false,errore='',chiave='',revision=0,scelte={};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const mappa=()=>window.SetteChiese?.apri();
 async function invia(azione,testo=null){if(busy)return null;busy=true;errore='';disegna();try{
 const r=await window.BorsaNuova.esegui('gioco_giorno19',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(!r)errore=window.BorsaNuova.errore||'Non riesco a completare l’azione. Riprova.';
 if(r?.racconto?.testo&&!(azione==='cerca'&&testo==='borsa'))window.Messaggi.mostra({...r.racconto,pulsante:'Continua'});return r;
 }catch(e){errore=e.message;return null}finally{busy=false;disegna();window.SetteChiese?.aggiorna?.()}}
 const passaggio=n=>invia('passaggio',String(n));
 function puoUsare(id){const d=api.dati,g=d?.stato_partita?.g19||{},f=d?.stato_partita?.fase;if(d?.giorno_corrente!==19||d.morto||d.giornata_completata||busy)return false;return id==='boccetta_giosue'?f==='g19_fessura'&&!g.boccetta_consumata:id==='boccetta_misura_g19'&&g.taglia==='piccolo'&&['g19_camera','g19_boccette','g19_sepolcro_piccolo'].includes(f)}
 async function usaOggetto(id){if(!puoUsare(id))return;if(!await window.ConfermaPergamena('Vuoi bere il contenuto della boccetta?',{titolo:'La boccetta',conferma:'Bevi',annulla:'Annulla'}))return;$('inventario')?.close();await invia('bevi',id)}
 function figura(nome,alt){const f=document.createElement('figure');f.className='immagine-schermata';const i=document.createElement('img');i.src=api.risorsa('images/'+nome);i.alt=alt;i.decoding='async';i.addEventListener('error',()=>f.hidden=true);f.append(i);area.append(f)}
 function testi(){const d=window.MenuPergamena("giorno19-testi",'Leggi i quattro testi incisi');;for(const [id,nome]of nomi)d.append(b('Il racconto di '+nome,()=>invia('testo',id)));area.append(d)}
 function schedeEvangelisti(g){
 if(g.evangelisti_risolti){area.append(p('Gli evangelisti si sono spostati ai lati del sepolcro. L’ingresso è libero.'),b('Entra nel sepolcro',()=>invia('entra_sepolcro')),b('Torna a esplorare la chiesa',()=>invia('torna')));return}
 if(!g.incavi_esaminati){
 area.append(p('Quattro figure occupano l’accesso al sepolcro. Non impugnano armi, ma quando tenti di avvicinarti si dispongono davanti a te e non ti lasciano passare.'),b('Affronta le figure',()=>invia('attacca_evangelisti')),b('Parla con loro',()=>invia('parla_evangelisti')),b('Osserva il sepolcro',()=>invia('osserva_sepolcro')));
 if(g.incavi_scoperti)area.append(p('Hai notato quattro simboli attorno al sepolcro e alcuni incavi vuoti sotto le figure.'),b('Esamina gli incavi',()=>invia('esamina_incavi')));
 area.append(b('Torna a esplorare la chiesa',()=>invia('torna')));return;
 }
 area.append(p('I simboli e le brevi iscrizioni sono incisi su frammenti mobili. Gli incavi sotto le figure possono accoglierli. Puoi scegliere come ricomporli.'));testi();
 const form=document.createElement('form'),griglia=document.createElement('div');griglia.className='abbinamenti-evangelisti19';
 function selettore(id,nome,campo,opzioni){const label=document.createElement('label'),select=document.createElement('select');label.htmlFor='ev19-'+id+'-'+campo;label.textContent=campo===0?'Simbolo di '+nome:'Significato';select.id=label.htmlFor;select.required=true;select.disabled=busy;const vuoto=document.createElement('option');vuoto.value='';vuoto.textContent='Scegli…';select.append(vuoto);for(const [valore,testo]of opzioni){const o=document.createElement('option');o.value=valore;o.textContent=testo;select.append(o)}select.value=scelte[id]?.[campo]||'';select.addEventListener('change',()=>{scelte[id]||=['',''];scelte[id][campo]=select.value});return[label,select]}
 for(const [id,nome]of nomi){const field=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=nome;field.append(legend,...selettore(id,nome,0,[['aquila','Aquila'],['bue','Bue'],['uomo','Uomo alato'],['leone','Leone']]),...selettore(id,nome,1,[['voce','La voce che si leva nel deserto'],['divino','Lo sguardo che si innalza al divino'],['origini','Le origini umane di Gesù'],['culto','Il sacerdote e il rito nel tempio']]));griglia.append(field)}
 const submit=b('Conferma gli abbinamenti',()=>{});submit.type='submit';form.addEventListener('submit',e=>{e.preventDefault();if(busy)return;if(nomi.some(([id])=>!scelte[id]?.[0]||!scelte[id]?.[1])){errore='Completa simbolo e significato per tutti e quattro gli evangelisti.';disegna();return}invia('abbina',JSON.stringify(scelte))});form.append(griglia,submit);area.append(form);
 if((g.errori_evangelisti||0)>=3)area.append(b('Chiedi un suggerimento',()=>invia('aiuto_evangelisti')));
 if(g.aiuto_evangelisti)area.append(p('Confronta il modo in cui cominciano i quattro racconti con i simboli scolpiti.'));
 area.append(b('Affronta le figure',()=>invia('attacca_evangelisti')),b('Torna a esplorare la chiesa',()=>invia('torna')));
 }
 const boccette=[['A','Fa brillare ciò che tocca.'],['B','Risana le ferite e restituisce le forze.'],['C','Dona alla voce il timbro del tuono.'],['D','Restituisce a ogni cosa la misura che le appartiene.'],['E','Fa riaffiorare i ricordi lontani.'],['F','Concede quiete alle membra stanche.']];
 function ripiano(g){
 area.append(p('Sei ancora minuscolo. Sul ripiano trovi sei boccette: ogni etichetta porta una lettera e poche parole.'));
 const elenco=document.createElement('div');elenco.className='boccette-giosue19';
 for(const [id,frase]of boccette){const d=window.MenuPergamena("giorno19-boccetta-"+id,'Boccetta '+id);d.append(p('«'+frase+'»'));
 const raccolta=id==='B'?g.media_presa:id==='D'?g.misura_presa||g.misura_bevuta:false;
 if(g.bevute?.[id]||id==='D'&&g.misura_bevuta)d.append(p('La boccetta è vuota.'));
 else if(raccolta)d.append(p('Hai già raccolto questa boccetta.'));
 else{
 if(['B','D'].includes(id))d.append(b('Prendi la boccetta '+id,()=>invia('prendi_boccetta',id)));
 d.append(b('Bevi dalla boccetta '+id,async()=>{if(busy)return;if(await window.ConfermaPergamena('Vuoi bere il contenuto della boccetta '+id+'?',{titolo:'Boccetta '+id,conferma:'Bevi',annulla:'Annulla'}))await invia('bevi',id)}));
 }elenco.append(d)}area.append(elenco,b('Torna a esplorare la stanza',()=>invia('torna')),b('Esci dalla porticina',()=>invia('esci_fessura')));
 }
 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},g=s.g19||{},f=s.fase||'',valido=d?.giorno_corrente===19&&(f.startsWith('g19_')||f==='fine_giorno19');area.replaceChildren();area.hidden=!valido;main.classList.toggle('giorno19-attivo',!!valido);if(!valido)return;
 const k=api.codice+':'+d.tentativo;if(k!==chiave){chiave=k;scelte=JSON.parse(JSON.stringify(g.abbinamenti||{}));errore=''}
 const stanza=['g19_basilisco','g19_riparo','g19_camera','g19_boccette','g19_schiacciato'].includes(f),img=stanza?'basilisco.png':d.luogo_attuale==='sette_chiese_1'?'chiesa1.png':d.luogo_attuale==='sette_chiese_2'?'chiesa2.png':'chiesa3.png';figura(img,stanza?'La stanza minuscola con il basilisco, la leva e sei boccette.':d.luogo_attuale==='sette_chiese_1'?'La Chiesa della Stella.':d.luogo_attuale==='sette_chiese_2'?'La Chiesa del Trifoglio.':'Il Santo Sepolcro, Chiesa del Serpente.');
 const h=document.createElement('h2');h.textContent=({g19_stella:'Il passaggio nella Stella',g19_cripta:'La Chiesa del Trifoglio',g19_chiesa:'La Chiesa del Serpente',g19_guardiani:'I quattro evangelisti',g19_sepolcro:'Dentro il sepolcro',g19_fessura:'Una porticina nella pietra',g19_sepolcro_piccolo:'Il mondo si è fatto grande',g19_basilisco:'Il basilisco',g19_riparo:'Un riparo fra le pietre',g19_camera:'La stanza minuscola',g19_boccette:'Le boccette sul ripiano',g19_schiacciato:'La stanza non basta',fine_giorno19:'Il passaggio verso Vitale e Agricola'})[f]||'La Chiesa del Serpente';area.append(h);
 if(d.morto){area.append(p(f==='g19_schiacciato'?'Sei cresciuto prima di lasciare la stanza: le sue pareti ti hanno schiacciato. Puoi ripartire dal checkpoint della giornata.':'Il basilisco ti ha sopraffatto. Puoi ripartire dal checkpoint della giornata.'),b('Riparti dal checkpoint',()=>api.esegui(()=>api.riprendiCheckpoint(),area)));return}
 if(d.giornata_completata){area.append(p('La giornata 19 è confermata. La quarta chiesa ti aspetta.'));return}
 if(['g19_stella','g19_cripta'].includes(f))area.append(p(f==='g19_stella'?'Il passaggio aperto dopo la prova nella cripta è davanti a te. Oltre la parete distingui gli archi di un altro ambiente.':'La voce della cripta tace. Per proseguire devi tornare al passaggio che collega la Stella al Santo Sepolcro.'),window.SetteChiese.comandoNavigazione(b('Raggiungi il Santo Sepolcro',()=>passaggio(3))),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 else if(f==='g19_chiesa'){
 area.append(p('Una riproduzione del Santo Sepolcro occupa il centro della chiesa. Colonne e archi le girano attorno; sui rilievi compaiono figure alate. Un piccolo serpente inciso richiama Giosuè.'),window.SetteChiese.comandoNavigazione(b('Prova il passaggio verso Santi Vitale e Agricola',()=>passaggio(4))),b('Avvicinati al sepolcro',()=>invia('avvicinati')));
 const esplorazioni=document.createElement('div');esplorazioni.className='esplorazioni-g19';for(const [id,t]of [['panche','Guarda sotto le panche'],['nicchie','Esamina le nicchie'],['pavimento','Segui le pietre del pavimento'],['rilievi','Osserva i rilievi']])esplorazioni.append(b(t,()=>invia('esplora',id)));area.append(esplorazioni);testi();area.append(window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 }else if(f==='g19_guardiani')schedeEvangelisti(g);
 else if(f==='g19_sepolcro'||f==='g19_fessura'){
 area.append(p(g.ritornato_grande?'Hai recuperato la tua grandezza nella camera del sepolcro. La fessura è tornata minuscola; dalla chiesa arriva l’eco del meccanismo che hai azionato.':'La camera interna sembra vuota. La pietra è nuda e non vedi né leve né scrigni. Puoi osservare meglio le pareti e il pavimento.'),b('Esamina le pareti',()=>invia('cerca','pareti')),b('Guarda vicino al pavimento',()=>invia('cerca','pavimento')),b('Esamina la nicchia nella camera',()=>invia('cerca','nicchia')));
 if(g.recupero_boccetta_disponibile&&!g.boccetta_consumata&&!d.inventario?.includes('boccetta_giosue'))area.append(b('Prendi la boccetta nella nicchia',()=>invia('recupera_boccetta')));
 if(f==='g19_fessura'){
 area.append(p('Vicino al pavimento distingui una fessura con la forma di una porta. È troppo piccola per attraversarla.'),b('Rovista nella Borsa',async()=>{const r=await invia('cerca','borsa');if(r)$('apri-borsa')?.click()}));
 if((g.tentativi_fessura||0)>=3)area.append(b('Chiedi un indizio',()=>invia('aiuto_fessura')));
 if(g.aiuto_fessura){area.append(p('Forse non devi cambiare la porta. Ripensa a ciò che hai raccolto cercando Giosuè.'));const dettagli=window.MenuPergamena("giorno19-aiuti",'Gli aiuti degli Spisotti');dettagli.append(p('Sulle pagine social degli Spisotti trovi la soluzione della giornata 19.'));for(const [t,u]of [['Facebook','https://www.facebook.com/profile.php?id=61594558125926'],['Instagram','https://www.instagram.com/glispisotti/']]){const a=document.createElement('a');a.textContent=t;a.href=u;a.target='_blank';a.rel='noopener noreferrer';dettagli.append(a)}area.append(dettagli)}
 }
 area.append(b('Torna nella chiesa',()=>invia('torna')));
 }else if(f==='g19_sepolcro_piccolo'){
 area.append(p('Le giunture della pietra sembrano crepacci. Sei ancora minuscolo, ma la porticina è della tua misura.'),b('Attraversa la porticina',()=>invia('entra_fessura')),b('Apri la Borsa',()=>$('apri-borsa')?.click()));
 }else if(f==='g19_basilisco')area.append(p('Il basilisco solleva il collo e spalanca le fauci. Dietro di lui vedi una leva e un ripiano con alcune boccette. La porticina si è richiusa alle tue spalle: devi difenderti.'),window.AzioniGioco.preparazione(),b('Affronta il basilisco',()=>window.AzioniGioco.apriScontro()));
 else if(f==='g19_riparo')area.append(p('Ti sei riparato fra le pietre. Il basilisco continua a sorvegliare la stanza; le ferite che gli hai inflitto non sono scomparse. Puoi riprendere fiato e usare ciò che porti nella Borsa.'),b('Torna ad affrontare il basilisco',()=>invia('riprendi_basilisco')),b('Apri la Borsa',()=>$('apri-borsa')?.click()));
 else if(f==='g19_camera'){
 area.append(p('Il basilisco non si muove più. Sei ancora minuscolo. Adesso puoi avvicinarti al fondo della stanza, dove una leva sporge dalla parete e sei boccette occupano un ripiano.'));
 for(const [id,t]of [['pareti','Esamina le pareti'],['polvere','Rovista fra polvere e schegge'],['leva','Esamina la leva'],['boccette','Esamina le boccette']])area.append(b(t,()=>invia('camera',id)));
 area.append(b(g.leva_azionata?'Riesamina la leva abbassata':'Aziona la leva',()=>invia('leva')),b('Esci dalla porticina',()=>invia('esci_fessura')),b('Apri la Borsa',()=>$('apri-borsa')?.click()));
 }else if(f==='g19_boccette')ripiano(g);
 else if(f==='fine_giorno19')area.append(p('Hai recuperato la tua grandezza e verificato che la porta verso Santi Vitale e Agricola si apre. La attraverserai domani.'),window.FineGiornata.pulsante(b),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 window.SetteChiese.posizionaNavigazione(area);
 }
 async function aggiorna(){const n=++revision;disegna();if(api.dati?.giorno_corrente!==19)return;try{await api.rpc('gioco_giorno19',{p_codice:api.codice});if(n===revision)errore=''}catch(e){if(n===revision){errore=e.message;disegna()}}}
 window.Giorno19={aggiorna,passaggio,usaOggetto,puoUsare,occupato:()=>busy};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
