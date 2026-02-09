import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BadRequestException } from '@nestjs/common'
import { TodolistsService } from './todolists.service'
import { createMockTodolistRepository } from '../../../../test/mocks/repository.mocks'
import { type TodolistRepository } from '../domain/todolist.repository'
import { type TodolistEntity } from '../domain/todolist.entity'
import { TooManyTodolistsException } from '../domain/too-many-todolists-error.domain'

describe('TodolistsService', () => {
  let service: TodolistsService
  let todolistRepository: jest.Mocked<TodolistRepository>
  let configService: jest.Mocked<ConfigService>

  const mockTodolist: TodolistEntity = {
    id: 'todo-1',
    ownerId: 'user-1',
    title: 'Test Todolist',
    imageUrl: null,
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    todolistRepository = createMockTodolistRepository()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodolistsService,
        { provide: 'TodolistsRepository', useValue: todolistRepository },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(10),
          },
        },
      ],
    }).compile()

    service = module.get<TodolistsService>(TodolistsService)
    configService = module.get(ConfigService)
  })

  describe('createTododlist', () => {
    it('should create a todolist successfully', async () => {
      todolistRepository.getTodolistsCountByOwnerId.mockResolvedValue(0)
      todolistRepository.createTodolist.mockResolvedValue(mockTodolist)

      const result = await service.createTododlist(
        { title: 'Test Todolist', imageUrl: null, description: 'Test description' },
        'user-1',
      )

      expect(result).toEqual(mockTodolist)
      expect(todolistRepository.createTodolist).toHaveBeenCalledWith({
        ownerId: 'user-1',
        title: 'Test Todolist',
        description: 'Test description',
        imageUrl: null,
      })
    })

    it('should throw TooManyTodolistsException when limit reached', async () => {
      todolistRepository.getTodolistsCountByOwnerId.mockResolvedValue(10)
      configService.getOrThrow = jest.fn().mockReturnValue(10)

      await expect(
        service.createTododlist(
          { title: 'New Todo', imageUrl: null, description: null },
          'user-1',
        ),
      ).rejects.toThrow(TooManyTodolistsException)
    })

    it('should throw BadRequestException when title is "undefined"', async () => {
      todolistRepository.getTodolistsCountByOwnerId.mockResolvedValue(0)

      await expect(
        service.createTododlist(
          { title: 'undefined', imageUrl: null, description: null },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('should pass null for optional fields when not provided', async () => {
      todolistRepository.getTodolistsCountByOwnerId.mockResolvedValue(0)
      todolistRepository.createTodolist.mockResolvedValue(mockTodolist)

      await service.createTododlist(
        { title: 'Test', imageUrl: null, description: null },
        'user-1',
      )

      expect(todolistRepository.createTodolist).toHaveBeenCalledWith({
        ownerId: 'user-1',
        title: 'Test',
        description: null,
        imageUrl: null,
      })
    })
  })

  describe('updateTodolist', () => {
    it('should update an existing todolist', async () => {
      const updated = { ...mockTodolist, title: 'Updated Title' }
      todolistRepository.updateTodolist.mockResolvedValue(updated)

      const result = await service.updateTodolist(
        { title: 'Updated Title', imageUrl: null, description: null },
        'todo-1',
      )

      expect(result.title).toBe('Updated Title')
      expect(todolistRepository.updateTodolist).toHaveBeenCalledWith('todo-1', {
        title: 'Updated Title',
        imageUrl: null,
        description: null,
      })
    })

    it('should throw Error when todolist not found', async () => {
      todolistRepository.updateTodolist.mockResolvedValue(null)

      await expect(
        service.updateTodolist(
          { title: 'Title', imageUrl: null, description: null },
          'nonexistent',
        ),
      ).rejects.toThrow('Todolist not found')
    })
  })

  describe('deleteTodolist', () => {
    it('should delete an existing todolist', async () => {
      todolistRepository.deleteTodolist.mockResolvedValue(mockTodolist)

      const result = await service.deleteTodolist('todo-1')

      expect(result).toEqual(mockTodolist)
      expect(todolistRepository.deleteTodolist).toHaveBeenCalledWith('todo-1')
    })

    it('should return null when todolist not found', async () => {
      todolistRepository.deleteTodolist.mockResolvedValue(null)

      const result = await service.deleteTodolist('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getTodolistById', () => {
    it('should return a todolist by id', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(mockTodolist)

      const result = await service.getTodolistById('todo-1')

      expect(result).toEqual(mockTodolist)
    })

    it('should return null when not found', async () => {
      todolistRepository.getTodolistById.mockResolvedValue(null)

      const result = await service.getTodolistById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getAllByOwnerId', () => {
    it('should return all todolists for a user', async () => {
      todolistRepository.getAllByOwnerId.mockResolvedValue([mockTodolist])

      const result = await service.getAllByOwnerId('user-1')

      expect(result).toEqual([mockTodolist])
      expect(todolistRepository.getAllByOwnerId).toHaveBeenCalledWith('user-1')
    })

    it('should return empty array when user has no todolists', async () => {
      todolistRepository.getAllByOwnerId.mockResolvedValue([])

      const result = await service.getAllByOwnerId('user-2')

      expect(result).toEqual([])
    })
  })
})
