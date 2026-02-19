import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';

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

  onSubmit(event: Event): void {
    event.preventDefault();
    // TODO: implement signup logic once the backend is ready
    this.signupError.set('Errore durante la registrazione.');
  }

  selectRole(role: Role): void {
    this.signupModel.update(data => ({ ...data, role }));
  }

  dismissError(): void {
    this.signupError.set(null);
  }
}
