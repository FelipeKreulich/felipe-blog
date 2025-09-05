"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send } from "lucide-react";
import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useElementDimensions } from "@/hooks/useElementDimensions";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Conic gradient effect
  const gradientRef = useRef<HTMLDivElement>(null);
  const [{ width, height, top, left }, measure] = useElementDimensions(gradientRef);
  const gradientX = useMotionValue(0.5);
  const gradientY = useMotionValue(0.5);
  
  const background = useTransform(
    [gradientX, gradientY],
    (values: number[]) =>
      `conic-gradient(from 0deg at calc(${values[0] * 100}% - ${left}px) calc(${values[1] * 100}% - ${top}px), #0cdcf7, #ff0088, #fff312, #0cdcf7)`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isSubscribed) return;

    setIsLoading(true);
    // Simular envio - substitua por sua lógica de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    
    // Reset form
    setEmail("");
    setIsSubscribed(false);
  };

  return (
    <motion.section 
      className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          variants={fadeInUp}
        >
          <Card className="overflow-hidden border-0 shadow-xl">
            <motion.div 
              ref={gradientRef}
              className="relative p-8 text-white overflow-hidden"
              style={{ background }}
              onPointerMove={(e) => {
                if (width && height) {
                  gradientX.set(e.clientX / width);
                  gradientY.set(e.clientY / height);
                }
              }}
              onPointerEnter={() => measure()}
            >
              {/* Overlay to maintain text readability */}
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Mail className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-4">
                  {t('newsletter.title')}
                </h2>
                <p className="text-center text-blue-100 max-w-2xl mx-auto">
                  {t('newsletter.description')}
                </p>
              </div>
            </motion.div>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  variants={fadeInUp}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    {t('newsletter.emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('newsletter.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="flex items-start space-x-3"
                >
                  <Checkbox
                    id="consent"
                    checked={isSubscribed}
                    onCheckedChange={(checked) => setIsSubscribed(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor="consent" 
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {t('newsletter.consentLabel')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('newsletter.consentDescription')}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                >
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 text-base font-medium"
                    disabled={!email || !isSubscribed || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t('newsletter.subscribing')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>{t('newsletter.subscribe')}</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div
                variants={fadeInUp}
                className="mt-6 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  {t('newsletter.privacyNote')}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
