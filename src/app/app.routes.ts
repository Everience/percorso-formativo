import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup')
        .then(m => m.Signup)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout')
        .then(m => m.Layout),
    children: [
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
    ]
  }
];
