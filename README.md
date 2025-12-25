# 🐴 Gestione Ferrature Scuderia

Una web app leggera, veloce e sincronizzata in cloud per gestire il calendario delle ferrature dei cavalli. Progettata per essere utilizzata direttamente in scuderia tramite smartphone.



## ✨ Funzionalità principali

* **☁️ Sincronizzazione Real-time**: Grazie all'integrazione con JSONBin, i dati sono condivisi tra tutti i dispositivi (PC, Tablet, Smartphone).
* **📱 PWA (Progressive Web App)**: Installabile su smartphone come un'app nativa, con icona dedicata sulla home.
* **🔍 Ricerca Intelligente**: Filtra velocemente i cavalli per nome.
* **📅 Ordinamento Automatico**: I cavalli che richiedono attenzione immediata (scaduti o in scadenza) compaiono sempre in cima alla lista.
* **🔨 Aggiornamento Rapido**: Pulsante "Ferrato Oggi" per aggiornare la data con un solo tocco durante il lavoro del maniscalco.
* **⚠️ Gestione Duplicati**: Avviso automatico se si tenta di inserire un cavallo già presente, con opzione di sovrascrittura.

## 🚀 Installazione come App (Smartphone)

L'applicazione è una PWA. Per averla sulla schermata home:

1.  Apri il link di GitHub Pages sul browser dello smartphone.
2.  **Android (Chrome)**: Clicca sui tre puntini in alto e seleziona **"Installa app"**.
3.  **iOS (Safari)**: Clicca sul tasto **Condividi** (quadrato con freccia verso l'alto) e seleziona **"Aggiungi alla schermata Home"**.

## 🛠️ Tecnologie Utilizzate

* **HTML5 / CSS3**: Layout responsive con sistema a card per mobile e tabella per desktop.
* **JavaScript (ES6)**: Logica di filtraggio, ordinamento e gestione date.
* **JSONBin.io**: Database JSON esterno per la persistenza dei dati.
* **GitHub Pages**: Hosting statico gratuito.

## ⚙️ Configurazione per Sviluppatori

Se desideri clonare il progetto, ricordati di configurare le chiavi API nel file `script.js`:

```javascript
const BIN_ID = "IL_TUO_BIN_ID"; 
const API_KEY = "LA_TUA_X_MASTER_KEY";
