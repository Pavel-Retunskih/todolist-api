import { TaskModel } from '../task/task.model';

export class TodolistModel {
  id: string;
  ownerId: string;
  title: string;
  order: number;
  tasks: TaskModel[];
}
