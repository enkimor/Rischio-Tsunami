// Inizializza la mappa principale
const map = L.map('map').setView([40.182, 16.713], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Funzione per caricare e visualizzare un itinerario GeoJSON
function caricaItinerarioGeoJSON(url, descrizione) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const percorso = L.geoJSON(data, {
        style: {
          color: '#0044cc', // Colore blu per l'itinerario
          weight: 4
        }
      }).addTo(map);

      // Aggiungi un popup con la descrizione del percorso
      percorso.bindPopup(descrizione);
    })
    .catch(error => {
      console.error(`Errore nel caricamento del file GeoJSON da ${url}:`, error);
    });
}

// Elenco degli itinerari obbligatori
const itinerari = [
  { url: 'geojson/itinerario 1 via lido.json', descrizione: 'Itinerario 1: Via Lido' },
  { url: 'geojson/itinerario 2 viale san giusto.json', descrizione: 'Itinerario 2: Viale San Giusto' },
  { url: 'geojson/itinerario 3 viale catone.json', descrizione: 'Itinerario 3: Viale Catone' },
  { url: 'geojson/itinerario 4 via lido.json', descrizione: 'Itinerario 4: Via Lido' },
  { url: 'geojson/itinerario 5 via mascagni.json', descrizione: 'Itinerario 5: Via Mascagni' } // Nuovo itinerario aggiunto
];

// Carica tutti gli itinerari sulla mappa
itinerari.forEach(itinerario => {
  caricaItinerarioGeoJSON(itinerario.url, itinerario.descrizione);
});

// Funzione per aggiungere aree di attesa
const areeAttesa = [
  { coords: [40.209, 16.666], descrizione: 'Area di attesa 1' },
  { coords: [40.203, 16.671], descrizione: 'Area di attesa 2' }
];

// Icona personalizzata per le aree di attesa
const areaAttesaIcon = L.icon({
  iconUrl: 'img/area-attesa-icon.png', // Verifica che il file esista
  iconSize: [30, 30], // Dimensioni dell'icona
  iconAnchor: [15, 30] // Punto di ancoraggio
});

// Aggiungi le aree di attesa alla mappa
areeAttesa.forEach(area => {
  L.marker(area.coords, { icon: areaAttesaIcon })
    .addTo(map)
    .bindPopup(area.descrizione);
});

console.log("La mappa è stata aggiornata con l'itinerario 5 e le aree di attesa.");

// Carica e visualizza l'area di rischio sulla mappa
function caricaAreaDiRischio() {
  fetch('geojson/area di rischio.geojson') // Percorso del file GeoJSON
    .then(response => response.json())
    .then(data => {
      const areaRischio = L.geoJSON(data, {
        style: {
          color: 'red', // Colore del bordo
          weight: 3, // Spessore del bordo
          fillColor: 'rgba(255, 0, 0, 0.2)', // Colore di riempimento
          fillOpacity: 0.4 // Opacità del riempimento
        }
      }).addTo(map);

      // Centra la mappa sull'area di rischio
      map.fitBounds(areaRischio.getBounds());
    })
    .catch(error => {
      console.error('Errore nel caricamento del file GeoJSON:', error);
    });
}

// Chiama la funzione per caricare l'area di rischio
caricaAreaDiRischio();

// Funzione per aggiungere la geolocalizzazione con icona personalizzata
function aggiungiGeolocalizzazione() {
  if (!navigator.geolocation) {
    alert('Il tuo browser non supporta la geolocalizzazione. Prova ad aggiornare il browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    const userIcon = L.icon({
      iconUrl: 'img/user-location.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    L.marker([userLat, userLon], { icon: userIcon }).addTo(map)
      .bindPopup('La tua posizione attuale.')
      .openPopup();

    map.setView([userLat, userLon], 13);
  }, (error) => {
    console.error('Errore nella geolocalizzazione:', error);
    let errorMessage = 'Errore sconosciuto.';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Hai negato l\'accesso alla geolocalizzazione. Abilitala per utilizzare questa funzionalità.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Informazioni sulla posizione non disponibili.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Richiesta di geolocalizzazione scaduta.';
        break;
    }
    alert(errorMessage);
  });
}

// Funzione per tracciare la posizione dell'utente in tempo reale
function tracciaPosizioneUtente() {
  if (!navigator.geolocation) {
    alert('Il tuo browser non supporta la geolocalizzazione.');
    return;
  }

  console.log('Geolocalizzazione supportata. Inizio il tracciamento della posizione...');

  navigator.geolocation.watchPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      console.log(`Posizione aggiornata: Latitudine ${userLat}, Longitudine ${userLon}`);

      const userIcon = L.icon({
        iconUrl: 'img/user-location.png', // Verifica che il file esista
        iconSize: [30, 30], // Dimensioni dell'icona
        iconAnchor: [15, 30] // Punto di ancoraggio
      });

      // Aggiorna la posizione dell'utente sulla mappa
      if (window.userMarker) {
        window.userMarker.setLatLng([userLat, userLon]);
        console.log('Marker aggiornato sulla mappa.');
      } else {
        window.userMarker = L.marker([userLat, userLon], { icon: userIcon }).addTo(map)
          .bindPopup('La tua posizione attuale.');
        console.log('Marker aggiunto sulla mappa.');
      }

      // Centra la mappa sulla posizione dell'utente
      map.setView([userLat, userLon], 13);
    },
    (error) => {
      console.error('Errore nella geolocalizzazione:', error);
      let errorMessage = 'Errore sconosciuto.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Hai negato l\'accesso alla geolocalizzazione. Abilitala per utilizzare questa funzionalità.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Informazioni sulla posizione non disponibili.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Richiesta di geolocalizzazione scaduta.';
          break;
      }
      alert(errorMessage);
    }
  );
}

// Avvia il tracciamento della posizione
tracciaPosizioneUtente();

// Chiamata per geolocalizzazione
aggiungiGeolocalizzazione();

// Mostra una notifica visiva e riproduce un suono
function mostraNotifica(messaggio = "⚠️ Allerta Tsunami: Segui gli itinerari di evacuazione!") {
  const notifica = document.getElementById("notifica");
  const alertAudio = document.getElementById("alertAudio");

  // Mostra la notifica
  notifica.textContent = messaggio;
  notifica.style.display = "block";

  // Riproduci il suono
  alertAudio.play();

  // Nascondi la notifica dopo 5 secondi
  setTimeout(() => {
    notifica.style.display = "none";
  }, 5000);
}

// Mostra la notifica all'avvio della pagina
window.onload = function () {
  mostraNotifica();
};

// Icona personalizzata per il COC
const cocIcon = L.icon({
  iconUrl: 'img/coc-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// Posizione del COC
const cocCoords = [40.208, 16.669];

// Aggiungi il marker del COC alla mappa
L.marker(cocCoords, { icon: cocIcon })
  .addTo(map)
  .bindPopup('Centro Operativo Comunale (COC)');

// Funzione per personalizzare il kit di emergenza
function personalizzaKit() {
  const oggettiAggiuntivi = prompt("Inserisci altri oggetti da aggiungere al tuo kit di emergenza, separati da una virgola:");
  if (!oggettiAggiuntivi.trim()) {
    alert("Nessun oggetto aggiunto.");
    return;
  }
  const listaKit = document.querySelector("#kit ul");
  oggettiAggiuntivi.split(",").forEach(oggetto => {
    const nuovoElemento = document.createElement("li");
    nuovoElemento.textContent = oggetto.trim();
    listaKit.appendChild(nuovoElemento);
  });
  alert("Oggetti aggiunti al kit di emergenza!");
}

// Funzione per inviare segnalazioni
document.addEventListener('DOMContentLoaded', () => {
  const formSegnalazioni = document.getElementById('form-segnalazioni');
  if (formSegnalazioni) {
    formSegnalazioni.addEventListener('submit', function (event) {
      event.preventDefault();
      const nome = document.getElementById('nome').value;
      const messaggio = document.getElementById('messaggio').value;

      if (!nome.trim() || !messaggio.trim()) {
        alert('Compila tutti i campi per inviare la segnalazione.');
        return;
      }

      document.getElementById('segnalazioni-risultato').style.display = 'block';
      setTimeout(() => {
        document.getElementById('segnalazioni-risultato').style.display = 'none';
      }, 5000);
    });
  }
});

// Funzione per ricevere notifiche in tempo reale
function riceviNotifiche() {
  const notifiche = [
    "⚠️ Allerta Maremoto: Evacuare immediatamente!",
    "🌊 Livello del mare in aumento, seguire gli itinerari di evacuazione.",
    "📢 Centro Operativo Comunale: Raggiungere le aree di attesa designate."
  ];

  let indice = 0;
  setInterval(() => {
    mostraNotifica(notifiche[indice]);
    indice = (indice + 1) % notifiche.length;
  }, 10000); // Mostra una notifica ogni 10 secondi
}

// Avvia il sistema di notifiche
riceviNotifiche();

// Elenco delle risorse
const risorse = [
  { coords: [40.213, 16.670], descrizione: 'Ospedale Policoro', tipo: 'ospedale' },
  { coords: [40.2117, 16.6718], descrizione: 'Punto di Raccolta 1', tipo: 'raccolta' },
  { coords: [40.2085, 16.6699], descrizione: 'Centro di Emergenza', tipo: 'emergenza' }
];

// Icone personalizzate per le risorse
const iconeRisorse = {
  ospedale: L.icon({ iconUrl: 'img/strutture-ospedaliere.png', iconSize: [30, 30], iconAnchor: [15, 30] }),
  raccolta: L.icon({ iconUrl: 'img/collection-point-icon.png', iconSize: [30, 30], iconAnchor: [15, 30] }),
  emergenza: L.icon({ iconUrl: 'img/aree-ammassamento-soccorritori.png', iconSize: [30, 30], iconAnchor: [15, 30] })
};

// Aggiungi le risorse alla mappa
risorse.forEach(risorsa => {
  L.marker(risorsa.coords, { icon: iconeRisorse[risorsa.tipo] })
    .addTo(map)
    .bindPopup(risorsa.descrizione);
});

// Funzione per avviare la simulazione di un maremoto
function avviaSimulazioneMaremoto() {
  const onde = [
    { coords: [[40.175, 16.706], [40.182, 16.713]], ritardo: 1000 },
    { coords: [[40.182, 16.713], [40.189, 16.719]], ritardo: 2000 },
    { coords: [[40.189, 16.719], [40.192, 16.722]], ritardo: 3000 }
  ];

  onde.forEach(onda => {
    setTimeout(() => {
      L.polyline(onda.coords, { color: 'blue', weight: 3 }).addTo(map)
        .bindPopup('Onda di maremoto in arrivo!');
    }, onda.ritardo);
  });

  alert("Simulazione del maremoto avviata! Guarda la mappa per vedere le onde in arrivo.");
}

// Avvia la simulazione
avviaSimulazioneMaremoto();

function toggleAudio() {
  const audioElement = document.getElementById('alertAudio');
  if (audioElement.muted) {
    audioElement.muted = false;
    alert('Audio attivato');
  } else {
    audioElement.muted = true;
    alert('Audio disattivato');
  }
}

function cercaStrada() {
  const query = document.getElementById('searchInput').value;

  if (!query.trim()) {
    alert('Inserisci il nome di una strada da cercare.');
    return;
  }

  // Effettua una richiesta al servizio Nominatim
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        // Centra la mappa sulla posizione trovata
        map.setView([lat, lon], 15);

        // Aggiungi un marker sulla posizione trovata
        L.marker([lat, lon]).addTo(map)
          .bindPopup(`Risultato della ricerca: ${data[0].display_name}`)
          .openPopup();
      } else {
        alert('Nessun risultato trovato per la ricerca.');
      }
    })
    .catch(error => {
      console.error('Errore nella ricerca:', error);
      alert('Si è verificato un errore durante la ricerca.');
    });
}

function toggleGuida() {
  const contenutoGuida = document.getElementById('contenutoGuida');
  const button = document.getElementById('toggleGuida');
  
  if (contenutoGuida.style.display === 'none') {
    contenutoGuida.style.display = 'block';
    button.textContent = 'Nascondi Cosa Fare';
  } else {
    contenutoGuida.style.display = 'none';
    button.textContent = 'Cosa Fare in Caso di Tsunami';
  }
}

