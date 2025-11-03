import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./car-list/car-list.component').then(m => m.CarListComponent)
  }
];

