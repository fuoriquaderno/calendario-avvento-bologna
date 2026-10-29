// app.js

// 1. Inizializzazione Supabase (sostituisci con i tuoi dati dal pannello Supabase -> Project Settings -> API)
const SUPABASE_URL = 'https://qjbpacymsqsvxecgzreo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xGe5aZMIXxd3_v9zY1bVJQ__89AO9Ae';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Riferimenti al DOM
const inputCodice = document.getElementById('codice-accesso');
const selectClasse = document.getElementById('scelta-classe');
const btnLogin = document.getElementById('btn-login');
const msgErrore = document.getElementById('messaggio-errore');
const msgSuccesso = document.getElementById('messaggio-successo');

const schermataLogin = document.getElementById('schermata-login');
const schermataGioco = document.getElementById('schermata-gioco');
const uiNome = document.getElementById('nome-personaggio');
const uiHp = document.getElementById('hp-personaggio');
const uiOro = document.getElementById('oro-personaggio');

// 3. Logica di Login e Creazione
btnLogin.addEventListener('click', async () => {
    msgErrore.style.display = 'none';
    msgSuccesso.style.display = 'none';
    
    const codice = inputCodice.value.trim();
    const classe = selectClasse.value;

    if (!codice) {
        mostraErrore("Devi inserire un nome in codice.");
        return;
    }

    try {
        // Tentativo di ricerca personaggio esistente
        const { data: personaggioEsistente, error: erroreRicerca } = await supabase
            .from('personaggi')
            .select('*')
            .eq('codice_accesso', codice)
            .single();

        if (personaggioEsistente) {
            // Login effettuato con successo
            avviaGioco(personaggioEsistente);
        } else {
            // Se non esiste, lo creiamo (Giorno 1)
            creaPersonaggio(codice, classe);
        }
    } catch (err) {
        console.error(err);
        mostraErrore("Errore di comunicazione col database.");
    }
});

async function creaPersonaggio(codice, classe) {
    // Definiamo i bonus in base alla classe
    let hpIniziali = (classe === 'Guerriero') ? 5 : 3;
    let inventarioBase = [];
    
    if (classe === 'Mago') inventarioBase.push("pergamena_chiarezza");
    if (classe === 'Ladro') inventarioBase.push("grimaldello");

    // Inseriamo i dati su Supabase
    const { data, error } = await supabase
        .from('personaggi')
        .insert([
            {
                codice_accesso: codice,
                classe: classe,
                hp_attuali: hpIniziali,
                oro_rimanente: 50,
                inventario: inventarioBase,
                giorni_sbloccati: [1]
            }
        ])
        .select()
        .single(); // Restituisce il personaggio appena creato

    if (error) {
        mostraErrore("Errore durante la creazione: " + error.message);
    } else {
        msgSuccesso.textContent = "Personaggio forgiato con successo!";
        msgSuccesso.style.display = 'block';
        setTimeout(() => avviaGioco(data), 1500); // Avvia il gioco dopo 1.5 secondi
    }
}

function mostraErrore(testo) {
    msgErrore.textContent = testo;
    msgErrore.style.display = 'block';
}

function avviaGioco(datiPersonaggio) {
    schermataLogin.style.display = 'none';
    schermataGioco.style.display = 'block';
    
    uiNome.textContent = `Nome: ${datiPersonaggio.codice_accesso} (${datiPersonaggio.classe})`;
    uiHp.textContent = `HP: ${datiPersonaggio.hp_attuali}`;
    uiOro.textContent = `Oro: ${datiPersonaggio.oro_rimanente}`;
}