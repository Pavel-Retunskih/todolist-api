export interface TaskEntity {
  id: string
  todolistId: string
  title: string
  createdAt: Date
  updatedAt: Date
  completed: boolean
  order: number
  priority: number
  dueDate?: Date | null
  tags?: string[]
  description?: string
  imageUrl?: string
}
