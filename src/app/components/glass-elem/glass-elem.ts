import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailService } from '../../services/course-detail.service';

@Component({
  selector: 'app-glass-elem',
  imports: [CommonModule],
  templateUrl: './glass-elem.html',
  styleUrl: './glass-elem.scss',
})
export class GlassElem {
  @Input() text?: string;
  @Input() type: 'course' | 'link' = 'course';
  @Input() svgIcon?: string;
  @Input() alt?: string;

  constructor(private courseDetailService: CourseDetailService) {}

  get courseState(): 'completed' | 'in-progress' | undefined {
    if (!this.text) return undefined;
    const status = this.courseDetailService.getStatus(this.text);
    if (status === 'not-started') return undefined;
    return status;
  }

  @HostListener('click')
  onClick(): void {
    if (this.type === 'course' && this.text) {
      this.courseDetailService.open(this.text);
    }
  }

  getStatusIcon(): string | null {
    if (this.courseState === 'completed') {
      return '/images/statuses/completed.svg';
    }
    if (this.courseState === 'in-progress') {
      return '/images/statuses/in-progress.svg';
    }
    return null;
  }
}
