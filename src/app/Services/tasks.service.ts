import { Injectable } from '@angular/core';
import { Tasks } from '../models/tasks.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private tasks: Tasks[] = [];
  private readonly STORAGE_KEY = 'app_tasks';

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    const storedTasks = localStorage.getItem(this.STORAGE_KEY);
    if (storedTasks) {
      this.tasks = JSON.parse(storedTasks);
    }
  }

  private saveTasks(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
  }

  getTasks(): Tasks[] {
    return this.tasks;
  }

  getTasksByType(type: 'house' | 'school'): Tasks[] {
    return this.tasks.filter(task => task.type === type);
  }

  getTaskById(id: string): Tasks | undefined {
    return this.tasks.find(task => task.id === id);
  }

  addTask(task: Tasks): void {
    this.tasks.push(task);
    this.saveTasks();
  }

  updateTask(updatedTask: Tasks): void {
    const index = this.tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.saveTasks();
    }
  }

  deleteTask(id: string): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveTasks();
  }

  toggleTaskStatus(id: string): void {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      this.tasks[index].completed = !this.tasks[index].completed;
      this.saveTasks();
    }
  }

  getOverdueTasks(): Tasks[] {
    const now = new Date();
    return this.tasks.filter(task => {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate <= now;
    });
  }
}