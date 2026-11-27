(() => {
 'use strict';
 const api=window.Partita;if(!document.getElementById('schermata-gioco'))return;
 const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno16';area.hidden=true;main.append(area);
 let busy=false,errore='',versione=0,meta={};
 const p=t=>{const e=document.createElement('p');e.textContent=t;return e};
 const b=(t,f)=>{const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e};
 const figura=document.createElement('figure');figura.className='immagine-schermata';const img=document.createElement('img');img.decoding='async';figura.append(img);
 img.addEventListener('error',()=>{if(img.dataset.fallback&&img.src!==img.dataset.fallback)img.src=img.dataset.fallback;else figura.hidden=true});img.addEventListener('load',()=>figura.hidden=false);
 function illustrazione(nome,alt,fallback='costruttori.png'){const src=api.risorsa('images/'+nome);img.dataset.fallback=api.risorsa('images/'+fallback);if(img.getAttribute('src')!==src){figura.hidden=false;img.src=src}img.alt=alt;area.append(figura)}

 // La pianta ricevuta da Iliano resta consultabile dalla Borsa anche nei giorni seguenti.
 const possiedeMappa=()=>Array.isArray(api.dati?.inventario)&&api.dati.inventario.includes('mappa_sette_chiese');
 const apriPianta=document.createElement('button');apriPianta.type='button';apriPianta.textContent='Mappa di Iliano';apriPianta.hidden=true;apriPianta.style.font='inherit';document.getElementById('borsa-elenco').before(apriPianta);
 const pianta=document.createElement('dialog');pianta.className='avviso-codice borsa-dialog';pianta.setAttribute('aria-labelledby','titolo-pianta-sette');pianta.style.width='1000px';pianta.style.maxWidth='calc(100vw - 24px)';
 const cima=document.createElement('div'),centro=document.createElement('div'),fondo=document.createElement('div');cima.className='scroll-top';fondo.className='scroll-bottom';centro.className='scroll-middle';
 const titoloPianta=document.createElement('h2');titoloPianta.id='titolo-pianta-sette';titoloPianta.textContent='La mappa di Iliano';
 const disegnoPianta=document.createElement('img');disegnoPianta.className='immagine-pianta-reale';disegnoPianta.alt='Planimetria reale delle Sette Chiese, con il presbiterio e la cripta sotto l’altare.';disegnoPianta.style.cssText='display:block;width:auto;height:auto;max-width:100%;max-height:60dvh;margin:0 auto';
 const grande=document.createElement('a');grande.target='_blank';grande.rel='noopener noreferrer';grande.textContent='Apri l’immagine a dimensione intera';grande.style.font='inherit';
 const chiudiPianta=document.createElement('button');chiudiPianta.type='button';chiudiPianta.textContent='Chiudi mappa';chiudiPianta.style.font='inherit';chiudiPianta.addEventListener('click',()=>pianta.close());
 const pergamenaVuota=document.createElement('img');pergamenaVuota.src=api.risorsa('images/pergamena_sette_simboli.png');pergamenaVuota.alt='I sette simboli del Consiglio disposti in cerchio, come sulla copertina del tomo; non compare alcuna pianta.';pergamenaVuota.style.cssText='display:block;width:min(100%,440px);height:auto;margin:16px auto';
 const notaPianta=document.createElement('p');
 centro.append(titoloPianta,pergamenaVuota,disegnoPianta,notaPianta,grande,chiudiPianta);pianta.append(cima,centro,fondo);document.body.append(pianta);
 function aggiornaPianta(){
 const attiva=api.dati?.giorno_corrente>=17&&api.dati?.interazioni?.mappa_iliano_attiva===true;
 pergamenaVuota.hidden=attiva;pergamenaVuota.style.display=attiva?'none':'block';
 disegnoPianta.hidden=!attiva;disegnoPianta.style.display=attiva?'block':'none';
 grande.hidden=!attiva;grande.style.display=attiva?'inline-block':'none';
 if(attiva){disegnoPianta.src=api.risorsa('images/map_reale.png');grande.href=api.risorsa('images/map_reale.png')}else{disegnoPianta.removeAttribute('src');grande.removeAttribute('href')}
 notaPianta.textContent=attiva?'Sulla pergamena è comparsa la pianta del complesso, con gli ambienti numerati.':'Sulla pergamena compaiono soltanto i sette simboli disposti in cerchio, come sulla copertina del tomo. La mappa si rivelerà quando entrerai nella dimensione alternativa.';
 }
 function mostraPianta(){if(!possiedeMappa())return;if(api.dati?.interazioni?.dimensione_alternativa&&window.SetteChiese){window.SetteChiese.apri();return}aggiornaPianta();if(!pianta.open)pianta.showModal()}
 apriPianta.addEventListener('click',mostraPianta);
 function ripassoRito(){window.Messaggi.mostra({titolo:'Le istruzioni di Iliano',testo:'Iliano ricorda queste parole: «A destra dell’entrata che sei solito passare». Per aprire la soglia, traccia sul muro con il dito sette piccoli cerchi collegati da una linea. Mentre li tracci, pronuncia: «Sette dimore, una sola soglia».',pulsante:'Ho capito'})}

 function risposta(r){if(r?.racconto?.testo)window.Messaggi.mostra({...r.racconto,pulsante:'Continua'})}
 async function invia(azione,testo=null){if(busy)return;busy=true;errore='';disegna();try{const r=await window.BorsaNuova.esegui('gioco_giorno16',{p_codice:api.codice,p_azione:azione,p_testo:testo,p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});if(r){meta=r;risposta(r)}else errore=window.BorsaNuova.errore||''}catch(e){errore=e.message}finally{busy=false;disegna()}}
 const mappa=()=>window.LuoghiGioco.apri();
 function disegna(){
 const d=api.dati,s=d?.stato_partita||{},f=s.fase||'',g=s.g16||{},valida=d?.giorno_corrente===16&&(!d.morto||['g16_arresto','g16_facchino_sconfitto'].includes(f))&&(f.startsWith('g16_')||f==='fine_giorno16')&&!(f==='fine_giorno16'&&d.luogo_attuale!=='santo_stefano'),piena=valida&&f!=='g16_citta';
 main.classList.toggle('giorno16-attivo',!!piena);area.hidden=!valida;area.replaceChildren();if(!valida)return;
 if(piena){const chiese=['g16_chiese','fine_giorno16'].includes(f),iliano=f.startsWith('g16_iliano')||f==='g16_verso_chiese',locanda=['g16_corridoio','g16_esito_gatto'].includes(f),strada=['g16_strada','g16_passeggiata','g16_attesa_iliano'].includes(f),facchino=f.startsWith('g16_facchino')||f==='g16_arresto';illustrazione(chiese?(f==='fine_giorno16'?'santo.stefano.png':'santo_stefano.png'):iliano?'iliano.png':facchino?'facchino.png':locanda?'locanda.png':strada?'notte.png':'reenzo.png',chiese?(f==='fine_giorno16'?'Piazza Santo Stefano deserta sotto la luna.':'Piazza Santo Stefano con passanti e monaci benedettini.'):iliano?'Iliano all’Osteria del Sole.':facchino?'Il facchino incantato nella rimessa, con l’apprendista al riparo.':locanda?'La locanda prima dell’alba.':strada?'Bologna ancora silenziosa.':'Il voltone all’alba.','reenzo.png')}
 const h=document.createElement('h2');h.textContent=({g16_corridoio:'Prima dell’alba',g16_esito_gatto:g.gatto_evitato?'Un passo silenzioso':'Un risveglio rumoroso',g16_strada:'Bologna prima del giorno',g16_voltone:'Il voltone deserto',g16_domande:'La voce fra le pietre',g16_rimando:'Chi ti ha mandato',g16_citta:'Le strade all’alba',g16_passeggiata:'È ancora presto',g16_facchino_soglia:'Un lavoro senza fine',g16_facchino_scelta:'Il facchino incantato',g16_facchino_prova:'Sciogliere l’incanto',g16_facchino_attacco:'Affrontare il facchino',g16_facchino_sconfitto:'Travolto dal facchino',g16_facchino_fuori:'Fuori dalla rimessa',g16_facchino_salvo:'Finalmente immobile',g16_attesa_iliano:'La città si sveglia',g16_arresto:'Le guardie ti portano via',g16_iliano_attesa:'Iliano non è ancora arrivato',g16_iliano_arrivo:'Di nuovo da Iliano',g16_iliano_dialogo:'Un nascondiglio diverso',g16_iliano_rito:'La soglia nascosta',g16_iliano_ripasso:'Iliano',g16_verso_chiese:'La pergamena di Iliano',g16_chiese:'Davanti a Santo Stefano',fine_giorno16:'Quando la piazza si svuota'})[f]||'Il sedicesimo giorno';area.append(h);
 const pending=window.BorsaNuova.pending();if(pending){area.append(p('Recupera il risultato prima di continuare.'),b('Recupera il risultato',async()=>{const r=await window.BorsaNuova.esegui(pending.nomeRpc,pending.args);if(r){meta=r;risposta(r)}disegna()}));return}
 if(f==='g16_corridoio'){
 area.append(p('Esci dalla stanza che è ancora buio. La locanda dorme; dal piano di sotto arriva soltanto l’odore spento del focolare. Cerchi di ricordare quali assi del corridoio scricchiolino di meno.'),p('Una piccola ombra ti attraversa la strada proprio mentre appoggi il piede: il gatto della locanda ha scelto lo stesso momento per la sua passeggiata.'),b('Evita il gatto — tiro di Agilità',()=>invia('gatto')));
 }else if(f==='g16_esito_gatto'){
 if(s.dado_g16)area.append(p('Il tuo tiro di Agilità: '+(s.dado_g16.valori||[]).join(' + ')+(s.dado_g16.bonus?' '+(s.dado_g16.bonus>0?'+ ':'− ')+Math.abs(s.dado_g16.bonus):'')+' = '+s.dado_g16.totale));
 if(g.gatto_evitato)area.append(p('Ti fermi appena in tempo e lasci passare il gatto. Lui solleva la coda, del tutto indifferente alla tua impresa, e scompare verso le scale. Raggiungi la porta senza svegliare nessuno.'));
 else area.append(p('Cerchi di scansarlo, ma il piede ti scivola e finisci sul pavimento con un tonfo. Il gatto balza via e ti guarda da una distanza prudente.'),p('Una porta si spalanca. La moglie del locandiere appare con uno scialle sulle spalle: «Ma ti pare l’ora di far tremare tutta la casa? La porta è da quella parte! E lascia stare il gatto, che lui sa dove mette le zampe!»'),p('Ti rialzi, raccogli quel che resta della tua dignità e raggiungi l’uscita sotto il suo sguardo severo.'));
 area.append(b('Esci dalla locanda',()=>invia('esci')));
 }else if(f==='g16_strada'){
 area.append(p('Bologna sembra trattenere il respiro. Le strade sono vuote, le imposte ancora serrate; sotto i portici il rumore dei tuoi passi corre più lontano del solito. L’aria fredda ti pizzica il viso e ogni respiro si scioglie in una piccola nuvola.'),p('Dai tetti sale qualche filo di fumo. In fondo a una via una finestra si accende, poi torna tutto immobile. Sopra le torri il cielo ha appena cominciato a perdere il nero della notte, lasciando una striscia più chiara verso oriente.'),p('Natale si avvicina. Non sapresti dire se sia il freddo, l’attesa o il silenzio, ma la città ha qualcosa di quasi magico anche senza incanti. Per una volta non hai fretta di attraversarla.'),b('Prosegui verso il voltone',()=>invia('voltone')),window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(f==='g16_voltone'){
 area.append(p('Arrivi sotto il voltone mentre la prima luce raggiunge gli archi. Gli angoli sono vuoti. Non c’è nessuno con cui scambiare sussurri, nessuno che ti risponda per gioco.'),p('Ti avvicini alla muratura. Nel silenzio senti il fruscio dei tuoi vestiti e, lontano, una porta che viene aperta. Poi una voce bassa, vicinissima: «Sei tornato.»'),b('Accostati all’angolo e parla',()=>invia('accostati')));
 }else if(f==='g16_domande'){
 area.append(p('All’angolo opposto non c’è nessuno. Eppure la voce è lì, fra le pietre, in attesa della tua domanda.'));
 const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('textarea'),submit=document.createElement('button');label.textContent='Che cosa chiedi alla voce?';input.id='domanda-re-g16';label.htmlFor=input.id;input.maxLength=500;input.rows=3;input.required=true;input.disabled=busy;submit.type='submit';submit.textContent='Domanda';submit.disabled=busy;form.append(label,input,submit);form.addEventListener('submit',e=>{e.preventDefault();const t=input.value.trim();if(t)invia('domanda',t)});area.append(form);
 if(s.risposta_g16?.testo){const rileggi=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Rileggi l’ultima risposta';rileggi.append(summary,p(s.risposta_g16.testo));area.append(rileggi)}
 if(g.aiuto_vecchina){const aiuti=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Gli aiuti degli Spisotti';aiuti.append(summary);for(const [nome,url] of [['Facebook','https://www.facebook.com/profile.php?id=61594558125926'],['Instagram','https://www.instagram.com/glispisotti/']]){const link=document.createElement('a');link.textContent=nome;link.href=url;link.target='_blank';link.rel='noopener noreferrer';aiuti.append(link)}area.append(aiuti)}
 area.append(window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(f==='g16_rimando'){
 area.append(p('Santo Stefano. Le Sette Chiese. Hai finalmente un luogo da cui cominciare, ma il re ti ha rimandato a chi ti ha affidato la ricerca.'),p('Devi tornare da Iliano: c’è qualcosa che non ti ha ancora raccontato.'),b('Passeggia in attesa che la città si svegli',()=>invia('passeggia')));
 }else if(f==='g16_citta'){
 area.append(p(g.rimando_iliano?'Il re ti ha rimandato a Iliano. Devi tornare da lui per sapere come varcare la soglia.':'La città comincia appena a svegliarsi. Puoi raggiungere il voltone per ascoltare la voce.'),window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 if(g.rimando_iliano&&!g.facchino_esito)area.append(b('Passeggia per la città',()=>invia('passeggia')));
 if(!g.rimando_iliano)area.append(b('Raggiungi il voltone',()=>invia('voltone')));
 }else if(f==='g16_passeggiata'){
 area.append(p('È ancora troppo presto per bussare alla porta di Iliano. Riprendi a camminare. La luna impallidisce sopra i tetti; sotto i portici l’aria punge ancora e qualche bottega comincia ad aprire.'),p('Da una rimessa arriva un tonfo, poi un altro. Una voce giovane sussurra: «Ehi! C’è qualcuno? Non riesco a uscire!»'),b('Avvicinati alla rimessa',()=>invia('ascolta')),b('Continua la passeggiata',()=>invia('prosegui')));
 }else if(f==='g16_facchino_soglia'){
 area.append(p('Dalla porta socchiusa vedi casse, sacchi di farina e un grande servitore di legno. Solleva una cassa, la porta dall’altra parte della stanza e ne riprende subito un’altra. Un apprendista è rannicchiato dietro un banco.'),p('«È il facchino del padrone», ti spiega. «Gli ho detto di non fermarsi finché ogni cosa non fosse al suo posto. Ma quando sposta una cassa, quella accanto non gli va più bene! Ho cercato di richiamarlo e mi ha quasi schiacciato.»'),b('Entra e valuta cosa fare',()=>invia('entra_rimessa')),b('Non intervenire e prosegui',()=>invia('prosegui')));
 }else if(f==='g16_facchino_scelta'){
 area.append(p('Il facchino non sembra accorgersi di te. Le sue braccia continuano a obbedire a un ordine che non riesce a concludere. L’apprendista segue ogni suo movimento dal riparo del banco. «Non riesco più ad avvicinarmi. Ci ho provato, ma continua a spostare tutto!»'),b('Disattiva il facchino',()=>invia('disattiva')),b('Combatti il facchino',()=>invia('attacca')),b('Esci e prosegui',()=>invia('prosegui')));
 }else if(f==='g16_facchino_attacco'){
 area.append(p('Ti prepari ad affrontare il facchino. Le braccia di legno continuano a muovere casse e sacchi: dovrai trovare il momento per colpire.'),b('Inizia il combattimento',()=>window.AzioniGioco.apriScontro()));
 }else if(f==='g16_facchino_prova'){
 area.append(p('Devi raggiungere gli snodi e sciogliere i legami dell’incanto, mentre il facchino continua a spostare la merce. Ogni tentativo richiede tempo: se ti muovi male, le sue braccia possono colpirti.'),b('Prova a disattivare il facchino',()=>window.AzioniGioco.apriScontro()));
 }else if(f==='g16_facchino_fuori'){
 area.append(p('Riprendi fiato fuori dalla rimessa. Dall’interno arrivano ancora i colpi delle casse. Puoi tornare ad aiutare l’apprendista oppure rinunciare.'),b('Rientra nella rimessa',()=>invia('entra_rimessa')),b('Prosegui per la città',()=>invia('prosegui')));
 }else if(f==='g16_facchino_salvo'){
 area.append(p('Il facchino resta fermo fra le casse, con le braccia abbassate. L’apprendista gli gira attorno, incredulo, poi corre ad aprire la porta al padrone.'),p('L’uomo ascolta il racconto, controlla che il suo servitore sia intero e ti porge cinque monete d’argento. «Hai salvato la merce e il ragazzo. Per l’ordine ci penseremo con calma.»'),p('Ricevi 5 monete d’argento e 3 XP. La ricompensa è già stata salvata.'),b('Saluta e riprendi la passeggiata',()=>invia('saluta_apprendista')));
 }else if(f==='g16_attesa_iliano'){
 area.append(p('Ora dalle botteghe arrivano voci e rumori di lavoro. La notte è finita: puoi tornare da Iliano e chiedergli ciò che il re ha lasciato in sospeso.'),window.LuoghiGioco.conPassante(b('Apri la mappa',mappa)));
 }else if(['g16_arresto','g16_facchino_sconfitto'].includes(f)){
 area.append(p(f==='g16_facchino_sconfitto'?'Una delle braccia di legno ti travolge. Cadi fra le casse e non riesci più a rialzarti.': 'Il facchino si schianta sul pavimento. Il padrone entra proprio mentre l’ultimo pezzo di legno smette di rotolare. Guarda il suo servitore distrutto, poi te. Non vuole sentire spiegazioni: chiama le guardie.'),p(f==='g16_facchino_sconfitto'?'Il combattimento è finito. Puoi ripartire dal checkpoint della giornata.':'Ti portano via sotto lo sguardo dell’apprendista. L’arresto interrompe la tua avventura e conta come una morte. Ripartirai dall’inizio della giornata, con gli oggetti e gli appunti del checkpoint.'),b('Riparti dal checkpoint',async()=>{if(busy)return;busy=true;disegna();try{const r=await api.rpc('gioco_riprendi_checkpoint',{p_codice:api.codice,p_tentativo:api.dati.tentativo});await api.applica(r,api.codice,{anima:true})}catch(e){errore=e.message}finally{busy=false;disegna()}}));

 }else if(f==='g16_iliano_attesa'){
 area.append(p('All’Osteria del Sole stanno ancora sistemando i tavoli. Iliano non è arrivato. Hai tempo per una passeggiata fra le botteghe che cominciano ad aprire.'),b('Passeggia per la città',()=>invia('passeggia')));
 }else if(f==='g16_iliano_arrivo'){
 area.append(p('Quando entri nell’Osteria del Sole, le conversazioni riempiono già la sala. Iliano è seduto al tavolo in fondo. Ti riconosce e sposta una coppa per farti posto.'),p('«Hai trovato qualcosa?»'),b('Raccontagli della voce e di Santo Stefano',()=>invia('incontra_iliano')));
 }else if(f==='g16_iliano_dialogo'){
 if(!g.pagina_iliano){area.append(p('Gli racconti del voltone, della voce che si è presentata come il re e della risposta che ti ha condotto alle Sette Chiese.'),p('«Conosco Santo Stefano», aggiungi. «Ci sono chiese, cortili, cappelle. Non mi risulta che ci sia alcun tomo del vostro Consiglio. Avete nascosto un passaggio segreto?»'),p('Iliano rimane qualche istante in silenzio. «Santo Stefano… No, questo non lo sapevo. Ma un’altra cosa posso dirtela.»'),b('Ascolta Iliano',()=>invia('ascolta_iliano')))}else{
 area.append(p('«Un passaggio segreto sarebbe stato troppo banale. Una pietra smossa, una porta murata: prima o poi qualcuno avrebbe trovato l’accesso. Anche soltanto per sbaglio.»'),p('Iliano si sporge verso di te. «Eravamo grandi maghi. Avevamo a disposizione la magia nuova. Abbiamo creato una dimensione separata dalla nostra e vi abbiamo nascosto il tomo.»'),p('«Quindi devo entrare in un’altra Bologna?»'),p("«In un luogo che si sovrappone al nostro senza essere raggiungibile da chiunque. Il ricordo del punto in cui lo avevamo legato alla città mi è stato tolto. Ricordo solo queste parole: a destra dell'entrata che sei solito passare»"),b('Chiedigli come entrare',()=>invia('ascolta_iliano')))}
 }else if(f==='g16_iliano_rito'){
 area.append(p('«Per aprire la soglia, traccia sul muro, con il dito, sette piccoli cerchi collegati da una linea. Mentre li tracci, pronuncia: “Sette dimore, una sola soglia”. Il segno aprirà l’accesso.»'),p("«I guardiani riconosceranno il rito. Sapranno che sei autorizzato a entrare e ti lasceranno passare.»"),p('Iliano prende una pergamena ripiegata e la distende sul tavolo. Sulla superficie sono tracciati soltanto sette simboli disposti in cerchio. Riconosci quelli della copertina del tomo.'),p('«Questa dovrebbe essere una mappa?» gli chiedi.'),p('«Lo è. Ma si rivela soltanto dentro la dimensione che abbiamo creato. Qui mostra soltanto i nostri sette simboli: per questo non poteva dirmi dove si trovasse il nascondiglio. Portala con te; quando avrai varcato la soglia, potrai leggerla.»'),p('Rigiri la pergamena. A parte i sette simboli, non c’è alcuna indicazione di luoghi o passaggi. La ripieghi con cura: finalmente sai dove cercare e come entrare.'),b('Prendi la mappa e saluta Iliano',()=>invia('ricevi_mappa')));
 }else if(f==='g16_verso_chiese'||f==='g16_iliano_ripasso'){
 area.append(p(f==='g16_iliano_ripasso'?'Iliano solleva lo sguardo dai suoi appunti. «Hai ciò che ti serve. A destra dell’entrata che sei solito passare, ricordalo.»':'Ripieghi la mappa e lasci l’osteria. Per raggiungere il nascondiglio devi cominciare da Santo Stefano.'));
 if(possiedeMappa())area.append(b('Guarda la mappa di Iliano',mostraPianta));
 area.append(b('Rileggi le istruzioni del rito',ripassoRito),window.LuoghiGioco.conPassante(b('Apri la mappa di Bologna',mappa)));
 }else if(f==='g16_chiese'){
 area.append(p('La piazza è attraversata da mercanti, passanti e monaci benedettini. Il portone della chiesa è aperto; qualcuno entra, altri si fermano a parlare davanti alla facciata.'),p('Riconosci il punto indicato da Iliano, a destra dell’ingresso. Ti basta avvicinarti al muro per tentare il rito.'));
 area.append(b('Prova a compiere il rito',()=>invia('prova_rito')),b('Rileggi le istruzioni',ripassoRito));
 if(possiedeMappa())area.append(b('Consulta la mappa di Iliano',mostraPianta));
 if(g.tentativi_diurni>=3)area.append(p('Fra chi entra e chi esce non riesci a restare vicino al muro senza essere notato.'),b('Aspetta che faccia buio',()=>invia('attendi_buio')));
 else area.append(window.LuoghiGioco.conPassante(b('Apri la mappa di Bologna',mappa)));
 }else if(f==='fine_giorno16'){
 area.append(p('Aspetti che le botteghe chiudano e i passi sotto i portici si facciano più radi. Le ultime conversazioni si allontanano. Quando torni davanti a Santo Stefano, la piazza è deserta.'),p('Sopra i tetti sono apparse la luna e qualche stella. Stringi la pergamena di Iliano, su cui compaiono ancora soltanto i sette simboli, e ti avvicini al lato destro del portone. Questa volta nessuno ti interrompe.'),p('Ora puoi tentare di aprire la soglia. Il tuo cammino nelle Sette Chiese comincerà nella prossima giornata.'));
 if(possiedeMappa())area.append(b('Consulta la mappa di Iliano',mostraPianta));

 }
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e)}
 }
 async function aggiorna(){aggiornaPianta();apriPianta.hidden=!possiedeMappa();if(!possiedeMappa()&&pianta.open)pianta.close();const n=++versione;if(api.dati?.giorno_corrente!==16){disegna();return}try{const r=await api.rpc('gioco_giorno16',{p_codice:api.codice});if(n!==versione)return;meta=r;errore='';if(r?.partita&&r.partita.stato_partita?.fase!==api.dati?.stato_partita?.fase){await api.applica(r.partita,api.codice,{anima:false});return}}catch(e){if(n!==versione)return;errore=e.message}disegna()}
 window.GiornoSedici={aggiorna};api.onChange(aggiorna);api.ready.then(aggiorna);
})();
