import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export const BadgePreorder = () => {
  const { t } = useLanguage();
  
  return (
    <Badge variant="secondary" className="bg-luxury-beige text-luxury-dark">
      {t.product.preorder}
    </Badge>
  );
};
