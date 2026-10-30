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
function normalizzaCodice(codice) { return codice.trim().toLowerCase(); }
function codiceValido(codice) { return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(codice); }

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
    if (error) throw new Error('Non è stato possibile leggere o salvare la partita. Controlla la connessione e riprova.');
    return data;
}

// Accesso a una partita esistente sempre disponibile, anche prima dell'enigma.
const accesso = document.createElement('section');
accesso.style.cssText = 'margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--line)';
accesso.innerHTML = '<h2>Hai già una partita?</h2><label for="codice-ripresa">Codice segreto della partita</label><input id="codice-ripresa" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" style="width:100%;padding:10px"><button type="button" id="riprendi-partita" style="margin-top:12px;padding:10px 16px">Riprendi la partita</button><p>Chi conosce il codice può accedere al salvataggio. Conservalo per giocare anche su un altro dispositivo. Senza il codice non possiamo recuperare la partita.</p>';
$('schermata-login').prepend(accesso);
$('riprendi-partita').addEventListener('click', () => esegui(() => riprendi($('codice-ripresa').value)));
$('codice-ripresa').addEventListener('keydown', event => {
    if(event.key==='Enter'){event.preventDefault();$('riprendi-partita').click();}
});

// Il nome precedente non viene più usato come segreto scelto dall'utente.
const vecchioInput = $('codice-accesso');
document.querySelector('label[for="codice-accesso"]')?.remove();
vecchioInput.hidden = true;
vecchioInput.style.display = 'none';
$('btn-login').type = 'button';
$('btn-login').textContent = 'Crea partita e genera codice';
const spiegazione = document.createElement('p');
spiegazione.textContent = 'Il gioco genera un codice segreto casuale. Copialo e conservalo: è l’unico modo per recuperare la partita su un altro dispositivo.';
$('btn-login').before(spiegazione);

const gestione = document.createElement('section');
gestione.style.cssText = 'margin-bottom:24px;padding:16px;border:1px solid var(--line)';
gestione.innerHTML = '<label for="codice-da-conservare">Il tuo codice segreto — conservalo</label><input id="codice-da-conservare" type="text" readonly autocomplete="off" style="width:100%;padding:10px"><div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px"><button type="button" id="copia-codice">Copia codice</button><button type="button" id="cambia-partita">Cambia partita</button></div>';
$('schermata-gioco').prepend(gestione);
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
    if(!codiceValido(codice)) { avvisa('Inserisci il codice completo generato dal gioco, compresi i trattini.');return; }
    const dati = await rpc('gioco_recupera',{p_codice:codice});
    if(!dati) { rimuoviMemoria(CHIAVE);avvisa('Nessuna partita trovata. Controlla il codice: non è stata creata una nuova partita.');return; }
    await mostraPartita(dati,codice);
}
$('btn-login').addEventListener('click', () => esegui(async () => {
    let richiesta;
    try { richiesta = JSON.parse(leggiMemoria(IN_SOSPESO)); } catch {}
    if(!richiesta || !codiceValido(richiesta.codice)) {
        richiesta = {codice:crypto.randomUUID(),classe:$('scelta-classe').value};
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
const ricordato = leggiMemoria(CHIAVE);
if(ricordato) {
    $('codice-ripresa').value=ricordato;
    esegui(()=>riprendi(ricordato));
} else if(leggiMemoria(IN_SOSPESO)) {
    avvisa('La creazione precedente potrebbe essere rimasta in sospeso. Supera l’enigma e premi Crea partita per recuperarla senza duplicarla.');
}

