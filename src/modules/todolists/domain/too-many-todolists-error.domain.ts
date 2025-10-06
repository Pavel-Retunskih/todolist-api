export class TooManyTodolistsException extends Error {
  constructor(
    message: string = 'User has reached the maximum number of todolists (10).',
  ) {
    super(message)
    this.name = 'TooManyTodolistsException'
  }
}
