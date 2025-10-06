export interface TodolistEntity {
  id: string
  ownerId: string
  title: string
  imageUrl?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
