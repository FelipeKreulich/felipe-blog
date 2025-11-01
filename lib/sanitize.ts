import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuração de sanitização para conteúdo do editor Tiptap
 * Permite tags e atributos seguros necessários para renderização rica
 */
const ALLOWED_TAGS = [
  // Texto e formatação
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  // Títulos
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Listas
  'ul', 'ol', 'li',
  // Blocos
  'blockquote', 'hr',
  // Links e mídia
  'a', 'img', 'iframe',
  // Tabelas
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // Containers
  'div', 'span',
  // Code highlighting
  'span',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class', 'style',
  'src', 'alt', 'width', 'height',
  'data-youtube-video', 'data-twitter-embed', 'data-image-gallery',
  'allowfullscreen', 'frameborder', 'allow',
  'colspan', 'rowspan',
];

const ALLOWED_IFRAME_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'player.vimeo.com',
  'vimeo.com',
];

/**
 * Sanitiza conteúdo HTML mantendo tags e atributos permitidos
 * Remove scripts, eventos maliciosos e outras ameaças XSS
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Permite iframes apenas de domínios confiáveis
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    // Hooks para validação adicional
    FORBID_TAGS: ['style', 'script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });

  // Validação adicional para iframes (apenas YouTube e Vimeo)
  const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const sanitizedWithIframes = cleanHtml.replace(iframeRegex, (match, src) => {
    try {
      const url = new URL(src);
      const isAllowed = ALLOWED_IFRAME_DOMAINS.some(domain =>
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );

      if (isAllowed) {
        // Garante que iframes do YouTube usem embed URLs
        if (url.hostname.includes('youtube.com')) {
          return match.replace(src, src.replace('youtube.com/watch?v=', 'youtube.com/embed/'));
        }
        return match;
      }

      // Remove iframe não autorizado
      return '';
    } catch {
      // URL inválida, remove o iframe
      return '';
    }
  });

  return sanitizedWithIframes;
}

/**
 * Sanitiza conteúdo de texto puro (para excerpts, títulos, etc)
 * Remove todas as tags HTML
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Extrai texto puro do HTML (para excerpts automáticos)
 */
export function extractPlainText(html: string, maxLength: number = 200): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove tags HTML
  const text = html.replace(/<[^>]*>/g, ' ')
    // Remove múltiplos espaços
    .replace(/\s+/g, ' ')
    // Trim
    .trim();

  // Trunca se necessário
  if (text.length > maxLength) {
    return text.substring(0, maxLength).trim() + '...';
  }

  return text;
}

/**
 * Valida e sanitiza URLs
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    // Apenas permite protocolos seguros
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}
