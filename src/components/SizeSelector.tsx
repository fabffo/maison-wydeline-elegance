import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SizeSelectorProps {
  sizes: number[];
  stock: Record<string, number>;
  selectedSize: number | null;
  onSizeSelect: (size: number) => void;
  lowStockThreshold?: number;
}

export const SizeSelector = ({ sizes, stock, selectedSize, onSizeSelect, lowStockThreshold = 3 }: SizeSelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{t.product.selectSize}</label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const sizeStock = stock[size.toString()] || 0;
          const isAvailable = sizeStock > 0;
          const isLowStock = sizeStock > 0 && sizeStock <= lowStockThreshold;
          const isSelected = selectedSize === size;

          const button = (
            <Button
              key={size}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSizeSelect(size)}
              className={cn(
                'w-16 h-10 transition-all',
                !isAvailable && 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground',
                isLowStock && isAvailable && 'border-orange-500'
              )}
              aria-disabled={!isAvailable}
              aria-label={`${t.product.size} ${size}${!isAvailable ? ' - Indisponible' : isLowStock ? ` - Plus que ${sizeStock}` : ''}`}
            >
              {size}
            </Button>
          );

          if (!isAvailable) {
            return (
              <TooltipProvider key={size}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Indisponible</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          if (isLowStock) {
            return (
              <TooltipProvider key={size}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Plus que {sizeStock} en stock</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return button;
        })}
      </div>
    </div>
  );
};
