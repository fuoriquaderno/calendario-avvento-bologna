// VERSIONE CON DISSOLVENZA DELLA PERGAMENA — 30 ottobre 2026
// app.js

// 1. Inizializzazione Supabase (sostituisci con i tuoi dati dal pannello Supabase -> Project Settings -> API)
const SUPABASE_URL = 'https://qjbpacymsqsvxecgzreo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xGe5aZMIXxd3_v9zY1bVJQ__89AO9Ae';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Attende il nuovo layout prima di riportare la lettura all'inizio del main.
function tornaInizioMain() {
    requestAnimationFrame(() => {
        const main = document.querySelector('main.site-main');
        if (!main) return;
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        window.scrollTo({
            top: Math.max(0, main.getBoundingClientRect().top + window.scrollY),
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant' : 'smooth'
        });
    });
}

let cambioPergamenaInCorso = false;
async function cambiaPergamena(aggiornaContenuto) {
    if (cambioPergamenaInCorso) return;
    const pergamena = document.querySelector('.scroll-container');
    if (!pergamena) { aggiornaContenuto(); tornaInizioMain(); return; }
    cambioPergamenaInCorso = true;
    const movimentoRidotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animazioni = [];
    try {
        pergamena.inert = true;
        pergamena.setAttribute('aria-busy', 'true');
        if (!movimentoRidotto) {
            const uscita = pergamena.animate([{ opacity: 1 }, { opacity: 0 }],
                { duration: 700, easing: 'ease-out', fill: 'forwards' });
            animazioni.push(uscita);
            await uscita.finished;
        }
        pergamena.style.opacity = '0';
        animazioni.forEach(animazione => animazione.cancel());
        aggiornaContenuto();
        // Il contenuto determina subito la nuova altezza mentre la pergamena è invisibile.
        await new Promise(resolve => requestAnimationFrame(resolve));
        const main = document.querySelector('main.site-main');
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus({ preventScroll: true });
            window.scrollTo({ top: Math.max(0, main.getBoundingClientRect().top + window.scrollY), behavior: 'instant' });
        }
        if (!movimentoRidotto) {
            const entrata = pergamena.animate([{ opacity: 0 }, { opacity: 1 }],
                { duration: 900, easing: 'ease-in', fill: 'forwards' });
            animazioni.push(entrata);
            await entrata.finished;
        }
    } finally {
        pergamena.style.removeProperty('opacity');
        animazioni.forEach(animazione => animazione.cancel());
        pergamena.inert = false;
        pergamena.removeAttribute('aria-busy');
        cambioPergamenaInCorso = false;
    }
}

const $ = id => document.getElementById(id);
const CHIAVE = 'ombra-sui-portici.codice-segreto.v2';
const IN_SOSPESO = 'ombra-sui-portici.creazione.v2';
let codiceAttivo = null;
let occupato = false;

function leggiMemoria(chiave) { try { return localStorage.getItem(chiave); } catch { return null; } }
function scriviMemoria(chiave, valore) { try { localStorage.setItem(chiave, valore); return true; } catch { return false; } }
function rimuoviMemoria(chiave) { try { localStorage.removeItem(chiave); } catch {} }
function normalizzaCodice(codice) { return codice.trim(); }
function codiceValido(codice) { return typeof codice==='string' && Array.from(codice.trim()).length>=1 && Array.from(codice.trim()).length<=128; }

// Informazione sul funzionamento, non una richiesta di consenso privacy.
const avvisoStile = document.createElement('style');
avvisoStile.textContent = `
dialog.avviso-codice{width:min(560px,calc(100% - 24px));max-height:90vh;max-height:90dvh;padding:0;border:0;background:transparent;color:var(--text);font:18px/1.6 var(--sans);overflow:auto;filter:drop-shadow(0 5px 16px #0006)}
dialog.avviso-codice::backdrop{background:#0009}
dialog.avviso-codice .scroll-middle{padding:0 10%;overflow-wrap:anywhere}
dialog.avviso-codice h2{margin:0;font:clamp(20px,4vw,26px)/1.4 var(--serif);color:var(--accent)}
dialog.avviso-codice button{width:100%;padding:12px;background:var(--accent);color:var(--surface);border:0;border-radius:3px;font:inherit;cursor:pointer}
`;
document.head.append(avvisoStile);
const avvisoCodice = document.createElement('dialog');
avvisoCodice.className='avviso-codice';
avvisoCodice.setAttribute('aria-labelledby','titolo-avviso-codice');
avvisoCodice.innerHTML = '<div class="scroll-top" aria-hidden="true"></div><div class="scroll-middle"><h2 id="titolo-avviso-codice">La tua partita, il tuo codice</h2><p>Abbiamo scelto di non richiedere la registrazione: per giocare non devi fornire un nome reale, un’email o una password. Il salvataggio viene comunque conservato su Supabase; il servizio può trattare dati tecnici di connessione.</p><p>Per proteggere la partita puoi usare il codice segreto generato automaticamente oppure sceglierne uno tuo. Se lo scegli tu, preferisci un codice lungo e poco prevedibile, anche con numeri e simboli: aggiungere qualche carattere speciale a un nome comune non basta a renderlo difficile da indovinare.</p><p>Chi conosce o indovina il codice può giocare la tua partita, modificare il salvataggio e cambiare il codice.</p><p>Conservalo: ti servirà per riprendere la partita anche su un altro dispositivo. Se lo perdi e il browser non lo ricorda più, non potremo recuperarla.</p><button type="button" id="chiudi-avviso-codice">Ho capito</button></div><div class="scroll-bottom" aria-hidden="true"></div>';
document.body.append(avvisoCodice);
$('chiudi-avviso-codice').addEventListener('click',()=>{
    scriviMemoria('ombra-sui-portici.avviso-codice.v1','letto');
    avvisoCodice.close();
});
function apriAvvisoCodice() {
    if(!avvisoCodice.open) avvisoCodice.showModal();
}
function pulsanteInformazioni(contenitore) {
    const button=document.createElement('button');
    button.type='button';button.textContent='Come funziona il codice della partita';
    button.style.cssText='display:block;margin-block:12px;padding:8px;cursor:pointer';
    button.addEventListener('click',apriAvvisoCodice);
    contenitore.append(button);
}

const messaggio = document.createElement('p');
messaggio.setAttribute('role', 'status');
messaggio.setAttribute('aria-live', 'polite');
document.querySelector('.scroll-middle').prepend(messaggio);
function avvisa(testo) { messaggio.textContent = testo; }
function abilitaPulsanti(disabilitati) {
    document.querySelectorAll('.scroll-middle button').forEach(button => { button.disabled = disabilitati; });
}
async function esegui(azione) {
    if (occupato || cambioPergamenaInCorso) return;
    occupato = true;
    abilitaPulsanti(true);
    avvisa('');
    try { await azione(); }
    catch (errore) {
        avvisa(errore.message || 'Operazione non riuscita. Riprova: non creare una nuova partita se stavi recuperando quella esistente.');
    } finally { occupato = false; abilitaPulsanti(false); }
}
async function rpc(nome, parametri) {
    const {data,error} = await supabaseClient.rpc(nome,parametri);
    if (error) {
        if(error.message==='Codice non disponibile') {
            rimuoviMemoria(IN_SOSPESO);
            throw new Error('Codice già occupato. Scegline un altro. Se è la tua partita, usa Riprendi la partita con quel codice.');
        }
        throw new Error('Operazione non riuscita. Controlla la connessione. Se la creazione o il cambio codice potrebbero essere riusciti, prova Riprendi la partita con il codice scelto.');
    }
    return data;
}

// Accesso a una partita esistente sempre disponibile, anche prima dell'enigma.
const accesso = document.createElement('section');
accesso.style.cssText = 'margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--line)';
accesso.innerHTML = '<h2>Hai già una partita?</h2><label for="codice-ripresa">Codice segreto della partita</label><input id="codice-ripresa" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;padding:10px"><button type="button" id="riprendi-partita" style="margin-top:12px;padding:10px 16px">Riprendi la partita</button><p>Chi conosce il codice può accedere al salvataggio. Conservalo per giocare anche su un altro dispositivo. Senza il codice non possiamo recuperare la partita.</p>';
$('schermata-login').prepend(accesso);
pulsanteInformazioni(accesso);
$('riprendi-partita').addEventListener('click', () => esegui(() => riprendi($('codice-ripresa').value)));
$('codice-ripresa').addEventListener('keydown', event => {
    if(event.key==='Enter'){event.preventDefault();$('riprendi-partita').click();}
});

// Codice scelto liberamente; il generatore casuale resta facoltativo.
const vecchioInput = $('codice-accesso');
const etichettaCodice = document.querySelector('label[for="codice-accesso"]');
if(etichettaCodice) etichettaCodice.textContent='Scegli il codice della partita';
vecchioInput.hidden = false;
vecchioInput.style.display = 'block';
vecchioInput.placeholder = 'Scrivi un codice a tua scelta';
vecchioInput.autocomplete = 'off';
vecchioInput.setAttribute('autocapitalize','none');
vecchioInput.spellcheck = false;
const generaCodice = document.createElement('button');
generaCodice.type='button';generaCodice.textContent='Genera un codice casuale';
generaCodice.style.cssText='margin-bottom:16px;padding:8px';
vecchioInput.after(generaCodice);
generaCodice.addEventListener('click',()=>{vecchioInput.value=crypto.randomUUID();});
$('btn-login').type = 'button';
$('btn-login').textContent = 'Crea partita';
const spiegazione = document.createElement('p');
spiegazione.textContent = 'Puoi scegliere un codice da 1 a 128 caratteri, anche con simboli. Maiuscole e minuscole contano; gli spazi iniziali e finali vengono rimossi. Chi lo conosce o lo indovina può accedere e modificarlo, incluso cambiare il codice. I codici semplici sono a tuo rischio. Senza il codice non possiamo recuperare la partita.';
$('btn-login').before(spiegazione);

const gestione = document.createElement('section');
gestione.style.cssText = 'margin-bottom:24px;padding:16px;border:1px solid var(--line)';
gestione.innerHTML = '<label for="codice-da-conservare">Il tuo codice segreto — conservalo</label><input id="codice-da-conservare" type="text" readonly autocomplete="off" style="width:100%;padding:10px"><div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px"><button type="button" id="copia-codice">Copia codice</button><button type="button" id="cambia-partita">Cambia partita</button></div>';
$('schermata-gioco').prepend(gestione);
pulsanteInformazioni(gestione);
const modificaCodice = document.createElement('section');
modificaCodice.innerHTML='<label for="nuovo-codice-partita">Cambia il codice della partita</label><input id="nuovo-codice-partita" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;padding:10px"><button type="button" id="salva-nuovo-codice" style="margin-top:12px">Salva nuovo codice</button><p>Il vecchio codice smetterà di funzionare su tutti i dispositivi. Anche un codice semplice è ammesso, a tuo rischio.</p>';
gestione.append(modificaCodice);
$('salva-nuovo-codice').addEventListener('click',()=>esegui(async()=>{
    const nuovo=normalizzaCodice($('nuovo-codice-partita').value);
    if(!codiceValido(nuovo)){avvisa('Inserisci un codice da 1 a 128 caratteri.');return;}
    const dati=await rpc('gioco_cambia_codice',{p_codice:codiceAttivo,p_nuovo_codice:nuovo});
    await mostraPartita(dati,nuovo);
    $('nuovo-codice-partita').value='';
    avvisa('Codice aggiornato. Copia il nuovo codice: quello precedente non dà più accesso alla partita.');
}));
$('copia-codice').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(codiceAttivo); avvisa('Codice copiato. Conservalo in un luogo privato.'); }
    catch { $('codice-da-conservare').select(); avvisa('Seleziona e copia il codice mostrato.'); }
});
$('cambia-partita').addEventListener('click', () => {
    if(occupato || cambioPergamenaInCorso) return;
    if(!window.confirm('Hai conservato il codice? Senza di esso non potrai recuperare questa partita.')) return;
    rimuoviMemoria(CHIAVE);rimuoviMemoria(IN_SOSPESO);
    window.location.reload();
});

const esito = document.createElement('section');
esito.style.cssText = 'display:none;margin-block:24px;padding:20px;border:1px solid var(--line)';
$('schermata-gioco').append(esito);
const timbro = $('testo-storia').previousElementSibling;
const testiEsito = {
    paga: 'Galeazzo ha ricevuto 25 monete d’argento. Il posto per domani è tuo.',
    favore: 'Hai accettato il favore futuro: recuperare il grimorio di Galeazzo al Mercato di Mezzo.',
    enigma: 'Hai superato la sfida di Galeazzo senza spendere argento.'
};

async function mostraPartita(dati, codice) {
    await cambiaPergamena(() => {
        codiceAttivo = codice;
        $('schermata-login').style.display = 'none';
        $('schermata-gioco').style.display = 'block';
        $('nome-personaggio').textContent = `Personaggio: ${dati.classe}`;
        $('hp-personaggio').textContent = `HP: ${dati.hp_attuali}`;
        $('argento-personaggio').textContent = `Argento: ${dati.oro_rimanente}`;
        $('codice-da-conservare').value = codice;
        const fase = dati.stato_partita?.fase || 'galeazzo';
        $('testo-storia').style.display = fase==='galeazzo' ? 'block' : 'none';
        $('scelte-storia').style.display = fase==='galeazzo' ? 'flex' : 'none';
        $('enigma-reale').style.display = fase==='enigma' ? 'block' : 'none';
        if(timbro) timbro.style.display = fase==='galeazzo' ? 'block' : 'none';
        $('errore-reale').style.display = 'none';
        esito.style.display = fase==='attesa_giorno2' ? 'block' : 'none';
        esito.replaceChildren();
        if(fase==='attesa_giorno2') {
            const titolo = document.createElement('h2');titolo.textContent = 'Primo giorno completato';
            const testo = document.createElement('p');testo.textContent = testiEsito[dati.stato_partita.scelta] || 'La tua scelta è stata salvata.';
            const seguito = document.createElement('p');seguito.textContent = 'Il Giorno 2 è sbloccato. Il contenuto del prossimo giorno non è ancora presente in questa versione del gioco.';
            esito.append(titolo,testo,seguito);
        }
        if(!scriviMemoria(CHIAVE,codice)) avvisa('Il browser non può ricordare il codice. Copialo prima di chiudere la pagina.');
    });
}
async function riprendi(valore) {
    const codice = normalizzaCodice(valore);
    if(!codiceValido(codice)) { avvisa('Inserisci il codice della partita, da 1 a 128 caratteri.');return; }
    const dati = await rpc('gioco_recupera',{p_codice:codice});
    if(!dati) { rimuoviMemoria(CHIAVE);avvisa('Nessuna partita trovata. Controlla il codice: non è stata creata una nuova partita.');return; }
    await mostraPartita(dati,codice);
}
$('btn-login').addEventListener('click', () => esegui(async () => {
    let richiesta;
    try { richiesta = JSON.parse(leggiMemoria(IN_SOSPESO)); } catch {}
    if(!richiesta || !codiceValido(richiesta.codice)) {
        const scelto=normalizzaCodice(vecchioInput.value);
        if(!codiceValido(scelto)){avvisa('Scrivi un codice da 1 a 128 caratteri, oppure usa Genera un codice casuale.');return;}
        richiesta = {codice:scelto,classe:$('scelta-classe').value};
        // Salva prima della richiesta: un problema di rete non deve duplicare la partita.
        if(!scriviMemoria(IN_SOSPESO,JSON.stringify(richiesta))) {
            avvisa('Per creare una partita abilita la memorizzazione dei dati del sito nel browser.');return;
        }
    }
    const dati = await rpc('gioco_crea',{p_codice:richiesta.codice,p_classe:richiesta.classe});
    await mostraPartita(dati,richiesta.codice);
    rimuoviMemoria(IN_SOSPESO);
}));

$('btn-enigma').type = 'button';
$('btn-enigma').addEventListener('click', () => esegui(async () => {
    if(!$('input-enigma').value.toLowerCase().trim().includes('richieste')) {
        $('errore-enigma').style.display='block';return;
    }
    await cambiaPergamena(() => {
        $('errore-enigma').style.display='none';
        $('enigma-pergamena').style.display='none';
        $('storia-ingresso').style.display='none';
        $('form-registrazione').style.display='block';
    });
}));

async function scegli(azione, risposta=null) {
    if(!codiceAttivo) return;
    const dati = await rpc('gioco_scegli',{p_codice:codiceAttivo,p_azione:azione,p_risposta:risposta});
    if(dati.risposta_errata) { $('errore-reale').style.display='block';return; }
    await mostraPartita(dati,codiceAttivo);
}
for(const [id,azione] of [['scelta-paga','paga'],['scelta-favore','favore'],['scelta-reale','enigma']]) {
    $(id).type='button';
    $(id).addEventListener('click',()=>esegui(()=>scegli(azione)));
}
$('btn-conferma-reale').type='button';
$('btn-conferma-reale').addEventListener('click',()=>esegui(()=>scegli('rispondi',$('risposta-reale').value)));

// Ripresa automatica. Un codice errato non crea mai un nuovo personaggio.
async function inizia() {
    if(!leggiMemoria('ombra-sui-portici.avviso-codice.v1')) {
        const chiuso=new Promise(resolve=>avvisoCodice.addEventListener('close',resolve,{once:true}));
        apriAvvisoCodice();
        await chiuso;
    }
    const ricordato = leggiMemoria(CHIAVE);
    if(ricordato) {
        $('codice-ripresa').value=ricordato;
        await esegui(()=>riprendi(ricordato));
    } else if(leggiMemoria(IN_SOSPESO)) {
        avvisa('La creazione precedente potrebbe essere rimasta in sospeso. Supera l’enigma e premi Crea partita per recuperarla senza duplicarla.');
    }
}
inizia();

