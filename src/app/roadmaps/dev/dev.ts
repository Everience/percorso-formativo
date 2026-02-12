import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlassElem } from '../../components/glass-elem/glass-elem';

@Component({
  selector: 'app-dev',
  imports: [GlassElem],
  templateUrl: './dev.html',
  styleUrl: '../roadmap.scss',
})
export class Dev {
  constructor(private router: Router) {}

  goToTech(): void {
    this.router.navigate(['/tech']);
  }
}
