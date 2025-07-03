export interface Tasks {
  id: string; // Identificador único
  title: string; // Actividad o Materia
  description?: string; // Descripción (ahora opcional)
  completed: boolean; // Estado (hecho/no hecho)
  dueDate: string; // Fecha límite
  dueTime?: string; // Hora límite separada
  photo?: string; // Foto opcional
  type: 'house' | 'school'; // Tipo: tarea del hogar o deber escolar
  subject?: string; // Solo para deberes escolares
  subjectColor?: string; // Color según materia (solo deberes)
  createdAt: string; // Fecha de creación
  
  // Nuevos campos para tareas diarias
  isDaily: boolean; // Si es una tarea diaria
  notificationTime?: string; // Hora de notificación (HH:MM format)
  notificationEnabled: boolean; // Si las notificaciones están habilitadas
  lastCompleted?: string; // Última vez que se completó (para tareas diarias)
}