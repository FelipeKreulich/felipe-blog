'use client';

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface FooterProps {
  showAnimations?: boolean;
  className?: string;
}

export function Footer({ showAnimations = true, className = "" }: FooterProps) {
  const { t } = useLanguage();

  const FooterContent = () => (
    <div className="text-center text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} Kreulich Blog. {t('footer.copyright')}</p>
    </div>
  );

  if (showAnimations) {
    return (
      <motion.footer 
        className={`container mx-auto px-4 py-12 border-t ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <FooterContent />
      </motion.footer>
    );
  }

  return (
    <footer className={`container mx-auto px-4 py-12 border-t ${className}`}>
      <FooterContent />
    </footer>
  );
}
