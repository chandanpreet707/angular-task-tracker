import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="stats-container">
      <mat-card class="stat-card total">
        <mat-card-content>
          <div class="stat-content">
            <mat-icon>task_alt</mat-icon>
            <div class="stat-text">
              <h3>{{ totalTasks$ | async }}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card pending">
        <mat-card-content>
          <div class="stat-content">
            <mat-icon>pending_actions</mat-icon>
            <div class="stat-text">
              <h3>{{ pendingTasks$ | async }}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card overdue">
        <mat-card-content>
          <div class="stat-content">
            <mat-icon>schedule</mat-icon>
            <div class="stat-text">
              <h3>{{ overdueTasks$ | async }}</h3>
              <p>Overdue Tasks</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="stat-card completion">
        <mat-card-content>
          <div class="stat-content">
            <mat-icon>trending_up</mat-icon>
            <div class="stat-text">
              <h3>{{ completionRate$ | async }}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <mat-card class="progress-card">
      <mat-card-header>
        <mat-card-title>Task Progress</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="progress-item">
          <span>To Do: {{ todoCount$ | async }}</span>
          <mat-progress-bar mode="determinate" [value]="todoPercentage$ | async" color="primary"></mat-progress-bar>
        </div>
        <div class="progress-item">
          <span>In Progress: {{ inProgressCount$ | async }}</span>
          <mat-progress-bar mode="determinate" [value]="inProgressPercentage$ | async" color="accent"></mat-progress-bar>
        </div>
        <div class="progress-item">
          <span>Done: {{ doneCount$ | async }}</span>
          <mat-progress-bar mode="determinate" [value]="donePercentage$ | async" color="warn"></mat-progress-bar>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      height: 100px;
    }
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .stat-text h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .stat-text p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .total { border-left: 4px solid #2196f3; }
    .pending { border-left: 4px solid #ff9800; }
    .overdue { border-left: 4px solid #f44336; }
    .completion { border-left: 4px solid #4caf50; }
    .progress-card {
      margin-top: 20px;
    }
    .progress-item {
      margin-bottom: 16px;
    }
    .progress-item span {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class TaskStatsComponent implements OnInit {
  totalTasks$: Observable<number> = new Observable();
  pendingTasks$: Observable<number> = new Observable();
  overdueTasks$: Observable<number> = new Observable();
  completionRate$: Observable<number> = new Observable();
  todoCount$: Observable<number> = new Observable();
  inProgressCount$: Observable<number> = new Observable();
  doneCount$: Observable<number> = new Observable();
  todoPercentage$: Observable<number> = new Observable();
  inProgressPercentage$: Observable<number> = new Observable();
  donePercentage$: Observable<number> = new Observable();

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    const tasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => !task.archived))
    );

    this.totalTasks$ = tasks$.pipe(
      map(tasks => tasks.length)
    );

    this.pendingTasks$ = tasks$.pipe(
      map(tasks => tasks.filter(task => task.status !== 'Done').length)
    );

    this.overdueTasks$ = tasks$.pipe(
      map(tasks => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today && task.status !== 'Done';
        }).length;
      })
    );

    this.completionRate$ = tasks$.pipe(
      map(tasks => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(task => task.status === 'Done').length;
        return Math.round((completed / tasks.length) * 100);
      })
    );

    this.todoCount$ = tasks$.pipe(
      map(tasks => tasks.filter(task => task.status === 'To Do').length)
    );

    this.inProgressCount$ = tasks$.pipe(
      map(tasks => tasks.filter(task => task.status === 'In Progress').length)
    );

    this.doneCount$ = tasks$.pipe(
      map(tasks => tasks.filter(task => task.status === 'Done').length)
    );

    this.todoPercentage$ = tasks$.pipe(
      map(tasks => {
        if (tasks.length === 0) return 0;
        return (tasks.filter(task => task.status === 'To Do').length / tasks.length) * 100;
      })
    );

    this.inProgressPercentage$ = tasks$.pipe(
      map(tasks => {
        if (tasks.length === 0) return 0;
        return (tasks.filter(task => task.status === 'In Progress').length / tasks.length) * 100;
      })
    );

    this.donePercentage$ = tasks$.pipe(
      map(tasks => {
        if (tasks.length === 0) return 0;
        return (tasks.filter(task => task.status === 'Done').length / tasks.length) * 100;
      })
    );
  }
}