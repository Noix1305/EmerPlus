import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Ticket } from 'src/app/models/ticket';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { Usuario } from 'src/app/models/usuario';
import { TicketService } from 'src/app/services/ticketService/ticket.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { MENSAJE_CARGANDO, SWAL_ERROR, SWAL_SUCCESS } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-formulario-ticket',
  templateUrl: './formulario-ticket.page.html',
  styleUrls: ['./formulario-ticket.page.scss'],
})
export class FormularioTicketPage implements OnInit {

  selectedTipoTicket: number | null = null; // Almacena el ID del tipo de ticket seleccionado
  isPickerOpen = false;
  tiposTickets: TipoTicket[] | [] = [];
  selectedTipoProblema: string = '';
  currentValue = '';
  // isModalOpen = false;  // Controla la apertura del modal
  usuario: Usuario | null = null;

  ticket: Ticket | undefined;

  ticketForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    tipoProblema: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    comentarios: new FormControl('')
  });

  constructor(
    // private pickerController: PickerController,
    private loadingController: LoadingController,
    private _ticketService: TicketService,
    private _usuarioService: UsuarioService) { }

  async ngOnInit() {

    this.obtenerTiposTickets();

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();

    await this._usuarioService.cargarUsuario(); // Cargar el usuario desde el servicio
    this.usuario = this._usuarioService.getUsuario();

    if (!this.usuario) {
      console.log('No se encontró el usuario en Preferences.');
      this.usuario = { rut: 'Invitado' } as Usuario;
    }
    loading.dismiss();
  }

  async obtenerTiposTickets() {
    (await this._ticketService.getTiposTickets()).subscribe({
      next: (response) => {
        this.tiposTickets = response.body || []; // La lista de tipos de tickets estará en el cuerpo de la respuesta
        console.log(this.tiposTickets[0].descripcion)
      },
      error: (err) => {
        console.error('Error al obtener los tipos de tickets', err);
      }
    });
  }

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      html: text, // Usamos 'html' en lugar de 'text' para interpretar HTML
      heightAuto: false
    });
  }

  onTipoProblemaChange(event: any) {
    this.selectedTipoProblema = event.detail.value;  // Actualiza el valor seleccionado
    console.log('Tipo de Problema seleccionado:', this.selectedTipoProblema);
  }

  onIonChange(event: any) {
    this.currentValue = event.detail.value;
  }

  onDidDismiss(event: any) {
    console.log('Modal dismissed', event);
  }

  async enviarTicket() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();

    console.log(this.usuario?.rut);

    if (this.ticketForm.valid && this.usuario) {
      const ticket: Ticket = {
        usuario_id: this.usuario?.rut,
        nombreUsuario: this.ticketForm.value.nombre,
        correo: this.ticketForm.value.email,
        tipo_problema_id: this.ticketForm.value.tipoProblema,
        descripcion: this.ticketForm.value.descripcion,
        estado_id: 1,  // Estado inicial
        comentarios: this.ticketForm.value.comentarios,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      };

      // Llama al servicio para enviar el ticket
      this._ticketService.enviarTicket(ticket).subscribe({
        next: (response: HttpResponse<Ticket>) => {
          const ticketCreado = response.body;
          if (ticketCreado?.id) {
            loading.dismiss();
            const tipoProblema = this.ticketForm.value.tipoProblema; // Tipo de problema elegido

            const mensaje = `Ticket creado con éxito.<br>ID: ${ticketCreado.id}.<br>Tipo de problema: ${this.tiposTickets[tipoProblema].descripcion}.<br>Nos pondremos en contacto contigo pronto.`;
            this.mostrarSwal(SWAL_SUCCESS, 'Éxito', mensaje);
          } else {
            console.warn('No se recibió un ID de ticket en la respuesta.');
          }
        },
        error: (error) => {
          console.error('Error al crear el ticket:', error);
          loading.dismiss();
          this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al crear el ticket:' + error);

        },
        complete: () => {
          console.log('Proceso de envío de ticket completado');
          loading.dismiss();
        },
      });
    }
  }


  // async openPicker() {
  //   this.isPickerOpen = true;

  //   const picker = await this.pickerController.create({
  //     cssClass: 'custom-picker',  // Agrega una clase personalizada
  //     columns: [
  //       {
  //         name: 'tipos',
  //         options: this.tiposTickets.map((tipo) => ({
  //           text: tipo.descripcion,
  //           value: tipo.id,
  //         })),
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //         handler: () => {
  //           this.isPickerOpen = false;
  //         },
  //       },
  //       {
  //         text: 'Seleccionar',
  //         handler: (selectedData) => {
  //           this.selectTipoTicket(selectedData);
  //         },
  //       },
  //     ],
  //   });

  //   await picker.present();
  // }



  // openModal() {
  //   this.isModalOpen = true;  // Abre el modal
  // }

  // dismissModal(action?: string) {
  //   this.isModalOpen = false;  // Cierra el modal

  //   if (action === 'confirm') {
  //     console.log('Confirmado: ', this.currentValue);  // Lógica cuando se confirma
  //   } else {
  //     console.log('Cancelado');
  //   }
  // }




  // selectTipoTicket(selectedData: { tipos: { value: number; }; }) {
  //   // Asigna el tipo seleccionado al input
  //   const tipoSeleccionado = this.tiposTickets.find(
  //     (tipo) => tipo.id === selectedData.tipos.value
  //   );
  //   if (tipoSeleccionado) {
  //     this.selectedTipoProblema = tipoSeleccionado.descripcion;
  //   }
  //   this.closePicker();
  // }

  // closePicker() {
  //   // Cierra el picker
  //   this.isPickerOpen = false;
  // }

  // // Cuando se cambia el valor del picker, actualizamos el valor seleccionado
  // updateSelectedTipoTicket(event: any) {
  //   this.selectedTipoTicket = event.detail.value;  // Actualiza el valor seleccionado
  // }

}
