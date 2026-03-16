import { Resend } from 'resend'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    _resend = getResendClient()
  }
  return _resend
}

export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
