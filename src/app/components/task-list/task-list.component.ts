import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { Observable, map } from 'rxjs';
import { DueDateFormatPipe } from '../../pipes/due-date-format.pipe';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { TaskStatsComponent } from '../task-stats/task-stats.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule, 
    MatChipsModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatSelectModule, DueDateFormatPipe, TruncatePipe, TaskStatsComponent
  ],
  template: `
    <div class="header">
      <h1>Tasks</h1>
      <button mat-raised-button color="primary" routerLink="/task/new">Add Task</button>
    </div>

    <app-task-stats></app-task-stats>

    <div class="filters-section">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search tasks...</mat-label>
        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange()" placeholder="Search by title or description">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Status</mat-label>
        <mat-select [(value)]="filterStatus" (selectionChange)="onFilterChange()">
          <mat-option value="all">All Statuses</mat-option>
          <mat-option value="To Do">To Do</mat-option>
          <mat-option value="In Progress">In Progress</mat-option>
          <mat-option value="Done">Done</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by Category</mat-label>
        <mat-select [(value)]="filterCategory" (selectionChange)="onFilterChange()">
          <mat-option value="all">All Categories</mat-option>
          <mat-option value="Work">Work</mat-option>
          <mat-option value="Personal">Personal</mat-option>
          <mat-option value="Urgent">Urgent</mat-option>
          <mat-option value="Other">Other</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    
    <div class="task-grid" *ngIf="(filteredTasks$ | async)?.length; else noTasks">
      <mat-card *ngFor="let task of filteredTasks$ | async" class="task-card">
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

    <ng-template #noTasks>
      <div class="no-tasks">
        <p>No tasks found matching your criteria.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .filters-section { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 20px; 
      margin-top: 30px; 
      flex-wrap: wrap; 
    }
    .search-field { flex: 1; min-width: 200px; }
    .filter-field { min-width: 150px; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .task-card { width: 100%; }
    .no-tasks { text-align: center; padding: 40px; color: #666; }
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-todo { background-color: #e3f2fd; color: #1976d2; }
    .status-progress { background-color: #fff3e0; color: #f57c00; }
    .status-done { background-color: #e8f5e8; color: #388e3c; }
    .category-chip { padding: 2px 6px; border-radius: 8px; font-size: 11px; }
    .category-work { background-color: #f3e5f5; color: #7b1fa2; }
    .category-personal { background-color: #e0f2f1; color: #00695c; }
    .category-urgent { background-color: #ffebee; color: #c62828; }
    .category-other { background-color: #f5f5f5; color: #616161; }
  
    app-task-stats {
      display: block;
      margin-bottom: 30px;
    }
    .task-card {
  width: 100%;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
  `]
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]> = new Observable();
  filteredTasks$: Observable<Task[]> = new Observable();
  searchTerm: string = '';
  filterStatus: string = 'all';
  filterCategory: string = 'all';

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => !task.archived))
    );
    
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTasks$ = this.tasks$.pipe(
      map(tasks => {
        return tasks.filter(task => {
          const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                              (task.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
          const matchesStatus = this.filterStatus === 'all' || task.status === this.filterStatus;
          const matchesCategory = this.filterCategory === 'all' || task.category === this.filterCategory;
          
          return matchesSearch && matchesStatus && matchesCategory;
        });
      })
    );
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
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