import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActualizarRol } from 'src/app/models/actualizarRol';
import { Rol } from 'src/app/models/rol';
import { RolService } from 'src/app/services/rolService/rol.service';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';


@Component({
  selector: 'app-modificar-rol-modal',
  templateUrl: './modificar-rol-modal.component.html',
  styleUrls: ['./modificar-rol-modal.component.scss'],
})
export class ModificarRolModalComponent implements OnInit {

  @Input() usuario: any; // Recibe el usuario desde el componente padre
  roles: Rol[] = []; // Array para almacenar los roles disponibles
  selectedRoleId: number | null = null; // Almacena el rol seleccionado

  constructor(
    private _usuarioService: UsuarioService,
    private _rolService: RolService,
    private modalController: ModalController) { }

  async ngOnInit() {
    this.roles = await this._rolService.obtenerRoles(); // Obtiene todos los roles
  }

  // Método para cerrar el modal
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Método para guardar el nuevo rol
  async guardarRol() {
    if (this.selectedRoleId !== null) {
      const data: ActualizarRol = {
        rol: [this.selectedRoleId],
      };

      // Llamar a actualizarRol pasándole el RUT del usuario y los datos del nuevo rol
      this._usuarioService.actualizarRol(this.usuario.rut, data).subscribe({
        next: (response) => {
          console.log('Rol actualizado con éxito', response);
          this.cerrarModal(); // Cerrar el modal después de actualizar
        },
        error: (error) => {
          console.error('Error al actualizar rol:', error);
        },
      });
    }
  }

}
