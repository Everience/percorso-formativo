import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';

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

  onSubmit(event: Event): void {
    event.preventDefault();
    // TODO: implement login logic once the backend is ready
    this.loginError.set('Credenziali non valide.');
  }

  onForgotPassword(): void {
    // TODO: implement forgot-password flow once the backend is ready
  }

  dismissError(): void {
    this.loginError.set(null);
  }
}
