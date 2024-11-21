import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isUsuarioGuard } from './guards/isUsuario/is-usuario.guard';
import { isAdminGuard } from './guards/isAdmin/is-admin.guard';
import { isAdminOrUserGuard } from './guards/isAdminOrUser/is-admin-or-user.guard';
import { isStaffGuard } from './guards/isStaff/is-staff.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'user-info',
    loadChildren: () => import('./pages/user-info/user-info.module').then(m => m.UserInfoPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule),
    canActivate: [isUsuarioGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminPageModule),
    canActivate: [isStaffGuard]
  },
  {
    path: 'solicitudes',
    loadChildren: () => import('./pages/solicitudes/solicitudes.module').then(m => m.SolicitudesPageModule),
    canActivate: [isAdminOrUserGuard]
  },
  {
    path: 'gestor-roles',
    loadChildren: () => import('./pages/gestionRoles/gestor-roles.module').then(m => m.GestorRolesPageModule),
    canActivate: [isAdminGuard]
  },
  {
    path: 'agregar-usuario-admin',
    loadChildren: () => import('./pages/agregarUsuarioAdmin/agregar-usuario-admin.module').then(m => m.AgregarUsuarioAdminPageModule),
    canActivate: [isAdminGuard]
  },
  {
    path: 'ver-notificacion',
    loadChildren: () => import('./pages/verNotificacion/ver-notificacion.module').then(m => m.VerNotificacionPageModule),
    canActivate: [isUsuarioGuard]
  },
  {
    path: 'ubicacion',
    loadChildren: () => import('./pages/ubicacion/ubicacion.module').then(m => m.UbicacionPageModule)
  },
  {
    path: 'soporte',
    loadChildren: () => import('./pages/soporte/soporte.module').then(m => m.SoportePageModule)
  },
  {
    path: 'gestionar-solicitud',
    loadChildren: () => import('./pages/gestionar-solicitud/gestionar-solicitud.module').then(m => m.GestionarSolicitudPageModule)
  },
  {
    path: 'formulario-ticket',
    loadChildren: () => import('./pages/formulario-ticket/formulario-ticket.module').then( m => m.FormularioTicketPageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
