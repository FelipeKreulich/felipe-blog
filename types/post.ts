export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  feature: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  authorId: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  categories: {
    category: {
      id: string
      name: string
      slug: string
      color: string | null
    }
  }[]
  tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface PostListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  categories: {
    category: {
      id: string
      name: string
      slug: string
      color: string | null
    }
  }[]
  tags: {
    tag: {
      id: string
      name: string
      slug: string
    }
  }[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface PostsResponse {
  posts: PostListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
