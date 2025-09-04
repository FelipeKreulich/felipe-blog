'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMetaTags } from "@/hooks/useMetaTags";
import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Briefcase } from "lucide-react";
import Waves from "@/components/Waves";

export default function SignUp() {
  const { t } = useLanguage();
  useMetaTags();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [otherJobRole, setOtherJobRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalJobRole = jobRole === 'other' ? otherJobRole : jobRole;
    // TODO: Implement signup logic
    console.log('Signup attempt:', { fullName, email, password, jobRole: finalJobRole });
  };

  const jobRoles = [
    { value: 'developer', label: t('signup.jobRoles.developer') },
    { value: 'software-engineer', label: t('signup.jobRoles.softwareEngineer') },
    { value: 'frontend-developer', label: t('signup.jobRoles.frontendDeveloper') },
    { value: 'backend-developer', label: t('signup.jobRoles.backendDeveloper') },
    { value: 'fullstack-developer', label: t('signup.jobRoles.fullstackDeveloper') },
    { value: 'devops-engineer', label: t('signup.jobRoles.devopsEngineer') },
    { value: 'data-scientist', label: t('signup.jobRoles.dataScientist') },
    { value: 'product-manager', label: t('signup.jobRoles.productManager') },
    { value: 'ui-ux-designer', label: t('signup.jobRoles.uiUxDesigner') },
    { value: 'qa-engineer', label: t('signup.jobRoles.qaEngineer') },
    { value: 'tech-lead', label: t('signup.jobRoles.techLead') },
    { value: 'other', label: t('signup.jobRoles.other') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Empty for future use */}
        <div className="lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 relative overflow-hidden">
          <div className="w-full h-full relative">
            <Waves />
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-bold">
                  {t('signup.title')}
                </CardTitle>
                <CardDescription>
                  {t('signup.subtitle')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      {t('signup.fullName')}
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('signup.fullNamePlaceholder')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t('signup.email')}
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('signup.emailPlaceholder')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t('signup.password')}
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('signup.passwordPlaceholder')}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Job Role Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Label htmlFor="jobRole" className="text-sm font-medium">
                      {t('signup.jobRole')}
                    </Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Select value={jobRole} onValueChange={setJobRole} required>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder={t('signup.jobRolePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {jobRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  {/* Other Job Role Field (conditional) */}
                  {jobRole === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <Label htmlFor="otherJobRole" className="text-sm font-medium">
                        {t('signup.otherJobRole')}
                      </Label>
                      <div className="relative mt-1">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otherJobRole"
                          type="text"
                          value={otherJobRole}
                          onChange={(e) => setOtherJobRole(e.target.value)}
                          placeholder={t('signup.otherJobRolePlaceholder')}
                          className="pl-10"
                          required={jobRole === 'other'}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Sign Up Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <Button type="submit" className="w-full" size="lg">
                      {t('signup.signupButton')}
                    </Button>
                  </motion.div>

                  {/* Divider */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('signup.or')}
                      </span>
                    </div>
                  </motion.div>

                  {/* Sign In Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="text-center"
                  >
                    <span className="text-sm text-muted-foreground">
                      {t('signup.haveAccount')}{' '}
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      className="text-green-600 hover:text-green-700 dark:text-green-400 p-0 h-auto"
                      onClick={() => window.location.href = '/signin'}
                    >
                      {t('signup.signIn')}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
