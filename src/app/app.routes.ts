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
    canActivate: [authGuard],
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'gastos-familia',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/gastos-familia/gastos-familia.page').then( m => m.GastosFamiliaPage)
  },
  {
    path: 'familia-setup',
    loadComponent: () => import('./pages/familia-setup/familia-setup.page').then( m => m.FamiliaSetupPage)
  },
  {
    path: 'familia-detalles',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/familia-detalles/familia-detalles.page').then( m => m.FamiliaDetallesPage)
  },
  {
    path: 'resumen-familia',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resumen-familia/resumen-familia.page').then( m => m.ResumenFamiliaPage)
  },
  {
    path: 'gastos-integrante/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/gastos-integrante/gastos-integrante.page').then( m => m.GastosIntegrantePage)
  }
];
