import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task';
import { Observable, map } from 'rxjs';
import { DueDateFormatPipe } from '../../pipes/due-date-format.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { OverdueHighlightDirective } from '../../directives/overdue-highlight.directive';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatChipsModule,
    DueDateFormatPipe, TruncatePipe, OverdueHighlightDirective
  ],
  template: `
    <div class="header">
      <h1>Archived Tasks</h1>
    </div>
    
    <div class="task-grid" *ngIf="(archivedTasks$ | async)?.length; else noTasks">
      <mat-card *ngFor="let task of archivedTasks$ | async" class="task-card" [appOverdueHighlight]="task.dueDate">
        <mat-card-header>
          <mat-card-title>{{ task.title }}</mat-card-title>
          <mat-card-subtitle>{{ task.status }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>{{ task.description | truncate:50 }}</p>
          <p><strong>Category:</strong> {{ task.category }}</p>
          <p><strong>Due:</strong> {{ task.dueDate | dueDateFormat }}</p>
          <mat-chip-set *ngIf="task.tags.length > 0">
            <mat-chip *ngFor="let tag of task.tags">{{ tag }}</mat-chip>
          </mat-chip-set>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="restoreTask(task.id)">Restore</button>
          <button mat-button color="warn" (click)="deleteTask(task.id)">Delete</button>
        </mat-card-actions>
      </mat-card>
    </div>

    <ng-template #noTasks>
      <div class="no-tasks">
        <p>No archived tasks found.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .header { margin-bottom: 20px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .task-card { width: 100%; }
    .no-tasks { text-align: center; padding: 40px; color: #666; }
  `]
})
export class ArchiveComponent implements OnInit {
  archivedTasks$: Observable<Task[]> = new Observable();

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.archivedTasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => task.archived))
    );
  }

  restoreTask(id: string) {
    const task = this.taskService.getTaskById(id);
    if (task) {
      this.taskService.updateTask(id, {
        archived: false
      });
    }
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'To Do': return 'status-todo';
      case 'In Progress': return 'status-progress';
      case 'Done': return 'status-done';
      default: return '';
    }
  }
  
  getCategoryClass(category: string): string {
    switch(category) {
      case 'Work': return 'category-work';
      case 'Personal': return 'category-personal';
      case 'Urgent': return 'category-urgent';
      case 'Other': return 'category-other';
      default: return '';
    }
  }
}