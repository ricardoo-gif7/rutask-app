import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TasksService } from '../../Services/tasks.service';
import { NotificationService } from '../../Services/notifications.service';
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
export class AddTasksComponent implements OnInit {
  // Campos básicos
  title: string = '';
  description: string = '';
  dueDate: string = '';
  dueTime: string = '';
  photo?: string;
  type: 'house' | 'school' = 'house';
  subject?: string;

  // Campos para tareas diarias
  isDaily: boolean = false;
  notificationEnabled: boolean = false;
  notificationTime: string = '';
  notificationPermission: boolean = false;

  // Control de errores
  titleError: string = '';
  dueDateError: string = '';
  dueTimeError: string = '';
  subjectError: string = '';
  notificationTimeError: string = '';
  generalError: string = '';

  // Estado del componente
  isSaving: boolean = false;

  constructor(
    private tasksService: TasksService,
    private notificationService: NotificationService,
    private router: Router,
    private cameraService: CameraService
  ) {}

  ngOnInit(): void {
    this.checkNotificationPermission();
    this.setDefaultDueDate();
  }

  /**
   * Verifica los permisos de notificación
   */
  private checkNotificationPermission(): void {
    this.notificationPermission = this.notificationService.areNotificationsSupported() &&
      this.notificationService.getNotificationPermission() === 'granted';
  }

  /**
   * Establece la fecha por defecto (mañana)
   */
  private setDefaultDueDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dueDate = tomorrow.toISOString().split('T')[0];
  }

  /**
   * Maneja el cambio en el checkbox de tarea diaria
   */
  onDailyChange(): void {
    if (this.isDaily) {
      this.dueDate = '';
      this.dueTime = '';
      this.dueDateError = '';
      this.dueTimeError = '';
    } else {
      this.setDefaultDueDate();
    }
  }

  /**
   * Maneja el cambio en el checkbox de notificaciones
   */
  onNotificationToggle(): void {
    if (this.notificationEnabled && !this.notificationPermission) {
      // Solicitar permisos si no están otorgados
      this.requestNotificationPermission();
    }
    
    if (!this.notificationEnabled) {
      this.notificationTime = '';
      this.notificationTimeError = '';
    }
  }

  /**
   * Solicita permisos de notificación
   */
  private async requestNotificationPermission(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission === 'granted';
      
      if (!this.notificationPermission) {
        this.notificationEnabled = false;
      }
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      this.notificationEnabled = false;
    }
  }

  /**
   * Validaciones individuales
   */
  validateTitle(): void {
    this.titleError = '';
    if (!this.title.trim()) {
      this.titleError = 'El título es requerido';
    } else if (this.title.trim().length < 3) {
      this.titleError = 'El título debe tener al menos 3 caracteres';
    }
  }

  validateSubject(): void {
    this.subjectError = '';
    if (this.type === 'school') {
      if (!this.subject?.trim()) {
        this.subjectError = 'La materia es requerida para deberes escolares';
      } else if (this.subject.trim().length < 2) {
        this.subjectError = 'La materia debe tener al menos 2 caracteres';
      }
    }
  }

  validateDueDate(): void {
    this.dueDateError = '';
    if (!this.isDaily && !this.dueDate) {
      this.dueDateError = 'La fecha límite es requerida';
    } else if (!this.isDaily && this.dueDate) {
      const selectedDate = new Date(this.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.dueDateError = 'La fecha límite no puede ser anterior a hoy';
      }
    }
  }

  validateDueTime(): void {
    this.dueTimeError = '';
    if (this.dueTime && !this.notificationService.isValidTime(this.dueTime)) {
      this.dueTimeError = 'Formato de hora inválido';
    }
  }

  validateNotificationTime(): void {
    this.notificationTimeError = '';
    if (this.notificationEnabled) {
      if (!this.notificationTime) {
        this.notificationTimeError = 'La hora de notificación es requerida';
      } else if (!this.notificationService.isValidTime(this.notificationTime)) {
        this.notificationTimeError = 'Formato de hora inválido';
      }
    }
  }

  /**
   * Validación completa del formulario
   */
  private validateForm(): boolean {
    this.validateTitle();
    this.validateSubject();
    this.validateDueDate();
    this.validateDueTime();
    this.validateNotificationTime();

    // Verificar si hay errores
    const hasErrors = !!(
      this.titleError ||
      this.subjectError ||
      this.dueDateError ||
      this.dueTimeError ||
      this.notificationTimeError
    );

    if (hasErrors) {
      this.generalError = 'Por favor, corrige los errores en el formulario';
      return false;
    }

    this.generalError = '';
    return true;
  }

  /**
   * Toma una foto usando el servicio de cámara
   */
  takePhoto(): void {
    this.cameraService.takePicture().then(photoUrl => {
      this.photo = photoUrl;
    }).catch(err => {
      console.error('Error al tomar la foto:', err);
      this.generalError = 'Error al tomar la foto. Inténtalo de nuevo.';
    });
  }

  /**
   * Asigna un color pastel basado en la materia para deberes
   */
  private getColorForSubject(subject: string): string {
    const colors = ["#FFB3BA", "#BAE1FF", "#BAFFC9", "#FFFFBA", "#FFDFBA", "#BAFFC9", "#D5BAFF"];
    let sum = 0;
    for (let i = 0; i < subject.length; i++) {
      sum += subject.charCodeAt(i);
    }
    return colors[sum % colors.length];
  }

  /**
   * Genera un ID único para la tarea
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * Guarda la tarea después de validar
   */
  saveTask(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;
    this.generalError = '';

    try {
      const subjectColor = this.type === 'school' && this.subject ? 
        this.getColorForSubject(this.subject) : undefined;

      // Combinar fecha y hora para tareas no diarias
      let combinedDateTime = '';
      if (!this.isDaily) {
        combinedDateTime = this.dueDate;
        if (this.dueTime) {
          combinedDateTime += `T${this.dueTime}`;
        }
      }

      const newTask: Tasks = {
        id: this.generateId(),
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        completed: false,
        dueDate: combinedDateTime,
        dueTime: this.dueTime || undefined,
        photo: this.photo,
        type: this.type,
        subject: this.type === 'school' ? this.subject?.trim() : undefined,
        subjectColor: subjectColor,
        createdAt: new Date().toISOString(),
        
        // Campos para tareas diarias
        isDaily: this.isDaily,
        notificationTime: this.notificationEnabled ? this.notificationTime : undefined,
        notificationEnabled: this.notificationEnabled,
        lastCompleted: undefined
      };

      // Guardar la tarea
      this.tasksService.addTask(newTask);

      // Programar notificación si está habilitada
      if (this.notificationEnabled && this.notificationTime) {
        this.notificationService.scheduleNotification(newTask);
      }
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      this.generalError = 'Error al guardar la tarea. Inténtalo de nuevo.';
    } finally {
      this.isSaving = false;
    }
    this.router.navigate(['/tasks-list']);
  }
}