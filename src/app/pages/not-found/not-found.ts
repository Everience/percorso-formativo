import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
    return role ? `/${role}` : '/login';
  });
}
