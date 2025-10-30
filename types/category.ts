export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  count: number
  createdAt: Date
  updatedAt: Date
}
