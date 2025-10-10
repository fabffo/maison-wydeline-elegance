import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo-wydeline.png';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="block">
            <img src={logo} alt="Maison Wydeline" className="h-8 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/collection"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/collection') ? 'text-primary' : 'text-foreground'
              }`}
            >
              {t.nav.collection}
            </Link>
            <Link
              to="/la-marque"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/la-marque') ? 'text-primary' : 'text-foreground'
              }`}
            >
              {t.nav.brand}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-foreground'
              }`}
            >
              {t.nav.contact}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            aria-label="Toggle language"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button
            className="text-foreground hover:text-primary transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </nav>
    </header>
  );
};
