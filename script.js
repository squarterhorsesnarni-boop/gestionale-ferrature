// --- CONFIGURAZIONE DATABASE ---
const BIN_ID = "694d0f31d0ea881f403f5171";
const API_KEY = "$2a$10$rnrc3gm93AxacslbWtqGWeXkwnGZUTHMuxP05ijc7f5gA1p5pQOja";
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const PASSWORD = "dogsehorses26";

let db = {
    cavalli: [],
    lezioni: []
};

// --- LOGIN ---
function checkPassword() {
    const inputPsw = document.getElementById("psw");
    const loginScreen = document.getElementById("login-screen");
    const mainApp = document.getElementById("main-app");

    if (inputPsw.value === PASSWORD) {
        loginScreen.style.display = "none";
        mainApp.style.display = "block";
        caricaDati();
    } else {
        alert("Password errata!");
    }
}

// --- CARICAMENTO E SALVATAGGIO ---
async function caricaDati() {
    try {
        const response = await fetch(`${API_URL}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const data = await response.json();
        db = data.record || { cavalli: [], lezioni: [] };
        renderAll();
    } catch (e) { console.error("Errore download:", e); }
}

async function salvaCloud() {
    try {
        await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
            body: JSON.stringify(db)
        });
        renderAll();
    } catch (e) { console.error("Errore salvataggio:", e); }
}

function renderAll() {
    renderFerrature();
    renderLezioni();
}

// --- LOGICA MODULI ---
document.addEventListener("DOMContentLoaded", () => {
    // MODULO CAVALLI (CON LOGICA SOVRASCRITTURA)
    const formCavallo = document.getElementById("form-cavallo");
    if (formCavallo) {
        formCavallo.addEventListener("submit", function(e) {
            e.preventDefault();
            const nomeInput = document.getElementById("nome").value.trim();
            const dataInput = document.getElementById("ultima").value;
            const intervalloInput = document.getElementById("intervallo").value;

            // Controllo se il cavallo esiste già
            const indexEsistente = db.cavalli.findIndex(c => c.nome === nomeInput);

            if (indexEsistente !== -1) {
                const conferma = confirm(`Il cavallo ${nomeInput} è già presente. Vuoi sovrascrivere i dati con la nuova data di ferratura?`);
                if (conferma) {
                    db.cavalli[indexEsistente].ultima = dataInput;
                    db.cavalli[indexEsistente].intervallo = intervalloInput;
                    db.cavalli[indexEsistente].pagato = false; // Reset pagamento su nuova ferratura
                } else {
                    return; // Annulla l'operazione
                }
            } else {
                // Nuovo inserimento
                db.cavalli.push({
                    nome: nomeInput,
                    ultima: dataInput,
                    intervallo: intervalloInput,
                    pagato: false
                });
            }

            salvaCloud();
            e.target.reset();
        });
    }

    // MODULO LEZIONI
    const formLezione = document.getElementById("form-lezione");
    if (formLezione) {
        formLezione.addEventListener("submit", function(e) {
            e.preventDefault();
            db.lezioni.push({
                id: Date.now(),
                allievo: document.getElementById("allievo").value,
                data: document.getElementById("data-lezione").value,
                ora: document.getElementById("ora-lezione").value,
                stato: document.getElementById("stato-pagamento").value
            });
            salvaCloud();
            e.target.reset();
        });
    }
});

// --- RENDER FERRATURE (ORDINAMENTO PER DATA ULTIMA) ---
function renderFerrature() {
    const contMob = document.getElementById("lista-cavalli");
    const contDesk = document.querySelector("#tabella-cavalli tbody");
    if (!contMob || !contDesk) return;

    contMob.innerHTML = "";
    contDesk.innerHTML = "";
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // ORDINAMENTO: I più vecchi (data ultima ferratura più lontana) per primi
    const visualizzati = [...db.cavalli].sort((a, b) => new Date(a.ultima) - new Date(b.ultima));

    visualizzati.forEach((c) => {
        // Calcolo indice originale per funzioni elimina/aggiorna
        const originalIdx = db.cavalli.findIndex(orig => orig.nome === c.nome);
        
        const p = new Date(c.ultima);
        p.setDate(p.getDate() + parseInt(c.intervallo));
        const diff = Math.ceil((p - oggi) / 86400000);

        const uIT = c.ultima.split('-').reverse().join('/');
        const pIT = p.toISOString().split('T')[0].split('-').reverse().join('/');

        const colStato = diff < 0 ? 'bg-scaduto' : (diff <= 7 ? 'bg-inscadenza' : 'bg-buono');
        const colPagato = c.pagato ? 'bg-buono' : 'bg-inscadenza';

        // MOBILE
        contMob.innerHTML += `
            <div class="card ${diff < 0 ? 'scaduto' : 'buono'}">
                <div class="nome">${c.nome} <span onclick="eliminaCavallo(${originalIdx})" style="cursor:pointer">🗑️</span></div>
                <div style="font-size:0.9em; color:#555;">Ultima: ${uIT}</div>
                <div>Prossima: <strong>${pIT}</strong></div>
                <div style="margin:8px 0"><strong>Mancano: ${diff} gg</strong></div>
                <div class="azioni-grid">
                    <button class="btn-action" style="background:#3498db; color:white" onclick="aggiornaFerratura(${originalIdx})">🔨 OGGI</button>
                    <button class="btn-action ${colPagato}" style="color:white" onclick="togglePagamentoFerratura(${originalIdx})">${c.pagato ? 'PAGATO' : 'DA PAGARE'}</button>
                </div>
            </div>`;

        // DESKTOP
        contDesk.innerHTML += `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${uIT}</td>
                <td>${c.intervallo} gg</td>
                <td>${pIT}</td>
                <td>${diff}</td>
                <td>
                    <span class="stato ${colStato}">${diff < 0 ? 'SCADUTO' : 'OK'}</span>
                    <span class="stato ${colPagato}" onclick="togglePagamentoFerratura(${originalIdx})" style="cursor:pointer">${c.pagato ? 'PAGATO' : 'DA PAGARE'}</span>
                </td>
                <td>
                    <button class="btn-tabella" onclick="aggiornaFerratura(${originalIdx})">🔨</button>
                    <button class="btn-tabella" onclick="eliminaCavallo(${originalIdx})">🗑️</button>
                </td>
            </tr>`;
    });
}

// Funzioni di supporto rimanenti (aggiornaFerratura, togglePagamentoFerratura, eliminaCavallo, renderLezioni, ecc.) restano identiche alle precedenti...
// [Sotto riporto per completezza le funzioni necessarie per il funzionamento]

function aggiornaFerratura(i) {
    db.cavalli[i].ultima = new Date().toISOString().split('T')[0];
    db.cavalli[i].pagato = false;
    salvaCloud();
}
function togglePagamentoFerratura(i) {
    db.cavalli[i].pagato = !db.cavalli[i].pagato;
    salvaCloud();
}
function eliminaCavallo(i) {
    if (confirm("Eliminare definitivamente?")) {
        db.cavalli.splice(i, 1);
        salvaCloud();
    }
}
function renderLezioni() {
    const contMob = document.getElementById("lista-lezioni");
    const contDesk = document.querySelector("#tabella-lezioni tbody");
    if (!contMob || !contDesk) return;
    contMob.innerHTML = ""; contDesk.innerHTML = "";
    const ordinate = [...db.lezioni].sort((a, b) => new Date(b.data) - new Date(a.data) || a.ora.localeCompare(b.ora));
    ordinate.forEach(l => {
        const isPagato = l.stato === 'pagato';
        const colPag = isPagato ? 'bg-buono' : 'bg-inscadenza';
        const dIT = l.data.split('-').reverse().join('/');
        contMob.innerHTML += `<div class="card-lezione ${isPagato ? 'pagato' : 'da-pagare'}"><div style="display:flex; justify-content:space-between"><div><strong>${l.allievo}</strong><br><small>${dIT} - ${l.ora}</small></div><span class="badge ${colPag}">${l.stato}</span></div><div class="azioni-grid"><button class="btn-action ${colPag}" style="color:white" onclick="togglePagamentoLezione(${l.id})">${isPagato ? 'Annulla' : 'Paga'}</button><button class="btn-action btn-duplica" onclick="duplicaLezione(${l.id})">➕7gg</button><button class="btn-action btn-elimina" onclick="eliminaLezione(${l.id})">🗑️</button></div></div>`;
        contDesk.innerHTML += `<tr><td><strong>${l.allievo}</strong></td><td>${dIT}</td><td>${l.ora}</td><td><span class="stato ${colPag}">${l.stato}</span></td><td><button class="btn-tabella" onclick="togglePagamentoLezione(${l.id})">🔄</button><button class="btn-tabella" onclick="duplicaLezione(${l.id})">➕</button><button class="btn-tabella" onclick="eliminaLezione(${l.id})">🗑️</button></td></tr>`;
    });
}
function togglePagamentoLezione(id) {
    const l = db.lezioni.find(x => x.id === id);
    if (l) l.stato = l.stato === 'pagato' ? 'da-pagare' : 'pagato';
    salvaCloud();
}
function duplicaLezione(id) {
    const l = db.lezioni.find(x => x.id === id);
    let d = new Date(l.data); d.setDate(d.getDate() + 7);
    db.lezioni.push({...l, id: Date.now(), data: d.toISOString().split('T')[0], stato: 'da-pagare'});
    salvaCloud();
}
function eliminaLezione(id) {
    if (confirm("Eliminare?")) { db.lezioni = db.lezioni.filter(x => x.id !== id); salvaCloud(); }
}
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}