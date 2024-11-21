import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { LoadingController, PickerController } from '@ionic/angular';
import { Ticket } from 'src/app/models/ticket';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { Usuario } from 'src/app/models/usuario';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { TicketService } from 'src/app/services/ticketService/ticket.service';
import { TipoTicketService } from 'src/app/services/tipoTicket/tipo-ticket-service.service';
import { KEY_USER_INFO, MENSAJE_CARGANDO, NAV_USUARIO, SWAL_ERROR } from 'src/constantes';
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
  usuario: Usuario | undefined;

  ticket: Ticket | undefined;

  ticketForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    tipoProblema: new FormControl('', [Validators.required]),
    descripcion: new FormControl('', [Validators.required]),
    comentarios: new FormControl('')
  });

  constructor(
    private _tipoTicketService: TipoTicketService,
    // private pickerController: PickerController,
    private loadingController: LoadingController,
    private _encriptadorService: EncriptadorService,
    private router: Router,
    private _ticketService: TicketService)
     { }

  async ngOnInit() {

    this.obtenerTiposTickets();

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();

    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.[NAV_USUARIO];

    if (!this.usuario) {
      const { value } = await Preferences.get({ key: KEY_USER_INFO });

      if (value) {
        try {
          // Desencriptar el valor usando el servicio de desencriptación
          const decryptedData = this._encriptadorService.decrypt(value);

          if (decryptedData) {
            this.usuario = JSON.parse(decryptedData) as Usuario;
            if (this.usuario.rol[0] === 0) {
              console.log(this.usuario.rol[0])
              this.usuario.rut = 'Invitado';
            } // Convierte el JSON desencriptado a Usuario
          } else {
            console.error('Error al desencriptar los datos');
            this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un problema al cargar los datos del usuario.');
          }
        } catch (error) {
          console.error('Error al parsear JSON o desencriptar:', error);
          this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un problema al cargar los datos del usuario.');
        }
      } else {
        console.log('No se encontró el usuario en Preferences.');
        this.usuario = { rut: 'Invitado' } as Usuario;
      }
    } else {
      console.log('Usuario obtenido desde la navegación:', this.usuario);
    }
    loading.dismiss();
  }

  async obtenerTiposTickets() {
    (await this._tipoTicketService.getTiposTickets()).subscribe({
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
      text: text,
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

  enviarTicket() {
    console.log(this.usuario?.rut)
    if (this.ticketForm.valid && this.usuario) {
      const ticket: Ticket = {
        usuario_id: this.usuario?.rut,  // Aquí debes agregar el valor real de usuario
        nombreUsuario: this.ticketForm.value.nombre,
        correo: this.ticketForm.value.email,
        tipo_problema_id: this.ticketForm.value.tipoProblema,
        descripcion: this.ticketForm.value.descripcion,
        estado_id: 1,  // Estado inicial
        comentarios: this.ticketForm.value.comentarios,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      };

      // Enviar el ticket usando el servicio
      this._ticketService.enviarTicket(ticket).subscribe({
        next: (response: HttpResponse<Ticket>) => {
          console.log('Ticket creado correctamente:', response.body);
        },
        error: (error) => {
          console.error('Error al crear el ticket:', error);
        },
        complete: () => {
          console.log('Proceso de envío de ticket completado');
        },
      });
    } else {
      console.log('El formulario no es válido');
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
