import { HttpResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { firstValueFrom } from 'rxjs';
import { Comuna } from 'src/app/models/comuna';
import { Contacto } from 'src/app/models/contacto';
import { Region } from 'src/app/models/region';
import { Usuario } from 'src/app/models/usuario';
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

  usuario: Usuario = {
    rut: '',
    password: '',
    nombre: '',
    papellido: '',
    sapellido: '',
    telefono: 0,
    comunaid: 0,
    regionid: 0,
    rol: [0],
    estado: 1,
    contactoEmergencia: undefined
  };
  rolUsuario: string | undefined; // Cambia a string
  contacto: Contacto = {
    rut_usuario: "",
    nombre: "",
    telefono: 0,
    correo: "",
    relacion: ""
  }

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

  constructor(private router: Router,
    private alertController: AlertController,
    private _rolService: RolService,
    private _loginService: LoginService,
    private _usuarioService: UsuarioService,
    private _regionComunaService: RegionComunaService,
    private toastController: ToastController) { }

  async ngOnInit() {
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario'];
    this.cargarRegiones();
    this.cargarComunas();

    if (this.usuario && this.usuario.rol && this.usuario.rol.length > 0) {
      const rolId = this.usuario.rol[0]; // Obtener el primer ID del rol
      console.log("Rol Usuario Nav: " + rolId); // Muestra solo el ID

      // Llama al servicio para obtener el rol usando el ID
      const rolDesdeServicio = await this._rolService.obtenerRolPorId(rolId);

      // Asigna el nombre del rol a rolUsuario
      this.rolUsuario = rolDesdeServicio ? rolDesdeServicio.nombre : undefined;
      console.log("Rol Usuario: " + this.rolUsuario); // Esto es ahora de tipo string | undefined
    } else {
      console.error('Usuario o rol no disponibles');
    }
  }

  getComunasPorRegion(idRegion: number) {
    this._regionComunaService.getComunaPorRegion(idRegion).subscribe(
      (response: HttpResponse<Comuna[]>) => {
        // Aquí obtienes el cuerpo de la respuesta
        if (response.body) {
          this.comunas = response.body; // Guarda las comunas en la variable
          console.log('Comunas obtenidas:', this.comunas); // Muestra las comunas en consola
        }
      },
      (error) => {
        console.error('Error al obtener comunas:', error); // Manejo de errores
      }
    );
  }

  async formularioEditUsuario(event: Event) {
  event.preventDefault(); // Prevenir el envío por defecto del formulario

  if (!this.usuario) {
    console.error('No hay usuario logueado para editar');
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const updatedUser: Usuario = {
    rut: this.usuario.rut, // Agregamos el rut aquí
    nombre: formData.get('nombre') as string,
    papellido: formData.get('pApellido') as string,
    sapellido: formData.get('sApellido') as string,
    correo: formData.get('correo') as string,
    telefono: Number(formData.get('telefono')),
    comunaid: this.selectedComuna ? this.selectedComuna.id : undefined, // Asegúrate de que esto sea correcto
    regionid: this.selectedRegion ? this.selectedRegion.id : undefined, // Asegúrate de que esto sea correcto
    password: this.usuario.password,
    rol: [this.usuario.rol[0]],
    estado: 1
  };

  console.log('comuna: ' + updatedUser.comunaid + '\nRegion: ' + updatedUser.regionid);

  this._usuarioService.editarUsuario(updatedUser.rut, updatedUser).subscribe({
    next: (response) => {
      this.successMessage = 'Usuario editado con éxito';
      console.log('Usuario editado:', response.body);
      // Cierra el modal o muestra un mensaje de éxito
      this.presentToast(this.successMessage);
      this.closeEditUserModal();
    },
    error: (error) => {
      console.error('Error al editar el usuario:', error);
      // Manejo de errores
    }
  });
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
      this.presentToast(this.successMessage);
      this.closeAddUserModal(); // Cierra el modal si el registro fue exitoso
    } catch (error) {
      console.error('Error al crear usuario:', error);
      this.errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
    }
  }

  async presentToast(successMessage: string) {
    const toast = await this.toastController.create({
      message: successMessage,
      duration: 2000, // Duración en milisegundos
      position: 'top', // Posición del Toast
      color: 'success', // Color del Toast, puedes cambiarlo según tus necesidades
    });
    toast.present();
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
      console.log('Region ID: ' + regionId);

      // Obtener las comunas desde el servicio
      this._regionComunaService.getComunaPorRegion(regionId).subscribe({
        next: (response: HttpResponse<Comuna[]>) => {
          // Acceder al cuerpo de la respuesta
          const comunas = response.body || []; // Asegúrate de que sea un array

          console.log('Tamaño nuevo array: ' + comunas.length); // Corrección de 'lenght' a 'length'

          // Verifica si se obtuvo un array de comunas
          if (Array.isArray(comunas)) {
            this.comunas = comunas; // Asigna el array de comunas directamente
          } else {
            console.error('No se obtuvieron comunas válidas');
            this.comunas = []; // Manejar el caso de error
          }

          console.log('comunas: ', this.comunas); // Ahora deberías ver un array de objetos Comuna
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
      console.log('Modal cerrado con confirmación');
    }
  }

  closeModal() {
    this.modalContacto.dismiss();
  }

  openAddUserModal() {
    this.modalAddUser.present();
  }

  closeAddUserModal() {
    this.modalAddUser.dismiss();
  }

  openEditUserModal() {
    this.modalEditUser.present();
  }

  closeEditUserModal() {
    this.modalEditUser.dismiss();
  }

  openEditContactModal() {
    this.modalEditContact.present();
  }

  closeEditContactModal() {
    this.modalEditContact.dismiss();
  }

  async handleEditContactSubmit(event: Event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    // Extraer los detalles del contacto del formulario
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extraer y convertir el teléfono a número
    const telefonoString = formData.get('telefono') as string;
    const telefono = parseInt(telefonoString, 10);

    // Validar si el teléfono es un número válido
    if (isNaN(telefono)) {
      console.error('El teléfono ingresado no es válido.');
      return;
    }

    // Crear el objeto actualizado de contacto
    const updatedContact: Contacto = {
      rut_usuario: this.usuario!.rut, // RUT del usuario logueado
      nombre: formData.get('nombre') as string,
      telefono: telefono, // Usar el número convertido
      correo: formData.get('correo') as string,
      relacion: formData.get('relacion') as string,
    };

    // Asegurarse de que `rut` está definido antes de actualizar `this.usuario`
    if (!this.usuario?.rut) {
      console.error('El RUT del usuario no está definido.');
      return;
    }

  }


}

