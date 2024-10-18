import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModificarRolModalComponent } from 'src/app/components/modificarRol/modificar-rol-modal/modificar-rol-modal.component';
import { ActualizarRol } from 'src/app/models/actualizarRol';
import { Rol } from 'src/app/models/rol';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';

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
    private modalController: ModalController
  ) { }

  async ngOnInit() {

    try {
      this.roles = await this._rolesService.obtenerRoles(); // Obtener todos los roles disponibles
      console.log(this.roles); // Ver cuántos roles se están cargando
    } catch (error) {
      console.error('Error al cargar roles:', error);
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
        console.error('Error al cargar usuarios:', error);
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
        console.log('Rol actualizado con éxito:', response);
        this.cerrarModal();
      },
      error: (error) => {
        console.error('Error al actualizar el rol:', error);
      }
    });
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
}
