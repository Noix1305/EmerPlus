import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isUsuarioGuard } from './guards/isUsuario/is-usuario.guard';
import { isAdminGuard } from './guards/isAdmin/is-admin.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'user-info',
    loadChildren: () => import('./pages/user-info/user-info/user-info.module').then(m => m.UserInfoPageModule),
    canActivate: [isUsuarioGuard]
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
    loadChildren: () => import('./pages/admin/admin/admin.module').then(m => m.AdminPageModule),
    canActivate: [isAdminGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },  {
    path: 'solicitudes',
    loadChildren: () => import('./pages/solicitudes/solicitudes/solicitudes.module').then( m => m.SolicitudesPageModule)
  },
  {
    path: 'gestor-roles',
    loadChildren: () => import('./pages/gestionRoles/gestor-roles/gestor-roles.module').then( m => m.GestorRolesPageModule)
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
