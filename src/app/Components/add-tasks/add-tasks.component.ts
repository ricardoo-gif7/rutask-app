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
  styleUrls: ['./add-tasks.component.css'],
})
export class AddTasksComponent implements OnInit {
  /* ------------------------------ CAMPOS BÁSICOS ------------------------------ */
  title = '';
  description = '';
  dueDate = '';
  dueTime = '';
  photo?: string;
  type: 'house' | 'school' = 'house';
  subject?: string;

  /* --------------------------- TAREAS DIARIAS & NOTIF -------------------------- */
  isDaily = false;
  notificationEnabled = false;
  notificationTime = '';
  notificationPermission = false;

  /* --------------------------------- ERRORES ---------------------------------- */
  titleError = '';
  dueDateError = '';
  dueTimeError = '';
  subjectError = '';
  notificationTimeError = '';
  generalError = '';

  /* ----------------------------- ESTADO COMPONENTE ---------------------------- */
  isSaving = false;

  constructor(
    private tasksService: TasksService,
    private notificationService: NotificationService,
    private router: Router,
    private cameraService: CameraService
  ) {}

  /* --------------------------------------------------------------------------- */
  /*                                   CICLO                                    */
  /* --------------------------------------------------------------------------- */
  ngOnInit(): void {
    this.checkNotificationPermission();
    this.setDefaultDueDate();
  }

  /* --------------------------------------------------------------------------- */
  /*                        PERMISOS DE NOTIFICACIONES                           */
  /* --------------------------------------------------------------------------- */
  private checkNotificationPermission(): void {
    if (this.notificationService.areNotificationsSupported()) {
      this.notificationPermission =
        this.notificationService.getNotificationPermission() === 'granted';
    } else {
      this.notificationPermission = false;
    }
  }

  /* ----------------------------- FECHA POR DEFECTO ---------------------------- */
  private setDefaultDueDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dueDate = tomorrow.toISOString().split('T')[0];
  }

  /* --------------------------------------------------------------------------- */
  /*                           BOTONES‑SWITCH HANDLERS                           */
  /* --------------------------------------------------------------------------- */
  toggleDaily(): void {
    this.isDaily = !this.isDaily;
    this.onDailyChange();
  }

  toggleNotification(): void {
    this.notificationEnabled = !this.notificationEnabled;
    this.onNotificationToggle();
  }

  /* ----------------------- LÓGICA DE CAMBIO DIARIO ---------------------------- */
  onDailyChange(): void {
    if (this.isDaily) {
      // Limpiar campos de fecha/hora
      this.dueDate = '';
      this.dueTime = '';
      this.clearDateErrors();
    } else {
      this.setDefaultDueDate();
    }
  }

  private clearDateErrors(): void {
    this.dueDateError = '';
    this.dueTimeError = '';
  }

  /* --------------------- LÓGICA DE CAMBIO NOTIFICACIONES ---------------------- */
  onNotificationToggle(): void {
    if (this.notificationEnabled && !this.notificationPermission) {
      this.requestNotificationPermission();
    }
    if (!this.notificationEnabled) {
      this.notificationTime = '';
      this.notificationTimeError = '';
    }
  }

  private async requestNotificationPermission(): Promise<void> {
    try {
      if (!this.notificationService.areNotificationsSupported()) {
        this.notificationEnabled = false;
        this.generalError =
          'Las notificaciones no están soportadas en este navegador';
        return;
      }

      const permission = await Notification.requestPermission();
      this.notificationPermission = permission === 'granted';

      if (!this.notificationPermission) {
        this.notificationEnabled = false;
        this.generalError =
          'Es necesario otorgar permisos de notificación para recibir recordatorios';
      }
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      this.notificationEnabled = false;
      this.generalError = 'Error al solicitar permisos de notificación';
    }
  }

  /* --------------------------------------------------------------------------- */
  /*                              VALIDACIONES UI                                */
  /* --------------------------------------------------------------------------- */
  validateTitle(): void {
    this.titleError = '';
    if (!this.title.trim()) {
      this.titleError = 'El título es requerido';
    } else if (this.title.trim().length < 3) {
      this.titleError = 'El título debe tener al menos 3 caracteres';
    } else if (this.title.trim().length > 100) {
      this.titleError = 'El título no puede exceder 100 caracteres';
    }
  }

  validateSubject(): void {
    this.subjectError = '';
    if (this.type === 'school') {
      if (!this.subject?.trim()) {
        this.subjectError = 'La materia es requerida para deberes escolares';
      } else if (this.subject.trim().length < 2) {
        this.subjectError = 'La materia debe tener al menos 2 caracteres';
      } else if (this.subject.trim().length > 50) {
        this.subjectError = 'La materia no puede exceder 50 caracteres';
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

      if (isNaN(selectedDate.getTime())) {
        this.dueDateError = 'Formato de fecha inválido';
      } else if (selectedDate < today) {
        this.dueDateError = 'La fecha límite no puede ser anterior a hoy';
      }
    }
  }

  validateDueTime(): void {
    this.dueTimeError = '';
    if (this.dueTime && !this.isValidTimeFormat(this.dueTime)) {
      this.dueTimeError = 'Formato de hora inválido (use HH:MM)';
    }

    if (!this.isDaily && this.dueDate && this.dueTime) {
      const selectedDate = new Date(this.dueDate);
      const today = new Date();

      if (this.isSameDay(selectedDate, today)) {
        const [hours, minutes] = this.dueTime.split(':').map(Number);
        const selectedDateTime = new Date();
        selectedDateTime.setHours(hours, minutes, 0, 0);

        if (selectedDateTime <= new Date()) {
          this.dueTimeError = 'La hora límite no puede ser en el pasado';
        }
      }
    }
  }

  validateNotificationTime(): void {
    this.notificationTimeError = '';
    if (this.notificationEnabled) {
      if (!this.notificationTime) {
        this.notificationTimeError = 'La hora de notificación es requerida';
      } else if (!this.isValidTimeFormat(this.notificationTime)) {
        this.notificationTimeError = 'Formato de hora inválido (use HH:MM)';
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  /* --------------------------------------------------------------------------- */
  /*                          VALIDACIÓN COMPLETA FORM                            */
  /* --------------------------------------------------------------------------- */
  private validateForm(): boolean {
    this.validateTitle();
    this.validateSubject();
    this.validateDueDate();
    this.validateDueTime();
    this.validateNotificationTime();

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

    if (this.notificationEnabled && !this.notificationPermission) {
      this.generalError = 'Es necesario otorgar permisos de notificación';
      return false;
    }

    this.generalError = '';
    return true;
  }

  /* --------------------------------------------------------------------------- */
  /*                                   CÁMARA                                    */
  /* --------------------------------------------------------------------------- */
  takePhoto(): void {
    this.cameraService
      .takePicture()
      .then((photoUrl) => {
        this.photo = photoUrl;
        this.generalError = '';
      })
      .catch((err) => {
        console.error('Error al tomar la foto:', err);
        this.generalError =
          'Error al tomar la foto. Inténtalo de nuevo.';
      });
  }

  /* --------------------------------------------------------------------------- */
  /*                          UTILIDADES PARA LA TAREA                           */
  /* --------------------------------------------------------------------------- */
  private getColorForSubject(subject: string): string {
    const colors = [
      '#FFB3BA',
      '#BAE1FF',
      '#BAFFC9',
      '#FFFFBA',
      '#FFDFBA',
      '#E6BAFF',
      '#D5BAFF',
    ];
    let sum = 0;
    for (let i = 0; i < subject.length; i++) {
      sum += subject.charCodeAt(i);
    }
    return colors[sum % colors.length];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private buildDateTime(): string {
    if (this.isDaily) return '';
    let dateTime = this.dueDate;
    dateTime += this.dueTime ? `T${this.dueTime}:00` : 'T23:59:59';
    return dateTime;
  }

  /* --------------------------------------------------------------------------- */
  /*                                GUARDAR TAREA                                */
  /* --------------------------------------------------------------------------- */
  async saveTask(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSaving = true;
    this.generalError = '';

    try {
      const subjectColor =
        this.type === 'school' && this.subject
          ? this.getColorForSubject(this.subject)
          : undefined;

      const newTask: Tasks = {
        id: this.generateId(),
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        completed: false,
        dueDate: this.buildDateTime(),
        dueTime: this.dueTime || undefined,
        photo: this.photo,
        type: this.type,
        subject: this.type === 'school' ? this.subject?.trim() : undefined,
        subjectColor,
        createdAt: new Date().toISOString(),

        isDaily: this.isDaily,
        notificationTime: this.notificationEnabled
          ? this.notificationTime
          : undefined,
        notificationEnabled: this.notificationEnabled,
        lastCompleted: undefined,
      };

      await this.tasksService.addTask(newTask);

      if (this.notificationEnabled && this.notificationTime) {
        try {
          await this.notificationService.scheduleNotification(newTask);
        } catch (notificationError) {
          console.warn(
            'Error al programar la notificación:',
            notificationError
          );
        }
      }

      this.router.navigate(['/tasks-list']);
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      this.generalError = 'Error al guardar la tarea. Inténtalo de nuevo.';
    } finally {
      this.isSaving = false;
    }
  }

  /* --------------------------------------------------------------------------- */
  /*                                RESET FORM                                   */
  /* --------------------------------------------------------------------------- */
  private clearAllErrors(): void {
    this.titleError = '';
    this.dueDateError = '';
    this.dueTimeError = '';
    this.subjectError = '';
    this.notificationTimeError = '';
    this.generalError = '';
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.dueTime = '';
    this.photo = undefined;
    this.type = 'house';
    this.subject = undefined;
    this.isDaily = false;
    this.notificationEnabled = false;
    this.notificationTime = '';

    this.clearAllErrors();
    this.setDefaultDueDate();
  }
}
