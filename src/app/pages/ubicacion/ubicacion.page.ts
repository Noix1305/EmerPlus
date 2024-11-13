import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  map: google.maps.Map | undefined;
  markers: google.maps.Marker[] = [];
  currentMarker: google.maps.Marker | undefined; // Para mantener el marcador actual

  ngOnInit() {
    const loader = new Loader({
      apiKey: environment.GOOGLE_MAP_TOKEN, // Reemplaza con tu API Key
      version: 'weekly',
      libraries: ['places', 'geometry', 'drawing'], // Asegúrate de incluir otras librerías necesarias
    });

    loader.load().then(() => {
      this.initMap();
    }).catch((error) => {
      console.error('Error al cargar la API de Google Maps: ', error);
    });
  }

  initMap() {
    // Verificar si la geolocalización está disponible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Obtener la ubicación actual
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Crear un objeto LatLng para la ubicación del usuario
          const userLatLng = new google.maps.LatLng(lat, lng);

          // Inicializar el mapa con la ubicación actual
          const mapOptions: google.maps.MapOptions = {
            center: userLatLng,  // Usar la ubicación del usuario
            zoom: 15,  // Aumentar el zoom para acercarse a la ubicación
          };

          // Crear el mapa en el elemento HTML con la id 'map'
          this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

          // Crear un marcador en la ubicación del usuario
          this.currentMarker = new google.maps.Marker({
            position: userLatLng,
            map: this.map,
          });

          this.markers.push(this.currentMarker);
        },
        (error) => {
          console.error('Error al obtener la ubicación: ', error);
          // Si no se puede obtener la ubicación, mostrar un mensaje de error o usar una ubicación predeterminada
          alert('No se pudo obtener la ubicación.');
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  }

  // Función para actualizar la ubicación
  actualizarUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Obtener la nueva ubicación
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Crear el nuevo LatLng
          const newLatLng = new google.maps.LatLng(lat, lng);

          // Actualizar el centro del mapa
          if (this.map) {
            this.map.setCenter(newLatLng);
          }

          // Mover el marcador a la nueva ubicación
          if (this.currentMarker) {
            this.currentMarker.setPosition(newLatLng);
          }
        },
        (error) => {
          console.error('Error al obtener la ubicación: ', error);
          alert('No se pudo obtener la ubicación.');
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  }
}
