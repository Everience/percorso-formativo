import { Component, computed, effect, ElementRef, HostListener, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CourseDetailService, CourseStatus } from '../../services/course-detail.service';
import { CourseService } from '../../services/course.service';
import { Course, Resource } from '../../models/course.model';
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
  private readonly courseService = inject(CourseService);
  private readonly elRef = inject(ElementRef);

  readonly statusOptions: StatusOption[] = [
    { value: 'completed', label: 'Completato' },
    { value: 'in-progress', label: 'In corso' },
    { value: 'not-started', label: 'Da iniziare' },
  ];

  readonly statusDropdownOpen = signal(false);
  readonly courseDetail = signal<Course | null>(null);
  readonly resources = signal<Resource[]>([]);
  readonly detailLoading = signal(false);

  readonly currentStatus = computed<CourseStatus>(() => {
    const course = this.courseDetailService.selectedCourse();
    return course ? this.courseDetailService.getStatus(course) : 'not-started';
  });

  readonly courseTitle = computed(() => {
    const raw = this.courseDetailService.selectedCourse();
    if (!raw) return '';
    return raw.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
  });

  readonly courseDescription = computed(() => {
    return this.courseDetail()?.description ?? '';
  });

  constructor() {
    effect(onCleanup => {
      const id = this.courseDetailService.selectedCourseId();
      if (id == null) {
        this.courseDetail.set(null);
        this.resources.set([]);
        return;
      }

      this.detailLoading.set(true);
      const sub = forkJoin({
        course: this.courseService.getCourseById(id),
        resources: this.courseService.getResourcesByCourseId(id),
      }).subscribe({
        next: ({ course, resources }) => {
          this.courseDetail.set(course);
          this.resources.set(resources);
          this.detailLoading.set(false);
        },
        error: () => {
          this.courseDetail.set(null);
          this.resources.set([]);
          this.detailLoading.set(false);
        },
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  platformClass(platform: string): string {
    return `resources__platform--${platform.toLowerCase()}`;
  }

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
