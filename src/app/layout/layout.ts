import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseDetailService } from '../services/course-detail.service';
import { CourseDetails } from '../components/course-details/course-details';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CourseDetails],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  readonly courseDetailService = inject(CourseDetailService);
}
