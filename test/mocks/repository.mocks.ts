import { UserRepository } from '../../src/modules/users/domain/user.repository'
import { TodolistRepository } from '../../src/modules/todolists/domain/todolist.repository'
import { TasksRepository } from '../../src/modules/tasks/domain/tasks.repository'
import { SessionRepository } from '../../src/modules/sessions/domain/sessions.repository'

/**
 * Mock для UserRepository
 */
export const createMockUserRepository = (): jest.Mocked<UserRepository> => ({
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  findUserByEmailWithPassword: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
})

/**
 * Mock для TodolistRepository
 */
export const createMockTodolistRepository =
  (): jest.Mocked<TodolistRepository> => ({
    createTodolist: jest.fn(),
    getTodolistById: jest.fn(),
    getAllByOwnerId: jest.fn(),
    updateTodolist: jest.fn(),
    deleteTodolist: jest.fn(),
    getTodolistsCountByOwnerId: jest.fn(),
  })

/**
 * Mock для TasksRepository
 */
export const createMockTasksRepository = (): jest.Mocked<TasksRepository> => ({
  createTask: jest.fn(),
  getTaskById: jest.fn(),
  getAllTodolistTasks: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  deleteAllTasksByTodolistId: jest.fn(),
})

/**
 * Mock для SessionRepository
 */
export const createMockSessionRepository =
  (): jest.Mocked<SessionRepository> => ({
    createSession: jest.fn(),
    getSession: jest.fn(),
    deleteByUserIdAndRefreshToken: jest.fn(),
    deleteAllByUserId: jest.fn(),
    deleteOthersByUserIdAndRefreshToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    updateSession: jest.fn(),
  })
