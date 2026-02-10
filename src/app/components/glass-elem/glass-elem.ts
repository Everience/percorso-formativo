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
  @Input() svgIcon?: string;
  @Input() svgSize: string = '24px';
  @Input() courseState?: 'completed' | 'in-progress';
}
