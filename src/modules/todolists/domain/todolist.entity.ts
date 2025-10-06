export interface TodolistEntity {
  id: string
  ownerId: string
  title: string
  imageUrl: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}
