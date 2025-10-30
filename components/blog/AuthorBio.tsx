'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Twitter, Linkedin, Github, Globe, Mail } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface AuthorBioProps {
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
    bio?: string | null
    role: string
    _count?: {
      posts: number
    }
  }
  profile?: {
    website?: string | null
    socialLinks?: any
  } | null
  otherPosts?: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string | null
  }>
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  MODERATOR: 'bg-orange-500',
  EDITOR: 'bg-purple-500',
  WRITER: 'bg-blue-500',
}

const getRoleLabel = (role: string, language: string) => {
  const labels: Record<string, Record<string, string>> = {
    pt: {
      ADMIN: 'Admin',
      MODERATOR: 'Moderador',
      EDITOR: 'Editor',
      WRITER: 'Escritor',
    },
    en: {
      ADMIN: 'Admin',
      MODERATOR: 'Moderator',
      EDITOR: 'Editor',
      WRITER: 'Writer',
    },
  }
  return labels[language]?.[role] || role
}

export function AuthorBio({ author, profile, otherPosts = [] }: AuthorBioProps) {
  const { t, language } = useLanguage()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const socialLinks = profile?.socialLinks
    ? typeof profile.socialLinks === 'string'
      ? JSON.parse(profile.socialLinks)
      : profile.socialLinks
    : {}

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
            <Link href={`/profile/${author.username}`}>
              <Avatar className="w-24 h-24 cursor-pointer hover:ring-4 hover:ring-primary/20 transition-all">
                <AvatarImage src={author.avatar || undefined} alt={author.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(author.name)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="text-center md:text-left w-full">
              <Link href={`/profile/${author.username}`}>
                <h3 className="text-xl font-bold hover:text-primary transition-colors">
                  {author.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-2">
                @{author.username}
              </p>
              <Badge className={`${roleColors[author.role] || 'bg-blue-500'} text-white`}>
                {getRoleLabel(author.role, language)}
              </Badge>

              {author._count && (
                <p className="text-sm text-muted-foreground mt-3">
                  {author._count.posts} {language === 'pt' ? 'posts publicados' : 'published posts'}
                </p>
              )}
            </div>
          </div>

          {/* Bio and Social Links */}
          <div className="flex-1 md:w-2/3">
            {author.bio && (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {author.bio}
              </p>
            )}

            {/* Social Links */}
            {(socialLinks.twitter ||
              socialLinks.linkedin ||
              socialLinks.github ||
              profile?.website) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {socialLinks.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}

                {socialLinks.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}

                {socialLinks.github && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}

                {profile?.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Other Posts by Author */}
            {otherPosts.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">
                  {language === 'pt'
                    ? 'Outros posts deste autor'
                    : 'More from this author'}
                </h4>
                <ul className="space-y-2">
                  {otherPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm hover:text-primary transition-colors line-clamp-1"
                      >
                        → {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
