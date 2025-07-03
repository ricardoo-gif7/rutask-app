import { Injectable } from '@angular/core';
import { Tasks } from '../models/tasks.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationTimers: Map<string, number> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.requestNotificationPermission();
  }

  /**
   * Solicita permisos de notificación al usuario
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  /**
   * Programa una notificación para una tarea
   * @param task - La tarea para la cual programar la notificación
   */
  scheduleNotification(task: Tasks): void {
    if (!task.notificationEnabled || !task.notificationTime) {
      return;
    }

    // Cancelar notificación anterior si existe
    this.cancelNotification(task.id);

    const now = new Date();
    const [hours, minutes] = task.notificationTime.split(':').map(Number);
    
    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    // Si la hora ya pasó hoy, programar para mañana
    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    const timeUntilNotification = notificationDate.getTime() - now.getTime();

    const timerId = window.setTimeout(() => {
      this.showNotification(task);
      
      // Si es una tarea diaria, programar la siguiente notificación
      if (task.isDaily) {
        setTimeout(() => this.scheduleNotification(task), 1000);
      }
    }, timeUntilNotification);

    this.notificationTimers.set(task.id, timerId);
  }

  /**
   * Cancela una notificación programada
   * @param taskId - ID de la tarea
   */
  cancelNotification(taskId: string): void {
    const timerId = this.notificationTimers.get(taskId);
    if (timerId) {
      clearTimeout(timerId);
      this.notificationTimers.delete(taskId);
    }
  }

  /**
   * Muestra una notificación
   * @param task - La tarea para mostrar la notificación
   */
  private showNotification(task: Tasks): void {
    if (this.notificationPermission !== 'granted') {
      return;
    }

    const notification = new Notification(`Recordatorio: ${task.title}`, {
      body: task.description || 'Es hora de completar esta tarea',
      icon: '/assets/icon/favicon.png',
      badge: '/assets/icon/favicon.png',
      tag: task.id,
      requireInteraction: true,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Aquí podrías navegar a la tarea específica
    };

    // Auto-cerrar después de 10 segundos
    setTimeout(() => notification.close(), 10000);
  }

  /**
   * Programa notificaciones para múltiples tareas
   * @param tasks - Array de tareas
   */
  scheduleMultipleNotifications(tasks: Tasks[]): void {
    tasks.forEach(task => {
      if (task.notificationEnabled && task.notificationTime) {
        this.scheduleNotification(task);
      }
    });
  }

  /**
   * Cancela todas las notificaciones
   */
  cancelAllNotifications(): void {
    this.notificationTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.notificationTimers.clear();
  }

  /**
   * Valida si una hora es válida
   * @param time - Hora en formato HH:MM
   * @returns boolean
   */
  isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Verifica si las notificaciones están soportadas
   * @returns boolean
   */
  areNotificationsSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Obtiene el estado de los permisos de notificación
   * @returns NotificationPermission
   */
  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission;
  }
}