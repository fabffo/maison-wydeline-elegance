import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Copy, Check, Gift, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';

interface PopupConfig {
  id: string;
  is_active: boolean;
  title: string;
  subtitle: string;
  cta_label: string;
  rgpd_text: string;
  display_delay_seconds: number;
  display_scroll_percent: number;
  cooldown_days: number;
  include_paths: string[] | null;
  exclude_paths: string[] | null;
}

interface SignupResponse {
  ok: boolean;
  error?: string;
  promo_code?: string;
  promo_type?: string;
  promo_value?: number;
  min_cart_amount?: number;
  ends_at?: string;
  already_subscribed?: boolean;
  already_assigned?: boolean;
}

const emailSchema = z.string().email('Veuillez entrer une adresse email valide');

const STORAGE_KEY = 'newsletter_popup_dismissed_until';

export const NewsletterPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDetails, setPromoDetails] = useState<{
    type?: string;
    value?: number;
    min_cart_amount?: number;
    ends_at?: string;
  }>({});
  const [copied, setCopied] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  // Fetch config
  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('popup_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setConfig(data);
      }
    };

    fetchConfig();
  }, []);

  // Check if popup should be shown
  const shouldShowPopup = useCallback(() => {
    if (!config || !config.is_active) return false;

    // Check cooldown
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        return false;
      }
    }

    // Check excluded paths
    const currentPath = location.pathname;
    if (config.exclude_paths?.some(path => currentPath.startsWith(path))) {
      return false;
    }

    // Check included paths (if specified, only show on those paths)
    if (config.include_paths && config.include_paths.length > 0) {
      if (!config.include_paths.some(path => currentPath.startsWith(path))) {
        return false;
      }
    }

    return true;
  }, [config, location.pathname]);

  // Handle display timing (delay and scroll)
  useEffect(() => {
    if (!config || !shouldShowPopup()) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let hasTriggered = false;

    const triggerPopup = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsOpen(true);
    };

    // Delay trigger
    timeoutId = setTimeout(triggerPopup, config.display_delay_seconds * 1000);

    // Scroll trigger
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= config.display_scroll_percent) {
        triggerPopup();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [config, shouldShowPopup]);

  const handleClose = () => {
    if (!config) return;
    
    // Set cooldown
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() + config.cooldown_days);
    localStorage.setItem(STORAGE_KEY, cooldownDate.toISOString());
    
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setEmailError('');
    setIsSubscribed(false);
    setPromoCode('');
    setPromoDetails({});
    setAlreadySubscribed(false);
    setCopied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const validation = emailSchema.safeParse(email.trim().toLowerCase());
    if (!validation.success) {
      setEmailError(validation.error.errors[0].message);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      // Call edge function
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: {
          email: cleanEmail,
          source_path: location.pathname
        }
      });

      if (error) {
        throw error;
      }

      const response = data as SignupResponse;

      if (!response.ok) {
        setEmailError(response.error || 'Une erreur est survenue');
        return;
      }

      // Success
      setPromoCode(response.promo_code || '');
      setPromoDetails({
        type: response.promo_type,
        value: response.promo_value,
        min_cart_amount: response.min_cart_amount,
        ends_at: response.ends_at
      });
      setAlreadySubscribed(response.already_subscribed || response.already_assigned || false);
      setIsSubscribed(true);

    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Code copié !',
        description: `Le code ${promoCode} a été copié dans votre presse-papier.`
      });
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = promoCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPromoValue = () => {
    if (promoDetails.type === 'percent') return `-${promoDetails.value}%`;
    if (promoDetails.type === 'fixed') return `-${promoDetails.value}€`;
    if (promoDetails.type === 'free_shipping') return 'Livraison offerte';
    return '';
  };

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-background">
        <DialogTitle className="sr-only">{config.title}</DialogTitle>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1 hover:bg-muted transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          {!isSubscribed ? (
            // Form state
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <Gift className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-light text-foreground mb-2">
                  {config.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {config.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email input */}
                <div>
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    className={emailError ? 'border-destructive' : ''}
                    required
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-destructive text-xs mt-1">{emailError}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Inscription...
                    </span>
                  ) : (
                    config.cta_label
                  )}
                </Button>

                {/* RGPD text */}
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {config.rgpd_text}
                </p>
              </form>
            </>
          ) : (
            // Success state
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              
              {alreadySubscribed ? (
                <>
                  <h2 className="text-2xl font-light text-foreground mb-2">
                    Vous êtes déjà inscrit(e) !
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Voici votre code avantage :
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-light text-foreground mb-2">
                    Merci !
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Voici votre avantage exclusif {formatPromoValue()} :
                  </p>
                </>
              )}

              {/* Promo code display */}
              {promoCode && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                    {promoCode}
                  </p>
                  
                  {/* Conditions */}
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    {promoDetails.min_cart_amount && (
                      <p>Valable dès {promoDetails.min_cart_amount}€ d'achat</p>
                    )}
                    {promoDetails.ends_at && (
                      <p>Offre valable jusqu'au {new Date(promoDetails.ends_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="mt-3"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier le code
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* CTA to collection */}
              <a href="/collection">
                <Button className="w-full group">
                  Découvrir la collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
