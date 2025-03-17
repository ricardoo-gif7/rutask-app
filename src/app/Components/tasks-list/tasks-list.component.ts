import { Component, OnInit, OnDestroy } from '@angular/core';
import { TasksService } from '../../Services/tasks.service';
import { Tasks } from '../../models/tasks.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent implements OnInit, OnDestroy {
  tasks: Tasks[] = [];
  filteredTasks: Tasks[] = [];
  overdueTasks: Tasks[] = [];
  type: 'house' | 'school' = 'house';
  statusFilter: 'all' | 'completed' | 'pending' = 'all';
  private timerId: any;

  constructor(private tasksService: TasksService, private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
    this.checkOverdueTasks();
    
    // Verificar cada minuto si hay tareas vencidas
    this.timerId = setInterval(() => this.checkOverdueTasks(), 60000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  loadTasks(): void {
    this.tasks = this.tasksService.getTasksByType(this.type);
    this.applyFilters();
  }

  applyFilters(): void {
    // Aplicar filtro por estado
    if (this.statusFilter === 'all') {
      this.filteredTasks = [...this.tasks];
    } else if (this.statusFilter === 'completed') {
      this.filteredTasks = this.tasks.filter(task => task.completed);
    } else {
      this.filteredTasks = this.tasks.filter(task => !task.completed);
    }
  }

  setType(type: 'house' | 'school'): void {
    this.type = type;
    this.loadTasks();
  }

  setStatusFilter(filter: 'all' | 'completed' | 'pending'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  checkOverdueTasks(): void {
    // Obtener todas las tareas vencidas, sin importar el tipo
    this.overdueTasks = this.tasksService.getOverdueTasks();
  }

  viewDetails(id: string): void {
    this.router.navigate([`/tasks-detail/${id}`]);
  }

  deleteTask(id: string): void {
    this.tasksService.deleteTask(id);
    this.loadTasks();
    this.checkOverdueTasks();
  }

  toggleTaskStatus(id: string): void {
    this.tasksService.toggleTaskStatus(id);
    this.loadTasks();
    this.checkOverdueTasks();
  }

  navigateToAddTask(): void {
    this.router.navigate(['/add-tasks']);
  }
}