import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { IonModal, LoadingController, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { firstValueFrom } from 'rxjs';
import { CambiarPassComponent } from 'src/app/components/cambiar-pass/cambiar-pass.component';
import { Comuna } from 'src/app/models/comuna';
import { Contacto } from 'src/app/models/contacto';
import { Region } from 'src/app/models/region';
import { Usuario } from 'src/app/models/usuario';
import { ContactosemergenciaService } from 'src/app/services/contactos/contactosemergencia.service';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { RegionComunaService } from 'src/app/services/region_comuna/region-comuna.service';
import { RolService } from 'src/app/services/rolService/rol.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { COLOR_ERROR, COLOR_EXITO, KEY_USER_INFO, MENSAJE_CARGANDO, NAV_CONTACTO, NAV_USUARIO, RUTA_LOGIN, RUTA_SOLICITUDES, SWAL_ERROR, SWAL_SUCCESS, SWAL_WARN } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage {
  @ViewChild('modalContacto', { static: false }) modalContacto!: IonModal;
  @ViewChild('modalAddUser', { static: false }) modalAddUser!: IonModal;
  @ViewChild('modalEditUser', { static: false }) modalEditUser!: IonModal;
  @ViewChild('modalEditContact', { static: false }) modalEditContact!: IonModal;

  rolUsuario: string | undefined;
  usuario: Usuario | null = null;


  colorVerde: string = COLOR_EXITO
  colorRojo: string = COLOR_ERROR

  contacto: Contacto | null = null;

  rut: string = '';
  password: string = '';
  roleId: number = 0;
  repeatPassword: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  regiones: Region[] = [];
  comunas: Comuna[] = [];

  comunasCargadas: Comuna[] = [];

  selectedRegion: Region | null = null;
  selectedComuna: Comuna | null = null;

  comunaUsuario: Comuna | null = null;
  regionUsuario: Region | null = null;

  form: FormGroup;

  constructor(private router: Router,
    private _rolService: RolService,
    private _usuarioService: UsuarioService,
    private _regionComunaService: RegionComunaService,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private _contactoService: ContactosemergenciaService,
    private _encriptadorService: EncriptadorService,
    private loadingController: LoadingController) {

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      pApellido: ['', Validators.required],
      sApellido: [''],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      contrasenaActual: ['', Validators.required],
      nuevaContrasena: ['', Validators.required],
      confirmarContrasena: ['', Validators.required]
    });
  }

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    this.cargarRegiones();
    this.cargarComunas();

    await loading.present();

    await this._usuarioService.cargarUsuario(); // Cargar el usuario desde el servicio
    this.usuario = this._usuarioService.getUsuario();

    if (this.usuario) {

      this.getContacto();
      console.log("Comuna ID: " + this.usuario.comunaid + "||" + "Región ID: " + this.usuario.regionid)
      if (this.usuario.comunaid) {
        this.getNombreComunaPorId(this.usuario.comunaid);
      } else {
        console.error('El ID de comuna es undefined');
      }

      if (this.usuario.regionid) {
        this.getNombreRegionPorId(this.usuario.regionid);
      } else {
        console.error('El ID de comuna es undefined');
      }

      if (this.usuario.rol && this.usuario.rol.length > 0) {
        const rolId = this.usuario.rol[0];

        const rolDesdeServicio = await this._rolService.obtenerRolPorId(rolId);
        this.rolUsuario = rolDesdeServicio ? rolDesdeServicio.nombre : undefined;
      } else {
        console.error('Usuario o rol no disponibles');
      }
    }
    loading.dismiss();
  }


  async openChangePasswordModal() {
    if (this.usuario) {
      try {
        const modal = await this.modalCtrl.create({
          component: CambiarPassComponent,
          componentProps: {
            rut: this.usuario.rut,
            password: this.usuario.password
          }
        });

        // Presenta el modal
        await modal.present();

        // Escucha el evento de cierre para actualizar el usuario si se cambió la contraseña
        const { data } = await modal.onDidDismiss();
        if (data && data.success) {
          console.log("Pass: " + data.nuevaContrasena)
          // Actualiza la contraseña del usuario en `this.usuario`
          this.usuario.password = data.nuevaContrasena;

          let usuario = this._encriptadorService.encrypt(JSON.stringify(this.usuario));
          // También puedes actualizar `Preferences` si es necesario
          await Preferences.set({
            key: KEY_USER_INFO,
            value: usuario
          });
        }
      } catch (error) {
        console.error('Error al abrir el modal:', error);
      }
    }
  }


  getComunasPorRegion(idRegion: number) {
    this._regionComunaService.getComunaPorRegion(idRegion).subscribe({
      next: (response: HttpResponse<Comuna[]>) => {
        // Aquí obtienes el cuerpo de la respuesta
        if (response.body) {
          this.comunas = response.body; // Guarda las comunas en la variable
        }
      },
      error: (error) => {
        console.error('Error al obtener comunas:', error); // Manejo de errores
      }
    });
  }

  // Método para obtener el nombre de la comuna según el ID
  async getNombreComunaPorId(idComuna: number): Promise<void> {
    try {
      const usuarioResponse: HttpResponse<Comuna[]> = await firstValueFrom(this._regionComunaService.getComunaPorId(idComuna));

      // Verificamos que la respuesta contenga datos
      if (usuarioResponse.body && usuarioResponse.body.length > 0) {
        this.comunaUsuario = usuarioResponse.body[0]; // Asigna el primer objeto Comuna al atributo
      } else {
        console.error('No se encontró la comuna.');
      }
    } catch (error) {
      console.error('Error al obtener la comuna:', error);
    }
  }

  async getNombreRegionPorId(idRegion: number): Promise<void> {
    try {
      const usuarioResponse: HttpResponse<Region[]> = await firstValueFrom(this._regionComunaService.getRegionPorId(idRegion));

      // Verificamos que la respuesta contenga datos
      if (usuarioResponse.body && usuarioResponse.body.length > 0) {
        this.regionUsuario = usuarioResponse.body[0]; // Asigna el primer objeto Comuna al atributo
      } else {
        console.error('No se encontró la comuna.');
      }
    } catch (error) {
      console.error('Error al obtener la comuna:', error);
    }
  }

  async formularioEditUsuario(event: Event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    const form = event.target as HTMLFormElement;

    // Validar si el formulario es válido antes de continuar
    if (form.checkValidity() === false) {
      console.error('El formulario tiene errores o campos vacíos.');
      return;
    }

    if (!this.usuario) {
      console.error('No hay usuario logueado para editar');
      return;
    }

    const formData = new FormData(form);

    const updatedUser: Usuario = {
      rut: this.usuario.rut,
      nombre: formData.get('nombre') as string,
      papellido: formData.get('pApellido') as string,
      sapellido: formData.get('sApellido') as string,
      correo: formData.get('correo') as string,
      telefono: Number(formData.get('telefono')),
      comunaid: this.selectedComuna ? this.selectedComuna.id : undefined,
      regionid: this.selectedRegion ? this.selectedRegion.id : undefined,
      password: this.usuario.password,
      rol: [this.usuario.rol[0]],
      estado: 1
    };

    try {
      await firstValueFrom(this._usuarioService.editarUsuario(updatedUser.rut, updatedUser));
      this.successMessage = 'Usuario editado con éxito';
      this.activarSwal('Exito', this.successMessage, SWAL_SUCCESS, 'OK');
      this.usuario = updatedUser;
      const encryptedUser = this._encriptadorService.encrypt(JSON.stringify(this.usuario));
      await Preferences.set({
        key: KEY_USER_INFO,
        value: encryptedUser // Convierte el objeto de usuario a string
      });

      this.closeEditUserModal();
      this.usuario = updatedUser;

      // // Actualiza los datos del usuario en la página
      // this.obtenerDatosUsuario(); // Método para obtener y actualizar los datos del usuario
    } catch (error) {
      console.error('Error al editar el usuario:', error);
    }
  }
  async obtenerDatosUsuario() {
    if (this.usuario) {
      try {
        // Espera la respuesta del servicio y extrae el cuerpo
        const response: HttpResponse<Usuario> = await firstValueFrom(this._usuarioService.getUsuarioPorRut(this.usuario.rut));

        // Comprueba si response.body es null antes de asignar
        if (response.body) {
          this.usuario = response.body; // Esto funcionará si response.body es de tipo Usuario
        } else {
          console.warn('No se encontró el usuario, se mantiene el estado anterior.');
          // O puedes asignar un valor predeterminado aquí si lo prefieres
          // this.usuario = { ... }; // Un objeto predeterminado
        }

      } catch (error) {
        console.log('Error al obtener datos del usuario:', error);
      }
    }
  }

  async eliminarCuenta() {
    const result = await Swal.fire({
      title: 'Eliminar Cuenta',
      text: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      icon: SWAL_WARN,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      heightAuto: false, // Para evitar problemas de visualización en Ionic
      reverseButtons: true, // Coloca el botón de cancelar a la izquierda
    });

    if (result.isConfirmed) {
      if (this.usuario) {
        try {
          // Llama al servicio para eliminar el usuario
          await firstValueFrom(this._usuarioService.eliminarCuenta(this.usuario.rut)); // Asegúrate de que esta función exista en tu servicio
          this.successMessage = 'Cuenta eliminada exitosamente.';

          this.activarSwal('Éxito', this.successMessage, SWAL_SUCCESS, 'OK');

          this.router.navigate([RUTA_LOGIN]); // Redirige al usuario a la página de login después de eliminar la cuenta
        } catch (error) {
          console.error('Error al eliminar la cuenta:', error);
          this.errorMessage = 'Ocurrió un error al eliminar la cuenta. Inténtalo de nuevo.';

          this.activarSwal('Error', this.errorMessage, SWAL_ERROR, 'OK')
        }
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Cancelado');
    }
  }

  async mostrarContacto() {
    if (this.usuario?.contactoEmergencia) {
      await this.modalContacto.present();
    } else {
      this.errorMessage = 'No se ha registrado información de contacto de emergencia.'
      this.activarSwal('Sin Contacto de Emergencia', this.errorMessage, SWAL_ERROR, 'OK');
    }
  }

  async cargarRegiones() {
    this.regiones = await this._regionComunaService.obtenerRegiones();
  }

  async cargarComunas() {
    this.comunas = await this._regionComunaService.obtenerComunas();
  }

  async onRegionChange() {
    if (this.selectedRegion) {
      const regionId = this.selectedRegion.id;

      // Obtener las comunas desde el servicio
      this._regionComunaService.getComunaPorRegion(regionId).subscribe({
        next: (response: HttpResponse<Comuna[]>) => {
          // Acceder al cuerpo de la respuesta
          const comunas = response.body || []; // Asegúrate de que sea un array

          // Verifica si se obtuvo un array de comunas
          if (Array.isArray(comunas)) {
            this.comunas = comunas; // Asigna el array de comunas directamente
          } else {
            console.error('No se obtuvieron comunas válidas');
            this.comunas = []; // Manejar el caso de error
          }

          this.selectedComuna = null; // Resetea la comuna seleccionada
        },
        error: (error) => {
          console.error('Error al obtener comunas:', error); // Manejo de errores
          this.comunas = []; // Resetea las comunas en caso de error
        }
      });
    } else {
      this.comunas = []; // Si no hay región seleccionada, vacía las comunas
      this.selectedComuna = null; // Resetea la comuna seleccionada
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
    }
  }

  async handleEditContactSubmit(event: Event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const telefonoString = formData.get('telefono') as string;
    const telefono = parseInt(telefonoString, 10);

    if (isNaN(telefono)) {
      console.error('El teléfono ingresado no es válido.');
      return;
    }

    if (this.usuario) {
      const updatedContact: Contacto = {
        rut_usuario: this.usuario.rut,
        nombre: formData.get('nombre') as string,
        apaterno: formData.get('apaterno') as string,
        amaterno: formData.get('amaterno') as string,
        telefono: telefono,
        correo: formData.get('correo') as string,
        relacion: formData.get('relacion') as string,
      };

      try {
        let response;

        // Verifica si ya existe el contacto
        if (this.contacto?.id) {
          // Si existe, editar contacto
          response = await firstValueFrom(this._contactoService.editarContacto(this.contacto.id, updatedContact));
        } else {
          // Si no existe, crear nuevo contacto
          response = await firstValueFrom(this._contactoService.crearContacto(updatedContact));
          this.successMessage = 'Nuevo contacto creado con éxito.';
        }

        // Verifica si la respuesta fue exitosa
        if (response.ok) {
          this.successMessage = this.contacto?.id
            ? 'Contacto actualizado con éxito, se le ha enviado una notificación.'
            : 'Nuevo contacto creado con éxito, se le ha enviado una notificación.';

          try {
            // Envío de notificación al contacto creado o editado
            await this._usuarioService.enviarCorreoRegistroContacto(updatedContact.correo, this.usuario, updatedContact.nombre);
          } catch (error: unknown) {
            if (error instanceof Error) {
              this.errorMessage = 'Error durante el envío de la notificación.';
              this.activarSwal('Error', this.errorMessage, SWAL_ERROR, 'OK');

            } else {
              console.error('Error desconocido:', error);
              this.errorMessage = 'Error durante el envío de la notificación.';

              this.activarSwal('Error', this.errorMessage, SWAL_ERROR, 'OK');
            }
          }
        } else {
          this.errorMessage = 'Ocurrió un error al crear o editar el contacto.';
          console.error(this.errorMessage);
          this.activarSwal('Error', this.errorMessage, SWAL_ERROR, 'OK');
        }

        this.activarSwal('Éxito', this.successMessage, SWAL_SUCCESS, 'OK');

        this.closeEditContactModal();

      } catch (error) {
        this.errorMessage = 'Ocurrió un error al crear o editar el contacto. Inténtalo de nuevo.';
        this.activarSwal('Error', this.errorMessage, SWAL_ERROR, 'OK');

        console.error('Error al crear o editar contacto:', error);
      }
    }
  }

  async getContacto() {
    if (this.usuario) {
      this._contactoService.getContactoPorParametro('rut_usuario', this.usuario.rut).subscribe({
        next: (response) => {
          console.log('Respuesta del servicio de contacto:', response);

          // Verifica que la respuesta tenga datos
          if (response.body && response.body.length > 0) {
            this.contacto = response.body[0];

            // Verifica si hay un contacto de emergencia
            if (this.contacto && this.usuario?.contactoEmergencia) {
              this.usuario.contactoEmergencia = this.contacto;
            }
          } else {
            console.log('No se encontró ningún contacto de emergencia.');
          }
        },
        error: (error) => {
          console.error('Error al obtener contacto:', error);
        },
        complete: async () => {
          console.log('Solicitud completada');

        }
      });
    }
  }

  // Función para verificar si una cadena es un JSON válido
  esJsonValido(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  navSolicitudes() {
    this.router.navigate([RUTA_SOLICITUDES]);
  }


  async activarSwal(titulo: string, mensaje: string, icono: SweetAlertIcon, textoBoton: string) {
    await Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,  // Ahora es del tipo correcto
      confirmButtonText: textoBoton,
      heightAuto: false, // Para evitar problemas de visualización en Ionic
    });
  }

  // Función genérica para abrir un modal
  openModal(modal: IonModal) {
    modal.present();
  }

  // Función genérica para cerrar un modal
  closeModal(modal: IonModal) {
    modal.dismiss();
  }

  openEditUserModal() {
    this.openModal(this.modalEditUser);
  }

  closeEditUserModal() {
    this.closeModal(this.modalEditUser);
  }

  openEditContactModal() {
    this.openModal(this.modalEditContact);
  }

  closeEditContactModal() {
    this.closeModal(this.modalEditContact);
  }

  closeModalContacto() {
    this.closeModal(this.modalContacto);

  }

  get correoUsuario(): string {
    return this.usuario?.correo || '';
  }

  get usuarioNombre(): string {
    return this.usuario?.nombre || '';
  }

  get usuario1erApellido(): string {
    return this.usuario?.papellido || '';
  }

  get usuario2doApellido(): string {
    return this.usuario?.sapellido || '';
  }

  get usuarioTelefono(): number {
    return this.usuario?.telefono || 0;
  }

}
