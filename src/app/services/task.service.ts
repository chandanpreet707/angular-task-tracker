import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task, TaskStatus } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date()
    };
    this.tasks.push(newTask);
    this.tasksSubject.next([...this.tasks]);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.tasksSubject.next([...this.tasks]);
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.tasksSubject.next([...this.tasks]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}