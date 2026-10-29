// app.js

// 1. Inizializzazione Supabase (sostituisci con i tuoi dati dal pannello Supabase -> Project Settings -> API)
const SUPABASE_URL = 'https://qjbpacymsqsvxecgzreo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xGe5aZMIXxd3_v9zY1bVJQ__89AO9Ae';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Riferimenti al DOM
const schermataLogin = document.getElementById('schermata-login');
const schermataGioco = document.getElementById('schermata-gioco');
const inputCodice = document.getElementById('codice-accesso');
const btnLogin = document.getElementById('btn-login');
const messaggioErrore = document.getElementById('messaggio-errore');

// Elementi della scheda personaggio
const uiNome = document.getElementById('nome-personaggio');
const uiHp = document.getElementById('hp-personaggio');
const uiOro = document.getElementById('oro-personaggio');

// Variabile globale per memorizzare il personaggio caricato
let personaggioCorrente = null;

// 3. Logica di Login
btnLogin.addEventListener('click', async () => {
    const codice = inputCodice.value.trim();
    if (!codice) {
        mostraErrore("Inserisci un nome in codice.");
        return;
    }

    try {
        // Cerca il personaggio nel database
        const { data, error } = await supabase
            .from('personaggi')
            .select('*')
            .eq('codice_accesso', codice)
            .single();

        if (error && error.code === 'PGRST116') {
            // Se non trova il personaggio, per ora mostriamo un errore. 
            // In futuro qui potremo inserire la logica per la "Creazione del Personaggio" del Giorno 1.
            mostraErrore("Personaggio non trovato. La magia non riconosce questo nome.");
        } else if (data) {
            // Personaggio trovato, carichiamo i dati
            personaggioCorrente = data;
            avviaGioco();
        }
    } catch (err) {
        console.error("Errore di connessione:", err);
        mostraErrore("Errore di comunicazione con le linee temporali (Database).");
    }
});

// 4. Funzioni di Supporto
function mostraErrore(testo) {
    messaggioErrore.textContent = testo;
    messaggioErrore.style.display = 'block';
}

function avviaGioco() {
    // Nascondi login, mostra gioco
    schermataLogin.style.display = 'none';
    schermataGioco.style.display = 'block';

    // Aggiorna l'interfaccia con i dati di Supabase
    uiNome.textContent = `Nome: ${personaggioCorrente.codice_accesso}`;
    uiHp.textContent = `HP: ${personaggioCorrente.hp_attuali}`;
    uiOro.textContent = `Oro: ${personaggioCorrente.oro_rimanente}`;

    // Qui in futuro chiameremo la funzione per caricare il file JSON con la storia del giorno attuale
    caricaGiornoOdierno();
}

function caricaGiornoOdierno() {
    // Placeholder per la logica che determinerà in automatico che giorno è 
    // e leggerà i testi da storia.json
    console.log("Pronto per caricare i testi narrativi.");
}