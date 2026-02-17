import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/auth/signup/signup')
        .then(m => m.Signup)
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/errors/not-found/not-found')
        .then(m => m.NotFound)
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
        redirectTo: '/not-found',
        pathMatch: 'full'
      }
    ]
  }
];
