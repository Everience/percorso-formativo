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
      import('./pages/not-found/not-found')
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
          import('./components/roadmap/roadmap')
            .then(m => m.Roadmap),
        data: {
          category: 'dev',
          oppositeRoute: '/tech',
          oppositeLabel: 'Visualizza i corsi tech',
        }
      },
      {
        path: 'tech',
        loadComponent: () =>
          import('./components/roadmap/roadmap')
            .then(m => m.Roadmap),
        data: {
          category: 'tech',
          oppositeRoute: '/dev',
          oppositeLabel: 'Visualizza i corsi dev',
        }
      },
      {
        path: '**',
        redirectTo: '/not-found',
        pathMatch: 'full'
      }
    ]
  }
];
