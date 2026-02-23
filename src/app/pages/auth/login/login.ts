import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth.service';

interface LoginData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly EMAIL_DOMAIN = '@everience.com';
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginModel = signal<LoginData>({
    username: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schema) => {
    required(schema.username, { message: 'Username is required' });
    required(schema.password, { message: 'Password is required' });
  });

  fullEmail = computed(() => {
    const username = this.loginForm.username().value();
    return username ? `${username}${this.EMAIL_DOMAIN}` : '';
  });

  refreshPage(): void {
    window.location.reload();
  }

  loginError = signal<string | null>(null);
  loading = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.loginError.set(null);

    const email = this.fullEmail();
    const password = this.loginForm.password().value();

    if (!email || !password) {
      this.loginError.set('Inserisci email e password.');
      return;
    }

    this.loading.set(true);

    try {
      const user = await this.authService.signIn(email, password);
      this.router.navigate([`/${user.role}`]);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        this.loginError.set('Credenziali non valide.');
      } else if (code === 'auth/too-many-requests') {
        this.loginError.set('Troppi tentativi. Riprova più tardi.');
      } else if (err?.status === 404) {
        this.loginError.set('Utente non registrato. Effettua la registrazione.');
      } else {
        this.loginError.set('Errore durante il login. Riprova.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  dismissError(): void {
    this.loginError.set(null);
  }
}
