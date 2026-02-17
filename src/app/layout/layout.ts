import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseDetailService } from '../services/course-detail.service';
import { CourseDetails } from '../components/course-details/course-details';
import { ProfileMenu } from '../components/profile-menu/profile-menu';
import { UdemyAccessInstructions } from '../components/udemy-access-instructions/udemy-access-instructions';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CourseDetails, ProfileMenu, UdemyAccessInstructions],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  readonly courseDetailService = inject(CourseDetailService);
}
