import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Nuevo } from './component/nuevo/nuevo';

export const routes: Routes = [
  { path: '', component: Dashboard},
  { path: 'nuevo', component: Nuevo }
];