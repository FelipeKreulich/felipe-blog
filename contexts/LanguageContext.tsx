'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Header
    'header.login': 'Entrar',
    'header.signup': 'Criar Conta',
    'header.blogName': 'Kreulich Blog',
    
    // Hero Section
    'hero.badge': '✨ Blog Pessoal',
    'hero.title': 'Compartilhando conhecimento e experiências',
    'hero.subtitle': 'Um espaço onde compartilho insights sobre tecnologia, desenvolvimento e experiências pessoais. Junte-se à comunidade e descubra conteúdo valioso.',
    'hero.exploreButton': 'Começar a Explorar',
    'hero.signupButton': 'Criar Minha Conta',
    
    // Features Section
    'features.title': 'Por que escolher este blog?',
    'features.subtitle': 'Conteúdo de qualidade, comunidade ativa e experiências reais compartilhadas',
    'features.exclusiveContent.title': 'Conteúdo Exclusivo',
    'features.exclusiveContent.description': 'Artigos únicos sobre tecnologia, desenvolvimento e experiências.',
    'features.community.title': 'Comunidade Ativa',
    'features.community.description': 'Conecte-se com outros desenvolvedores e compartilhe experiências',
    'features.updates.title': 'Atualizações Regulares',
    'features.updates.description': 'Novo conteúdo semanal com insights e tutoriais práticos',
    
    // Stats Section
    'stats.articles': 'Artigos Publicados',
    'stats.readers': 'Leitores Ativos',
    'stats.tutorials': 'Tutoriais Práticos',
    'stats.rating': 'Avaliação',
    
    // CTA Section
    'cta.title': 'Pronto para começar sua jornada?',
    'cta.subtitle': 'Junte-se à comunidade e tenha acesso a conteúdo exclusivo',
    'cta.signupButton': 'Criar Conta Gratuita',
    'cta.exploreButton': 'Explorar Blog',
    
    // Footer
    'footer.copyright': 'Todos os direitos reservados.',
    
    // 404 Page
    '404.title': 'Página não encontrada',
    '404.subtitle': 'Ops! Parece que você se perdeu.',
    '404.description': 'A página que você está procurando não existe ou foi movida.',
    '404.backHome': 'Voltar ao Início',
    '404.exploreBlog': 'Explorar Blog',
    
    // Layout/Meta
    'meta.title': 'Kreulich Blog',
    'meta.description': 'Blog sobre tecnologia, programação e outros assuntos.',
    
    // Cookie Consent
    'cookies.title': 'Política de Cookies',
    'cookies.subtitle': 'Sua privacidade é importante para nós',
    'cookies.description': 'Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. Ao continuar navegando, você concorda com nossa política de cookies.',
    'cookies.essential.title': 'Cookies Essenciais',
    'cookies.essential.description': 'Necessários para o funcionamento básico do site',
    'cookies.preferences.title': 'Cookies de Preferências',
    'cookies.preferences.description': 'Armazenam suas configurações de idioma e tema',
    'cookies.analytics.title': 'Cookies de Analytics',
    'cookies.analytics.description': 'Nos ajudam a entender como você usa o site',
    'cookies.marketing.title': 'Cookies de Marketing',
    'cookies.marketing.description': 'Usados para personalizar anúncios e conteúdo',
    'cookies.always': 'Sempre ativo',
    'cookies.optional': 'Opcional',
    'cookies.accept': 'Aceitar Todos',
    'cookies.decline': 'Recusar',
    'cookies.settings': 'Configurações',
    'cookies.acceptAll': 'Aceitar Todos',
    'cookies.declineAll': 'Recusar Todos',
    'cookies.cancel': 'Cancelar',
    'cookies.save': 'Salvar',
    'cookies.settingsDescription': 'Gerencie suas preferências de cookies. Você pode ativar ou desativar diferentes tipos de cookies conforme sua preferência.',
    'cookies.banner.text': 'Cookies configurados',
    'cookies.footer': 'Você pode alterar suas preferências a qualquer momento nas configurações.',
    
    // Sign In Page
    'signin.title': 'Bem-vindo de volta',
    'signin.subtitle': 'Entre com suas credenciais para acessar sua conta',
    'signin.email': 'E-mail',
    'signin.emailPlaceholder': 'seu@email.com',
    'signin.password': 'Senha',
    'signin.passwordPlaceholder': 'Digite sua senha',
    'signin.rememberMe': 'Lembrar de mim',
    'signin.forgotPassword': 'Esqueceu a senha?',
    'signin.loginButton': 'Entrar',
    'signin.or': 'ou',
    'signin.noAccount': 'Não tem uma conta?',
    'signin.createAccount': 'Criar conta',
    
    // Sign Up Page
    'signup.title': 'Criar sua conta',
    'signup.subtitle': 'Preencha os dados abaixo para começar sua jornada',
    'signup.fullName': 'Nome completo',
    'signup.fullNamePlaceholder': 'Digite seu nome completo',
    'signup.email': 'E-mail',
    'signup.emailPlaceholder': 'seu@email.com',
    'signup.password': 'Senha',
    'signup.passwordPlaceholder': 'Crie uma senha segura',
    'signup.jobRole': 'Cargo',
    'signup.jobRolePlaceholder': 'Selecione seu cargo',
    'signup.otherJobRole': 'Especifique o cargo',
    'signup.otherJobRolePlaceholder': 'Digite seu cargo',
    'signup.signupButton': 'Criar conta',
    'signup.or': 'ou',
    'signup.haveAccount': 'Já tem uma conta?',
    'signup.signIn': 'Fazer login',
    'signup.jobRoles.developer': 'Desenvolvedor',
    'signup.jobRoles.softwareEngineer': 'Engenheiro de Software',
    'signup.jobRoles.frontendDeveloper': 'Desenvolvedor Frontend',
    'signup.jobRoles.backendDeveloper': 'Desenvolvedor Backend',
    'signup.jobRoles.fullstackDeveloper': 'Desenvolvedor Full Stack',
    'signup.jobRoles.devopsEngineer': 'Engenheiro DevOps',
    'signup.jobRoles.dataScientist': 'Cientista de Dados',
    'signup.jobRoles.productManager': 'Product Manager',
    'signup.jobRoles.uiUxDesigner': 'UI/UX Designer',
    'signup.jobRoles.qaEngineer': 'Engenheiro QA',
    'signup.jobRoles.techLead': 'Tech Lead',
    'signup.jobRoles.other': 'Outro',
    
    // Blog Page
    'blog.highlights': 'Destaques',
    'blog.categories': 'Categorias',
    'blog.categoriesDescription': 'Explore nossos artigos organizados por categoria',
    'blog.allPosts': 'Todos os Artigos',
    'blog.allPostsDescription': 'Descubra todos os nossos artigos e tutoriais',
    'blog.readMore': 'Ler mais',
    'blog.loadMore': 'Carregar mais artigos',
    
    // Newsletter
    'newsletter.title': 'Receba nossas novidades',
    'newsletter.description': 'Inscreva-se em nossa newsletter e receba os melhores artigos diretamente no seu e-mail.',
    'newsletter.emailLabel': 'E-mail',
    'newsletter.emailPlaceholder': 'Digite seu e-mail',
    'newsletter.consentLabel': 'Autorizo o recebimento de e-mails',
    'newsletter.consentDescription': 'Você pode cancelar sua inscrição a qualquer momento.',
    'newsletter.subscribe': 'Inscrever-se',
    'newsletter.subscribing': 'Inscrevendo...',
    'newsletter.privacyNote': 'Respeitamos sua privacidade. Não compartilhamos seus dados com terceiros.',
  },
  en: {
    // Header
    'header.login': 'Login',
    'header.signup': 'Sign Up',
    'header.blogName': 'Kreulich Blog',
    
    // Hero Section
    'hero.badge': '✨ Personal Blog',
    'hero.title': 'Sharing knowledge and experiences',
    'hero.subtitle': 'A space where I share insights about technology, development and personal experiences. Join the community and discover valuable content.',
    'hero.exploreButton': 'Start Exploring',
    'hero.signupButton': 'Create My Account',
    
    // Features Section
    'features.title': 'Why choose this blog?',
    'features.subtitle': 'Quality content, active community and real shared experiences',
    'features.exclusiveContent.title': 'Exclusive Content',
    'features.exclusiveContent.description': 'Unique articles about technology, development and experiences.',
    'features.community.title': 'Active Community',
    'features.community.description': 'Connect with other developers and share experiences',
    'features.updates.title': 'Regular Updates',
    'features.updates.description': 'Weekly new content with insights and practical tutorials',
    
    // Stats Section
    'stats.articles': 'Published Articles',
    'stats.readers': 'Active Readers',
    'stats.tutorials': 'Practical Tutorials',
    'stats.rating': 'Rating',
    
    // CTA Section
    'cta.title': 'Ready to start your journey?',
    'cta.subtitle': 'Join the community and get access to exclusive content',
    'cta.signupButton': 'Create Free Account',
    'cta.exploreButton': 'Explore Blog',
    
    // Footer
    'footer.copyright': 'All rights reserved.',
    
    // 404 Page
    '404.title': 'Page not found',
    '404.subtitle': 'Oops! Looks like you got lost.',
    '404.description': 'The page you are looking for does not exist or has been moved.',
    '404.backHome': 'Back to Home',
    '404.exploreBlog': 'Explore Blog',
    
    // Layout/Meta
    'meta.title': 'Kreulich Blog',
    'meta.description': 'Blog about technology, programming and other topics.',
    
    // Cookie Consent
    'cookies.title': 'Cookie Policy',
    'cookies.subtitle': 'Your privacy is important to us',
    'cookies.description': 'We use cookies to improve your experience, analyze site traffic and personalize content. By continuing to browse, you agree to our cookie policy.',
    'cookies.essential.title': 'Essential Cookies',
    'cookies.essential.description': 'Necessary for basic site functionality',
    'cookies.preferences.title': 'Preference Cookies',
    'cookies.preferences.description': 'Store your language and theme settings',
    'cookies.analytics.title': 'Analytics Cookies',
    'cookies.analytics.description': 'Help us understand how you use the site',
    'cookies.marketing.title': 'Marketing Cookies',
    'cookies.marketing.description': 'Used to personalize ads and content',
    'cookies.always': 'Always active',
    'cookies.optional': 'Optional',
    'cookies.accept': 'Accept All',
    'cookies.decline': 'Decline',
    'cookies.settings': 'Settings',
    'cookies.acceptAll': 'Accept All',
    'cookies.declineAll': 'Decline All',
    'cookies.cancel': 'Cancel',
    'cookies.save': 'Save',
    'cookies.settingsDescription': 'Manage your cookie preferences. You can enable or disable different types of cookies according to your preference.',
    'cookies.banner.text': 'Cookies configured',
    'cookies.footer': 'You can change your preferences at any time in settings.',
    
    // Sign In Page
    'signin.title': 'Welcome back',
    'signin.subtitle': 'Enter your credentials to access your account',
    'signin.email': 'Email',
    'signin.emailPlaceholder': 'your@email.com',
    'signin.password': 'Password',
    'signin.passwordPlaceholder': 'Enter your password',
    'signin.rememberMe': 'Remember me',
    'signin.forgotPassword': 'Forgot password?',
    'signin.loginButton': 'Sign In',
    'signin.or': 'or',
    'signin.noAccount': "Don't have an account?",
    'signin.createAccount': 'Create account',
    
    // Sign Up Page
    'signup.title': 'Create your account',
    'signup.subtitle': 'Fill in the data below to start your journey',
    'signup.fullName': 'Full name',
    'signup.fullNamePlaceholder': 'Enter your full name',
    'signup.email': 'Email',
    'signup.emailPlaceholder': 'your@email.com',
    'signup.password': 'Password',
    'signup.passwordPlaceholder': 'Create a secure password',
    'signup.jobRole': 'Job role',
    'signup.jobRolePlaceholder': 'Select your job role',
    'signup.otherJobRole': 'Specify job role',
    'signup.otherJobRolePlaceholder': 'Enter your job role',
    'signup.signupButton': 'Create account',
    'signup.or': 'or',
    'signup.haveAccount': 'Already have an account?',
    'signup.signIn': 'Sign in',
    'signup.jobRoles.developer': 'Developer',
    'signup.jobRoles.softwareEngineer': 'Software Engineer',
    'signup.jobRoles.frontendDeveloper': 'Frontend Developer',
    'signup.jobRoles.backendDeveloper': 'Backend Developer',
    'signup.jobRoles.fullstackDeveloper': 'Full Stack Developer',
    'signup.jobRoles.devopsEngineer': 'DevOps Engineer',
    'signup.jobRoles.dataScientist': 'Data Scientist',
    'signup.jobRoles.productManager': 'Product Manager',
    'signup.jobRoles.uiUxDesigner': 'UI/UX Designer',
    'signup.jobRoles.qaEngineer': 'QA Engineer',
    'signup.jobRoles.techLead': 'Tech Lead',
    'signup.jobRoles.other': 'Other',
    
    // Blog Page
    'blog.highlights': 'Highlights',
    'blog.categories': 'Categories',
    'blog.categoriesDescription': 'Explore our articles organized by category',
    'blog.allPosts': 'All Articles',
    'blog.allPostsDescription': 'Discover all our articles and tutorials',
    'blog.readMore': 'Read more',
    'blog.loadMore': 'Load more articles',
    
    // Newsletter
    'newsletter.title': 'Get our updates',
    'newsletter.description': 'Subscribe to our newsletter and receive the best articles directly in your email.',
    'newsletter.emailLabel': 'Email',
    'newsletter.emailPlaceholder': 'Enter your email',
    'newsletter.consentLabel': 'I authorize receiving emails',
    'newsletter.consentDescription': 'You can unsubscribe at any time.',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.subscribing': 'Subscribing...',
    'newsletter.privacyNote': 'We respect your privacy. We do not share your data with third parties.',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    } else {
      setLanguageState('pt');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
