// Messaggi e conferme condivisi: dimensioni proporzionate al contenuto.
(() => {
 'use strict';
 const $=id=>document.getElementById(id),mobile=()=>document.documentElement.clientWidth<=600;
 const osservati=new WeakSet();
 const menuPergamena=new Map();
 let tentativoMenu;
 window.MenuPergamena=(chiave,titolo,{aperto=false,libri=false}={})=>{
  const tentativo=window.Partita?.dati?.tentativo;
  if(tentativo!==tentativoMenu){menuPergamena.clear();tentativoMenu=tentativo}
  let menu=menuPergamena.get(chiave);
  if(!menu){
   menu=document.createElement('details');
   menu.className=libri?'menu-pergamena menu-pergamena-libri':'menu-pergamena';
   menu.open=aperto;
   menu.append(document.createElement('summary'));
   menuPergamena.set(chiave,menu);
  }
  const sommario=menu.firstElementChild;
  sommario.textContent=titolo;
  menu.replaceChildren(sommario);
  return menu;
 };
 function aggiornaCornice(dialogo){
 const altezza=dialogo.getBoundingClientRect().height;if(!altezza)return;
 const valore=altezza.toFixed(2)+'px';if(dialogo.style.getPropertyValue('--altezza-messaggio')!==valore)dialogo.style.setProperty('--altezza-messaggio',valore);
 }
 function osserva(dialogo){
 if(osservati.has(dialogo))return;osservati.add(dialogo);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>aggiornaCornice(dialogo)).observe(dialogo);
 aggiornaCornice(dialogo);
 }
 function altezzaNaturale(dialogo){
 const centro=dialogo.querySelector('.scroll-middle'),stile=getComputedStyle(centro),figli=[...centro.children].filter(e=>!e.hidden&&getComputedStyle(e).display!=='none');
 return parseFloat(stile.paddingTop)+parseFloat(stile.paddingBottom)+Math.max(0,figli.length-1)*(parseFloat(stile.rowGap)||0)+figli.reduce((n,e)=>n+Math.max(e.scrollHeight,e.getBoundingClientRect().height),0);
 }
 function dimensiona(dialogo){
 const limite=Math.max(0,Math.min(1000,document.documentElement.clientWidth-24));
 let larghezza=Math.min(460,limite);
 const imposta=()=>{dialogo.style.width=larghezza+'px';dialogo.style.setProperty('--larghezza-messaggio',larghezza+'px')};
 imposta();
 if(!mobile()){
 const obiettivo=Math.min(300,Math.max(140,window.innerHeight-24));
 while(altezzaNaturale(dialogo)>obiettivo+1&&larghezza<limite){larghezza=Math.min(limite,larghezza+40);imposta()}
 }
 osserva(dialogo);aggiornaCornice(dialogo);
 }
 // Anche le finestre create in seguito (per esempio il fine giornata) hanno la cornice all’altezza corretta.
 if(typeof MutationObserver!=='undefined')new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1&&node.matches('dialog.messaggio-orizzontale'))osserva(node)}).observe(document.body,{childList:true});
 const popup=document.createElement('dialog');popup.className='avviso-codice messaggio-orizzontale';popup.setAttribute('aria-labelledby','titolo-popup-risposta');
 popup.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-popup-risposta"></h2><p id="frase-popup-risposta"></p><button type="button" id="chiudi-popup-risposta">Continua</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
 document.body.append(popup);
 const testoMessaggio=$('frase-popup-risposta'),comando=$('chiudi-popup-risposta');
 let pagine=[],pagina=0,testoCompleto='',pulsanteFinale='Continua';
 function mostraPagina(){testoMessaggio.textContent=pagine[pagina]||'';comando.textContent=pagina<pagine.length-1?'Avanti':pulsanteFinale;aggiornaCornice(popup)}
 function impagina(){
 testoMessaggio.textContent=testoCompleto;comando.textContent=pulsanteFinale;dimensiona(popup);pagine=[];pagina=0;
 const entra=()=>mobile()||testoMessaggio.scrollHeight<=testoMessaggio.clientHeight+1;
 if(entra())pagine=[testoCompleto];
 else{
 const parole=testoCompleto.split(/(\s+)/);let inizio=0;
 while(inizio<parole.length){let basso=inizio+1,alto=parole.length,fine=inizio+1;
 while(basso<=alto){const centro=Math.floor((basso+alto)/2);testoMessaggio.textContent=parole.slice(inizio,centro).join('');if(entra()){fine=centro;basso=centro+1}else alto=centro-1}
 pagine.push(parole.slice(inizio,fine).join('').trim());inizio=fine;
 }
 }
 mostraPagina();
 }
 comando.addEventListener('click',()=>{if(pagina<pagine.length-1){pagina++;mostraPagina()}else popup.close()});
 window.Messaggi={mostra({titolo='Messaggio',testo='',pulsante='Continua'}={}){
 $('titolo-popup-risposta').textContent=titolo;testoCompleto=String(testo);pulsanteFinale=pulsante;testoMessaggio.style.whiteSpace='pre-line';testoMessaggio.style.overflow='hidden';
 popup.style.width='460px';popup.style.setProperty('--larghezza-messaggio','460px');if(!popup.open)popup.showModal();impagina();
 }};
 let confermaAperta=null;
 window.ConfermaPergamena=(testo,{titolo='Confermi?',conferma='Conferma',annulla='Annulla'}={})=>{
 if(confermaAperta)return Promise.resolve(false);
 let dialogo=$('pergamena-conferma');if(!dialogo){
 dialogo=document.createElement('dialog');dialogo.id='pergamena-conferma';dialogo.className='avviso-codice messaggio-orizzontale conferma-azione';dialogo.setAttribute('aria-labelledby','pergamena-conferma-titolo');
 dialogo.innerHTML='<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="pergamena-conferma-titolo"></h2><p id="pergamena-conferma-testo"></p><button type="button" id="pergamena-conferma-si"></button><button type="button" id="pergamena-conferma-no"></button></div><div class="scroll-bottom" aria-hidden="true"></div>';document.body.append(dialogo);
 }
 return new Promise(resolve=>{
 confermaAperta=resolve;let accettata=false;
 const si=$('pergamena-conferma-si'),no=$('pergamena-conferma-no'),frase=$('pergamena-conferma-testo');
 $('pergamena-conferma-titolo').textContent=titolo;frase.textContent=String(testo);frase.style.whiteSpace='pre-line';frase.style.overflow='auto';si.textContent=conferma;no.textContent=annulla;
 const positivo=()=>{accettata=true;dialogo.close()},negativo=()=>dialogo.close();
 si.addEventListener('click',positivo);no.addEventListener('click',negativo);
 dialogo.addEventListener('close',()=>{si.removeEventListener('click',positivo);no.removeEventListener('click',negativo);confermaAperta=null;resolve(accettata)},{once:true});
 dialogo.style.width='460px';dialogo.style.setProperty('--larghezza-messaggio','460px');dialogo.showModal();dimensiona(dialogo);no.focus({preventScroll:true});
 });
 };
 window.addEventListener('resize',()=>{if(popup.open)impagina();const conferma=$('pergamena-conferma');if(conferma?.open)dimensiona(conferma)});
 document.fonts?.ready.then(()=>{if(popup.open)impagina();const conferma=$('pergamena-conferma');if(conferma?.open)dimensiona(conferma)});
})();
