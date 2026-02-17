import { Component, signal, ElementRef, inject, HostListener } from '@angular/core';

@Component({
  selector: 'app-profile-menu',
  imports: [],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.scss',
})
export class ProfileMenu {
  private readonly elRef = inject(ElementRef);

  readonly firstName = 'Mario';
  readonly lastName = 'Rossi';
  readonly email = 'mario.rossi@everience.com';
  readonly role: 'dev' | 'tech' = 'dev';

  readonly initials = this.firstName[0] + this.lastName[0];
  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  logout(): void {
    // TODO: Add logout functionality when backend auth exists
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
