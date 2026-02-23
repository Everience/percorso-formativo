import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';
import { AuthService } from '../../../services/auth.service';

type Role = 'dev' | 'tech';

interface SignupData {
  firstName: string;
  lastName: string;
  role: Role | '';
  username: string;
  password: string;
}

@Component({
  selector: 'app-signup',
  imports: [FormField, RouterLink],
  templateUrl: './signup.html',
  styleUrl: '../auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup {
  private readonly EMAIL_DOMAIN = '@everience.com';
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  signupModel = signal<SignupData>({
    firstName: '',
    lastName: '',
    role: '',
    username: '',
    password: '',
  });

  signupForm = form(this.signupModel, (schema) => {
    required(schema.firstName, { message: 'First name is required' });
    required(schema.lastName, { message: 'Last name is required' });
    required(schema.role, { message: 'Role is required' });
    required(schema.username, { message: 'Username is required' });
    required(schema.password, { message: 'Password is required' });
  });

  fullEmail = computed(() => {
    const username = this.signupForm.username().value();
    return username ? `${username}${this.EMAIL_DOMAIN}` : '';
  });

  refreshPage(): void {
    window.location.reload();
  }

  signupError = signal<string | null>(null);
  loading = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.signupError.set(null);

    const firstName = this.signupForm.firstName().value();
    const lastName = this.signupForm.lastName().value();
    const role = this.signupForm.role().value() as Role;
    const email = this.fullEmail();
    const password = this.signupForm.password().value();

    if (!firstName || !lastName || !role || !email || !password) {
      this.signupError.set('Compila tutti i campi.');
      return;
    }

    this.loading.set(true);

    try {
      await this.authService.signUp(firstName, lastName, email, password, role);
      this.router.navigate(['/login']);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        this.signupError.set('Email già registrata. Effettua il login.');
      } else if (code === 'auth/weak-password') {
        this.signupError.set('La password deve avere almeno 6 caratteri.');
      } else if (code === 'auth/invalid-email') {
        this.signupError.set('Indirizzo email non valido.');
      } else if (err?.status === 409) {
        this.signupError.set('Utente già presente nel sistema.');
      } else {
        this.signupError.set('Errore durante la registrazione. Riprova.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  selectRole(role: Role): void {
    this.signupModel.update(data => ({ ...data, role }));
  }

  dismissError(): void {
    this.signupError.set(null);
  }
}
