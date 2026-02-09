import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException } from '@nestjs/common'
import { TasksService } from './tasks.service'
import {
  createMockTasksRepository,
  createMockTodolistRepository,
} from '../../../../test/mocks/repository.mocks'
import { type TasksRepository } from '../domain/tasks.repository'
import { type TodolistRepository } from '../../todolists/domain/todolist.repository'
import { type TaskEntity } from '../domain/task.entity'
import { type TodolistEntity } from '../../todolists/domain/todolist.entity'

describe('TasksService', () => {
  let service: TasksService
  let taskRepository: jest.Mocked<TasksRepository>
  let todolistRepository: jest.Mocked<TodolistRepository>

  const mockTodolist: TodolistEntity = {
    id: 'todo-1',
    ownerId: 'user-1',
    title: 'Test Todolist',
    imageUrl: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTask: TaskEntity = {
    id: 'task-1',
    todolistId: 'todo-1',
    title: 'Test Task',
    completed: false,
    order: 1,
    priority: 0,
    dueDate: null,
    tags: [],
    description: 'Test task description',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    taskRepository = createMockTasksRepository()
    todolistRepository = createMockTodolistRepository()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: 'TasksRepository', useValue: taskRepository },
        { provide: 'TodolistsRepository', useValue: todolistRepository },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  describe('createTask', () => {
    it('should create a task when user owns the todolist', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.createTask.mockResolvedValue(mockTask)

      const result = await service.createTask('user-1', {
        title: 'Test Task',
        todolistId: 'todo-1',
        description: 'Test task description',
        imageUrl: null,
        tags: [],
        dueDate: null,
      })

      expect(result).toEqual(mockTask)
      expect(taskRepository.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        todolistId: 'todo-1',
        description: 'Test task description',
        imageUrl: null,
        tags: [],
        dueDate: null,
      })
    })

    it('should throw ForbiddenException when user does not own todolist', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      await expect(
        service.createTask('other-user', {
          title: 'Test Task',
          todolistId: 'todo-1',
          description: null,
          imageUrl: null,
          tags: null,
        }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw ForbiddenException when todolist not found', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(null)

      await expect(
        service.createTask('user-1', {
          title: 'Test Task',
          todolistId: 'nonexistent',
          description: null,
          imageUrl: null,
          tags: null,
        }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should convert dueDate string to Date', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.createTask.mockResolvedValue(mockTask)

      await service.createTask('user-1', {
        title: 'Test Task',
        todolistId: 'todo-1',
        description: null,
        imageUrl: null,
        tags: null,
        dueDate: '2025-12-31T00:00:00.000Z',
      })

      expect(taskRepository.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: expect.any(Date),
        }),
      )
    })
  })

  describe('getAllTodolistTasks', () => {
    it('should return all tasks for a todolist', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.getAllTodolistTasks.mockResolvedValue([mockTask])

      const result = await service.getAllTodolistTasks('user-1', 'todo-1')

      expect(result).toEqual([mockTask])
    })

    it('should throw ForbiddenException when user does not own todolist', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      await expect(
        service.getAllTodolistTasks('other-user', 'todo-1'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should filter tasks by minPriority', async () => {
      const highPriorityTask = { ...mockTask, id: 'task-2', priority: 5 }
      const lowPriorityTask = { ...mockTask, id: 'task-3', priority: 1 }
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.getAllTodolistTasks.mockResolvedValue([
        highPriorityTask,
        lowPriorityTask,
      ])

      const result = await service.getAllTodolistTasks('user-1', 'todo-1', {
        minPriority: 3,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('task-2')
    })

    it('should filter tasks by dueInDays', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const taskDueTomorrow = {
        ...mockTask,
        id: 'task-soon',
        priority: 0,
        dueDate: tomorrow,
      }
      const taskDueNextWeek = {
        ...mockTask,
        id: 'task-later',
        priority: 0,
        dueDate: nextWeek,
      }
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.getAllTodolistTasks.mockResolvedValue([
        taskDueTomorrow,
        taskDueNextWeek,
      ])

      const result = await service.getAllTodolistTasks('user-1', 'todo-1', {
        dueInDays: 2,
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('task-soon')
    })

    it('should sort tasks by dueDate then priority', async () => {
      const soon = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const later = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      const tasks: TaskEntity[] = [
        { ...mockTask, id: 'task-1', priority: 5, dueDate: later },
        { ...mockTask, id: 'task-2', priority: 3, dueDate: soon },
      ]
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.getAllTodolistTasks.mockResolvedValue(tasks)

      const result = await service.getAllTodolistTasks('user-1', 'todo-1', {
        minPriority: 1,
      })

      expect(result[0].id).toBe('task-2') // sooner due date comes first
      expect(result[1].id).toBe('task-1')
    })
  })

  describe('getTaskById', () => {
    it('should return a task when user owns the todolist', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      const result = await service.getTaskById('user-1', 'task-1')

      expect(result).toEqual(mockTask)
    })

    it('should return null when task not found', async () => {
      taskRepository.getTaskById.mockResolvedValue(null)

      const result = await service.getTaskById('user-1', 'nonexistent')

      expect(result).toBeNull()
    })

    it('should throw ForbiddenException when user does not own task', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      await expect(
        service.getTaskById('other-user', 'task-1'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('updateTask', () => {
    it('should update a task when user owns the todolist', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' }
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.updateTask.mockResolvedValue(updatedTask)

      const result = await service.updateTask('user-1', 'task-1', {
        title: 'Updated Title',
      })

      expect(result?.title).toBe('Updated Title')
      expect(taskRepository.updateTask).toHaveBeenCalledWith('task-1', {
        title: 'Updated Title',
      })
    })

    it('should return null when task not found', async () => {
      taskRepository.getTaskById.mockResolvedValue(null)

      const result = await service.updateTask('user-1', 'nonexistent', {
        title: 'Updated',
      })

      expect(result).toBeNull()
    })

    it('should throw ForbiddenException when user does not own task', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      await expect(
        service.updateTask('other-user', 'task-1', { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should handle partial updates', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.updateTask.mockResolvedValue({
        ...mockTask,
        completed: true,
      })

      await service.updateTask('user-1', 'task-1', { completed: true })

      expect(taskRepository.updateTask).toHaveBeenCalledWith('task-1', {
        completed: true,
      })
    })

    it('should convert dueDate string to Date in update', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.updateTask.mockResolvedValue(mockTask)

      await service.updateTask('user-1', 'task-1', {
        dueDate: '2025-12-31T00:00:00.000Z',
      })

      expect(taskRepository.updateTask).toHaveBeenCalledWith('task-1', {
        dueDate: expect.any(Date),
      })
    })

    it('should set dueDate to null when provided as null', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.updateTask.mockResolvedValue(mockTask)

      await service.updateTask('user-1', 'task-1', { dueDate: null })

      expect(taskRepository.updateTask).toHaveBeenCalledWith('task-1', {
        dueDate: null,
      })
    })
  })

  describe('deleteTask', () => {
    it('should delete a task when user owns the todolist', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)
      taskRepository.deleteTask.mockResolvedValue(mockTask)

      const result = await service.deleteTask('user-1', 'task-1')

      expect(result).toEqual(mockTask)
      expect(taskRepository.deleteTask).toHaveBeenCalledWith('task-1')
    })

    it('should return null when task not found', async () => {
      taskRepository.getTaskById.mockResolvedValue(null)

      const result = await service.deleteTask('user-1', 'nonexistent')

      expect(result).toBeNull()
    })

    it('should throw ForbiddenException when user does not own task', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask)
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      await expect(
        service.deleteTask('other-user', 'task-1'),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
