import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { employeeRoadmapHome } from '../../utils/employee-roadmap-home';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  private readonly authService = inject(AuthService);

  readonly homeRoute = computed(() => {
    const role = this.authService.userRole();
    if (!role) {
      return '/login';
    }
    if (role === 'admin') {
      return '/admin';
    }
    return employeeRoadmapHome(role);
  });
}
