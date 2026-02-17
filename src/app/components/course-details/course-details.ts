import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CourseDetailService, CourseStatus } from '../../services/course-detail.service';
import { GlassElem } from '../glass-elem/glass-elem';

interface StatusOption {
  value: CourseStatus;
  label: string;
}

@Component({
  selector: 'app-course-details',
  imports: [GlassElem],
  templateUrl: './course-details.html',
  styleUrl: './course-details.scss',
})
export class CourseDetails {
  readonly courseDetailService = inject(CourseDetailService);
  private readonly elRef = inject(ElementRef);

  readonly statusOptions: StatusOption[] = [
    { value: 'completed', label: 'Completato' },
    { value: 'in-progress', label: 'In corso' },
    { value: 'not-started', label: 'Da iniziare' },
  ];

  readonly statusDropdownOpen = signal(false);

  readonly currentStatus = computed<CourseStatus>(() => {
    const course = this.courseDetailService.selectedCourse();
    return course ? this.courseDetailService.getStatus(course) : 'not-started';
  });

  readonly courseTitle = computed(() => {
    const raw = this.courseDetailService.selectedCourse();
    if (!raw) return '';
    return raw.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
  });

  get currentStatusLabel(): string {
    return this.statusOptions.find(o => o.value === this.currentStatus())?.label ?? '';
  }

  toggleDropdown(): void {
    this.statusDropdownOpen.update(v => !v);
  }

  selectStatus(status: CourseStatus): void {
    const course = this.courseDetailService.selectedCourse();
    if (course) {
      this.courseDetailService.setStatus(course, status);
    }
    this.statusDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.statusDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.courseDetailService.selectedCourse()) {
      this.courseDetailService.close();
    }
  }
}
