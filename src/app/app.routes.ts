import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'nuevo-gasto',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/nuevo-gasto/nuevo-gasto.page').then( m => m.NuevoGastoPage)
  },
  {
    path: 'confirmar-gasto',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/confirmar-gasto/confirmar-gasto.page').then( m => m.ConfirmarGastoPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  }
];
