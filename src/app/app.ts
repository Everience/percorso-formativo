import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlassElem } from './components/glass-elem/glass-elem';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlassElem],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('percorso-formativo');
}
