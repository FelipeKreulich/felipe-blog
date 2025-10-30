/**
 * Calcula o tempo estimado de leitura de um texto
 * @param content - Conteúdo do post (pode ser HTML ou Markdown)
 * @param wordsPerMinute - Palavras por minuto (padrão: 200)
 * @returns Objeto com minutos e texto formatado
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): { minutes: number; text: string; textPt: string; textEn: string } {
  // Remove HTML tags e markdown syntax
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*`_~\[\]()]/g, '') // Remove markdown syntax
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim()

  // Conta palavras
  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length

  // Calcula minutos (mínimo 1)
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))

  return {
    minutes,
    text: `${minutes} min read`,
    textPt: `${minutes} min de leitura`,
    textEn: `${minutes} min read`,
  }
}

/**
 * Formata tempo de leitura com ícone
 */
export function formatReadingTime(minutes: number, language: 'pt' | 'en' = 'pt'): string {
  if (language === 'pt') {
    return minutes === 1 ? '1 minuto de leitura' : `${minutes} minutos de leitura`
  }
  return minutes === 1 ? '1 minute read' : `${minutes} minutes read`
}
