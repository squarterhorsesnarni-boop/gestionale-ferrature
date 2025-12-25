self.addEventListener('fetch', function(event) {
  // Questo permette all'app di funzionare anche con connessione instabile
  event.respondWith(fetch(event.request));
});