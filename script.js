// --- CONFIGURAZIONE ---
const BIN_ID = "694d0f31d0ea881f403f5171"; 
const API_KEY = "$2a$10$rnrc3gm93AxacslbWtqGWeXkwnGZUTHMuxP05ijc7f5gA1p5pQOja"; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let listaCavalli = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("form-cavallo").addEventListener("submit", salvaCavallo);
    caricaDati();
});

function caricaDati() {
    toggleLoading(true);
    fetch(`${API_URL}/latest`, { headers: { "X-Master-Key": API_KEY } })
        .then(r => r.json())
        .then(data => {
            listaCavalli = data.record || [];
            render();
        })
        .finally(() => toggleLoading(false));
}

function salvaCloud() {
    toggleLoading(true);
    fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
        body: JSON.stringify(listaCavalli)
    })
    .then(() => render())
    .finally(() => toggleLoading(false));
}

function salvaCavallo(e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const ultima = document.getElementById("ultima").value;
    const intervallo = parseInt(document.getElementById("intervallo").value);

    const indexEsistente = listaCavalli.findIndex(c => c.nome.toLowerCase() === nome.toLowerCase());

    if (indexEsistente !== -1) {
        if (!confirm(`Il cavallo "${nome}" esiste già. Sovrascrivere i dati?`)) return;
        listaCavalli[indexEsistente] = { nome, ultima, intervallo };
    } else {
        listaCavalli.push({ nome, ultima, intervallo });
    }
    
    salvaCloud();
    e.target.reset();
}

function aggiornaFerratura(index) {
    const oggi = new Date().toISOString().split('T')[0];
    if (confirm(`Confermi ferratura per ${listaCavalli[index].nome} in data oggi?`)) {
        listaCavalli[index].ultima = oggi;
        salvaCloud();
    }
}

function eliminaCavallo(index) {
    if (confirm("Eliminare definitivamente questo cavallo?")) {
        listaCavalli.splice(index, 1);
        salvaCloud();
    }
}

function render() {
    const containerMobile = document.getElementById("lista-cavalli");
    const containerDesktop = document.querySelector("#tabella-cavalli tbody");
    const searchTerm = document.getElementById("search") ? document.getElementById("search").value.toLowerCase() : "";
    
    containerMobile.innerHTML = "";
    containerDesktop.innerHTML = "";

    const oggi = new Date();
    oggi.setHours(0,0,0,0);

    // 1. CREIAMO UNA COPIA PER NON ROVINARE L'ORIGINALE E CALCOLIAMO LE DATE
    let cavalliVisualizzati = listaCavalli.map((c, index) => {
        const ultima = new Date(c.ultima);
        const prossima = new Date(ultima);
        prossima.setDate(prossima.getDate() + c.intervallo);
        return { ...c, prossima, originaleIndex: index }; // Teniamo l'indice originale per le funzioni elimina/aggiorna
    });

    // 2. FILTRIAMO IN BASE ALLA RICERCA
    if (searchTerm) {
        cavalliVisualizzati = cavalliVisualizzati.filter(c => 
            c.nome.toLowerCase().includes(searchTerm)
        );
    }

    // 3. ORDINIAMO PER DATA (Il più vecchio/urgente per primo)
    cavalliVisualizzati.sort((a, b) => a.prossima - b.prossima);

    // 4. DISEGNIAMO I RISULTATI
    cavalliVisualizzati.forEach((c) => {
        const diff = Math.ceil((c.prossima - oggi) / 86400000);

        let stato = "BUONO", classe = "buono", bg = "bg-buono";
        if (diff < 0) { stato = "SCADUTO"; classe = "scaduto"; bg = "bg-scaduto"; }
        else if (diff <= 7) { stato = "IN SCADENZA"; classe = "inscadenza"; bg = "bg-inscadenza"; }

        // Render Mobile
        const card = document.createElement("div");
        card.className = `card ${classe}`;
        card.innerHTML = `
            <div class="nome">${c.nome} <span onclick="eliminaCavallo(${c.originaleIndex})" style="cursor:pointer">🗑️</span></div>
            <div style="font-size:14px">Ultima: ${c.ultima} | Prossima: ${c.prossima.toISOString().split('T')[0]}</div>
            <div style="margin: 10px 0"><strong>Mancano: ${diff} giorni</strong></div>
            <div style="display:flex; gap:10px;">
                <span class="stato ${bg}">${stato}</span>
                <button onclick="aggiornaFerratura(${c.originaleIndex})" style="flex:1; background:#3498db; color:white; border:none; border-radius:5px; padding:5px; font-weight:bold; cursor:pointer;">🔨 FERRATO OGGI</button>
            </div>`;
        containerMobile.appendChild(card);

        // Render Desktop
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td>${c.ultima}</td>
            <td>${c.intervallo} gg</td>
            <td>${c.prossima.toISOString().split('T')[0]}</td>
            <td>${diff}</td>
            <td><span class="stato ${bg}">${stato}</span></td>
            <td>
                <button onclick="aggiornaFerratura(${c.originaleIndex})" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🔨 Oggi</button>
                <button onclick="eliminaCavallo(${c.originaleIndex})" style="background:#eee; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-left:5px;">🗑️</button>
            </td>`;
        containerDesktop.appendChild(row);
    });
}

function toggleLoading(isLoading) {
    const btn = document.getElementById("btn-salva");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Attendere..." : "Salva";
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("PWA: Service Worker Registrato"));
}