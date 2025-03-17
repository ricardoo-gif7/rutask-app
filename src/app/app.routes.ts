import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash', // Ahora inicia en la pantalla de carga
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadComponent: () => import('./Components/splash-screen/splash-screen.component').then(m => m.SplashScreenComponent)
  },
  {
    path: 'tasks-list',
    loadComponent: () => import('./Components/tasks-list/tasks-list.component').then(m => m.TasksListComponent)
  },
  {
    path: 'tasks-detail/:id', // Asegúrate de incluir el parámetro :id
    loadComponent: () => import('./Components/tasks-detail/tasks-detail.component').then(m => m.TasksDetailComponent)
  },
  {
    path: 'add-tasks',
    loadComponent: () => import('./Components/add-tasks/add-tasks.component').then(m => m.AddTasksComponent)
  },
  {
    path: 'house-tasks',
    loadComponent: () => import('./Components/tasks-list/tasks-list.component').then(m => m.TasksListComponent)
  },
  {
    path: 'school-tasks',
    loadComponent: () => import('./Components/tasks-list/tasks-list.component').then(m => m.TasksListComponent)
  }
];
