import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo-wydeline-white.png';

export const Header = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { getItemCount } = useCart();
  const location = useLocation();
  const cartCount = getItemCount();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-luxury-dark/95 backdrop-blur-sm border-b border-luxury-dark">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="block">
            <img src={logo} alt="Maison Wydeline" className="h-8 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/collection"
              className={`text-sm font-medium transition-colors hover:text-luxury-beige ${
                isActive('/collection') ? 'text-luxury-beige' : 'text-white'
              }`}
            >
              {t.nav.collection}
            </Link>
            <Link
              to="/la-marque"
              className={`text-sm font-medium transition-colors hover:text-luxury-beige ${
                isActive('/la-marque') ? 'text-luxury-beige' : 'text-white'
              }`}
            >
              {t.nav.brand}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-luxury-beige ${
                isActive('/contact') ? 'text-luxury-beige' : 'text-white'
              }`}
            >
              {t.nav.contact}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-sm font-medium text-white hover:text-luxury-beige transition-colors"
            aria-label="Toggle language"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
          <button
            className="text-white hover:text-luxury-beige transition-colors"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button
            onClick={() => navigate('/panier')}
            className="text-white hover:text-luxury-beige transition-colors relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-luxury-beige text-luxury-dark"
              >
                {cartCount}
              </Badge>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
