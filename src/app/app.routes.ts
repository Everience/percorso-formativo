import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dev',
    loadComponent: () =>
      import('./roadmaps/dev/dev')
        .then(m => m.Dev)
  },
  {
    path: 'tech',
    loadComponent: () =>
      import('./roadmaps/tech/tech')
        .then(m => m.Tech)
  },
  {
    path: '**',
    redirectTo: 'dev',
    pathMatch: 'full'
  }
];
