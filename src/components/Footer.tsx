import { Truck, RotateCcw, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo-wydeline-white.png';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-luxury-dark border-t border-luxury-dark">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-beige/20 mb-4">
              <Truck className="text-luxury-beige" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-white">{t.footer.delivery}</h3>
            <p className="text-sm text-luxury-beige/80">{t.footer.deliveryText}</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-beige/20 mb-4">
              <RotateCcw className="text-luxury-beige" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-white">{t.footer.returns}</h3>
            <p className="text-sm text-luxury-beige/80">{t.footer.returnsText}</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-luxury-beige/20 mb-4">
              <CreditCard className="text-luxury-beige" size={24} />
            </div>
            <h3 className="font-medium mb-2 text-white">{t.footer.payment}</h3>
            <p className="text-sm text-luxury-beige/80">{t.footer.paymentText}</p>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-luxury-beige/20">
          <img src={logo} alt="Maison Wydeline" className="h-6 w-auto mx-auto mb-4" />
          <p className="text-sm text-luxury-beige/80">
            © {new Date().getFullYear()} Maison Wydeline. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
