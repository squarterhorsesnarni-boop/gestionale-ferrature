/* --- CONFIGURAZIONE DATABASE (JSONBin.io) --- */
const BIN_ID = "694d0f31d0ea881f403f5171"; 
const API_KEY = "$2a$10$rnrc3gm93AxacslbWtqGWeXkwnGZUTHMuxP05ijc7f5gA1p5pQOja"; 

// URL base per le chiamate
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Variabile globale per tenere i dati in memoria mentre l'utente lavora
let listaCavalli = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
  document.getElementById("form-cavallo").addEventListener("submit", salvaCavallo);
  caricaDati(); // Avvia il download dei dati dal cloud
}

/* 1. SCARICA I DATI DAL CLOUD */
function caricaDati() {
  mostraCaricamento(true);
  
  fetch(API_URL + "/latest", {
    method: "GET",
    headers: {
      "X-Master-Key": API_KEY
    }
  })
  .then(response => response.json())
  .then(data => {
    // JSONBin restituisce i dati dentro un oggetto "record"
    listaCavalli = data.record || [];
    render();
    mostraCaricamento(false);
  })
  .catch(err => {
    console.error("Errore download:", err);
    alert("Errore nel caricamento dei dati! Controlla la connessione.");
    mostraCaricamento(false);
  });
}

/* 2. SALVA I DATI NEL CLOUD (Sovrascrive il file) */
function aggiornaCloud() {
  mostraCaricamento(true);

  fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(listaCavalli)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Salvataggio riuscito");
    mostraCaricamento(false);
    render(); // Ridisegna per sicurezza
  })
  .catch(err => {
    console.error("Errore salvataggio:", err);
    alert("Impossibile salvare! Riprova.");
    mostraCaricamento(false);
  });
}

/* 3. AGGIUNGI CAVALLO */
function salvaCavallo(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const ultima = document.getElementById("ultima").value;
  const intervallo = parseInt(document.getElementById("intervallo").value);

  if (!nome || !ultima || !intervallo) return;

  // Aggiungiamo alla lista locale e poi inviamo tutto al cloud
  listaCavalli.push({ nome, ultima, intervallo });
  
  aggiornaCloud(); // Salva online
  e.target.reset();
}

/* 4. RIMUOVI CAVALLO */
function eliminaCavallo(index) {
  if(confirm("Sei sicuro di voler rimuovere questo cavallo?")) {
    listaCavalli.splice(index, 1);
    aggiornaCloud(); // Salva online le modifiche
  }
}

/* 5. DISEGNA L'INTERFACCIA */
function render() {
  const containerMobile = document.getElementById("lista-cavalli");
  const containerDesktop = document.querySelector("#tabella-cavalli tbody");
  
  containerMobile.innerHTML = "";
  containerDesktop.innerHTML = "";

  const oggi = new Date();
  oggi.setHours(0,0,0,0); // Ignoriamo l'ora per calcoli precisi

  listaCavalli.forEach((c, i) => {
    const ultima = new Date(c.ultima);
    const prossima = new Date(ultima);
    prossima.setDate(prossima.getDate() + c.intervallo);
    
    // Differenza in giorni
    const diff = Math.ceil((prossima - oggi) / (1000 * 60 * 60 * 24));

    let statoTesto = "BUONO";
    let classeColore = "bg-buono"; // Nota: classi aggiornate per corrispondere al CSS
    
    if (diff < 0) { 
        statoTesto = "SCADUTO"; 
        classeColore = "bg-scaduto"; 
    } else if (diff <= 7) { 
        statoTesto = "IN SCADENZA"; 
        classeColore = "bg-inscadenza"; 
    }

    // --- Versione Mobile ---
    const card = document.createElement("div");
    card.className = `card ${classeColore.replace('bg-', '')}`; // Aggiunge bordo colorato
    card.innerHTML = `
      <div class="nome">
        ${c.nome} 
        <button onclick="eliminaCavallo(${i})" style="background:none; border:none; font-size:18px;">❌</button>
      </div>
      <div class="dati">📅 Ultima: ${c.ultima}</div>
      <div class="dati">🔮 Prossima: ${prossima.toISOString().split("T")[0]}</div>
      <div class="dati">⏳ Mancano: <strong>${diff} gg</strong></div>
      <div style="margin-top:10px;">
        <span class="stato ${classeColore}">${statoTesto}</span>
      </div>
    `;
    containerMobile.appendChild(card);

    // --- Versione Desktop ---
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${c.nome}</strong></td>
      <td>${c.ultima}</td>
      <td>${c.intervallo} gg</td>
      <td>${prossima.toISOString().split("T")[0]}</td>
      <td><strong>${diff}</strong></td>
      <td><span class="stato ${classeColore}">${statoTesto}</span></td>
      <td><button onclick="eliminaCavallo(${i})">Elimina</button></td>
    `;
    containerDesktop.appendChild(row);
  });
}

function mostraCaricamento(isLoading) {
    const btn = document.querySelector("form button");
    if(isLoading) {
        btn.textContent = "⏳ Attendi...";
        btn.disabled = true;
        document.body.style.cursor = "wait";
    } else {
        btn.textContent = "Salva";
        btn.disabled = false;
        document.body.style.cursor = "default";
    }
}