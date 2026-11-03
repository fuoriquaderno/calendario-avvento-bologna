// Messaggi e conferme condivisi da tutte le pagine.
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
  const popupRisposta=document.createElement('dialog');
  popupRisposta.className='avviso-codice messaggio-orizzontale';
  popupRisposta.setAttribute('aria-labelledby','titolo-popup-risposta');
  popupRisposta.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-popup-risposta"></h2><p id="frase-popup-risposta"></p><button type="button" id="chiudi-popup-risposta">Continua</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
  document.body.append(popupRisposta);
  let pagineMessaggio=[],paginaMessaggio=0,pulsanteMessaggio='Continua';
  const testoMessaggio=$('frase-popup-risposta'),comandoMessaggio=$('chiudi-popup-risposta');
  function mostraPaginaMessaggio(){
    testoMessaggio.textContent=pagineMessaggio[paginaMessaggio]||'';
    comandoMessaggio.textContent=paginaMessaggio<pagineMessaggio.length-1?'Avanti':pulsanteMessaggio;
  }
  comandoMessaggio.addEventListener('click',()=>{
    if(paginaMessaggio<pagineMessaggio.length-1){paginaMessaggio++;mostraPaginaMessaggio()}
    else popupRisposta.close();
  });
  window.Messaggi={mostra({titolo='Messaggio',testo='',pulsante='Continua'}={}){
    $('titolo-popup-risposta').textContent=titolo;
    testoMessaggio.textContent=testo;testoMessaggio.style.whiteSpace='pre-line';
    testoMessaggio.style.overflow='hidden';
    comandoMessaggio.textContent=pulsante;pulsanteMessaggio=pulsante;
    const misura=document.createElement('span');
    misura.style.cssText='position:fixed;visibility:hidden;white-space:pre;pointer-events:none';
    misura.style.font=window.getComputedStyle(popupRisposta).font;
    misura.textContent=testo;document.body.append(misura);
    const larghezzaTesto=misura.getBoundingClientRect().width;misura.remove();
    const limite=Math.max(0,document.documentElement.clientWidth-24);
    let larghezza=Math.min(limite,Math.max(520,Math.ceil(larghezzaTesto/3+180)));
    function impostaLarghezza(){popupRisposta.style.width=larghezza+'px';popupRisposta.style.setProperty('--larghezza-messaggio',larghezza+'px')}
    impostaLarghezza();
    if(!popupRisposta.open)popupRisposta.showModal();
    // Misura il testo nell’altezza effettivamente disponibile, senza barre di scorrimento.
    const entra=()=>testoMessaggio.scrollHeight<=testoMessaggio.clientHeight+1;
    while(!entra()&&larghezza<limite){larghezza=Math.min(limite,larghezza+40);impostaLarghezza()}
    pagineMessaggio=[];paginaMessaggio=0;
    if(entra())pagineMessaggio=[testo];
    else{
      // Su mobile il testo prosegue per pagine, mantenendo l’altezza fissa.
      const parole=String(testo).split(/(\s+)/);let inizio=0;
      while(inizio<parole.length){
        let basso=inizio+1,alto=parole.length,fine=inizio+1;
        while(basso<=alto){
          const centro=Math.floor((basso+alto)/2);
          testoMessaggio.textContent=parole.slice(inizio,centro).join('');
          if(entra()){fine=centro;basso=centro+1}else alto=centro-1;
        }
        pagineMessaggio.push(parole.slice(inizio,fine).join('').trim());inizio=fine;
      }
    }
    mostraPaginaMessaggio();
  }};

// Una sola conferma alla volta: annullare o premere Esc non avvia operazioni.
let confermaAperta=null;
window.ConfermaPergamena=(testo,{titolo='Confermi?',conferma='Conferma',annulla='Annulla'}={})=>{
 if(confermaAperta)return Promise.resolve(false);
 
 if(!confermaAperta){
   let dialogo=document.getElementById('pergamena-conferma');
   if(!dialogo){
     dialogo=document.createElement('dialog');dialogo.id='pergamena-conferma';dialogo.className='avviso-codice messaggio-orizzontale conferma-azione';
     dialogo.setAttribute('aria-labelledby','pergamena-conferma-titolo');
     dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="pergamena-conferma-titolo"></h2><p id="pergamena-conferma-testo"></p><button type="button" id="pergamena-conferma-si"></button><button type="button" id="pergamena-conferma-no"></button></div><div class="scroll-bottom" aria-hidden="true"></div>';
     document.body.append(dialogo);
   }
   return new Promise(resolve=>{
     confermaAperta=resolve;let accettata=false;
     const si=document.getElementById('pergamena-conferma-si'),no=document.getElementById('pergamena-conferma-no'),frase=document.getElementById('pergamena-conferma-testo');
     document.getElementById('pergamena-conferma-titolo').textContent=titolo;
     frase.textContent=testo;frase.style.overflow='hidden';si.textContent=conferma;no.textContent=annulla;
     const misura=document.createElement('span');misura.style.cssText='position:fixed;visibility:hidden;white-space:pre;pointer-events:none';
     misura.style.font=window.getComputedStyle(dialogo).font;misura.textContent=testo;document.body.append(misura);
     const limite=document.documentElement.clientWidth-24;
     let larghezza=Math.min(limite,Math.max(600,Math.ceil(misura.getBoundingClientRect().width/3+180)));misura.remove();
     function dimensiona(){dialogo.style.width=larghezza+'px';dialogo.style.setProperty('--larghezza-messaggio',larghezza+'px')}
     dimensiona();
     const positivo=()=>{accettata=true;dialogo.close()},negativo=()=>{accettata=false;dialogo.close()};
     si.addEventListener('click',positivo);no.addEventListener('click',negativo);
     dialogo.addEventListener('close',()=>{
       si.removeEventListener('click',positivo);no.removeEventListener('click',negativo);
       confermaAperta=null;resolve(accettata);
     },{once:true});
     dialogo.showModal();
     while(frase.scrollHeight>frase.clientHeight+1&&larghezza<limite){larghezza=Math.min(limite,larghezza+40);dimensiona()}
     no.focus({preventScroll:true});
   });
 }
};


})();
