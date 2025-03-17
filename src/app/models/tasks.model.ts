export interface Tasks {
    id: string; // Identificador único
    title: string; // Actividad o Materia
    description: string; // Descripción
    completed: boolean; // Estado (hecho/no hecho)
    dueDate: string; // Fecha límite
    photo?: string; // Foto opcional
    type: 'house' | 'school'; // Tipo: tarea del hogar o deber escolar
    subject?: string; // Solo para deberes escolares
    subjectColor?: string; // Color según materia (solo deberes)
    createdAt: string; // Fecha de creación
  }