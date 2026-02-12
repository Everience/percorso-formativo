import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dev',
    loadComponent: () =>
      import('./roadmaps/dev/dev')
        .then(m => m.Dev)
  },
  {
    path: '**',
    redirectTo: 'dev',
    pathMatch: 'full'
  }
];
