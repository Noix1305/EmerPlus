import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Ticket } from 'src/app/models/ticket';
import { TicketPatch } from 'src/app/models/ticketPatch';
import { Usuario } from 'src/app/models/usuario';
import { TicketService } from 'src/app/services/ticketService/ticket.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { SWAL_ERROR, SWAL_SUCCESS, SWAL_WARN } from 'src/constantes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestionar-ticket',
  templateUrl: './gestionar-ticket.page.html',
  styleUrls: ['./gestionar-ticket.page.scss'],
})
export class GestionarTicketPage implements OnInit {

  ticket: Ticket | undefined;
  usuarios: Usuario[] = [];  // Lista de usuarios
  usuarioSeleccionado: Usuario | undefined;  // Usuario seleccionado
  usuario: Usuario | null = null;

  // Estado del modal
  modalAbierto: boolean = false;
  tipoUsuarioAdmin: boolean = false;
  estadoTicket: string = '';
  tipoProblema: string = '';

  constructor(
    private _usuarioService: UsuarioService,
    private _ticketService: TicketService) { }

  async ngOnInit() {
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();

    if (this.usuario) {
      console.log('Usuario cargado:', this.usuario);
    } else {
      console.log('No se cargó ningún usuario');
    }



    const ticketData = this._ticketService.getTicketData();

    if (ticketData) {
      this.ticket = ticketData.ticket;
      this.tipoUsuarioAdmin = ticketData.tipoUsuarioAdmin;
      this.estadoTicket = ticketData.estadoTicket;
      this.tipoProblema = ticketData.tipoProblema;

      console.log('Solicitud recibida:', this.ticket);
    } else {
      console.error('No se recibieron datos del ticket');
    }

    if (this.usuario) {
      this.getUsuariosPorRol(this.usuario);
    } else {
      console.log('No se pudo ejecutar la función getUsuariosPorRol');
    }
  }


  ticketResuelto() {
    if (this.ticket && this.ticket.id && this.usuario && this.usuario.nombre) {
      const ticketPatch: TicketPatch = {
        id: this.ticket.id,
        estado_id: 3, //Resuelto
        fecha_actualizacion: new Date(),
        resuelto_por: this.usuario.pseudonimo
      };
      this.modificarSolicitud(ticketPatch);
    }

  }

  asignarTicket() {
    if (this.ticket && this.ticket.id && this.usuarioSeleccionado) {
      const ticketPatch: TicketPatch = {
        id: this.ticket.id,
        estado_id: 2, //En Progreso
        fecha_actualizacion: new Date(),
        asignado: this.usuarioSeleccionado.rut  // Asumiendo que "rut" es el identificador en Usuario
      };

      // Llamada para actualizar la solicitud (método ficticio para enviar la solicitud actualizada)
      this.modificarSolicitud(ticketPatch);
    }
  }

  modificarSolicitud(ticket: TicketPatch) {

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas modificar el estado de este ticket?',
      icon: SWAL_WARN,
      showCancelButton: true,
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true, // Opcional: cambia el orden de los botones
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, se ejecuta la modificación
        this._ticketService.modificarTicket(ticket.id, ticket).subscribe({
          next: () => {
            console.log('Solicitud en Ejecución con éxito');
            this.cerrarModal();
            Swal.fire({
              title: 'Ejecutad',
              text: 'El estado de su ticket ha sido modificado con éxito.',
              icon: SWAL_SUCCESS,
              heightAuto: false
            });
          },
          error: (error) => {
            console.error('Error al realizar la modificación:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al modificar su ticket.',
              icon: SWAL_ERROR,
              heightAuto: false
            });
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si el usuario cancela, solo se muestra un mensaje y no se realiza ninguna acción
        console.log('La modificación fue cancelada');
        Swal.fire({
          title: 'Cancelada',
          text: 'La modificación de su ticket ha sido cancelada.',
          icon: 'info',
          heightAuto: false
        });
      }
    });

  }

  mostrarUsuarios() {
    console.log('Mostrar opciones de usuarios');
    this.modalAbierto = true;  // Abre el modal (o puede ser cualquier acción para mostrar la lista)
  }

  seleccionarUsuario(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    console.log('Usuario seleccionado:', usuario);
  }


  async getUsuariosPorRol(usuario: Usuario) {

    if (this.ticket && usuario) {
      try {
        const response = await firstValueFrom(this._usuarioService.getUsuarioPorRol(usuario.rol[0]));
        this.usuarios = response.body || [];

        this.usuarios = this.usuarios.filter(u => u.rut !== 'staff');
        console.log('Usuarios encontrados:', this.usuarios);
      } catch (error) {
        console.error('Error al obtener usuarios por rol:', error);
      }
    } else {
      console.error('Rol del usuario activo no disponible');
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

}
