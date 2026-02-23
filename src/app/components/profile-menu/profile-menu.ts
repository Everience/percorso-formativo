import { Component, signal, computed, ElementRef, inject, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-menu',
  imports: [],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.scss',
})
export class ProfileMenu {
  private readonly elRef = inject(ElementRef);
  private readonly authService = inject(AuthService);

  readonly firstName = computed(() => this.authService.currentUser()?.first_name ?? '');
  readonly lastName = computed(() => this.authService.currentUser()?.last_name ?? '');
  readonly email = computed(() => this.authService.currentUser()?.email ?? '');
  readonly role = computed(() => this.authService.currentUser()?.role ?? 'dev');

  readonly initials = computed(() => {
    const fn = this.firstName();
    const ln = this.lastName();
    return (fn?.[0] ?? '') + (ln?.[0] ?? '');
  });

  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  async logout(): Promise<void> {
    await this.authService.logOut();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
