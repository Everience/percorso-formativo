import { Component, signal, inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-udemy-access-instructions',
  imports: [],
  templateUrl: './udemy-access-instructions.html',
  styleUrl: './udemy-access-instructions.scss',
})
export class UdemyAccessInstructions {
  private readonly doc = inject(DOCUMENT);
  readonly isOpen = signal(false);
  readonly copied = signal(false);

  readonly sharedEmail = 'register.is@everience.com';
  readonly hrContacts = environment.hrContacts;

  getTeamsChatLink(email: string): string {
    return `https://teams.microsoft.com/l/chat/0/0?users=${email}`;
  }

  open(): void {
    this.isOpen.set(true);
    this.doc.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    this.doc.body.style.overflow = '';
  }

  async copyEmail(): Promise<void> {
    await navigator.clipboard.writeText(this.sharedEmail);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}
