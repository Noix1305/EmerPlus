import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { lastValueFrom } from 'rxjs';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { SolicitudPatch } from 'src/app/models/solicitudPatch';
import { Usuario } from 'src/app/models/usuario';
import { EstadoSolicitudService } from 'src/app/services/estadoSolicitud/estado-solicitud.service';
import { SolicitudDeEmergenciaService } from 'src/app/services/solicitudEmergencia/solicitud-de-emergencia.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { HOY, AYER, SEMANA, MES, RUTA_ADMIN, RUTA_DASHBOARD, RUTA_MAPA, RUTA_GESTION_SOLICITUD, SWAL_SUCCESS } from 'src/constantes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {
  solicitudes: SolicitudDeEmergencia[] = [];
  solicitudPatch: SolicitudPatch | null = null;
  solicitudesFiltradas: SolicitudDeEmergencia[] = [];
  solicitudesAsignadas: SolicitudDeEmergencia[] = [];

  esAdmin: boolean = false;
  usuario: Usuario | null = null;
  esUsuario: boolean = false;
  esPolicia: boolean = false;
  esBombero: boolean = false;
  esAmbulancia: boolean = false;

  esPoliciaAdmin: boolean = false;
  esBomberoAdmin: boolean = false;
  esAmbulanciaAdmin: boolean = false;
  tipoUsuarioAdmin: boolean = false;

  fechaDesde: string = '';
  fechaHasta: string = '';
  estadoFiltro: string = '';
  rolUsuario: number = 0;
  comentario: string = '';
  notificaciones: number = 0;
  previousNotificaciones: number = 0;
  notificationInterval: any;


  constructor(
    private _solicitudService: SolicitudDeEmergenciaService,
    private _estadoSolicitudService: EstadoSolicitudService,
    private _usuarioService: UsuarioService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.inicializarDatos();
    this.startNotificationCheck();
  }

  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval); // Limpiar el intervalo cuando el componente se destruye
    }
  }

  async startNotificationCheck() {
    if (this.tipoUsuarioAdmin) {
      this.notificaciones = this.solicitudes.length;
    } else {
      this.notificaciones = this.solicitudesAsignadas.length;
    }
    this.notificationInterval = setInterval(async () => {
      await this.cargarSolicitudes(); // Cargar las solicitudes
      this.verSolicitudesAsignadas(); // Ver las solicitudes asignadas

      if (this.tipoUsuarioAdmin) {
        this.notificaciones = this.solicitudes.length;
      } else {
        this.notificaciones = this.solicitudesAsignadas.length;
      }

      // Verificar si las notificaciones han cambiado
      if (this.notificaciones !== this.previousNotificaciones) {
        this.previousNotificaciones = this.notificaciones;

        // Mostrar alerta si hay nuevas notificaciones
        Swal.fire({
          title: '¡Nueva notificación!',
          text: 'Tienes nuevas notificaciones.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      }

    }, 10000); // Ejecutar cada 10 segundos
  }

  private async inicializarDatos() {
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();
    this.setRolesUsuario();
    this.solicitudes = [];
    this.solicitudesFiltradas = [];
    await this.cargarSolicitudes();
    this.verSolicitudesAsignadas();
    if (this.tipoUsuarioAdmin) {
      this.notificaciones = this.solicitudes.length;
    } else {
      this.notificaciones = this.solicitudesAsignadas.length;
    }
  }

  navGestionarSolicitud(solicitud: SolicitudDeEmergencia) {
    this.crearSolicitudRecibida(solicitud);
    this.router.navigate([RUTA_GESTION_SOLICITUD], {
      state: {
        solicitud,
        tipoUsuarioAdmin: this.tipoUsuarioAdmin
      }
    });
  }

  private setRolesUsuario() {
    const rolRutMap = {
      3: 'bombero',
      4: 'policia',
      5: 'ambulancia'
    };

    if (this.usuario && this.usuario.rol.length > 0) {
      this.rolUsuario = this.usuario.rol[0];

      // Definir los roles generales
      this.esUsuario = this.rolUsuario === 2;
      this.esBombero = this.rolUsuario === 3 && this.usuario.rut !== rolRutMap[3];
      this.esPolicia = this.rolUsuario === 4 && this.usuario.rut !== rolRutMap[4];
      this.esAmbulancia = this.rolUsuario === 5 && this.usuario.rut !== rolRutMap[5];

      // Definir roles de administrador
      this.esBomberoAdmin = this.rolUsuario === 3 && this.usuario.rut === rolRutMap[3];
      this.esPoliciaAdmin = this.rolUsuario === 4 && this.usuario.rut === rolRutMap[4];
      this.esAmbulanciaAdmin = this.rolUsuario === 5 && this.usuario.rut === rolRutMap[5];

      // Establecer tipoUsuarioAdmin en base a los roles de administrador
      this.tipoUsuarioAdmin = this.esBomberoAdmin || this.esPoliciaAdmin || this.esAmbulanciaAdmin;
    }
  }


  async filtrar() {
    await this.cargarSolicitudes();
    await this.filtrarSolicitudes();
  }

  async cargarSolicitudes() {
    let solicitudes: SolicitudDeEmergencia[]; // Define solicitudes con el tipo esperado.

    try {
      if (!this.esUsuario) {
        solicitudes = await this._solicitudService.obtenerSolicitudesPorRol(this.rolUsuario);
        // console.log('Rol Usuario: ' + this.rolUsuario)
        // console.log('Solicitudes obtenidas desde el servicio:', solicitudes);
      } else {
        // Usa await para obtener el array de solicitudes.
        solicitudes = await this._solicitudService.obtenerSolicitudes();
      }

      solicitudes = await this.procesarSolicitudes(solicitudes);
      // console.log('Solicitudes procesadas:', solicitudes);

      // solicitudes.forEach(s => console.log('Entidad:', s.entidad));

      // Filtra las solicitudes según el rol del usuario
      this.solicitudes = this.filtrarSolicitudesPorRol(solicitudes);

      if (!this.solicitudes.length) console.warn('No se encontraron solicitudes.');

    } catch (error) {
      console.error('Error al cargar las solicitudes:', error);
    }
  }

  private filtrarSolicitudesPorRol(solicitudes: SolicitudDeEmergencia[]): SolicitudDeEmergencia[] {
    switch (this.rolUsuario) {
      case 2: // Usuario puede ver todas sus solicitudes
        return solicitudes.filter(
          solicitud => solicitud.usuario_id === this.usuario?.rut && solicitud.estado !== 1 && solicitud.estado !== 5
        );
      case 3: // Bomberos
        return solicitudes.filter(
          solicitud => solicitud.entidad === 3 && solicitud.estado !== 1 && solicitud.estado !== 5
        );
      case 4: // Policía
        return solicitudes.filter(
          solicitud => solicitud.entidad === 4 && solicitud.estado !== 1 && solicitud.estado !== 5
        );
      case 5: // Ambulancia
        return solicitudes.filter(
          solicitud => solicitud.entidad === 5 && solicitud.estado !== 1 && solicitud.estado !== 5
        );
      default: // Si el rol no coincide, devolver un array vacío o manejar de otra forma
        return [];
    }
  }

  private async filtrarSolicitudesAsignadas() {
    console.log("Solicitudes con asignada:", this.solicitudes.map(s => ({ id: s.id, asignada: s.asignacion })));

    return this.solicitudes.filter(s => s.asignacion === this.usuario?.rut);
  }

  async verSolicitudesAsignadas() {
    this.solicitudesAsignadas = await this.filtrarSolicitudesAsignadas();
    if (this.solicitudesAsignadas.length > 0) {
      console.log('Solicitudes Asignadas: ' + this.solicitudesAsignadas[0].usuario_id);
    } else {
      console.warn('No hay solicitudes asignadas.');
    }
  }


  async filtrarSolicitudes() {
    let solicitudesAFiltrar: SolicitudDeEmergencia[] = [];

    // Verifica el tipo de usuario conectado
    if (this.esBomberoAdmin || this.esPoliciaAdmin || this.esAmbulanciaAdmin || this.esUsuario) {
      // Si es bomberAdmin, policiaAdmin, bomberoAdmin o isUser, filtra desde "solicitudes"
      solicitudesAFiltrar = this.solicitudes;
    } else if (this.esBombero || this.esPolicia || this.esAmbulancia) {
      // Si es bombero, policia o ambulancia, filtra desde "solicitudesAsignadas"
      solicitudesAFiltrar = this.solicitudesAsignadas;
    }

    // Filtra las solicitudes en función de la fecha y el estado
    const solicitudesFiltradas = solicitudesAFiltrar.filter((solicitud) => {
      const fechaSolicitud = new Date(solicitud.fecha);
      return (
        this.filtrarPorFecha(fechaSolicitud) &&
        this.filtrarPorEstado(solicitud.estado)
      );
    });

    // Procesa las solicitudes después de filtrarlas
    this.solicitudesFiltradas = await this.procesarSolicitudes(solicitudesFiltradas);
  }

  private filtrarPorFecha(fechaSolicitud: Date): boolean {
    const fechaDesdeDate = this.obtenerFechaFiltro(this.fechaDesde);
    const fechaHastaDate = this.obtenerFechaFiltro(this.fechaHasta);

    // console.log("Fecha de la solicitud:", fechaSolicitud);
    // console.log("Fecha desde filtro:", fechaDesdeDate, "Fecha hasta filtro:", fechaHastaDate);

    const fechaValida = fechaDesdeDate ? fechaSolicitud >= fechaDesdeDate : true;
    const hastaValida = fechaHastaDate ? fechaSolicitud <= fechaHastaDate : true;
    return fechaValida && hastaValida;
  }

  private obtenerFechaFiltro(fecha: string): Date | null {
    const ahora = Date.now();
    switch (fecha) {
      case HOY: return new Date();
      case AYER: return new Date(ahora - 864e5);
      case SEMANA: return new Date(ahora - 6048e5);
      case MES: return new Date(ahora - 2592e6);
      default: return null;
    }
  }

  private filtrarPorEstado(estado: number): boolean {
    // console.log("Estado de la solicitud:", estado, "Estado filtro:", this.estadoFiltro);
    return this.estadoFiltro === '0' || estado === Number(this.estadoFiltro);
  }

  limpiarFiltro() {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.estadoFiltro = '';
    this.solicitudesFiltradas = [];
  }

  async procesarSolicitudes(solicitudes: SolicitudDeEmergencia[]) {
    return Promise.all(
      solicitudes.map(async (solicitud) => {
        const estadoDescripcion = await this._estadoSolicitudService.obtenerNombreRol(solicitud.estado);
        // console.log(`Solicitud ID: ${solicitud.id}, Estado: ${solicitud.estado}, Descripción: ${estadoDescripcion}`);
        return { ...solicitud, estadoDescripcion: estadoDescripcion || 'Desconocido' };
      })
    );
  }

  async modificarSolicitud(solicitudPatch: SolicitudPatch) {
    try {
      // Convierte el Observable en una Promise
      const response = await lastValueFrom(this._solicitudService.modificarSolicitud(solicitudPatch.id, solicitudPatch));
      // Aquí puedes manejar la respuesta si es necesario
      // console.log('Solicitud modificada con éxito:', response.body);
    } catch (error) {
      console.error('Error al modificar la Solicitud:', error);
    }
  }

  // Método para crear una solicitud recibida
  async crearSolicitudRecibida(solicitud: SolicitudDeEmergencia) {
    if (solicitud.estado !== 3) {
      const solicitudPatch: SolicitudPatch = {
        id: solicitud?.id ?? 0,
        estado: 3 //Estado Recibida
      };
      await this.modificarSolicitud(solicitudPatch);
    }
  }

  // Método para comentar una solicitud
  async comentarSolicitud(solicitud: SolicitudDeEmergencia, comentariosolicitud: string) {
    const solicitudPatch: SolicitudPatch = {
      id: solicitud?.id ?? 0,
      comentario: comentariosolicitud
    };
    await this.modificarSolicitud(solicitudPatch);
  }

  // Método para cancelar una solicitud
  async cancelarSolicitud(solicitud: SolicitudDeEmergencia, comentarioSolicitud: string) {
    const solicitudPatch: SolicitudPatch = {
      id: solicitud?.id ?? 0,
      estado: 5,
      comentario: comentarioSolicitud
    };
    await this.modificarSolicitud(solicitudPatch);
  }

  // Método para abrir la caja de comentario con SweetAlert
  async gestionarSolicitud(solicitud: SolicitudDeEmergencia) {
    // Preguntar al usuario qué acción desea tomar con botones personalizados
    const { isConfirmed, isDenied } = await Swal.fire({
      title: '¿Qué deseas hacer?',
      text: 'Puedes comentar o cancelar la solicitud.',
      icon: 'question',
      heightAuto: false,
      showCancelButton: false,
      confirmButtonText: 'Agregar Comentario',
      denyButtonText: 'Cancelar solicitud',
      showDenyButton: true, // Muestra el segundo botón
    });

    // Opción de comentar
    if (isConfirmed) {
      const { value: comentario } = await Swal.fire({
        title: 'Agregar Comentario',
        input: 'textarea',
        inputLabel: 'Escribe tu comentario aquí',
        inputPlaceholder: 'Comentario...',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        heightAuto: false,
      });

      // Asigna "Sin comentarios" si no hay comentario ingresado
      const comentarioFinal = comentario || 'Sin comentarios';

      // Llama a la función para agregar un comentario
      await this.comentarSolicitud(solicitud, comentarioFinal);
      Swal.fire({
        title: 'Comentario enviado.',
        icon: SWAL_SUCCESS,
        text: 'Su comentario ha sido asignado a la solicitud ID: ' + solicitud.id,
        heightAuto: false
      });
    }

    // Opción de cancelar solicitud
    else if (isDenied) {
      const { value: comentario } = await Swal.fire({
        title: 'Agregar Comentario',
        input: 'textarea',
        inputLabel: 'Escribe tu comentario aquí',
        inputPlaceholder: 'Comentario...',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        heightAuto: false,
      });

      // Asigna "Sin comentarios" si no hay comentario ingresado
      const comentarioFinal = comentario || 'Sin comentarios';

      // Llama a la función para cancelar la solicitud
      await this.cancelarSolicitud(solicitud, comentarioFinal);
      Swal.fire({
        title: 'Solicitud cancelada.',
        icon: SWAL_SUCCESS,
        text: 'La solicitud ID: ' + solicitud.id + ' ha sido cancelada.',
        heightAuto: false
      });
    }
  }

  verEnMapa(solicitud: SolicitudDeEmergencia) {
    this.router.navigate([RUTA_MAPA], { state: { solicitud } });
  }

  navegar() {
    this.router.navigate([this.esAdmin ? RUTA_ADMIN : RUTA_DASHBOARD]);
  }

  // generarPDF() {
  //   const doc = new jsPDF();
  //   const title = 'Reporte de Solicitudes de Emergencia';
  //   doc.setFontSize(16);
  //   doc.text(title, 10, 10);

  //   const head = [['ID', 'Tipo', 'Fecha', 'Ubicación']];
  //   const data = this.solicitudesUsuario.map(solicitud => [
  //     solicitud.id,
  //     solicitud.tipo,
  //     solicitud.fecha,
  //     `${solicitud.latitud}, ${solicitud.longitud}`
  //   ]);

  //   (doc as any).autoTable({ head, body: data, startY: 20 });
  //   doc.save('solicitudes_emergencia.pdf');
  // }


}
