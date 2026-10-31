// Un solo spazio nel layout; ciascun luogo sceglie l'immagine da mostrare.
(() => {
 'use strict';
 const figura=document.getElementById('immagine-schermata');
 const immagine=document.getElementById('illustrazione-schermata');
 if(!figura||!immagine)return;
 const radice=document.currentScript?.src||window.location.href;
 const luoghi={
  sala_consiglio:{src:new URL('images/stanza-nascosta.png',radice).href,alt:'Scaffali di vecchi tomi e piccoli topi nella stanza nascosta.'},
  locanda_risveglio:{src:new URL('images/locanda.png',radice).href,alt:'La colazione in locanda, con due avventori al tavolo e il locandiere con la brocca.'},
  biblioteca:{src:new URL('images/biblioteca.png',radice).href,alt:"Il bibliotecario fra i manoscritti del convento di San Domenico."},
  san_domenico:{src:new URL('images/san_domenico.png',radice).href,alt:"La basilica e il convento di San Domenico."},
  mercato:{src:new URL('images/mercato.png',radice).href,alt:"I banchi del mercato, con venditori e passanti sotto i portici."},
  piazza_maggiore:{src:new URL('images/piazza_maggiore.png',radice).href,alt:'Piazza Maggiore, con i palazzi e i portici della Bologna medievale.'},
  osteria_sole:{src:new URL('images/iliano.png',radice).href,alt:'Iliano, vecchio mago seduto al tavolo dell’Osteria del Sole, con un sacchetto e i suoi appunti.'},
  armaiolo:{src:new URL('images/armaiolo-solo-ritaglio.png',radice).href,alt:'Mastro Taddeo dietro il banco, con spade e armature ai lati.'},
  bottega_preziosi:{src:new URL('images/negozio_oggetti.png',radice).href,alt:'Madonna Gemma al banco del Ghirigoro, fra mappe e piccoli preziosi.'},
  speziale:{src:new URL('images/speziale.png',radice).href,alt:'Mastro Neri con mortaio, ampolle ed erbe medicinali.'},
  porta_maggiore:{src:new URL('images/porta_maggiore.png',radice).href,alt:'Porta Maggiore fra Galeazzo e l’omino con la pergamena e la piuma volante.'}
 };
 const predefinita=figura.dataset.immagine?{src:figura.dataset.immagine,alt:figura.dataset.descrizione||''}:null;
 let versione=0,attuale='',caricamento=Promise.resolve(),annullaCaricamento=null;
 function mostra(dati){
  if(!dati?.src){
   if(annullaCaricamento)annullaCaricamento();
   versione++;attuale='';figura.hidden=true;immagine.onload=null;immagine.onerror=null;immagine.removeAttribute('src');immagine.alt='';
   caricamento=Promise.resolve();return caricamento;
  }
  const src=new URL(dati.src,radice).href;
  if(src===attuale)return caricamento;
  if(annullaCaricamento)annullaCaricamento();
  const n=++versione;attuale=src;figura.hidden=true;immagine.alt=dati.alt||'';
  caricamento=new Promise(resolve=>{
   let concluso=false,timer;
   const termina=ok=>{
    if(concluso)return;concluso=true;clearTimeout(timer);
    if(n===versione){figura.hidden=!ok;immagine.onload=null;immagine.onerror=null;annullaCaricamento=null;}
    resolve();
   };
   annullaCaricamento=()=>termina(false);
   immagine.onload=()=>termina(true);immagine.onerror=()=>termina(false);
   // Un file mancante non deve lasciare la pergamena bloccata.
   timer=setTimeout(()=>termina(false),4000);
   immagine.src=src;
   if(immagine.complete&&immagine.naturalWidth>0)termina(true);
  });
  return caricamento;
 }
 function aggiorna(dati){
  
  if(document.getElementById('schermata-gioco'))return mostra(dati?(dati.morto?predefinita:luoghi[dati.luogo_attuale]||predefinita):(predefinita||luoghi.porta_maggiore));
  return mostra(predefinita);
 }

 window.ImmagineSchermata={mostra,nascondi:()=>mostra(null),aggiorna};
 mostra(predefinita);
 if(window.Partita){window.Partita.onChange(aggiorna);window.Partita.ready.then(()=>aggiorna(window.Partita.dati))}
})();



