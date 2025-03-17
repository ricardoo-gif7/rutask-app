import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TasksService } from '../../Services/tasks.service';
import { Tasks } from '../../models/tasks.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CameraService } from '../../Services/camera.service';

@Component({
  selector: 'app-add-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-tasks.component.html',
  styleUrls: ['./add-tasks.component.css']
})
export class AddTasksComponent {
  title: string = '';
  description: string = '';
  dueDate: string = '';
  photo?: string;
  type: 'house' | 'school' = 'house';
  subject?: string;

  constructor(
    private tasksService: TasksService, 
    private router: Router,
    private cameraService: CameraService
  ) {}

  takePhoto(): void {
    this.cameraService.takePicture().then(photoUrl => {
      this.photo = photoUrl;
    }).catch(err => console.error(err));
  }

  // Asigna un color pastel basado en la materia para deberes
  getColorForSubject(subject: string): string {
    const colors = ["#FFB3BA", "#BAE1FF", "#BAFFC9", "#FFFFBA", "#FFDFBA", "#BAFFC9", "#D5BAFF"];
    let sum = 0;
    for (let i = 0; i < subject.length; i++) {
      sum += subject.charCodeAt(i);
    }
    return colors[sum % colors.length];
  }

  saveTask(): void {
    if (this.title && this.description && this.dueDate) {
      const subjectColor = this.type === 'school' && this.subject ? this.getColorForSubject(this.subject) : undefined;
      const newTask: Tasks = {
        id: this.generateId(),
        title: this.title,
        description: this.description,
        completed: false,
        dueDate: this.dueDate,
        photo: this.photo,
        type: this.type,
        subject: this.type === 'school' ? this.subject : undefined,
        subjectColor: subjectColor,
        createdAt: new Date().toISOString()
      };
      this.tasksService.addTask(newTask);
      this.router.navigate(['/tasks-list']);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
