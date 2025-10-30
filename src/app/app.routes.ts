import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    // Protegida authenticacion guard
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'dashboard/nuevo',
    // Protegida authenticacion guard
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/nuevo/nuevo').then(m => m.Nuevo)
  },
  {
    path: 'dashboard/detalle/:tipo/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/detalle/detalle').then(m => m.Detalle)
  },
  
{
  path: 'dashboard/detalle/:tipo/:id/item/:itemId', // edición
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/component/detalle/item/item').then(m => m.Item)
},
   {
  path: 'dashboard/detalle/:tipo/:id/item',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/component/detalle/item/item').then(m => m.Item)
},
{
    path: 'dashboard/editar/:tipo/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/nuevo/nuevo').then(m => m.Nuevo), // reutilizamos "nuevo" como formulario de edición
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } // por si alguien pone mal la ruta
];

