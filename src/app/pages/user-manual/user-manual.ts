import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-manual.html',
  styleUrl: './user-manual.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManual implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeSection = signal('introduzione');
  readonly showBackToTop = signal(false);
  readonly tocOpen = signal(false);
  readonly scrollProgress = signal(0);

  private sectionIds = [
    'introduzione', 'requisiti', 'accesso', 'navigazione',
    'udemy', 'corsi', 'profilo', 'problemi'
  ];
  private scrollListener: (() => void) | null = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollListener = () => this.onScroll();
      window.addEventListener('scroll', this.scrollListener, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.onScroll();
  }

  toggleToc(): void {
    this.tocOpen.update(v => !v);
  }

  scrollTo(sectionId: string): void {
    this.tocOpen.set(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private onScroll(): void {
    const scrollY = window.scrollY;

    this.showBackToTop.set(scrollY > 400);

    let active = this.sectionIds[0];
    const offset = 120;

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + scrollY - offset;
        if (scrollY >= top) {
          active = id;
        }
      }
    }

    this.activeSection.set(active);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max((scrollY / maxScroll) * 100, 0), 100) : 0;
    this.scrollProgress.set(progress);
  }
}
