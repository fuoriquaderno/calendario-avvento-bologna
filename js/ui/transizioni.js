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
    if (!pergamena) { await aggiornaContenuto(); tornaInizioMain(); return; }
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
        await aggiornaContenuto();
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

window.cambiaPergamena=cambiaPergamena;
