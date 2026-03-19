import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { AdminUiService } from '../../services/admin-ui.service';

@Component({
    selector: 'app-admin-sidebar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly adminUi = inject(AdminUiService);

  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user ? `${user.first_name} ${user.last_name}` : '';
  });

  readonly userInitials = computed(() => {
    const user = this.authService.currentUser();
    return user ? (user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '') : '';
  });

  readonly isDark = computed(() => this.themeService.theme() === 'dark');

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleSidebar(): void {
    this.adminUi.toggleSidebar();
  }

  async logout(): Promise<void> {
    await this.authService.logOut();
  }
}
