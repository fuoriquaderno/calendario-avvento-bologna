(() => {
 'use strict';const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno20';area.hidden=true;main.append(area);
 const ns='http://www.w3.org/2000/svg',mirrorPositions=[[2,5],[2,1],[6,1],[6,4],[4,4]],initial=[String.fromCharCode(92),'/','/',String.fromCharCode(92),'/'];
 let busy=false,errore='',chiave='',revision=0,specchi=null,zoom=1;
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,fn)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',fn);return e};
 const crea=(tag,attrs={})=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e};
 const mappa=()=>window.SetteChiese?.apri();
 async function invia(azione,testo=null){if(busy)return null;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno20',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(!r)errore=window.BorsaNuova.errore||'Non riesco a completare l’azione. Riprova.';if(r?.racconto?.testo)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'});return r}catch(e){errore=e.message;return null}finally{busy=false;disegna();window.SetteChiese?.aggiorna?.()}}
 const passaggio=n=>invia('passaggio',String(n));
 function figura(nome,alt){const f=document.createElement('figure');f.className='immagine-schermata';const i=document.createElement('img');i.src=api.risorsa('images/'+nome);i.alt=alt;i.decoding='async';i.addEventListener('error',()=>f.hidden=true);f.append(i);area.append(f)}
 function ombre(g){
 area.append(p('Tre figure chiedono aiuto da tre soglie apparentemente identiche. La voce insiste: «La terza. Apri la terza e fidati di me». La lampada sul pavimento può essere spostata.'));
 const quadro=crea('svg',{viewBox:'0 0 900 340',role:'img','aria-label':'Tre figure numerate I, II e III. Osserva le ombre mentre sposti la lampada.'});quadro.classList.add('apparizioni-sole20');
 for(let n=1;n<=3;n++){
 const x=100+(n-1)*300;quadro.append(crea('path',{d:'M'+x+' 272 V90 Q'+(x+50)+' 10 '+(x+100)+' 90 V272',fill:'none',stroke:'#79502c','stroke-width':3}));
 const persona=crea('g',{transform:'translate('+(x+50)+' 175)'});persona.append(crea('circle',{cx:0,cy:-50,r:20,fill:'#79502c','fill-opacity':.12,stroke:'#79502c','stroke-width':2}),crea('path',{d:'M-15 -29 Q-32 6 -37 75 L37 75 Q32 6 15 -29 Z',fill:'#79502c','fill-opacity':.12,stroke:'#79502c','stroke-width':2}));
 if(n===2&&g.lampada){const dx=g.lampada===1?85:-85;persona.append(crea('path',{d:'M-17 77 Q'+dx+' 88 '+(dx*1.5)+' 100 L17 82 Z',fill:'#593a25','fill-opacity':.5,'aria-hidden':'true'}))}
 quadro.append(persona);const label=crea('text',{x:x+50,y:315,'text-anchor':'middle',fill:'#593a25','font-size':26});label.textContent=['I','II','III'][n-1];quadro.append(label);
 }
 const luce=crea('g',{transform:'translate('+(g.lampada===1?65:g.lampada===3?835:450)+' 310)'});luce.append(crea('path',{d:'M-18 0 H18 L10 10 H-10 Z M0 0 Q-13 -20 0 -32 Q13 -20 0 0',fill:'#ad7136',stroke:'#79502c','stroke-width':2}));quadro.append(luce);area.append(quadro);
 const scelte=document.createElement('div');scelte.className='figure-sole20';for(let n=1;n<=3;n++)scelte.append(b('Avvicinati alla figura '+['I','II','III'][n-1],()=>invia('figura',String(n))));area.append(scelte);
 area.append(b('Sposta la lampada a sinistra',()=>invia('lampada','1')),b('Sposta la lampada a destra',()=>invia('lampada','3')));
 if(g.lampada){const nota=p(g.lampada===1?'La lampada è a sinistra: osserva dove si allunga l’ombra.':'La lampada è a destra: confronta la direzione dell’ombra.');nota.setAttribute('role','status');area.append(nota)}
 if(g.ombra_verificata)area.append(p('Hai confrontato le ombre da due posizioni diverse. Puoi ora provare a portare la luce a un sigillo.'),b('Esamina la tavola degli specchi',()=>invia('specchi')));
 if((g.tentativi_figure||0)>=3&&!g.ombra_verificata)area.append(b('Chiedi un suggerimento',()=>invia('aiuto_ombre')));
 if(g.aiuto_ombre)area.append(p('Cambia la posizione della luce, osserva il pavimento e ripeti dall’altro lato.'));
 area.append(b('Torna a esplorare la chiesa',()=>invia('torna')));
 }
 function traccia(o){
 let x=0,y=5,dx=1,dy=0;const punti=[[x,y]],visti=new Set();
 for(let step=0;step<160;step++){
 const k=[x,y,dx,dy].join(':');if(visti.has(k))return{punti,bersaglio:0,esito:'circuito'};visti.add(k);x+=dx;y+=dy;
 if(x<0||x>8||y<0||y>6)return{punti,bersaglio:0,esito:'fuori'};punti.push([x,y]);
 if(y===0&&[1,4,6].includes(x))return{punti,bersaglio:x===1?1:x===4?2:3,esito:'sigillo'};
 if([[3,3],[5,2],[7,3],[4,6],[2,6]].some(([a,b])=>x===a&&y===b))return{punti,bersaglio:0,esito:'ostacolo'};
 let simbolo=x===1&&y===1?String.fromCharCode(92):null;const index=mirrorPositions.findIndex(([a,b])=>x===a&&y===b);if(index>=0)simbolo=o[index];
 if(simbolo){const a=dx,b=dy;if(simbolo==='/'){dx=-b;dy=-a}else{dx=b;dy=a}}
 }return{punti,bersaglio:0,esito:'circuito'};
 }
 function tavola(g){
 if(!specchi)specchi=[...(g.orientamenti||initial)];
 area.append(p('Ruota gli specchi per portare il raggio a un sigillo. I blocchi fermano la luce; lo specchio segnato F è fisso. Ricorda ciò che hai osservato sulle ombre.'));
 const comandi=document.createElement('div');comandi.className='comandi-specchi20';comandi.append(b(zoom===1?'Ingrandisci tavola':'Adatta la tavola',()=>{if(busy)return;zoom=zoom===1?2:1;disegna()}));area.append(comandi);
 const scroll=document.createElement('div');scroll.className='scorri-specchi20';const tela=document.createElement('div');tela.className='tavola-specchi20';tela.style.width=(zoom*100)+'%';const svg=crea('svg',{viewBox:'0 0 900 700',role:'group','aria-label':'Percorso della luce: cinque specchi ruotabili e tre sigilli.'});svg.classList.add('schema-specchi20');
 const px=x=>60+x*95,py=y=>65+y*95;svg.append(crea('rect',{x:14,y:14,width:872,height:672,rx:14,fill:'none',stroke:'#79502c','stroke-width':2}));
 for(let y=0;y<=6;y++)for(let x=0;x<=8;x++)svg.append(crea('circle',{cx:px(x),cy:py(y),r:1.6,fill:'#79502c','fill-opacity':.35,'pointer-events':'none'}));
 for(const[x,y]of [[3,3],[5,2],[7,3],[4,6],[2,6]])svg.append(crea('rect',{x:px(x)-28,y:py(y)-28,width:56,height:56,rx:3,fill:'#79502c','fill-opacity':.18,stroke:'#79502c','stroke-width':2}));
 for(const[x,n]of [[1,1],[4,2],[6,3]]){svg.append(crea('circle',{cx:px(x),cy:py(0),r:24,fill:'none',stroke:'#79502c','stroke-width':3}));const t=crea('text',{x:px(x),y:py(0)+8,'text-anchor':'middle','font-size':25,fill:'#593a25'});t.textContent=['I','II','III'][n-1];svg.append(t)}
 const raggio=traccia(specchi);svg.append(crea('polyline',{points:raggio.punti.map(([x,y])=>px(x)+','+py(y)).join(' '),fill:'none',stroke:'#a3501a','stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round','pointer-events':'none'}));
 svg.append(crea('circle',{cx:px(0),cy:py(5),r:15,fill:'#b88245',stroke:'#79502c','stroke-width':2}));const source=crea('text',{x:px(0),y:py(5)+42,'text-anchor':'middle','font-size':20,fill:'#593a25'});source.textContent='Luce';svg.append(source);
 const fisso=crea('g',{transform:'translate('+px(1)+' '+py(1)+')','aria-label':'Specchio fisso F'});fisso.append(crea('line',{x1:-23,y1:-23,x2:23,y2:23,stroke:'#79502c','stroke-width':7}),crea('rect',{x:-29,y:-29,width:58,height:58,fill:'none',stroke:'#79502c','stroke-dasharray':'4 5'}));const ft=crea('text',{x:35,y:-30,'font-size':20,fill:'#593a25'});ft.textContent='F';fisso.append(ft);svg.append(fisso);
 const ruota=n=>{if(busy)return;specchi[n]=specchi[n]==='/'?String.fromCharCode(92):'/';disegna()};
 mirrorPositions.forEach(([x,y],n)=>{const group=crea('g',{transform:'translate('+px(x)+' '+py(y)+')',role:'button',tabindex:busy?-1:0,'aria-disabled':busy?'true':'false','aria-label':'Ruota lo specchio '+(n+1)});group.style.cursor=busy?'default':'pointer';group.append(crea('circle',{r:34,fill:'transparent','pointer-events':'all'}));group.append(crea('line',{x1:-24,y1:specchi[n]==='/'?24:-24,x2:24,y2:specchi[n]==='/'?-24:24,stroke:'#593a25','stroke-width':8,'stroke-linecap':'round','pointer-events':'none'}));const t=crea('text',{x:34,y:35,'font-size':23,fill:'#593a25','pointer-events':'none'});t.textContent=String(n+1);group.append(t);group.addEventListener('click',()=>ruota(n));group.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();ruota(n)}});svg.append(group)});
 tela.append(svg);scroll.append(tela);area.append(scroll);const bottoni=document.createElement('div');bottoni.className='rotazioni-specchi20';for(let n=0;n<5;n++)bottoni.append(b('Ruota '+(n+1),()=>ruota(n)));area.append(bottoni,b('Prova il raggio',()=>invia('raggio',JSON.stringify(specchi))));
 if((g.errori_specchi||0)>=3)area.append(b('Chiedi un suggerimento',()=>invia('aiuto_specchi')));
 if(g.aiuto_specchi)area.append(p('Segui la luce uno specchio alla volta. Il sigillo deve appartenere alla figura che proiettava l’ombra.'));
 area.append(b('Torna a esplorare la chiesa',()=>invia('torna')));
 }
 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},g=s.g20||{},f=s.fase||'',valido=d?.giorno_corrente===20&&(f.startsWith('g20_')||f==='fine_giorno20');area.replaceChildren();area.hidden=!valido;main.classList.toggle('giorno20-attivo',!!valido);if(!valido)return;
 const k=api.codice+':'+d.tentativo;if(k!==chiave){chiave=k;specchi=null;zoom=1;errore=''}
 const luogo=Number(String(d.luogo_attuale||'').split('_').pop())||4;figura('chiesa'+luogo+'.png',luogo===4?'La Chiesa del Sole, Santi Vitale e Agricola, con il sarcofago di San Vitale.':luogo===3?'La Chiesa del Serpente.':luogo===2?'La Chiesa del Trifoglio.':'La Chiesa della Stella.');
 const h=document.createElement('h2');h.textContent=({g20_serpente:'Verso la quarta chiesa',g20_ritorno:'Una via già percorsa',g20_navata:'La Chiesa del Sole',g20_apparizioni:'Tre figure nella luce',g20_specchi:'La tavola degli specchi',g20_custode:'Il custode del Sole',g20_riparo:'Dietro il sarcofago',g20_dopocustode:'Ciò che il custode sorvegliava',fine_giorno20:'Il passaggio verso il Cortile di Pilato'})[f]||'La Chiesa del Sole';area.append(h);
 if(d.morto){area.append(p('Il custode ti ha sopraffatto. Puoi ripartire dal checkpoint della giornata.'),b('Riparti dal checkpoint',()=>api.esegui(()=>api.riprendiCheckpoint(),area)));return}
 const pending=window.BorsaNuova.pending?.();if(pending){area.append(p('Recupera l’esito dell’ultima azione prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r?.racconto)window.Messaggi.mostra(r.racconto);disegna()}));return}
 if(d.giornata_completata){area.append(p('La giornata 20 è confermata. Il Cortile di Pilato ti aspetta.'));return}
 if(['g20_serpente','g20_ritorno'].includes(f))area.append(p('Hai ritrovato la tua misura e aperto la porta di Vitale e Agricola. Ora puoi scoprire ciò che custodisce la quarta chiesa.'),window.SetteChiese.comandoNavigazione(b('Raggiungi Santi Vitale e Agricola',()=>passaggio(4))),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 else if(f==='g20_navata'){
 area.append(p('Le colonne incorniciano un piccolo altare. Il sarcofago scolpito occupa un lato della navata; vicino trovi una lampada e due recipienti. Il sole inciso nella pietra è il segno di Alano.'));
 if(d.inventario?.includes('pagina_alano'))area.append(p('Conservi ancora la pagina di Alano: «La soluzione è sempre la scienza».'));
 area.append(window.SetteChiese.comandoNavigazione(b('Prova il passaggio verso il Cortile di Pilato',()=>passaggio(5))),b(g.custode_liberato?'Torna al luogo del sigillo':'Osserva la parete davanti a te',()=>invia('apparizioni')));
 for(const[id,t]of [['sarcofago','Esamina il sarcofago'],['capitelli','Osserva i capitelli'],['recipienti','Esamina i recipienti'],['finestra','Avvicinati alla finestra'],['altare','Guarda dietro l’altare']])area.append(b(t,()=>invia('esplora',id)));
 if(g.pozione_vista&&!g.pozione_presa)area.append(b('Prendi la pozione media',async()=>{if(await window.ConfermaPergamena('Vuoi raccogliere la pozione media? Occupa il peso previsto nella Borsa.',{titolo:'La custodia dietro l’altare',conferma:'Prendi la pozione',annulla:'Lasciala lì'}))await invia('prendi_pozione')}));
 if(g.ombra_verificata&&!g.custode_liberato)area.append(b('Torna alla tavola degli specchi',()=>invia('specchi')));area.append(window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 }else if(f==='g20_apparizioni')ombre(g);
 else if(f==='g20_specchi')tavola(g);
 else if(f==='g20_custode')area.append(p('La luce ha sciolto il sigillo. Il custode è uscito dalla soglia e prepara un incanto. Ora la figura è reale e può essere affrontata.'),b('Affronta il custode',()=>window.AzioniGioco.apriScontro()));
 else if(f==='g20_riparo')area.append(p('Ti sei sottratto ai bagliori del custode. Dal riparo dietro il sarcofago puoi recuperare le forze. Le ferite che hai inflitto alla figura rimangono.'),b('Torna ad affrontare il custode',()=>invia('riprendi_custode')),b('Apri la Borsa',()=>$('apri-borsa')?.click()));
 else if(f==='g20_dopocustode'){
 area.append(p('Il custode è immobile e le immagini ingannevoli sono svanite. Nel punto che sorvegliava distingui un piccolo alloggiamento nella pietra.'),b('Esamina l’alloggiamento',()=>invia('esamina_custodia')));
 if(g.custodia_vista&&!g.chiave_presa)area.append(p('Il foglio di Alano dice: «Il pericolo cominciò quando smettemmo di verificare le risposte, perché erano quasi sempre giuste».'),b('Prendi la chiave con il sole',()=>invia('prendi_chiave')));if(g.chiave_presa)area.append(window.SetteChiese.comandoNavigazione(b('Controlla il passaggio verso il cortile',()=>passaggio(5))));
 }else if(f==='fine_giorno20')area.append(p('Hai verificato le apparenze, seguito il percorso della luce e superato il custode. Il passaggio al Cortile di Pilato è aperto; lo attraverserai domani.'),window.FineGiornata.pulsante(b),window.SetteChiese.comandoNavigazione(b('Apri la mappa delle Sette Chiese',mappa)));
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 window.SetteChiese.posizionaNavigazione(area);
 }
 async function aggiorna(){const n=++revision;disegna();if(api.dati?.giorno_corrente!==20)return;try{await api.rpc('gioco_giorno20',{p_codice:api.codice});if(n===revision)errore=''}catch(e){if(n===revision){errore=e.message;disegna()}}}
 window.Giorno20={aggiorna,passaggio,occupato:()=>busy};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
