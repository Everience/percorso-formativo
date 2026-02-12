import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tech',
    loadComponent: () =>
      import('./roadmaps/tech/tech')
        .then(m => m.Tech)
  },
  {
    path: '**',
    redirectTo: 'tech',
    pathMatch: 'full'
  }
];
