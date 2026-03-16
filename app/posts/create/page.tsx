import { redirect } from 'next/navigation'

export default function CreatePostRedirect() {
  redirect('/posts/new')
}
