import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'nuevo-gasto',
    loadComponent: () => import('./pages/nuevo-gasto/nuevo-gasto.page').then( m => m.NuevoGastoPage)
  },
];
