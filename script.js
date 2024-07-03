let h2 = document.querySelector('h2');
let map;
let brasilLayer;
let geojsonFiles = [
  'https://github.com/mkgtcreator/M.I/main/geojson/norte.geojson',
  'https://github.com/mkgtcreator/M.I/main/geojson/nordeste.geojson',
  'https://github.com/mkgtcreator/M.I/main/geojson/centro-oeste.geojson',
  'https://github.com/mkgtcreator/M.I/main/geojson/sudeste.geojson',
  'https://github.com/mkgtcreator/M.I/main/geojson/sul.geojson'
];

// Função para inicializar o mapa e centralizá-lo no Brasil com controle de zoom
function initMap() {
  map = L.map('mapid').setView([-15.7942, -47.8821], 2);
  if (!map) {
    console.error('Failed to initialize the map');
    return;
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Adicionar controle de zoom personalizado
  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  // Carregar dados GeoJSON
  loadBrasilData();
}

// Função para carregar arquivos GeoJSON e adicioná-los ao mapa
function loadBrasilData() {
  geojsonFiles.forEach(file => {
    fetch(file)
      .then(response => response.json())
      .then(data => {
        if (!data) {
          console.error('Failed to load data from ' + file);
          return;
        }
        brasilLayer = L.geoJson(data, {
          style: function(feature) {
            return {
              weight: 2,
              opacity: 1,
              color: 'white',
              fillOpacity: 0.7,
              fillColor: '#4CAF50'
            };
          },
          onEachFeature: function(feature, layer) {
            layer.on({
              mouseover: highlightFeature,
              mouseout: resetHighlight,
              click: enviarLocalizacao
            });
          }
        }).addTo(map);
      })
      .catch(error => {
        console.error('Erro ao carregar ' + file + ':', error);
      });
  });
}

// Define as funções de highlight e reset
function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 3,
    color: '#3388ff',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie &&!L.Browser.opera &&!L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  brasilLayer.resetStyle(e.target);
}

function enviarLocalizacao(e) {
  var region = e.latlng;
  var regionName = `Latitude: ${region.lat}, Longitude: ${region.lng}`;

  fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer pat-na1-f1d2ed0f-2135-4ab4-8efa-d0ec5c153365'
    },
    body: JSON.stringify({ location: regionName })
  })
   .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao enviar localização: ' + response.statusText);
      }
      return response.json();
    })
   .then(data => {
      console.log('Success:', data);
      alert('Sua localização foi registrada com sucesso!');
    })
   .catch((error) => {
      console.error('Erro ao enviar localização:', error);
      alert('Houve um erro ao enviar a localização.');
    });
}

function success(pos) {
  console.log(pos.coords.latitude, pos.coords.longitude);
  h2.textContent = `Latitude: ${pos.coords.latitude}, Longitude: ${pos.coords.longitude}`;

  if (!map) {
    initMap();
  }

  map.setView([pos.coords.latitude, pos.coords.longitude], 13);

  L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map)
   .bindPopup('Eu estou aqui.<br> Facilmente customizável.')
   .openPopup();
}

function error(err) {
  console.error(err);
}

navigator.geolocation.watchPosition(success, error, {
  enableHighAccuracy: true,
  timeout: 5000
});

// Inicializar o mapa
initMap();