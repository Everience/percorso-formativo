import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlassElem } from '../../components/glass-elem/glass-elem';

@Component({
  selector: 'app-tech',
  imports: [GlassElem],
  templateUrl: './tech.html',
  styleUrl: '../roadmap.scss',
})
export class Tech {
  constructor(private router: Router) {}

  goToDev(): void {
    this.router.navigate(['/dev']);
  }
}
