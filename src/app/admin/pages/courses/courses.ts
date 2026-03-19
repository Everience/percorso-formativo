import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { CdkDrag, CdkDropList, CdkDragDrop, CdkDragHandle, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AdminCourseService } from '../../services/admin-course.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';
import { AdminCourse, PaginatedResponse } from '../../../models/admin.model';

@Component({
  selector: 'app-admin-courses',
  imports: [RouterLink, FormsModule, CdkDrag, CdkDropList, CdkDragHandle, CdkDropListGroup],
  templateUrl: './courses.html',
  styleUrl: './courses.scss',
})
export class Courses implements OnInit, OnDestroy {
  private readonly maxCoursesPerRow = 4;
  private readonly courseService = inject(AdminCourseService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly searchSubject = new Subject<string>();

  readonly courses = signal<AdminCourse[]>([]);
  readonly loading = signal(true);
  readonly savingOrder = signal(false);
  readonly selectedTab = signal<'DEV' | 'TECH'>('DEV');
  readonly isDragging = signal(false);

  searchQuery = '';
  showCreateForm = false;
  newCourse = {
    title: '',
    description: '',
    category: 'DEV' as 'DEV' | 'TECH',
    position_row: 1,
    display_order: 1,
  };

  readonly devCourses = computed(() =>
    this.courses().filter(c => c.category === 'DEV')
  );

  readonly techCourses = computed(() =>
    this.courses().filter(c => c.category === 'TECH')
  );

  readonly devRows = computed(() => this.buildRows('DEV'));
  readonly techRows = computed(() => this.buildRows('TECH'));

  readonly activeRows = computed(() =>
    this.selectedTab() === 'DEV' ? this.devRows() : this.techRows()
  );

  // Used for rendering: includes a virtual new row (N+1) at the end.
  // Counts should use activeRowsCount() to avoid including it.
  readonly displayRows = computed(() => {
    const rows = this.activeRows();
    const maxRow = rows.length > 0 ? Math.max(...rows.map(r => r.row)) : 0;
    return [...rows, { row: maxRow + 1, courses: [] as AdminCourse[] }];
  });

  readonly activeRowsCount = computed(() =>
    this.activeRows().filter(r => r.courses.length > 0).length
  );

  readonly activeCourseCount = computed(() => {
    const list = this.selectedTab() === 'DEV' ? this.devCourses() : this.techCourses();
    return list.filter(c => !this.isCertification(c)).length;
  });

  readonly lastRow = computed(() => {
    const rows = this.activeRows().filter(r => r.courses.length > 0);
    return rows.length ? rows[rows.length - 1].row : null;
  });

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => this.loadCourses());
    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.courseService.getCourses({
      page: 1,
      limit: 500,
      q: this.searchQuery || undefined,
      sort: 'position_row',
    }).subscribe({
      next: (res: PaginatedResponse<AdminCourse>) => {
        const normalized = res.data.map(course => ({
          ...course,
          category: (course.category ?? '').toString().toUpperCase() as 'DEV' | 'TECH',
        }));
        normalized.sort((a, b) =>
          a.position_row - b.position_row || a.display_order - b.display_order
        );
        this.courses.set(normalized);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Errore nel caricamento dei corsi');
        this.loading.set(false);
      },
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  switchTab(tab: 'DEV' | 'TECH'): void {
    this.selectedTab.set(tab);
  }

  isCertification(course: AdminCourse): boolean {
    return !course.description || course.description.trim() === '';
  }

  formatTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, '<br>');
  }

  cleanTitle(title: string): string {
    return (title || '').replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      const rows = this.activeRows();
      const maxRow = rows.length > 0 ? Math.max(...rows.map(r => r.row)) : 0;
      this.newCourse = {
        title: '',
        description: '',
        category: this.selectedTab(),
        position_row: maxRow + 1,
        display_order: 1,
      };
    }
  }

  private toPositiveInt(value: number, fallback = 1): number {
    if (!Number.isFinite(value)) return fallback;
    const next = Math.trunc(value);
    return next > 0 ? next : fallback;
  }

  private getRowCourseCount(category: 'DEV' | 'TECH', row: number, excludeCourseId?: number): number {
    const safeRow = this.toPositiveInt(row, 1);
    return this.courses().filter(course =>
      course.category === category &&
      course.position_row === safeRow &&
      (excludeCourseId === undefined || course.id !== excludeCourseId)
    ).length;
  }

  newCourseRowCount(): number {
    return this.getRowCourseCount(this.newCourse.category, this.newCourse.position_row);
  }

  rowIsAtCapacity(category: 'DEV' | 'TECH', row: number, excludeCourseId?: number): boolean {
    return this.getRowCourseCount(category, row, excludeCourseId) >= this.maxCoursesPerRow;
  }

  canCreateCourse(): boolean {
    if (!this.newCourse.title.trim()) return false;
    const row = this.toPositiveInt(this.newCourse.position_row, 1);
    const order = this.toPositiveInt(this.newCourse.display_order, 1);
    if (order > this.maxCoursesPerRow) return false;
    return !this.rowIsAtCapacity(this.newCourse.category, row);
  }

  createCourse(): void {
    const title = this.newCourse.title.trim();
    const category = this.newCourse.category;
    const row = this.toPositiveInt(this.newCourse.position_row, 1);
    const requestedOrder = this.toPositiveInt(this.newCourse.display_order, 1);
    const existingInRow = this.getRowCourseCount(category, row);

    if (!title) {
      this.toast.warning('Inserisci un titolo corso');
      return;
    }

    if (requestedOrder > this.maxCoursesPerRow) {
      this.toast.warning(`Ordine nella riga deve essere tra 1 e ${this.maxCoursesPerRow}`);
      return;
    }

    if (existingInRow >= this.maxCoursesPerRow) {
      this.toast.error(`La riga ${row} è piena: massimo ${this.maxCoursesPerRow} corsi`);
      return;
    }

    const displayOrder = Math.min(requestedOrder, existingInRow + 1, this.maxCoursesPerRow);
    const payload = {
      ...this.newCourse,
      title,
      position_row: row,
      display_order: displayOrder,
      description: this.newCourse.description ?? '',
    };

    this.courseService.createCourse(payload).subscribe({
      next: () => {
        this.toast.success('Corso creato con successo');
        this.showCreateForm = false;
        this.loadCourses();
      },
      error: (error) => {
        const message = error?.error?.message ?? 'Errore nella creazione del corso';
        this.toast.error(message);
      },
    });
  }

  async deleteCourse(event: Event, course: AdminCourse): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const confirmed = await this.confirm.confirm(
      'Elimina corso',
      `Sei sicuro di voler eliminare "${this.cleanTitle(course.title)}"? Questa azione è irreversibile.`,
      { destructive: true, confirmLabel: 'Elimina' },
    );
    if (!confirmed) return;

    this.courseService.deleteCourse(course.id).subscribe({
      next: () => {
        this.toast.success('Corso eliminato');
        this.loadCourses();
      },
      error: () => this.toast.error('Errore nell\'eliminazione del corso'),
    });
  }

  onDragStarted(): void {
    this.isDragging.set(true);
  }

  onDragEnded(): void {
    this.isDragging.set(false);
  }

  isNewRow(rowGroup: { row: number; courses: AdminCourse[] }): boolean {
    return rowGroup.courses.length === 0;
  }

  async onDrop(targetRow: number, event: CdkDragDrop<AdminCourse[]>): Promise<void> {
    this.isDragging.set(false);
    const sameContainer = event.previousContainer === event.container;
    if (sameContainer && event.previousIndex === event.currentIndex) return;

    if (!sameContainer && event.container.data.length >= this.maxCoursesPerRow) {
      this.toast.warning(`Ogni riga può contenere al massimo ${this.maxCoursesPerRow} corsi`);
      return;
    }

    if (sameContainer) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    // Build the updated row map from all current rows
    const allRows = this.selectedTab() === 'DEV' ? this.devRows() : this.techRows();

    // Collect all rows including the new-row target
    const rowMap = new Map<number, AdminCourse[]>();
    for (const r of allRows) {
      if (r.courses.length > 0) rowMap.set(r.row, r.courses);
    }
    // Include the target container data (it may be the new empty row)
    if (event.container.data.length > 0) {
      rowMap.set(targetRow, event.container.data);
    }

    // Renumber rows consecutively (1, 2, 3, ...) removing gaps from empty rows
    const sortedRows = [...rowMap.entries()]
      .filter(([, courses]) => courses.length > 0)
      .sort((a, b) => a[0] - b[0]);

    const updates: Array<{ id: number; payload: Partial<AdminCourse> }> = [];
    sortedRows.forEach(([, courses], rowIndex) => {
      const newRow = rowIndex + 1;
      courses.forEach((course, i) => {
        updates.push({ id: course.id, payload: { position_row: newRow, display_order: i + 1 } });
      });
    });

    this.savingOrder.set(true);
    try {
      await Promise.all(updates.map(u =>
        firstValueFrom(this.courseService.updateCourse(u.id, u.payload))
      ));
      this.toast.success('Ordine aggiornato');
      this.loadCourses();
    } catch (error: unknown) {
      const message = (error as { error?: { message?: string } })?.error?.message ?? 'Errore nel riordinamento';
      this.toast.error(message);
      this.loadCourses();
    }
    this.savingOrder.set(false);
  }

  private buildRows(category: 'DEV' | 'TECH'): Array<{ row: number; courses: AdminCourse[] }> {
    const rows = new Map<number, AdminCourse[]>();
    for (const course of this.courses()) {
      if (course.category !== category) continue;
      if (!rows.has(course.position_row)) rows.set(course.position_row, []);
      rows.get(course.position_row)?.push(course);
    }
    return [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([row, list]) => ({
        row,
        courses: [...list].sort((a, b) => a.display_order - b.display_order),
      }));
  }
}
