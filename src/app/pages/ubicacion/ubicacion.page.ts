import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { environment } from 'src/environments/environment';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  map: google.maps.Map | undefined;
  currentMarker: google.maps.Marker | undefined;
  solicitud: SolicitudDeEmergencia | undefined;

  constructor(private router: Router) { }


  ngOnInit() {

    const navigation = this.router.getCurrentNavigation();

    // Verifica si hay una navegación y si tiene parámetros
    if (navigation?.extras?.state) {
      this.solicitud = navigation.extras.state['solicitud'];
      console.log(`Ubicación recibida: Latitud = ${this.solicitud?.latitud}, Longitud = ${this.solicitud?.longitud}`);
    }

    const loader = new Loader({
      apiKey: environment.GOOGLE_MAP_TOKEN,  // Tu API key
      version: 'weekly',
    });

    loader.importLibrary('marker').then(() => {
      if (this.solicitud?.latitud && this.solicitud?.longitud) {
        // Asegúrate de que las coordenadas son cadenas antes de pasarlas a initMap
        this.initMap(this.solicitud.latitud.toString(), this.solicitud.longitud.toString());
      } else {
        this.initMap();
      }
    }).catch((error) => {
      console.error('Error al cargar la API de Google Maps: ', error);
    });


  }

  initMap(latitud?: string, longitud?: string) {
    if (latitud && longitud) {
      // Si hay parámetros de latitud y longitud, inicializa el mapa con esos valores.
      this.iniciarConParametros(latitud, longitud);
      console.log('Hay Parametros');
    } else {
      console.log('No Hay Parametros');
      this.iniciarSinParametros();
    }
  }

  async iniciarSinParametros() {
    console.log("Iniciando sin parametros...");
    try {
      // Verifica si ya se tienen permisos para acceder a la ubicación.
      console.log("Comprobando permisos de ubicación...");
      const permission = await Geolocation.checkPermissions();
      console.log('Permiso actual: ', permission);

      if (permission.location !== 'granted') {
        // Si no se tienen permisos, solicita permisos.
        console.log("Solicitando permisos...");
        const requestPermission = await Geolocation.requestPermissions();
        console.log('Respuesta de solicitud de permisos: ', requestPermission);

        if (requestPermission.location !== 'granted') {
          console.error('No se ha concedido permiso para acceder a la ubicación.');
          alert('No se ha concedido permiso para acceder a la ubicación.');
          return;
        }
      }

      // Si se conceden los permisos, obtiene la ubicación.
      console.log("Obteniendo la ubicación...");
      const position = await Geolocation.getCurrentPosition();
      console.log('Ubicación obtenida:', position);

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const userLatLng = new google.maps.LatLng(lat, lng);

      const mapOptions: google.maps.MapOptions = {
        center: userLatLng,
        zoom: 15,
      };

      // Asegúrate de que el div con id="map" existe y tiene tamaño.
      const mapElement = document.getElementById('map') as HTMLElement;

      if (mapElement) {
        console.log("Cargando mapa...");
        this.map = new google.maps.Map(mapElement, mapOptions);

        // Crear el marcador con la ubicación actual.
        this.currentMarker = new google.maps.Marker({
          position: userLatLng,
          map: this.map,
        });

        console.log("Mapa cargado correctamente.");
      } else {
        console.error('No se encontró el contenedor del mapa');
      }
    } catch (error) {
      console.error('Error al obtener la ubicación: ', error);
      alert('No se pudo obtener la ubicación.');
    }
  }



  iniciarConParametros(latitud: string, longitud: string) {
    const lat = parseFloat(latitud); // Convierte la latitud a número
    const lng = parseFloat(longitud); // Convierte la longitud a número

    const latLng = new google.maps.LatLng(lat, lng);

    const mapOptions: google.maps.MapOptions = {
      center: latLng,
      zoom: 15,
    };

    // Asegúrate de que el div con id="map" existe
    const mapElement = document.getElementById('map') as HTMLElement;

    if (mapElement) {
      this.map = new google.maps.Map(mapElement, mapOptions);

      // Crear el marcador en la ubicación pasada por parámetros
      this.currentMarker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
    } else {
      console.error('No se encontró el contenedor del mapa');
    }
  }

  // actualizarUbicacion() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const lat = position.coords.latitude;
  //         const lng = position.coords.longitude;
  //         const newLatLng = new google.maps.LatLng(lat, lng);

  //         // Asegúrate de que el mapa y el marcador estén definidos antes de intentar actualizarlos
  //         if (this.map && this.currentMarker) {
  //           this.map.setCenter(newLatLng); // Actualizar el centro del mapa
  //           this.currentMarker.setPosition(newLatLng); // Mover el marcador
  //         }
  //       },
  //       (error) => {
  //         console.error('Error al obtener la ubicación: ', error);
  //         alert('No se pudo obtener la ubicación.');
  //       }
  //     );
  //   } else {
  //     alert('La geolocalización no es compatible con este navegador.');
  //   }
  // }
}
