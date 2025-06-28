import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Task Tracker</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/tasks" routerLinkActive="active">Tasks</button>
      <button mat-button routerLink="/archive" routerLinkActive="active">Archive</button>
    </mat-toolbar>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .active { background-color: rgba(255,255,255,0.2); }
  `]
})
export class NavigationComponent {}