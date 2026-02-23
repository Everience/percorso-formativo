import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth.service';

interface ForgotPasswordData {
  username: string;
}

@Component({
  selector: 'app-forgot-password',
  imports: [FormField, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly EMAIL_DOMAIN = '@everience.com';
  private readonly authService = inject(AuthService);

  forgotModel = signal<ForgotPasswordData>({
    username: '',
  });

  forgotForm = form(this.forgotModel, (schema) => {
    required(schema.username, { message: 'Username is required' });
  });

  fullEmail = computed(() => {
    const username = this.forgotForm.username().value();
    return username ? `${username}${this.EMAIL_DOMAIN}` : '';
  });

  refreshPage(): void {
    window.location.reload();
  }

  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set(null);
    this.success.set(false);

    const email = this.fullEmail();

    if (!email) {
      this.error.set('Inserisci il tuo indirizzo email.');
      return;
    }

    this.loading.set(true);

    try {
      await this.authService.resetPassword(email);
      this.success.set(true);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        // Still show success to prevent email enumeration attacks
        this.success.set(true);
      } else if (code === 'auth/too-many-requests') {
        this.error.set('Troppi tentativi. Riprova più tardi.');
      } else if (code === 'auth/invalid-email') {
        this.error.set('Indirizzo email non valido.');
      } else {
        this.error.set('Errore durante l\'invio. Riprova.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  dismissError(): void {
    this.error.set(null);
  }
}
