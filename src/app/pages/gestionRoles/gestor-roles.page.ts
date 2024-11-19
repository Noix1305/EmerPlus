import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { ModificarRolModalComponent } from 'src/app/components/modificarRol/modificar-rol-modal/modificar-rol-modal.component';
import { ActualizarRol } from 'src/app/models/actualizarRol';
import { Rol } from 'src/app/models/rol';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { MENSAJE_CARGANDO, SWAL_ERROR, SWAL_SUCCESS, SWAL_WARN } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-gestor-roles',
  templateUrl: './gestor-roles.page.html',
  styleUrls: ['./gestor-roles.page.scss'],
})
export class GestorRolesPage implements OnInit {

  usuarios: Usuario[] = [];
  @Input() usuario: Usuario = { rut: '', nombre: '', papellido: '', sapellido: '', password: '', estado: 0, rol: [0] };
  usuarioSeleccionado!: Usuario;
  roles: Rol[] = []; // Array para almacenar los roles disponibles
  selectedRoleIds: number[] = []; // Almacena los roles seleccionados
  selectedRoleId: number | null = null;
  usuariosFiltrados: Usuario[] = []; // Lista filtrada de usuarios
  filterRUT: string = ''; // RUT para filtrar


  constructor(
    private _usuarioService: UsuarioService,
    private _rolesService: RolService,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });
    await loading.present();
    try {
      this.roles = await this._rolesService.obtenerRoles(); // Obtener todos los roles disponibles
      console.log(this.roles); // Ver cuántos roles se están cargando
    } catch (error) {
      this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al cargar los roles.')
    } finally {
      // Cierra el loading después de procesar la solicitud
      loading.dismiss();
    }
    this.cargarUsuarios();
  }

  get usuariosParaMostrar(): Usuario[] {
    return this.usuariosFiltrados.length < 1 ? this.usuarios : this.usuariosFiltrados;
  }


  async abrirModalRol(usuario: Usuario) {
    // Establecer los roles actuales del usuario
    this.selectedRoleIds = [...usuario.rol];

    const modal = await this.modalController.create({
      component: ModificarRolModalComponent,
      componentProps: { usuario },
      cssClass: 'custom-modal'
    });

    await modal.present();

    // Obtener el resultado del modal para actualizar la lista de usuarios si es necesario
    const { data, role } = await modal.onDidDismiss();
    if (role === 'updated') {
      this.cargarUsuarios(); // Recargar usuarios si los roles fueron actualizados
    }
  }

  async cargarUsuarios() {
    this._usuarioService.obtenerUsuarios().subscribe({
      next: async (data) => {
        this.usuarios = data;

        // Asignar el nombre del rol y ordenar alfabéticamente por nombre
        for (const usuario of this.usuarios) {
          usuario.rolNombre = await this._rolesService.obtenerNombreRol(usuario.rol[0]); // Asumir un rol
        }

        // Ordenar usuarios alfabéticamente por nombre
        this.usuarios.sort((a, b) => {
          const nombreA = `${a.nombre} ${a.papellido} ${a.sapellido}`.toLowerCase();
          const nombreB = `${b.nombre} ${b.papellido} ${b.sapellido}`.toLowerCase();
          return nombreA.localeCompare(nombreB);
        });
      },
      error: (error) => {
        this.mostrarSwal(SWAL_ERROR, 'Error', 'Error al cargar usuarios: ' + error)
      },
    });
  }

  // Abrir el modal dentro del mismo componente
  async abrirModal(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.roles = await this._rolesService.obtenerRoles();

    const modal = await this.modalController.create({
      component: GestorRolesPage, // Reutilizamos el mismo componente
      componentProps: {
        usuario: this.usuarioSeleccionado,
        roles: this.roles,
      }
    });

    await modal.present();
  }

  // Método para guardar el nuevo rol
  guardarRol() {
    // Filtramos cualquier valor null de los roles seleccionados
    const data: ActualizarRol = {
      rol: this.selectedRoleId !== null ? [this.selectedRoleId] : []  // Si selectedRoleId es null, se envía un array vacío
    };

    this._usuarioService.actualizarRol(this.usuarioSeleccionado.rut, data).subscribe({
      next: (response) => {
        this.mostrarSwal(SWAL_SUCCESS, 'Éxito', 'Rol Actualizado con éxito.')
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al actualizar el rol:', error);
      }
    });
  }

  async modificarRol2() {
    // Crear opciones de rol
    const roleOptions = this.roles.map(rol => `
      <button class="role-button" data-role-id="${rol.id}" style="margin: 5px; padding: 10px; border: none; background-color: #007bff; color: white; cursor: pointer;">
        ${rol.nombre}
      </button>
    `).join('');

    // Crear la alerta
    const { isConfirmed } = await Swal.fire({
      title: 'Modificar Rol',
      html: `
        <div>
          <p>Selecciona un rol:</p>
          <div class="role-options">${roleOptions}</div>
        </div>
      `,
      heightAuto: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar Rol',
      focusConfirm: false,
      didOpen: () => {
        // Seleccionar todos los botones de rol después de abrir la alerta
        const buttons = document.querySelectorAll('.role-button') as NodeListOf<HTMLElement>;

        // Añadir eventos de clic a los botones
        buttons.forEach(button => {
          button.addEventListener('click', () => {
            buttons.forEach(btn => {
              btn.style.backgroundColor = '#007bff'; // Reiniciar color
            }); // Limpiar selección anterior
            button.style.backgroundColor = '#28a745'; // Cambiar color del botón seleccionado
            console.log('Rol seleccionado ID:', button.getAttribute('data-role-id')); // Mostrar ID del rol seleccionado
          });
        });
      }
    });

    // Manejar la confirmación
    if (isConfirmed) {
      const selectedButton = document.querySelector('.role-button[style*="background-color: rgb(40, 167, 69)"]') as HTMLElement;
      if (selectedButton) {
        const selectedRoleId = selectedButton.getAttribute('data-role-id');
        this.mostrarSwal(SWAL_SUCCESS, 'Guardado exitoso.', `Rol guardado con ID: ${selectedRoleId}`)

      } else {
        this.mostrarSwal(SWAL_WARN, 'No hay rol seleccionado.', 'No se seleccionó ningún rol')
      }
    }
  }


  async modificarRol(usuario: Usuario) {
    // Obtener los roles disponibles
    const roles = await this._rolesService.obtenerRoles();

    // Crear un HTML dinámico para mostrar los detalles del usuario y los roles
    const roleOptions = roles.map(rol =>
      `<button class="role-button" data-role-id="${rol.id}" style="margin: 5px; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        ${rol.nombre}
      </button>`
    ).join('');

    // Mostrar la alerta con SweetAlert
    const { isConfirmed } = await Swal.fire({
      title: 'Modificar Rol',
      html: `
        <div>
          <p><strong>Nombre del Usuario:</strong> ${usuario.nombre}</p>
          <p><strong>Correo Electrónico:</strong> ${usuario.correo}</p>
          <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
          <p><strong>Seleccionar Rol:</strong></p>
          <div class="role-options">${roleOptions}</div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Rol',
      heightAuto: false,
      didOpen: () => {
        // Seleccionar todos los botones de rol después de abrir la alerta
        const buttons = document.querySelectorAll('.role-button') as NodeListOf<HTMLElement>;

        // Añadir eventos de clic a los botones
        buttons.forEach(button => {
          button.addEventListener('click', () => {
            // Limpiar selección anterior
            buttons.forEach(btn => {
              (btn as HTMLButtonElement).classList.remove('selected');
              (btn as HTMLButtonElement).style.backgroundColor = '#007bff'; // Color original
            });

            // Marcar el botón seleccionado
            (button as HTMLButtonElement).classList.add('selected');
            (button as HTMLButtonElement).style.backgroundColor = '#28a745'; // Cambiar a color verde cuando se selecciona
            console.log('Rol seleccionado ID:', button.getAttribute('data-role-id')); // Mostrar el ID del rol seleccionado
          });
        });
      }
    });

    // Manejar la confirmación de la selección
    if (isConfirmed) {
      // Obtener el botón seleccionado
      const selectedButton = document.querySelector('.role-button.selected') as HTMLElement;

      if (selectedButton) {
        const selectedRoleId = selectedButton.getAttribute('data-role-id'); // Obtener el ID del rol seleccionado
        const data: ActualizarRol = {
          rol: [parseInt(selectedRoleId!)] // Asegúrate de enviar el rol como número
        };

        // Actualizar el rol en el servicio
        this._usuarioService.actualizarRol(usuario.rut, data).subscribe({
          next: (response) => {
            console.log('Rol actualizado con éxito:', response);
            this.mostrarSwal(SWAL_SUCCESS, 'Éxito', 'Rol guardado.')

            this.cargarUsuarios(); // Recargar la lista de usuarios
          },
          error: (error) => {
            console.error('Error al actualizar el rol:', error);
            this.mostrarSwal(SWAL_ERROR, 'Error', 'No se pudo actualizar el rol');
          }
        });
      } else {
        this.mostrarSwal(SWAL_WARN, 'Error', 'No se seleccionó ningún rol');
      }
    }
  }

  // Cerrar modal
  cerrarModal() {
    this.modalController.dismiss();
  }

  filtrarPorRUT() {
    if (this.filterRUT) {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.rut.toLowerCase().includes(this.filterRUT.toLowerCase())
      );
    } else {
      this.usuariosFiltrados = this.usuarios; // Si no hay filtro, mostrar todos los usuarios
    }
  }

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      text: text,
      heightAuto: false
    });
  }
}
