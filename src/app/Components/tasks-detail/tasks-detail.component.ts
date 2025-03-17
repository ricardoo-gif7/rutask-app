import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../Services/tasks.service';
import { Tasks } from '../../models/tasks.model';
import { CameraService } from '../../Services/camera.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tasks-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks-detail.component.html',
  styleUrls: ['./tasks-detail.component.css']
})
export class TasksDetailComponent implements OnInit, OnDestroy {
  task: Tasks | undefined;
  showModal: boolean = false;
  isEditing: boolean = false; // Para activar el modo edición
  private timerId: any;

  constructor(
    private route: ActivatedRoute, 
    private tasksService: TasksService, 
    private router: Router,
    private cameraService: CameraService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.task = this.tasksService.getTaskById(id);
      this.checkDueDate();
      this.timerId = setInterval(() => this.checkDueDate(), 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  checkDueDate(): void {
    if (this.task && !this.task.completed && this.task.dueDate) {
      const now = new Date();
      const due = new Date(this.task.dueDate);
      this.showModal = now >= due;
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks-list']);
  }

  toggleStatus(): void {
    if (this.task) {
      this.tasksService.toggleTaskStatus(this.task.id);
      this.task = this.tasksService.getTaskById(this.task.id);
      if (this.task?.completed) {
        this.showModal = false;
      }
    }
  }

  dismissModal(): void {
    this.toggleStatus();
  }

  addPhoto(): void {
    this.cameraService.takePicture().then(photoUrl => {
      if (this.task) {
        this.task.photo = photoUrl;
        this.tasksService.updateTask(this.task);
      }
    }).catch(err => console.error(err));
  }

  deleteTask(): void {
    if (this.task) {
      this.tasksService.deleteTask(this.task.id);
      this.goBack();
    }
  }

  editTask(): void {
    this.isEditing = true;
  }

  saveTaskEdit(): void {
    if (this.task) {
      this.tasksService.updateTask(this.task);
      this.isEditing = false;
    }
  }
}
