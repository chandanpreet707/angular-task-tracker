import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/task.service';
import { ApiService } from '../../services/api.service';
import { Task, TaskStatus, TaskCategory } from '../../models/task';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatChipsModule, MatIconModule, MatAutocompleteModule
  ],
  
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ isEditMode ? 'Edit Task' : 'Add New Task' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="taskForm.get('title')?.hasError('required') && taskForm.get('title')?.touched">Title is required.</mat-error>
            <mat-error *ngIf="taskForm.get('title')?.hasError('minlength') && taskForm.get('title')?.touched">Title must be at least 3 characters.</mat-error>
            <mat-error *ngIf="taskForm.get('title')?.hasError('maxlength') && taskForm.get('title')?.touched">Title cannot exceed 50 characters.</mat-error>  
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" maxlength="200"></textarea>
          <mat-error *ngIf="taskForm.get('description')?.hasError('maxlength') && taskForm.get('description')?.touched">Description cannot exceed 200 characters.</mat-error>
          </mat-form-field>
          <div class="char-counter" [ngClass]="getCharCounterClass()">
            {{ taskForm.get('description')?.value?.length || 0 }}/200 characters
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option *ngFor="let status of statusOptions" [value]="status.value">{{ status.label }}</mat-option>
            </mat-select>
            <mat-error *ngIf="taskForm.get('status')?.hasError('required') && taskForm.get('status')?.touched">Status is required.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let category of categoryOptions" [value]="category.value">{{ category.label }}</mat-option>
            </mat-select>
            <mat-error *ngIf="taskForm.get('category')?.hasError('required') && taskForm.get('category')?.touched">Category is required.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="taskForm.get('dueDate')?.hasError('pastDate') && taskForm.get('dueDate')?.touched">Due date cannot be in the past.</mat-error>
          </mat-form-field>

          <div class="tags-section">
          <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid>
          <mat-chip-row *ngFor="let tag of selectedTags" (removed)="removeTag(tag)">
            {{ tag }}
          <mat-icon matChipRemove>cancel</mat-icon>
          </mat-chip-row>
          </mat-chip-grid>
          <input placeholder="Add tag..." #tagInput 
           [matChipInputFor]="chipGrid"
           [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
           (matChipInputTokenEnd)="addTag($event)"
           [matAutocomplete]="auto">
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectTag($event.option.value); tagInput.value = ''">
          <mat-option *ngFor="let tag of availableTags" [value]="tag">{{ tag }}</mat-option>
          </mat-autocomplete>
          </mat-form-field>
          <div class="tag-errors">
          <small *ngIf="selectedTags.length >= 5" style="color: #f44336;">Cannot add more than 5 tags.</small>
          <small *ngIf="tagError" style="color: #f44336;">{{ tagError }}</small>
          </div>
          </div>
          <div *ngIf="apiError" class="api-error">
          <small style="color: #ff9800;">Unable to load predefined tags. You can still enter custom tags.</small>
          </div>
        </form>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="taskForm.invalid">
          {{ isEditMode ? 'Update' : 'Create' }} Task
        </button>
        <button mat-button (click)="onCancel()">Cancel</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    mat-card { max-width: 600px; margin: 0 auto; }
    .tags-section { margin-bottom: 16px; }
    .char-counter { 
      font-size: 12px; 
      margin-top: -12px; 
      margin-bottom: 16px; 
      text-align: right; 
      font-weight: 500;
      transition: color 0.3s ease;
    }
    .char-counter-normal { color: #666; }
    .char-counter-warning { color: #ff9800; }
    .char-counter-danger { color: #f44336; }
    
    mat-card-content {
      padding-top: 24px !important;
    }
    
    mat-card-content form .full-width:first-child {
      margin-top: 8px;
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  availableTags: string[] = [];
  selectedTags: string[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagError: string = '';
  apiError: boolean = false;

  statusOptions = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  categoryOptions = [
    { value: TaskCategory.WORK, label: 'Work' },
    { value: TaskCategory.PERSONAL, label: 'Personal' },
    { value: TaskCategory.URGENT, label: 'Urgent' },
    { value: TaskCategory.OTHER, label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      status: [TaskStatus.TODO, [Validators.required]],
      category: ['', [Validators.required]],
      dueDate: ['', [this.futureDateValidator]]
    });
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.taskId !== 'new' && this.taskId !== null;
  
    this.apiService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
        this.apiError = false;
      },
      error: () => {
        this.apiError = true;
        this.availableTags = [];
      }
    });
  
    if (this.isEditMode && this.taskId) {
      const task = this.taskService.getTaskById(this.taskId);
      if (task) {
        this.selectedTags = [...task.tags];
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          category: task.category,
          dueDate: task.dueDate
        });
      }
    }
  }

  futureDateValidator(control: any) {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      
      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, {
          ...formValue,
          tags: this.selectedTags
        });
      } else {
        this.taskService.addTask({
          ...formValue,
          tags: this.selectedTags,
          archived: false
        });
      }
      
      this.router.navigate(['/tasks']);
    }
  }

  onCancel() {
    this.router.navigate(['/tasks']);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.tagError = '';
    
    if (!value) return;
    
    if (this.selectedTags.length >= 5) {
      this.tagError = 'Cannot add more than 5 tags.';
    } else if (value.length < 2) {
      this.tagError = 'Each tag must be at least 2 characters.';
    } else if (value.length > 20) {
      this.tagError = 'Each tag cannot exceed 20 characters.';
    } else if (this.selectedTags.includes(value)) {
      this.tagError = 'Tag already exists.';
    } else {
      this.selectedTags.push(value);
    }
    
    event.chipInput!.clear();
  }
  
  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }
  
  selectTag(tag: string): void {
    if (this.selectedTags.length < 5 && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
    }
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

  getCharCounterClass(): string {
    const length = this.taskForm.get('description')?.value?.length || 0;
    if (length > 180) return 'char-counter-danger';
    if (length > 150) return 'char-counter-warning';
    return 'char-counter-normal';
  }
}