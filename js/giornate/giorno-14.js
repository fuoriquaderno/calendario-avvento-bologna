(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno14';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,meta={},modoGriglia='esplora';
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);
 img.addEventListener('error',()=>{if(img.dataset.fallback&&img.src!==img.dataset.fallback)img.src=img.dataset.fallback;else figura.hidden=true});img.addEventListener('load',()=>figura.hidden=false);
 function illustrazione(nome,alt,fallback='costruttori.png'){const src=api.risorsa('images/'+nome);img.dataset.fallback=api.risorsa('images/'+fallback);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}
 function risposta(r){if(r?.racconto)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno14',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){meta=r;risposta(r)}else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 async function usa(azione,testo){if(busy)return;const ok=await window.ConfermaPergamena(testo,{titolo:'Gioca 2 monete',conferma:'Gioca 2 monete',annulla:'Annulla'});if(ok)await invia(azione)}
 const mappa=()=>window.LuoghiGioco.apri();


 const valore=c=>c%10<7?c%10+1:.5;
 const nomi=['Asso','Due','Tre','Quattro','Cinque','Sei','Sette','Fante','Cavallo','Re'];
 const semi=['Denari','Coppe','Spade','Bastoni'];
 const disegni=[
 '<circle cx="30" cy="35" r="20"/><circle cx="30" cy="35" r="14"/><path d="M30 22v26M17 35h26"/>',
 '<path d="M15 14h30v15c0 12-7 18-15 18s-15-6-15-18zM30 47v12M19 61h22M15 19H7v11c0 7 4 10 10 10M45 19h8v11c0 7-4 10-10 10"/>',
 '<path d="M27 45V12l3-8 3 8v33M17 45h26M30 45v16M24 63h12"/>',
 '<path d="M23 61 37 10l7 2-14 51zM28 40l-9-7M33 25l12-5M25 52l12-5"/>'
 ];
 function carta(c,coperta=false){const e=document.createElement('div');e.className='carta-g14'+(coperta?' carta-g14-coperta':'');if(coperta){e.setAttribute('aria-label','Carta coperta del banco');e.append(p('✦'));return e}
 const rank=nomi[c%10],seme=semi[Math.floor(c/10)];e.setAttribute('aria-label',rank+' di '+seme+', valore '+valore(c));const numero=document.createElement('strong');numero.textContent=c%10<7?String(c%10+1):rank;const simbolo=document.createElement('span');simbolo.className='seme-g14';simbolo.innerHTML='<svg viewBox="0 0 60 70" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+disegni[Math.floor(c/10)]+'</svg>';const label=document.createElement('small');label.textContent=seme;e.append(numero,simbolo,label);return e}
 function mano(titolo,carte,coperta=false){const gruppo=document.createElement('div');gruppo.className='mano-g14';const h=document.createElement('h3');h.textContent=titolo;const fila=document.createElement('div');fila.className='carte-g14';if(coperta)fila.append(carta(0,true));else for(const c of carte||[])fila.append(carta(c));gruppo.append(h,fila);return gruppo}

 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g14||{};
 const valida=d?.giorno_corrente===14&&!d.morto&&(f.startsWith('g14_')||f==='fine_giorno14'),piena=valida&&!['g14_strada','fine_giorno14'].includes(f);
 main.classList.toggle('giorno14-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
 if(piena)illustrazione(f==='g14_locanda'?'locanda.png':f==='g14_pegni'?'pegno.png':['g14_tavolo','g14_carte','g14_recupero'].includes(f)?'carte.png':f==='g14_allieva'?'allieva_fiorenza.png':'mercato.png','La ricerca di Fiorenza fra i banchi di Bologna.','mercato.png');
 const h=document.createElement('h2');h.textContent=({g14_locanda:'Il quattordicesimo giorno',g14_strada:'Sulle tracce di Fiorenza',g14_pegni:'Il banco dei pegni',g14_mercato:'I banchi settimanali',g14_tavolo:'Una partita per una risposta',g14_carte:'Sette e mezzo',g14_cartello:'Un banco chiuso',g14_recupero:'Fra i banchi',g14_allieva:'L’allieva di Fiorenza',fine_giorno14:'Un appuntamento per domani'})[f]||'Fiorenza';area.append(h);
 const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r){meta=r;risposta(r)}disegna()}));return}
 if(f==='g14_locanda'){
 area.append(p('Ti svegli alla locanda. Hai raccolto la nota e il modellino di Goffredo, ma ti manca ancora il tassello di Fiorenza. Ripensi al libro sulle maghe: portava sempre con sé un amuleto. Potresti cercarne notizie fra chi compra, vende e ripara vecchi oggetti.'),b('Fai colazione',()=>invia('colazione')),b('Esci subito',()=>invia('esci')));
 }else if(f==='g14_strada'){
 area.append(p('Fra banchi dei pegni e rivenditori potresti trovare qualcuno che ricordi l’amuleto di Fiorenza.'),b('Cerca fra i banchi dei pegni',()=>invia('pegni')),...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(f==='g14_pegni'){
 area.append(p('Il mercante sistema piccoli scrigni e gioielli usati. Ogni oggetto sembra essere passato per molte mani.'));
 if(!g.pista_mercato)area.append(b('Chiedi dell’amuleto di Fiorenza',()=>invia('chiedi')));
 area.append(b('Esamina i gioielli'+(g.visto_gioielli?' · Esaminati':''),()=>invia('osserva','gioielli')),b('Guarda negli scrigni'+(g.visto_scrigni?' · Esaminati':''),()=>invia('osserva','scrigni')));
 if(g.pista_mercato)area.append(p('La donna che cerchi frequenta i banchi settimanali. Al tavolo da gioco potrebbero sapere dove si trova.'));
 area.append(...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(f==='g14_mercato'){
 area.append(p('Le tende dei banchi settimanali si affiancano alle botteghe. Fra stoffe, oggetti usati e voci che si sovrappongono, cerchi una pista sull’amuleto.'));
 if(!g.pista_mercato)area.append(b('Chiedi al banco dei pegni',()=>invia('pegni')));
 for(const [id,t] of [['nuovi','Osserva il banco dei gioielli nuovi'],['incanti','Ascolta il venditore di incanti'],['riparazioni','Visita il banco delle riparazioni']])area.append(b(t+(g['banco_'+id]?' · Visitato':''),()=>invia('banco',id)));
 if(!g.patacca_scoperta)area.append(b('Ascolta il venditore di cimeli',()=>invia('patacca')));
 if(g.patacca_vista&&!g.patacca_scoperta)area.append(b('Esamina il pendente del venditore',()=>invia('esamina')));
 if(g.pista_mercato)area.append(b('Avvicinati al tavolo da gioco',()=>invia('tavolo')));
 if(g.indicazioni)area.append(b('Cerca la tenda dietro i banchi delle stoffe',()=>invia('allieva')));
 area.append(...window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(f==='g14_tavolo'){
 if(g.indicazioni)area.append(p('Sai dove cercare la restauratrice. Se vuoi, prima puoi giocare ancora.'),b('Cerca la tenda',()=>invia('allieva')));
 else area.append(p(g.partita_fatta?'Il giocatore riordina le carte. Puoi sfidarlo ancora oppure ottenere l’indicazione aiutandolo a cercare il gettone.':'Un giocatore alza lo sguardo dalle carte. «La donna dei pendenti? La conosco. Ti va una partita, con una piccola posta, prima delle domande?»'));
 area.append(b('Chiedi le regole',()=>invia('regole')));
 const gioca=b(g.partita_fatta?'Gioca ancora — 2 monete':'Gioca 2 monete',()=>usa('gioca','Metterai due monete d’argento per una nuova sfida al meglio delle tre mani. Se vinci raccoglierai quattro monete; se perdi, la posta sarà persa. Puoi giocare ancora finché hai almeno due monete.'));
 gioca.disabled=busy||(d.oro_rimanente||0)<2;area.append(gioca);
 if((d.oro_rimanente||0)<2)area.append(p('Per una nuova sfida servono due monete d’argento.'));
 if(!g.indicazioni)area.append(b('Aiutalo a cercare il gettone, senza giocare',()=>invia('aiuta')));
 area.append(b('Torna fra i banchi',()=>invia('mercato')));

 }else if(f==='g14_carte'){
 const c=meta.carte;
 if(!c)area.append(p('Sto recuperando la partita salvata…'),b('Ricarica le carte',aggiorna));
 else{
 const attiva=c.stato==='gioca',mezzo=n=>String(n/2).replace('.',',');
 area.append(p('Mano '+c.mano+' · Mani vinte: tu '+c.vinte+' — banco '+c.perse+'. Vince la sfida chi conquista due mani.'),mano('Le tue carte · totale '+mezzo(c.totale),c.giocatore),mano(attiva?'Il banco · carte coperte':'Il banco · totale '+mezzo(c.totale_banco),c.banco,attiva));
 if(attiva)area.append(p('Puoi chiedere un’altra carta oppure fermarti. Le figure valgono mezzo punto; superando sette e mezzo perdi la mano.'),b('Chiedi carta',()=>invia('carta')),b('Stai',()=>invia('stai')));
 else{
 const testo=c.totale>15?'Hai superato sette e mezzo. La mano va al banco.':c.totale_banco>15?'Il banco ha superato sette e mezzo. Vinci la mano.':c.totale===c.totale_banco?'Avete lo stesso totale: come concordato, a parità vince il banco.':c.esito==='vittoria'?'Il tuo totale è più vicino a sette e mezzo: vinci la mano.':'Il banco si avvicina di più a sette e mezzo e vince la mano.';
 area.append(p(testo));
 if(c.stato==='finita')area.append(p(c.vinte>=2?'Hai vinto la sfida e raccolto le quattro monete della posta. Il giocatore ti indicherà dove cercare la restauratrice.':'Hai perso la sfida e le due monete della posta. Puoi ancora ottenere l’indicazione cercando il gettone.'),b('Lascia il tavolo da gioco',()=>invia('chiudi_carte')));
 else area.append(b('Gioca la prossima mano',()=>invia('prossima_mano')));
 }
 }
 }else if(f==='g14_cartello'){
 area.append(p('Dietro i banchi delle stoffe trovi la tenda rattoppata, ma il banco è chiuso. Un cartello è appeso al telo:'),p('«Sono dove le cose rotte aspettano una seconda occasione.»'));
 const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input'),submit=document.createElement('button');label.textContent='Dove vai a cercarla?';input.type='text';input.maxLength=300;input.required=true;input.autocomplete='off';input.id='destinazione-fiorenza';label.htmlFor=input.id;submit.type='submit';submit.textContent='Vai a cercarla';submit.disabled=busy;input.disabled=busy;form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();const t=input.value.trim();if(t)invia('destinazione',t)});area.append(form);
 if((g.errori_ricerca||0)>=3){area.append(p('Se vuoi un indizio, cerca gli aiuti della giornata 14 sulle pagine degli Spisotti.'));for(const [title,url] of [['Facebook degli Spisotti','https://www.facebook.com/profile.php?id=61594558125926'],['Instagram degli Spisotti','https://www.instagram.com/glispisotti/']]){const link=document.createElement('a');link.textContent=title;link.href=url;link.target='_blank';link.rel='noopener noreferrer';area.append(link)}}
 area.append(b('Torna a osservare i banchi',()=>invia('indietro_cartello')));
 }else if(f==='g14_recupero'){
 const gr=meta.griglia;
 area.append(p('Il gettone è rotolato sul pavimento ingombro di paglia e teli. Cerca senza urtare i dieci oggetti fragili nascosti. I numeri indicano quanti oggetti fragili si trovano nelle otto caselle vicine.'));
 if(!gr)area.append(p('Sto recuperando la ricerca salvata…'),b('Ricarica la griglia',aggiorna));
 else{
 const attiva=['attesa','in_corso'].includes(gr.stato),grid=document.createElement('div');grid.className='griglia-gettone14';grid.setAttribute('role','group');grid.setAttribute('aria-label','Ricerca del gettone: nove righe per nove colonne');
 area.append(p('Caselle sicure esplorate: '+gr.aperte+' / '+gr.totale_sicure+' · Segni: '+gr.segnate+' / '+gr.totale_fragili));
 if(gr.stato==='attesa')area.append(p('Scegli da dove cominciare: la prima apertura è sempre sicura.'));
 for(const cell of gr.caselle){
 const testo=cell.fragile?'✕':cell.segnata?'⚑':cell.aperta?(cell.numero?String(cell.numero):'·'):'';
 const btn=b(testo,()=>invia(modoGriglia==='segna'?'segna_casella':'apri_casella',String(cell.indice)));btn.className='casella-gettone14'+(cell.aperta?' aperta':'')+(cell.segnata?' segnata':'')+(cell.fragile?' fragile':'')+(cell.colpita?' colpita':'');btn.dataset.indice=String(cell.indice);
 btn.disabled=busy||!attiva||cell.aperta;
 btn.setAttribute('aria-label','Riga '+(Math.floor(cell.indice/9)+1)+', colonna '+(cell.indice%9+1)+': '+(cell.fragile?'oggetto fragile':cell.segnata?'segnata come sospetta':cell.aperta?(cell.numero?cell.numero+' oggetti fragili vicini':'nessun oggetto fragile vicino'):'da esplorare'));
 btn.addEventListener('contextmenu',e=>{e.preventDefault();if(!busy&&attiva&&!cell.aperta)invia('segna_casella',String(cell.indice))});grid.append(btn);
 }
 area.append(grid);
 if(attiva){const comandi=document.createElement('div');comandi.className='comandi-gettone14';for(const [id,t] of [['esplora','Esplora'],['segna','Segna']]){const btn=b(t,()=>{modoGriglia=id;disegna()});btn.setAttribute('aria-pressed',String(modoGriglia===id));comandi.append(btn)}area.append(comandi,p(modoGriglia==='segna'?'Modalità Segna: tocca una casella per mettere o togliere un segno.':'Modalità Esplora: tocca una casella per scoprirla. Se è segnata, togli prima il segno.'))}
 if(gr.stato==='persa')area.append(p('Urti un oggetto fragile: un coccio si rompe e il mercante protesta. Non perdi monete né punti vita. Puoi ricominciare la ricerca.'),b('Ricomincia la ricerca',()=>{modoGriglia='esplora';invia('ricomincia_griglia')}));
 if(gr.stato==='vinta')area.append(p('Hai esplorato tutte le caselle sicure. Fra la paglia ritrovi il gettone, senza aver rotto nulla.'),b('Restituisci il gettone',()=>invia('consegna_gettone')));
 }
 area.append(b('Torna fra i banchi',()=>invia('mercato')));
 }else if(f==='g14_allieva'){
 area.append(p('Sotto una tenda rattoppata, una donna ripara un piccolo pendente. Sul banco ha disposto pochi strumenti e oggetti smontati. Appena ti avvicini, posa le pinzette.'));
 if(!g.allieva_conosciuta)area.append(b('Chiedile se conosceva Fiorenza',()=>invia('fiorenza')));
 area.append(b('Osserva il suo lavoro',()=>invia('attrezzi')));
 if(g.allieva_conosciuta&&!g.appuntamento)area.append(b('Raccontale dell’incarico e chiedi dell’amuleto',()=>invia('incarico')));
 if(g.appuntamento)area.append(p('Vi siete dati appuntamento per domani. Prima di affidarti l’amuleto, vuole metterti alla prova.'),b('Saluta e termina il racconto di oggi',()=>invia('fine')));
 area.append(b('Torna fra i banchi',()=>invia('mercato')));
 }else if(f==='fine_giorno14')area.append(p('Hai trovato l’allieva di Fiorenza. Domani tornerai al suo banco per la prova.'),b('Termina giornata',()=>window.FineGiornata.apri()));
 if(errore)area.append(p(errore));
 }
 async function aggiorna(){const n=++versione;if(api.dati?.giorno_corrente!==14){disegna();return}try{const r=await api.rpc('gioco_giorno14',{p_codice:api.codice});if(n!==versione)return;meta=r;errore=''}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoQuattordici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
