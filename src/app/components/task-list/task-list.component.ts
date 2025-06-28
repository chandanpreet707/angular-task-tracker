import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { Observable, map } from 'rxjs';
import { DueDateFormatPipe } from '../../pipes/due-date-format.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, DueDateFormatPipe, TruncatePipe],
  template: `
    <div class="header">
      <h1>Tasks</h1>
      <button mat-raised-button color="primary" routerLink="/task/new">Add Task</button>
    </div>
    
    <div class="task-grid">
      <mat-card *ngFor="let task of tasks$ | async" class="task-card">
      <mat-card-header>
  <mat-card-title>{{ task.title }}</mat-card-title>
  <mat-card-subtitle>
    <span class="status-badge" [ngClass]="getStatusClass(task.status)">{{ task.status }}</span>
    </mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>{{ task.description | truncate:50 }}</p>
    <p><strong>Category:</strong> 
    <span class="category-chip" [ngClass]="getCategoryClass(task.category)">{{ task.category }}</span>
    </p>
    <p><strong>Due:</strong> {{ task.dueDate | dueDateFormat }}</p>
    <mat-chip-set *ngIf="task.tags.length > 0">
    <mat-chip *ngFor="let tag of task.tags">{{ tag }}</mat-chip>
  </mat-chip-set>
</mat-card-content>
        <mat-card-actions>
        <button mat-button [routerLink]="['/task', task.id]">Edit</button>
        <button mat-button color="primary" *ngIf="task.status === 'Done' && !task.archived" (click)="archiveTask(task.id)">Archive</button>
        <button mat-button color="warn" (click)="deleteTask(task.id)">Delete</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .task-card { width: 100%; }
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-todo { background-color: #e3f2fd; color: #1976d2; }
    .status-progress { background-color: #fff3e0; color: #f57c00; }
    .status-done { background-color: #e8f5e8; color: #388e3c; }
    .category-chip { padding: 2px 6px; border-radius: 8px; font-size: 11px; }
    .category-work { background-color: #f3e5f5; color: #7b1fa2; }
    .category-personal { background-color: #e0f2f1; color: #00695c; }
    .category-urgent { background-color: #ffebee; color: #c62828; }
    .category-other { background-color: #f5f5f5; color: #616161; }
  `]
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]> = new Observable();

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => !task.archived))
    );
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }
  archiveTask(id: string) {
    this.taskService.updateTask(id, { archived: true });
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