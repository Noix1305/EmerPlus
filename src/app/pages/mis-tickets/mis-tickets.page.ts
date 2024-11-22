import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { EstadoTicket } from 'src/app/models/estadoTicket';
import { Ticket } from 'src/app/models/ticket';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { Usuario } from 'src/app/models/usuario';
import { TicketService } from 'src/app/services/ticketService/ticket.service';
import { TipoTicketService } from 'src/app/services/tipoTicket/tipo-ticket-service.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { MENSAJE_CARGANDO } from 'src/constantes';
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

  constructor(
    private _ticketService: TicketService,
    private loadingController: LoadingController,
    private _usuarioService: UsuarioService,
    private _tipoTicketService: TipoTicketService
  ) { }

  async ngOnInit() {
    // Crear y mostrar el loader
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });
    await loading.present();
    await this.cargarTiposTickets();
    await this.cargarEstadosTickets();

    // Obtener el usuario del servicio
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();

    // Obtener tickets desde el servicio
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
        this.ticketsFiltrados = this.listaTickets.filter(ticket => ticket.usuario_id === this.usuario?.rut);
        break;
      case 6: // Si es staff, filtrar por asignado
        this.ticketsFiltrados = this.listaTickets.filter(ticket => ticket.asignado === this.usuario?.rut);
        break;
      default:
        this.ticketsFiltrados = this.listaTickets; // Mostrar todos los tickets por defecto
        break;
    }
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
    try {
      (await this._tipoTicketService.getTiposTickets()).subscribe({
        next: (response: HttpResponse<TipoTicket[]>) => {
          // Asigna los tipos de tickets a la lista
          this.tiposTicket = response.body || [];
          console.log('Tipos de tickets:', this.tiposTicket);
        },
        error: (error) => {
          console.error('Error al obtener los tipos de tickets:', error);
        },
        complete: () => {
          console.log('Carga de tipos de tickets completada.');
        }
      });
    } catch (error) {
      console.error('Error en la carga de tipos de tickets:', error);
    }
  }


  async cargarEstadosTickets() {
    // Aquí no necesitamos 'async' ya que estamos usando 'subscribe'
    this._ticketService.obtenerEstadosTickets().subscribe({
      next: (response: EstadoTicket[]) => {
        // Asigna los estados de tickets a la lista
        this.estadosTickets = response || [];
        console.log('Estados de tickets:', this.estadosTickets);
      },
      error: (error) => {
        console.error('Error al obtener los estados de tickets:', error);
      },
      complete: () => {
        console.log('Carga de estados de tickets completada.');
      }
    });
  }

}
