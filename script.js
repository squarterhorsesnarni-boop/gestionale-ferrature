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
    
    if (!listaCavalli) return; 

    const searchInput = document.getElementById("search");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    
    containerMobile.innerHTML = "";
    containerDesktop.innerHTML = "";

    const oggi = new Date();
    oggi.setHours(0,0,0,0);

    // Funzione rapida per convertire AAAA-MM-GG in GG/MM/AAAA
    const formattaDataIT = (dataISO) => {
        if (!dataISO) return "-";
        const [anno, mese, giorno] = dataISO.split('-');
        return `${giorno}/${mese}/${anno}`;
    };

    let cavalliVisualizzati = listaCavalli.map((c, index) => {
        const ultima = new Date(c.ultima);
        const prossima = new Date(ultima);
        prossima.setDate(prossima.getDate() + c.intervallo);
        return { 
            ...c, 
            prossima, 
            originaleIndex: index 
        };
    });

    if (searchTerm) {
        cavalliVisualizzati = cavalliVisualizzati.filter(c => 
            c.nome.toLowerCase().includes(searchTerm)
        );
    }

    cavalliVisualizzati.sort((a, b) => a.prossima - b.prossima);

    cavalliVisualizzati.forEach((c) => {
        const diff = Math.ceil((c.prossima - oggi) / 86400000);
        
        // Prepariamo le date formattate per la visualizzazione
        const ultimaFormattata = formattaDataIT(c.ultima);
        const prossimaFormattata = formattaDataIT(c.prossima.toISOString().split('T')[0]);

        let stato = "BUONO", classe = "buono", bg = "bg-buono";
        if (diff < 0) { stato = "SCADUTO"; classe = "scaduto"; bg = "bg-scaduto"; }
        else if (diff <= 7) { stato = "IN SCADENZA"; classe = "inscadenza"; bg = "bg-inscadenza"; }

        // Render Mobile
        const card = document.createElement("div");
        card.className = `card ${classe}`;
        card.innerHTML = `
            <div class="nome">
                ${c.nome} 
                <span onclick="eliminaCavallo(${c.originaleIndex})" style="cursor:pointer; font-size: 16px;">🗑️</span>
            </div>
            <div style="font-size:14px; color: #666;">
                Ultima: ${ultimaFormattata} | Prossima: ${prossimaFormattata}
            </div>
            <div style="margin: 12px 0; font-size: 16px;">
                <strong>Mancano: ${diff} giorni</strong>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <span class="stato ${bg}">${stato}</span>
                <button onclick="aggiornaFerratura(${c.originaleIndex})" 
                        style="flex:1; background:#3498db; color:white; border:none; border-radius:6px; padding:10px; font-weight:bold; cursor:pointer;">
                        🔨 FERRATO OGGI
                </button>
            </div>`;
        containerMobile.appendChild(card);

        // Render Desktop
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.nome}</strong></td>
            <td>${ultimaFormattata}</td>
            <td>${c.intervallo} gg</td>
            <td>${prossimaFormattata}</td>
            <td><strong>${diff}</strong></td>
            <td><span class="stato ${bg}">${stato}</span></td>
            <td>
                <button onclick="aggiornaFerratura(${c.originaleIndex})" 
                        style="background:#3498db; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">
                        🔨 Oggi
                </button>
                <button onclick="eliminaCavallo(${c.originaleIndex})" 
                        style="background:#f1f2f6; color:#e74c3c; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-left:5px;">
                        🗑️
                </button>
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