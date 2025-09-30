import { Body, Controller, Post } from '@nestjs/common';
import { TaskModel } from './task.model';

@Controller('task')
export class TaskController {
  @Post()
  async createTask(@Body() dto: { title: string; todoId: string }) {}
  async getTasks(@Body() dto: { todoId: string }) {}
  async updateTask(@Body() dto: { taskId: string; todoId: string }) {}
  async deleteTask(@Body() dto: { taskId: string; todoId: string }) {}
}
