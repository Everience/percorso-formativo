import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-elem',
  imports: [CommonModule],
  templateUrl: './glass-elem.html',
  styleUrl: './glass-elem.scss',
})
export class GlassElem {
  @Input() text?: string;
  @Input() courseState?: 'completed' | 'in-progress';
  @Input() svgIcon?: string;
  @Input() alt?: string;

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
