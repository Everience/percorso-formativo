import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { employeeRoadmapHome } from '../utils/employee-roadmap-home';

export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.initializing()) {
        await waitUntilReady(auth);
    }

    if (!auth.isLoggedIn()) {
        return true;
    }

    const role = auth.userRole();
    if (role === 'admin') {
        return router.createUrlTree(['/admin']);
    }
    return router.createUrlTree([employeeRoadmapHome(role)]);
};

function waitUntilReady(auth: AuthService): Promise<void> {
    return new Promise((resolve) => {
        const check = setInterval(() => {
            if (!auth.initializing()) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });
}
