import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login')
        .then(m => m.Login)
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/signup/signup')
        .then(m => m.Signup)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/not-found/not-found')
        .then(m => m.NotFound)
  },
  {
    path: '',
    canActivate: [authGuard],
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
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: '/not-found',
        pathMatch: 'full'
      }
    ]
  }
];
