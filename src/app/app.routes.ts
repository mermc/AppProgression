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
  path: 'dashboard/detalle/:tipo/:id/items/:itemId', // edición
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/component/detalle/item/item').then(m => m.Item)
},
   {
  path: 'dashboard/detalle/:tipo/:id/items', // creación
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/component/detalle/item/item').then(m => m.Item)
},
{
    path: 'dashboard/editar/:tipo/:id', // edición del padre
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/nuevo/nuevo').then(m => m.Nuevo), // reutilizamos "nuevo" como formulario de edición
  },
  {
  path: 'dashboard/detalle/:tipo/:id/items',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/component/detalle/item-list/item-list')
      .then(m => m.ItemList)
},

// Registros (subcolección dentro de items) - lista, nuevo, edición
  {
    path: 'dashboard/detalle/:tipo/:id/items/:itemId/registros',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/detalle/item/registro-list/registro-list').then(m => m.RegistroList)
  },
  {
    path: 'dashboard/detalle/:tipo/:id/items/:itemId/registros/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/detalle/item/registro-form/registro-form').then(m => m.RegistroForm)
  },
  {
    path: 'dashboard/detalle/:tipo/:id/items/:itemId/registros/:registroId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/component/detalle/item/registro-form/registro-form').then(m => m.RegistroForm)
  },


  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' } // por si alguien pone mal la ruta
];

