import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { AdminCourseService } from '../../services/admin-course.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';
import { AdminCourse, AdminResource } from '../../../models/admin.model';

@Component({
    selector: 'app-course-detail',
    imports: [RouterLink, FormsModule, CdkDrag, CdkDropList, CdkDragHandle],
    templateUrl: './course-detail.html',
    styleUrl: './course-detail.scss',
})
export class CourseDetail implements OnInit {
    private readonly maxCoursesPerRow = 4;
    readonly id = input.required<string>();

    private readonly courseService = inject(AdminCourseService);
    private readonly toast = inject(ToastService);
    private readonly confirm = inject(ConfirmService);

    readonly course = signal<AdminCourse | null>(null);
    readonly resources = signal<AdminResource[]>([]);
    readonly loading = signal(true);
    readonly saving = signal(false);

    editData = { title: '', description: '', category: 'DEV' as 'DEV' | 'TECH', position_row: 1, display_order: 1 };
    showAddResource = false;
    newResource = { title: '', platform: 'Udemy', video_url: '', sort_order: 1 };
    editingResourceId: number | null = null;
    editResource = { title: '', platform: '', video_url: '', sort_order: 1 };

  ngOnInit(): void {
    this.loadCourse();
    this.loadResources();
  }

  private loadCourse(): void {
    const courseId = Number(this.id());
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        const normalizedCategory = (course.category ?? '').toString().toUpperCase() as 'DEV' | 'TECH';
        this.course.set(course);
        this.editData = {
          title: course.title,
          description: course.description ?? '',
          category: normalizedCategory,
          position_row: course.position_row,
          display_order: course.display_order,
        };
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadResources(): void {
    const courseId = Number(this.id());
    this.courseService.getResources(courseId).subscribe({
      next: (resources) => {
        this.resources.set(resources.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
      },
    });
  }

  get isCertification(): boolean {
    return !this.editData.description || this.editData.description.trim() === '';
  }

  get hasChanges(): boolean {
    const original = this.course();
    if (!original) return false;
    const originalCategory = (original.category ?? '').toString().toUpperCase() as 'DEV' | 'TECH';
    return (
      original.title !== this.editData.title ||
      (original.description ?? '') !== (this.editData.description ?? '') ||
      originalCategory !== this.editData.category ||
      original.position_row !== this.editData.position_row ||
      original.display_order !== this.editData.display_order
    );
  }

  async saveCourse(): Promise<void> {
    const title = this.editData.title.trim();
    const positionRow = Number(this.editData.position_row);
    const displayOrder = Number(this.editData.display_order);

    if (!title) {
      this.toast.warning('Inserisci un titolo corso');
      return;
    }

    if (!Number.isInteger(positionRow) || positionRow < 1) {
      this.toast.warning('Riga posizione non valida');
      return;
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 1 || displayOrder > this.maxCoursesPerRow) {
      this.toast.warning(`Ordine nella riga deve essere tra 1 e ${this.maxCoursesPerRow}`);
      return;
    }

    const courseId = Number(this.id());
    const canSave = await this.canPlaceCourseInRow(this.editData.category, positionRow, courseId);
    if (!canSave) {
      this.toast.error(`La riga ${positionRow} è piena: massimo ${this.maxCoursesPerRow} corsi`);
      return;
    }

    const payload = {
      ...this.editData,
      title,
      position_row: positionRow,
      display_order: displayOrder,
    };

    this.saving.set(true);
    this.courseService.updateCourse(courseId, payload).subscribe({
      next: () => {
        this.toast.success('Corso aggiornato con successo');
        this.saving.set(false);
        this.course.update((course) => course ? { ...course, ...payload } as AdminCourse : null);
      },
      error: (error) => {
        const message = error?.error?.message ?? 'Errore nell\'aggiornamento del corso';
        this.toast.error(message);
        this.saving.set(false);
      },
    });
  }

  private async canPlaceCourseInRow(category: 'DEV' | 'TECH', row: number, excludeId: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.courseService.getCourses({ page: 1, limit: 500 }));
      const targetCount = response.data.filter(course =>
        course.id !== excludeId &&
        (course.category ?? '').toString().toUpperCase() === category &&
        Number(course.position_row) === row
      ).length;
      return targetCount < this.maxCoursesPerRow;
    } catch {
      return false;
    }
  }

  toggleAddResource(): void {
    this.showAddResource = !this.showAddResource;
    this.newResource = { title: '', platform: 'Udemy', video_url: '', sort_order: this.resources().length + 1 };
  }

  addResource(): void {
    const courseId = Number(this.id());
    const payload = {
      title: this.newResource.title,
      platform: this.newResource.platform,
      video_url: this.newResource.video_url,
      sort_order: this.newResource.sort_order,
    };
    this.courseService.createResource(courseId, payload).subscribe({
      next: () => {
        this.toast.success('Risorsa aggiunta');
        this.showAddResource = false;
        this.loadResources();
      },
      error: () => this.toast.error('Errore nella creazione della risorsa'),
    });
  }

  startEditResource(resource: AdminResource): void {
    this.editingResourceId = resource.id;
    this.editResource = {
      title: resource.title,
      platform: resource.platform,
      video_url: resource.video_url,
      sort_order: resource.sort_order ?? 1,
    };
  }

  cancelEditResource(): void {
    this.editingResourceId = null;
  }

  saveResource(resourceId: number): void {
    const courseId = Number(this.id());
    this.courseService.updateResource(courseId, resourceId, this.editResource).subscribe({
      next: () => {
        this.toast.success('Risorsa aggiornata');
        this.editingResourceId = null;
        this.loadResources();
      },
      error: () => this.toast.error('Errore nell\'aggiornamento della risorsa'),
    });
  }

  async deleteResource(resource: AdminResource): Promise<void> {
    const confirmed = await this.confirm.confirm(
      'Elimina risorsa',
      `Vuoi eliminare la risorsa "${resource.title}"?`,
      { destructive: true, confirmLabel: 'Elimina' },
    );
    if (!confirmed) return;

    const courseId = Number(this.id());
    this.courseService.deleteResource(courseId, resource.id).subscribe({
      next: () => {
        this.toast.success('Risorsa eliminata');
        this.loadResources();
      },
      error: () => this.toast.error('Errore nell\'eliminazione della risorsa'),
    });
  }

  onResourceDrop(event: CdkDragDrop<AdminResource[]>): void {
    const items = [...this.resources()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.resources.set(items);

    const courseId = Number(this.id());
    const orderedIds = items.map((resource) => resource.id);
    this.courseService.reorderResources(courseId, orderedIds).subscribe({
      next: () => this.toast.success('Ordine risorse aggiornato'),
      error: () => this.toast.error('Errore nel riordinamento'),
    });
  }

  platformLabel(resource: AdminResource): string {
    const value = (resource.platform || '').trim();
    return value ? value : 'Altro';
  }

  platformClass(resource: AdminResource): string {
    const value = (resource.platform || '').trim().toLowerCase();
    if (value === 'udemy') return 'platform-badge platform-badge--udemy';
    if (value === 'youtube') return 'platform-badge platform-badge--youtube';
    return 'platform-badge platform-badge--other';
  }

  resourceHasChanges(original: AdminResource): boolean {
    return (
      (original.title ?? '') !== (this.editResource.title ?? '') ||
      (original.platform ?? '') !== (this.editResource.platform ?? '') ||
      (original.video_url ?? '') !== (this.editResource.video_url ?? '')
    );
  }

  formatTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, '<br>');
  }

  cleanTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
