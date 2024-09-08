import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Contacto } from 'src/app/models/contacto';
import { Usuario } from 'src/app/models/usuario';
import { LoginService } from 'src/app/services/loginService/login.service';
import { RolService } from 'src/app/services/rolService/rol.service';

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
    pApellido: '',
    sApellido: '',
    telefono: 0,
    comuna: '',
    region: '',
    rol: [],
    contactoEmergencia: undefined
  };
  rolUsuario: string | undefined;
  contacto: Contacto = {
    rut_usuario: "",
    nombre: "",
    telefono: 0,
    correo: "",
    relacion: ""
  }

  constructor(private router: Router, private alertController: AlertController, private _rolService: RolService, private _loginService: LoginService) { }

  ngOnInit() {
    // Accede al state pasado desde el LoginComponent
    console.info(this.router.getCurrentNavigation())
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario']
    const idsRoles = this.usuario?.rol.map(rol => rol.id) || [];

    // Obtener los roles desde el servicio basado en los IDs
    const roles = this._rolService.getRolByIds(idsRoles);

    // Concatenar los nombres de los roles
    if (roles && roles.length > 0) {
      this.rolUsuario = roles.map(rol => rol.nombre).join(', ');
      console.log("Roles Usuarios: " + this.rolUsuario)
    } else {
      this.rolUsuario = undefined; // o algún valor por defecto si no se encuentran roles
    }


    if (this.usuario) {
      console.log('Usuario logueado:', this.usuario);
    } else {
      console.error('No se recibió ningún usuario.');
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log('Modal cerrado con confirmación');
    }
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

  closeModal() {
    this.modalContacto.dismiss();
  }

  openAddUserModal() {
    this.modalAddUser.present();
  }

  closeAddUserModal() {
    this.modalAddUser.dismiss();
  }

  async handleAddUserSubmit(event: Event) {
    const success = await this._loginService.handleAddUserSubmit(event);

    // Si el usuario fue agregado correctamente, cierra el modal de registro
    if (success) {
      this.closeAddUserModal()
    }

  }

  openEditUserModal() {
    this.modalEditUser.present();
  }

  closeEditUserModal() {
    this.modalEditUser.dismiss();
  }

  async handleEditUserSubmit(event: Event) {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    if (!this.usuario) {
      console.error('No hay usuario logueado para editar');
      return;
    }

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const telefonoString = formData.get('telefono') as string;
    const telefono = parseInt(telefonoString, 10);

    if (isNaN(telefono)) {
      console.error('El teléfono ingresado no es válido.');
      return;
    }

    const updatedUser = {
      nombre: formData.get('nombre') as string,
      pApellido: formData.get('pApellido') as string,
      sApellido: formData.get('sApellido') as string,
      telefono: telefono,
      comuna: formData.get('comuna') as string,
      region: formData.get('region') as string,
      // No se incluye `rut` aquí porque se toma del usuario logueado
    };

    const success = await this._loginService.updateUser(this.usuario.rut, updatedUser);

    if (success) {
      this.usuario = { ...this.usuario, ...updatedUser };
      this.closeEditUserModal();
    } else {
      // Manejar fallo en la actualización
    }
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

    // Actualizar el contacto usando el servicio
    const success = this._loginService.updateContact(this.usuario!.rut, updatedContact);

    if (success) {
      this.usuario = {
        ...this.usuario,
        contactoEmergencia: updatedContact,
      };
      this.closeEditContactModal();
    } else {
      // Manejar fallo en la actualización
      console.error('Error al actualizar el contacto de emergencia.');
    }
  }
}

