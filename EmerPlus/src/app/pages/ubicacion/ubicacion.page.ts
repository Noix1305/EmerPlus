import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LoadingController, ToastController } from '@ionic/angular';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  map: mapboxgl.Map | undefined;
  markers: mapboxgl.Marker[] = [];

  constructor(private loadingController: LoadingController, private toastController: ToastController) { }

  async ngOnInit() {
    await this.presentLoading();
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoianBpbm8yNjEwIiwiYSI6ImNtMzBnaTF4YjBsYzgyaXB1b3A4MTF4MDgifQ.UHAesxhHmXsudPvRFjmsZg';

    // Obtener la ubicación antes de inicializar el mapa
    const ubicacion = await this.obtenerUbicacionActual();

    if (ubicacion) {
        const { latitud, longitud } = ubicacion;
        this.mostrarToast(''+ubicacion.latitud + ubicacion.longitud);

        // Inicializa el mapa con la ubicación obtenida
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [longitud, latitud], // Usa la ubicación obtenida
            zoom: 14 // Zoom deseado
        });

        // Añade un marcador en la ubicación inicial
        const marker = new mapboxgl.Marker()
            .setLngLat([longitud, latitud])
            .addTo(this.map);
        this.markers.push(marker);
    } else {
        this.mostrarToast('No se pudo obtener la ubicación. Mostrando una ubicación predeterminada.');

        // Inicializa el mapa en una ubicación predeterminada
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-74.5, 40], // Coordenadas predeterminadas
            zoom: 12
        });
    }
}

private async obtenerUbicacionActual(): Promise<{ latitud: number, longitud: number } | null> {
    try {
        // Verifica si la plataforma es nativa y solicita permisos
        if (Capacitor.isNativePlatform()) {
            const permission = await Geolocation.checkPermissions();
            if (permission.location !== 'granted') {
                const requestPermission = await Geolocation.requestPermissions();
                if (requestPermission.location !== 'granted') {
                    this.mostrarToast('Acceso a la ubicación denegado.');
                    return null;
                }
            }
        }

        // Obtener la ubicación
        const position = await Geolocation.getCurrentPosition();
        return { latitud: position.coords.latitude, longitud: position.coords.longitude };

    } catch (error) {
        console.error('Error al obtener la ubicación:', error);
        this.mostrarToast('Error al obtener la ubicación.');
        return null;
    }
}

  async verificarYObtenerUbicacion() {
    // Verifica si estamos en un entorno de Capacitor
    if (Capacitor.isNativePlatform()) {
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const requestPermission = await Geolocation.requestPermissions();
        if (requestPermission.location !== 'granted') {
          this.mostrarToast('Acceso a la ubicación denegado. No se puede acceder a GPS.');
          return;
        }
      }
    }

    // Si estamos en un navegador o se han otorgado los permisos, carga la ubicación en el mapa
    await this.cargarUbicacionEnMapa();
  }

  async cargarUbicacionEnMapa() {
    const ubicacion = await this.obtenerUbicacionActual();
    try {
      if (ubicacion) {
        const { latitud, longitud } = ubicacion;

        console.log('Coordenadas obtenidas:', ubicacion);

        if (this.map) {
          this.map.setCenter([longitud, latitud]);
          this.map.setZoom(14);

          // Crea un nuevo marcador y lo añade al mapa
          const marker = new mapboxgl.Marker()
            .setLngLat([longitud, latitud])
            .addTo(this.map);

          this.markers.push(marker);
        } else {
          console.error('El mapa no está inicializado');
        }
      } else {
        console.error('No se pudo obtener la ubicación.');
        this.mostrarToast('No se pudo obtener la ubicación.');
      }
    } catch (error) {
      console.error('Error al cargar la ubicación en el mapa:', error);
      this.mostrarToast('Error al cargar la ubicación en el mapa.');
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 1000,
    });
    await loading.present();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 60000,
      position: 'bottom'
    });
    toast.present();
  }

  async actualizarUbicacion() {
    await this.cargarUbicacionEnMapa(); // Vuelve a cargar la ubicación en el mapa
}

}
