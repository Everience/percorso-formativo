import { Component, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-admin-toast',
    templateUrl: './toast.html',
    styleUrl: './toast.scss',
})
export class AdminToast {
    readonly toastService = inject(ToastService);
}
