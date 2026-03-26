import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/admin-layout').then(m => m.AdminLayout),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'users',
                loadComponent: () => import('./pages/users/users').then(m => m.Users),
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./pages/user-detail/user-detail').then(m => m.UserDetail),
            },
            {
                path: 'courses',
                loadComponent: () => import('./pages/courses/courses').then(m => m.Courses),
            },
            {
                path: 'courses/:id',
                loadComponent: () => import('./pages/course-detail/course-detail').then(m => m.CourseDetail),
            },
            {
                path: 'courses/:id/completions',
                loadComponent: () => import('./pages/course-completions/course-completions').then(m => m.CourseCompletions),
            },
            {
                path: 'manual',
                loadComponent: () => import('./pages/manual/admin-manual').then(m => m.AdminManual),
            },
        ],
    },
];
