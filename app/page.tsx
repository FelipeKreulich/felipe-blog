'use client';

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Calendar, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useElementDimensions } from "@/hooks/useElementDimensions";
import { useMetaTags } from "@/hooks/useMetaTags";
import { useRef } from "react";
import ShinyText from '@/components/ShinyText';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  useMetaTags();
  const ctaRef = useRef<HTMLDivElement>(null);
  const [{ width, height, top, left }, measure] = useElementDimensions(ctaRef);
  const gradientX = useMotionValue(0.5);
  const gradientY = useMotionValue(0.5);
  
  const background = useTransform(
    [gradientX, gradientY],
    (values: number[]) =>
      `conic-gradient(from 0deg at calc(${values[0] * 100}% - ${left}px) calc(${values[1] * 100}% - ${top}px), #0cdcf7, #ff0088, #fff312, #0cdcf7)`
  );

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.div variants={fadeInUp}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Badge variant="secondary" className="mb-4">
                {t('hero.badge')}
              </Badge>
            </motion.div>
          </motion.div>
          <motion.h1 className="text-5xl font-bold leading-tight mb-6" variants={fadeInUp}>
            <ShinyText text={t('hero.title')} disabled={false} speed={5} className="" />
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="group" onClick={() => router.push('/signin')}>
                {t('hero.exploreButton')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" onClick={() => router.push('/signup')}>
                {t('hero.signupButton')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={fadeInUp}>
          <h2 className="text-3xl font-bold mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="text-center cursor-pointer h-full">
                <CardHeader>
                  <motion.div 
                    className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <CardTitle>{t('features.exclusiveContent.title')}</CardTitle>
                  <CardDescription>
                    {t('features.exclusiveContent.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="text-center cursor-pointer h-full">
                <CardHeader>
                  <motion.div 
                    className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <CardTitle>{t('features.community.title')}</CardTitle>
                  <CardDescription>
                    {t('features.community.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="text-center cursor-pointer h-full">
                <CardHeader>
                  <motion.div 
                    className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <CardTitle>{t('features.updates.title')}</CardTitle>
                  <CardDescription>
                    {t('features.updates.description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.div 
          className="bg-card rounded-2xl shadow-lg p-8"
          variants={fadeInUp}
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
              <div className="text-muted-foreground">{t('stats.articles')}</div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">5K+</div>
              <div className="text-muted-foreground">{t('stats.readers')}</div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50+</div>
              <div className="text-muted-foreground">{t('stats.tutorials')}</div>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">4.9</div>
              <div className="text-muted-foreground flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                </motion.div>
                {t('stats.rating')}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="container mx-auto px-4 py-20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.div 
          ref={ctaRef}
          className="relative rounded-2xl p-12 text-center text-white overflow-hidden"
          variants={fadeInUp}
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
          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              variants={fadeInUp}
            >
              {t('cta.title')}
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90"
              variants={fadeInUp}
            >
              {t('cta.subtitle')}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="group" onClick={() => router.push('/signup')}>
                  {t('cta.signupButton')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="border-white hover:bg-white hover:text-blue-600" onClick={() => router.push('/signin')}>
                  {t('cta.exploreButton')}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
