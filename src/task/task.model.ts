export class TaskModel {
  id: string;
  order: number;
  priority: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date;
}
