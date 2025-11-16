export interface TaskEntity {
  id: string
  todolistId: string
  title: string
  createdAt: Date
  updatedAt: Date
  completed: boolean
  order: number
  priority: number
  tags?: string[]
  description?: string
  imageUrl?: string
}
