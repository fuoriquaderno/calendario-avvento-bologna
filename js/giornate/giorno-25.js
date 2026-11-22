/* Il mattino di Natale: tre conseguenze, una scelta già compiuta. */
(()=>{
'use strict';
const api=window.Partita,$=id=>document.getElementById(id);if(!$('schermata-gioco'))return;
const main=document.querySelector('main .scroll-middle'),area=document.createElement('section');area.id='racconto-giorno25';area.hidden=true;main.append(area);
let busy=false,errore='';
const epiloghi={
 tenere:{titolo:'Il peso del tomo',immagine:'finale_tomo_custodito',alt:'Il tomo custodito dal protagonista, con Bologna oltre la finestra.',paragrafi:[
  'Il mattino di Natale Bologna si sveglia sotto un cielo freddo. Le campane chiamano dai tetti e, fra i portici, ricominciano i passi e le voci. Il tomo è con te, lontano dagli sguardi. Studi le sue pagine e impari a riconoscere gli incanti che stanno sfuggendo al controllo di chi li ha creati.',
  'La magia nuova continua a compiere i suoi prodigi. Nelle botteghe i servitori di legno aiutano gli artigiani; nelle case, formule accessibili anche a chi non ha studiato rendono meno faticose le giornate. Quando qualcosa si guasta, ora hai gli strumenti per comprenderlo e intervenire. Il tomo non è finito nelle mani che temevi.',
  'Le richieste di aiuto, però, si moltiplicano. Devi decidere quali incanti correggere, quali fermare e a chi insegnare ciò che hai scoperto. Ogni volta che apri il volume, la decisione spetta a te. Lo hai messo al sicuro; custodirlo significa anche portare il peso di ciò che farai, e di ciò che non riuscirai a fare.'
 ]},
 distruggere:{titolo:'La magia di un tempo',immagine:'finale_senza_magia_nuova',alt:'Bologna torna al lavoro manuale; un servitore di legno è rimasto immobile.',paragrafi:[
  'Quando pronunci le ultime formule, i fili della magia nuova si sciolgono. Bologna non crolla e i portici restano al loro posto. Si spengono invece le luci che ardevano senza olio; i servitori di legno si fermano davanti alle botteghe. Il mattino di Natale qualcuno deve tornare ad accendere le lanterne e a trasportare i carichi con le proprie mani.',
  'Gli incanti che avevano preso una strada propria non possono più ferire nessuno. Le porte conducono di nuovo dove dovrebbero e le parole incise nella pietra rimangono ferme. Hai fermato un pericolo che sembrava crescere a ogni nuovo prodigio.',
  'Con quel pericolo sono scomparsi anche molti aiuti. Chi aveva imparato a servirsi della magia nuova senza lunghi studi deve rinunciarvi. Restano gli incantesimi antichi e i pochi che sanno crearli: per gli altri, la magia torna a essere qualcosa da chiedere. Sotto i portici si riprende a lavorare, fra il sollievo di alcuni e il rimpianto di altri.'
 ]},
 iliano:{titolo:'Un nuovo Consiglio Arcano',immagine:'finale_consiglio_arcano',alt:'Iliano e i nuovi saggi discutono attorno al tomo.',paragrafi:[
  'Iliano riceve il tomo e rimane a lungo in silenzio sulle sue pagine. Nei giorni che seguono chiama a raccolta nuovi saggi: persone capaci di studiare gli incanti, ma anche di discutere e contraddirsi. Il Consiglio Arcano torna a riunirsi, e il volume viene aperto su un tavolo attorno al quale nessuno siede da solo.',
  'La magia nuova rimane a Bologna. Il Consiglio comincia a verificarne gli effetti, corregge le formule più instabili e raccoglie le segnalazioni di chi le usa ogni giorno. Gli artigiani conservano i loro aiutanti e le meraviglie non scompaiono dalle case. Il controllo del tomo è una responsabilità condivisa.',
  'Condividere, però, richiede tempo. Alcune decisioni si fermano fra pareri contrari; altre vengono prese mentre fuori c’è chi aspetta una risposta. E non tutti hanno un posto a quel tavolo. Iliano ha ricostituito il Consiglio: dovrà ora fare in modo che ascolti anche chi non possiede né un sigillo né una lunga istruzione magica.'
 ]}
};
const p=t=>{const e=document.createElement('p');e.textContent=t;return e;};
function b(t,f){const e=document.createElement('button');e.type='button';e.textContent=t;e.disabled=busy;e.addEventListener('click',f);return e;}
function link(t,url){const e=document.createElement('a');e.textContent=t;e.href=url;e.target='_blank';e.rel='noopener noreferrer';return e;}
async function concludi(pendente=null){
 if(busy)return;busy=true;errore='';disegna();
 try{
  const r=await window.BorsaNuova.esegui(pendente?.nomeRpc||'gioco_giorno25',pendente?.args||{p_codice:api.codice,p_azione:'concludi',p_richiesta:crypto.randomUUID(),p_tentativo:api.dati.tentativo});
  if(!r)errore=window.BorsaNuova.errore||'Non è stato possibile salvare la conclusione. Riprova.';
  else if(r.partita?.giornata_da_confermare)window.FineGiornata.apri();
 }catch(e){errore=e.message;}finally{busy=false;disegna();}
}
function disegna(){
 const d=api.dati,f=d?.stato_partita?.fase,attivo=d?.giorno_corrente===25&&['g25_epilogo','fine_giorno25'].includes(f);
 area.replaceChildren();area.hidden=!attivo;main.classList.toggle('giorno25-attivo',!!attivo);if(!attivo)return;
 const scelta=d.stato_partita?.g25?.scelta_tomo,epilogo=epiloghi[scelta];
 if(!epilogo){area.append(p('Non è stato possibile ritrovare la scelta del tomo. Ricarica la partita.'));return;}
 const figura=document.createElement('figure'),img=document.createElement('img');figura.className='immagine-schermata';img.src=api.risorsa('images/'+epilogo.immagine+'.png');img.alt=epilogo.alt;img.decoding='async';figura.append(img);area.append(figura);
 const titolo=document.createElement('h2');titolo.textContent=epilogo.titolo;area.append(titolo);
 for(const testo of epilogo.paragrafi)area.append(p(testo));
 const statistiche=document.createElement('section');statistiche.className='statistiche-finali';area.append(statistiche);window.StatisticheGioco?.mostraFinali(statistiche);
 const saluti=document.createElement('section');saluti.className='saluti-spisotti25';const h=document.createElement('h2');h.textContent='Grazie per aver giocato';
 saluti.append(h,p('Gli Spisotti ti ringraziano per aver giocato a L’ombra sui Portici e per averci accompagnato fra i portici, i misteri e le magie di Bologna.'),p('Seguici per scoprire le prossime iniziative e altre avventure da giocare insieme.'),p('Buon Natale a tutte e a tutti, dagli Spisotti!'));
 const social=document.createElement('div');social.className='social-spisotti25';social.append(link('Seguici su Facebook','https://www.facebook.com/profile.php?id=61594558125926'),link('Seguici su Instagram','https://www.instagram.com/glispisotti/'));social.append(link('Scopri il progetto','https://glispisotti.github.io/progetti/calendario-avvento-bologna/'));saluti.append(social);area.append(saluti);
 const pending=window.BorsaNuova.pending?.();
 if(pending)area.append(p('Recupera il risultato dell’ultima azione per completare il salvataggio.'),b('Recupera il risultato',()=>concludi(pending)));
 else if(d.giornata_completata)area.append(p('La tua avventura è conclusa. Puoi tornare a leggere questo finale quando vuoi.'));
 else area.append(b(d.giornata_da_confermare?'Salva la conclusione dell’avventura':'Concludi l’avventura',()=>d.giornata_da_confermare?window.FineGiornata.apri():concludi()));
 if(errore){const e=p(errore);e.setAttribute('role','alert');area.append(e);}
}
window.Giorno25={aggiorna:disegna};api.onChange(disegna);api.ready.then(disegna);
})();
