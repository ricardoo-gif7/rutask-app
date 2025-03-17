import { Component, OnInit } from '@angular/core';
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
export class TasksListComponent implements OnInit {
  tasks: Tasks[] = [];
  type: 'house' | 'school' = 'house';

  constructor(private tasksService: TasksService, private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.tasks = this.tasksService.getTasksByType(this.type);
  }

  setType(type: 'house' | 'school'): void {
    this.type = type;
    this.loadTasks();
  }

  viewDetails(id: string): void {
    this.router.navigate([`/tasks-detail/${id}`]);
  }

  deleteTask(id: string): void {
    this.tasksService.deleteTask(id);
    this.loadTasks();
  }

  navigateToAddTask(): void {
    this.router.navigate(['/add-tasks']);
  }
}
