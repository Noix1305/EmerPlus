import { Component, OnInit } from '@angular/core';
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

  constructor(
    private usuarioService: UsuarioService,
    private _rolesService: RolService
  ) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: async (data) => {
        this.usuarios = data;

        // Asignar nombre de rol y ordenar alfabéticamente por nombre
        for (const usuario of this.usuarios) {
          usuario.rolNombre = await this._rolesService.obtenerNombreRol(usuario.rol[0]); // Asumiendo que el rol es un array
        }

        // Ordenar usuarios alfabéticamente por nombre
        this.usuarios.sort((a, b) => {
          const nombreA = `${a.nombre} ${a.papellido} ${a.sapellido}`.toLowerCase();
          const nombreB = `${b.nombre} ${b.papellido} ${b.sapellido}`.toLowerCase();
          return nombreA.localeCompare(nombreB); // Compara nombres
        });
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      },
    });
  }
}
