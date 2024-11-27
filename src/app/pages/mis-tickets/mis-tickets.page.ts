import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { EstadoTicket } from 'src/app/models/estadoTicket';
import { SatisfaccionTicket } from 'src/app/models/satisfaccionTicket';
import { Ticket } from 'src/app/models/ticket';
import { TicketPatch } from 'src/app/models/ticketPatch';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { Usuario } from 'src/app/models/usuario';
import { TicketService } from 'src/app/services/ticketService/ticket.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { MENSAJE_CARGANDO, RUTA_GESTION_TICKET, SWAL_ERROR, SWAL_SUCCESS, SWAL_WARN } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-mis-tickets',
  templateUrl: './mis-tickets.page.html',
  styleUrls: ['./mis-tickets.page.scss'],
})
export class MisTicketsPage implements OnInit {

  ticket: Ticket | undefined;
  usuario: Usuario | null = null;
  listaTickets: Ticket[] = [];
  ticketsFiltrados: Ticket[] = [];
  rolUsuario: number = 0;
  tiposTicket: TipoTicket[] | [] = [];
  estadosTickets: EstadoTicket[] | [] = [];
  tipoUsuarioAdmin: boolean = false;
  valoresTicket: SatisfaccionTicket[] | [] = [];
  stars: number[] = [1, 2, 3, 4, 5];
  rating: number = 0; // Valor inicial de la calificación
  showStars: boolean = false; // Controla si se muestran las estrellas

  constructor(
    private _ticketService: TicketService,
    private loadingController: LoadingController,
    private _usuarioService: UsuarioService,
    private router: Router
  ) { }

  async ngOnInit() {
    // Crear y mostrar el loader
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });
    await loading.present();
    await this.cargarTiposTickets();
    await this.cargarEstadosTickets();
    await this.cargarValoresTickets();

    // Obtener el usuario del servicio
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();


    // Obtener tickets desde el servicio
    if (this.usuario) {

      this.rolUsuario = this.usuario?.rol[0];
      console.log('Rol Usuario = ' + this.rolUsuario)
    }
    this._ticketService.obtenerTickets().subscribe({
      next: (tickets) => {
        this.listaTickets = tickets;
        this.filtrarTicketsPorRol(); // Filtrar tickets según el rol del usuario
      },
      error: (error) => {
        console.error('Error al obtener tickets:', error);
        loading.dismiss();
      },
      complete: () => {
        console.log('Proceso completado');
        loading.dismiss();
      }
    });
  }

  getTipoTicketDescripcion(tipoProblemaId: number): string {
    const tipoTicket = this.tiposTicket.find(tipo => tipo.id === tipoProblemaId);
    return tipoTicket ? tipoTicket.descripcion : 'Desconocido'; // Valor por defecto si no se encuentra
  }

  getEstadosTickets(estadoTicket: number): string {
    const estado = this.estadosTickets.find(estado => estado.id === estadoTicket);
    return estado ? estado.nombre_estado : 'Desconocido'; // Valor por defecto si no se encuentra
  }

  // Función para filtrar los tickets según el rol del usuario
  filtrarTicketsPorRol() {
    if (!this.usuario) return;
    switch (this.usuario.rol[0]) {
      case 2: // Si es usuario, filtrar por usuario_id
        this.ticketsFiltrados = this.listaTickets.filter(ticket => ticket.usuario_id === this.usuario?.rut && ticket.estado_id !== 4);
        break;
      case 6: // Si es staff, filtrar por asignado
        this.ticketsFiltrados = this.listaTickets.filter(ticket => ticket.asignado === this.usuario?.rut);
        this.tipoUsuarioAdmin = this.usuario.rut === "staff";
        break;
      default:
        this.ticketsFiltrados = this.listaTickets; // Mostrar todos los tickets por defecto
        break;
    }
  }

  gestionarTicket(ticket: Ticket) {
    const estadoTicket = this.getEstadosTickets(ticket.estado_id);
    const tipoProblema = this.getTipoTicketDescripcion(ticket.tipo_problema_id);

    this._ticketService.setTicketData({
      ticket,
      tipoUsuarioAdmin: this.tipoUsuarioAdmin,
      estadoTicket,
      tipoProblema
    });

    this.router.navigate([RUTA_GESTION_TICKET]);
  }

  verDetallesTicket(ticket: Ticket) {
    let mensaje = '';
    const tipoProblema = this.getTipoTicketDescripcion(ticket.tipo_problema_id);
    const estadoTicket = this.getEstadosTickets(ticket.estado_id);
    // Crear un mensaje con los detalles del ticket
    if (ticket) {
      mensaje = `
        <strong>ID del Ticket:</strong> ${ticket.id}<br>
        <strong>Usuario:</strong> ${ticket.nombreUsuario}<br>
        <strong>Correo:</strong> ${ticket.correo}<br>
        <strong>Tipo de Problema:</strong> ${tipoProblema}<br>
        <strong>Descripción:</strong> ${ticket.descripcion}<br>
        <strong>Estado:</strong> ${estadoTicket}<br>
        <strong>Comentarios:</strong> ${ticket.comentarios ? ticket.comentarios : 'No hay comentarios.'}
      `;
    }

    // Llamamos a la función mostrarSwal con los detalles del ticket
    this.mostrarSwal('info', 'Detalles del Ticket', mensaje);
  }

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, html: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      html: html,  // Cambiado de 'text' a 'html' para que interprete las etiquetas HTML
      heightAuto: false
    });
  }

  async cargarTiposTickets() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();
    try {
      (await this._ticketService.getTiposTickets()).subscribe({
        next: (response: HttpResponse<TipoTicket[]>) => {
          // Asigna los tipos de tickets a la lista
          this.tiposTicket = response.body || [];
          console.log('Tipos de tickets:', this.tiposTicket);
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener los tipos de tickets:', error);
        },
        complete: () => {
          console.log('Carga de tipos de tickets completada.');
          loading.dismiss();
        }
      });
    } catch (error) {
      loading.dismiss();
      console.error('Error en la carga de tipos de tickets:', error);
    }
  }


  async cargarEstadosTickets() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();
    this._ticketService.obtenerEstadosTickets().subscribe({
      next: (response: EstadoTicket[]) => {
        // Asigna los estados de tickets a la lista
        this.estadosTickets = response || [];
        console.log('Estados de tickets:', this.estadosTickets);
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error al obtener los estados de tickets:', error);
        loading.dismiss();
      },
      complete: () => {
        loading.dismiss();
        console.log('Carga de estados de tickets completada.');
      }
    });
  }

  async cargarValoresTickets() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();
    try {
      (await this._ticketService.getSatisfaccionTicket()).subscribe({
        next: (response: HttpResponse<SatisfaccionTicket[]>) => {
          // Asigna los tipos de tickets a la lista
          this.valoresTicket = response.body || [];
          console.log('Tipos de tickets:', this.valoresTicket);
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener los valores de tickets:', error);
        },
        complete: () => {
          console.log('Carga de valores de tickets completada.');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Error en la carga de valores de tickets:', error);
      loading.dismiss();
    }
  }

  async valorarTicket(ticket: Ticket) {


    if (ticket && ticket.id) {
      const ticketPatch: TicketPatch = {
        id: ticket.id,
        estado_id: 4, //Cerrado
        fecha_actualizacion: new Date(),
        satisfaccion_id: this.rating
      };
      this.modificarSolicitud(ticketPatch);
    }
    ticket.showStars = false;
  }

  toggleStars(ticket: Ticket): void {
    ticket.showStars = true;
  }

  rate(value: number): void {
    this.rating = value;
    console.log(`Valoración: ${this.rating}`);
  }

  async modificarSolicitud(ticket: TicketPatch) {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas calificar este ticket?',
      icon: SWAL_WARN,
      showCancelButton: true,
      confirmButtonText: 'Sí, calificar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true, // Opcional: cambia el orden de los botones
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, se ejecuta la modificación
        this._ticketService.modificarTicket(ticket.id, ticket).subscribe({
          next: () => {
            Swal.fire({
              title: 'Ejecutado',
              text: 'La calificación de su ticket ha sido modificada con éxito.',
              icon: SWAL_SUCCESS,
              heightAuto: false
            });
            loading.dismiss();
          },
          error: (error) => {
            console.error('Error al realizar la calificación:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al modificar su ticket.',
              icon: SWAL_ERROR,
              heightAuto: false
            });
            loading.dismiss();
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si el usuario cancela, solo se muestra un mensaje y no se realiza ninguna acción
        console.log('La calificación fue cancelada');
        Swal.fire({
          title: 'Cancelada',
          text: 'La modificación de su ticket ha sido cancelada.',
          icon: 'info',
          heightAuto: false
        });
        loading.dismiss();
      }
    });

  }

}
