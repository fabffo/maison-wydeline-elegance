import { Link } from 'react-router-dom';
import { Truck, RotateCcw, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo-wydeline-white.png';

// Instagram SVG Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// TikTok SVG Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-dark/10 mb-4">
              <Truck className="text-luxury-dark" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-foreground">{t.footer.delivery}</h3>
            <p className="text-sm text-muted-foreground">{t.footer.deliveryText}</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-dark/10 mb-4">
              <RotateCcw className="text-luxury-dark" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-foreground">{t.footer.returns}</h3>
            <p className="text-sm text-muted-foreground">{t.footer.returnsText}</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-dark/10 mb-4">
              <CreditCard className="text-luxury-dark" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-foreground">{t.footer.payment}</h3>
            <p className="text-sm text-muted-foreground">{t.footer.paymentText}</p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center pb-12 mb-8 border-b border-border">
          <h3 className="font-medium text-foreground mb-4">{t.footer.followUs}</h3>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/maisonwydeline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivre Maison Wydeline sur Instagram"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-luxury-dark/5 text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@maisonwydeline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suivre Maison Wydeline sur TikTok"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-luxury-dark/5 text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links Section */}
        <div className="text-center pb-8 mb-8 border-b border-border">
          <h3 className="font-medium text-foreground mb-4">Aide</h3>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link 
              to="/guide-des-tailles" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Guide des tailles
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="text-center">
          <img src={logo} alt="Maison Wydeline" className="h-6 w-auto mx-auto mb-4 brightness-0" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Maison Wydeline. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
