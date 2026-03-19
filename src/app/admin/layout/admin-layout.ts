import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmService } from '../../services/confirm.service';
import { Sidebar } from '../components/sidebar/sidebar';
import { AdminToast } from '../components/toast/toast';
import { ConfirmDialog } from '../components/confirm-dialog/confirm-dialog';
import { AdminUiService } from '../services/admin-ui.service';

@Component({
    selector: 'app-admin-layout',
    imports: [RouterOutlet, Sidebar, AdminToast, ConfirmDialog],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  readonly themeService = inject(ThemeService);
  readonly toastService = inject(ToastService);
  readonly confirmService = inject(ConfirmService);
  readonly adminUi = inject(AdminUiService);
  readonly themeAttr = computed(() => this.themeService.theme());
}
