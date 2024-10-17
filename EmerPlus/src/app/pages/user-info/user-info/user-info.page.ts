import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AlertController, IonModal, ModalController, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { firstValueFrom } from 'rxjs';
import { CambiarPassComponent } from 'src/app/components/cambiar-pass/cambiar-pass.component';
import { Comuna } from 'src/app/models/comuna';
import { Contacto } from 'src/app/models/contacto';
import { Region } from 'src/app/models/region';
import { Usuario } from 'src/app/models/usuario';
import { ContactosemergenciaService } from 'src/app/services/contactos/contactosemergencia.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { RegionComunaService } from 'src/app/services/region_comuna/region-comuna.service';
import { RolService } from 'src/app/services/rolService/rol.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

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
  usuario: Usuario = {
    rut: '',
    password: '',
    nombre: '',
    papellido: '',
    sapellido: '',
    telefono: 0,
    regionid: undefined,
    comunaid: undefined,
    contactoEmergencia: undefined, // Inicializar como undefined
    correo: '',
    rol: [0], // Inicializar como un array vacío
    rolNombre: '',
    estado: 1 // O el valor que desees
  };


  colorVerde: string = 'success'
  colorRojo: string = 'danger'

  contacto: Contacto = {
    usuario_id: '',
    nombre: '',
    apaterno: '',
    amaterno: '',
    telefono: 0,
    correo: '',
    relacion: ''
  };

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
    private alertController: AlertController,
    private _rolService: RolService,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private _regionComunaService: RegionComunaService,
    private toastController: ToastController,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private _contactoService: ContactosemergenciaService) {

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
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario'];

    this.cargarRegiones();
    this.cargarComunas();

    if (!this.usuario) {
      const { value } = await Preferences.get({ key: 'userInfo' });

      if (value) {
        this.usuario = JSON.parse(value) as Usuario; // Convierte el JSON a Usuario
        console.log('Usuario obtenido de Preferences:', this.usuario);
      } else {
        console.log('No se encontró el usuario en Preferences.');
      }
    } else {
      console.log('Usuario obtenido desde la navegación:', this.usuario);
    }

    if (this.usuario) {

      this._contactoService.getContactoPorRut(this.usuario.rut).subscribe({
        next: (response: HttpResponse<Contacto>) => {
          this.contacto = response.body || {
            usuario_id: '',
            nombre: '',
            apaterno: '',
            amaterno: '',
            telefono: 0,
            correo: '',
            relacion: ''
          };
        },
        error: (error) => {
          console.error('Error al obtener contacto:', error);
        },
        complete: () => {
          console.log('Solicitud completada');
        }
      });

      if (this.usuario.comunaid) { // Reemplaza 'id' con la propiedad correspondiente que estés usando
        this.getNombreComunaPorId(this.usuario.comunaid);
      } else {
        console.error('El ID de comuna es undefined');
      }

      if (this.usuario.regionid) { // Reemplaza 'id' con la propiedad correspondiente que estés usando
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
  }

  async openChangePasswordModal() {
    if (this.usuario) {
      try {
        const modal = await this.modalCtrl.create({
          component: CambiarPassComponent,
          componentProps: {

            rut: this.usuario.rut, // Enviar el RUT al modal
            password: this.usuario.password, // Enviar la contraseña actual
          }
        }
        );
        return await modal.present();
      } catch (error) {
        return error;
      }
    } else {
      return;
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
      this.presentToast(this.successMessage, this.colorVerde);
      this.usuario = updatedUser;

      await Preferences.set({
        key: 'userInfo',
        value: JSON.stringify(this.usuario) // Convierte el objeto de usuario a string
      });
      this.closeEditUserModal();
      location.reload()
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



  async formularioRegistroAdmin(event: Event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    this.errorMessage = ''; // Reiniciar el mensaje de error
    this.successMessage = ''; // Reiniciar el mensaje de éxito
    let passwordFinal = '';

    // Validar campos
    if (!this.rut || !this.password || !this.repeatPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this._loginService.validarRUT(this.rut)) {
      this.errorMessage = 'El RUT ingresado no es válido.';
      return;
    }

    passwordFinal = this._loginService.encryptText(this.password);

    const newUser: Usuario = {
      rut: this.rut,
      password: passwordFinal,
      rol: [this.roleId],
      estado: 1
    };

    try {
      // Llama al servicio para crear el usuario
      await firstValueFrom(this._usuarioService.crearUsuario(newUser)); // Asegúrate de que la función `crearUsuario` devuelva un Observable
      this.successMessage = 'Usuario creado exitosamente.';
      this.presentToast(this.successMessage, this.colorVerde);
      this.closeAddUserModal(); // Cierra el modal si el registro fue exitoso
    } catch (error) {
      console.error('Error al crear usuario:', error);
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
      this.presentToast(this.successMessage, this.colorRojo);
    }
  }

  async presentToast(successMessage: string, color: string) {
    const toast = await this.toastController.create({
      message: successMessage,
      duration: 2000, // Duración en milisegundos
      position: 'top', // Posición del Toast
      color: color, // Color del Toast, puedes cambiarlo según tus necesidades
    });
    toast.present();
  }

  async eliminarCuenta() {
    const alert = await this.alertController.create({
      header: 'Eliminar Cuenta',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        }, {
          text: 'Eliminar',
          handler: async () => {
            if (this.usuario) {
              try {
                // Llama al servicio para eliminar el usuario
                await firstValueFrom(this._usuarioService.eliminarCuenta(this.usuario.rut)); // Asegúrate de que esta función exista en tu servicio
                this.successMessage = 'Cuenta eliminada exitosamente.';
                await this.presentToast(this.successMessage, 'success');
                this.router.navigate(['/login']); // Redirige al usuario a la página de login después de eliminar la cuenta
              } catch (error) {
                console.error('Error al eliminar la cuenta:', error);
                this.errorMessage = 'Ocurrió un error al eliminar la cuenta. Inténtalo de nuevo.';
                await this.presentToast(this.errorMessage, 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarContacto() {
    if (this.usuario?.contactoEmergencia) {
      await this.modalContacto.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Sin Contacto de Emergencia',
        message: 'No se ha registrado información de contacto de emergencia.',
        buttons: ['OK']
      });

      await alert.present();
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

  // Función genérica para abrir un modal
  openModal(modal: IonModal) {
    modal.present();
  }

  // Función genérica para cerrar un modal
  closeModal(modal: IonModal) {
    modal.dismiss();
  }

  // Funciones específicas que usan las funciones genéricas
  openAddUserModal() {
    this.openModal(this.modalAddUser);
  }

  closeAddUserModal() {
    this.closeModal(this.modalAddUser);
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
        usuario_id: this.usuario.rut,
        nombre: formData.get('nombre') as string,
        apaterno: formData.get('apaterno') as string,
        amaterno: formData.get('amaterno') as string,
        telefono: telefono,
        correo: formData.get('correo') as string,
        relacion: formData.get('relacion') as string,
      };

      try {
        // Llama al servicio para crear el contacto
        const response = await firstValueFrom(this._contactoService.crearContacto(updatedContact));
        this.successMessage = 'Contacto agregado con éxito, se le ha enviado una notificación.'

        // Verifica si la respuesta fue exitosa
        if (response.ok) {
          try {
            //Envío de notificación al contacto agregado
            await this._usuarioService.enviarCorreoRegistroContacto(updatedContact.correo, this.usuario, updatedContact.nombre)
          } catch (error: unknown) {
            if (error instanceof Error) {
              this.successMessage = 'Error durante el envío de la notificación.'
              console.error('Error durante el envío de la notificación:', error.message);
              alert(error.message || 'Ocurrió un error inesperado.');
            } else {
              console.error('Error desconocido:', error);
              this.successMessage = 'Error durante el envío de la notificación.'
              alert('Ocurrió un error inesperado.');
            }
          }
        } else {
          this.errorMessage = 'Ocurrió un error al crear el contacto.';
          console.error(this.errorMessage);
          this.presentToast(this.errorMessage, 'danger');
        }

        this.presentToast(this.successMessage, 'success');
        this.closeEditContactModal();
      } catch (error) {
        this.errorMessage = 'Ocurrió un error al crear el contacto. Inténtalo de nuevo.';
        console.log(this.errorMessage);
        console.error('Error al crear contacto:', error);
      }
    }
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

