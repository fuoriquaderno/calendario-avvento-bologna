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

// Riferimenti per l'enigma iniziale
const inputEnigma = document.getElementById('input-enigma');
const btnEnigma = document.getElementById('btn-enigma');
const enigmaPergamena = document.getElementById('enigma-pergamena');
const msgErroreEnigma = document.getElementById('errore-enigma');
const formRegistrazione = document.getElementById('form-registrazione');

// Logica dell'enigma
btnEnigma.addEventListener('click', () => {
    // Trasforma la risposta in minuscolo e toglie gli spazi per facilitare il controllo
    const risposta = inputEnigma.value.toLowerCase().trim();
    
    // Controlla se la parola digitata contiene "richieste"
    if (risposta.includes('richieste') || risposta.includes('stanza delle richieste')) {
        msgErroreEnigma.style.display = 'none';
        enigmaPergamena.style.display = 'none';
        formRegistrazione.style.display = 'block'; // Mostra il form del nome
    } else {
        msgErroreEnigma.style.display = 'block';
    }
});


// --- LOGICA DELLE SCELTE DI GALEAZZO (GIORNO 1) ---

const btnPaga = document.getElementById('scelta-paga');
const btnFavore = document.getElementById('scelta-favore');
const btnReale = document.getElementById('scelta-reale');
const contenitoreScelte = document.getElementById('scelte-storia');
const enigmaReale = document.getElementById('enigma-reale');
const btnConfermaReale = document.getElementById('btn-conferma-reale');

// Variabile temporanea per le monete (poi la collegheremo a Supabase)
let argentoGiocatore = 50;

btnPaga.addEventListener('click', () => {
    argentoGiocatore -= 25;
    document.getElementById('argento-personaggio').innerText = `Argento: ${argentoGiocatore}`;
    alert("Galeazzo intasca le monete con un sorriso avido. «Il posto per domani mattina è tuo. Ci vediamo oltre la Porta.»\n\n[Hai sbloccato il Giorno 2!]");
    // In futuro qui nasconderemo il Giorno 1 e mostreremo il Giorno 2
});

btnFavore.addEventListener('click', () => {
    alert("Galeazzo annuisce, tirando fuori un patto magico. «Dovrai recuperarmi un vecchio grimorio al Mercato di Mezzo. Ti aspetto domani.»\n\n[Hai ottenuto la Quest: Il Grimorio di Galeazzo! Sbloccato Giorno 2!]");
    // In futuro salveremo su Supabase che il giocatore ha il "Debito di Galeazzo"
});

btnReale.addEventListener('click', () => {
    // Nascondiamo i bottoni e mostriamo l'indovinello fisico
    contenitoreScelte.style.display = 'none';
    enigmaReale.style.display = 'block';
});

btnConfermaReale.addEventListener('click', () => {
    const risposta = document.getElementById('risposta-reale').value.trim().toLowerCase();
    
    // La vera Porta Maggiore (Mazzini) ha due fori per il ponte levatoio.
    if(risposta === "2" || risposta === "due") {
        document.getElementById('errore-reale').style.display = 'none';
        alert("Galeazzo sbuffa, impressionato. «E va bene, forestiero. Hai fegato e vista buona. Il posto è tuo.»\n\n[Hai sbloccato il Giorno 2 mantenendo tutto il tuo argento!]");
    } else {
        document.getElementById('errore-reale').style.display = 'block';
    }
});