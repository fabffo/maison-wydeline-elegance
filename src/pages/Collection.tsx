import { useLanguage } from '@/contexts/LanguageContext';
import bootsBlackNappa from '@/assets/boots-black-nappa.jpg';
import bootsGreen from '@/assets/boots-green-suede.jpg';
import ankleBootsBordeaux from '@/assets/ankle-boots-bordeaux.jpg';
import ankleBootsBlackSuede from '@/assets/ankle-boots-black-suede.jpg';
import ankleBootsBlack from '@/assets/ankle-boots-black.jpg';
import flatsWhite from '@/assets/flats-white.jpg';
import slingbackBlue from '@/assets/slingback-blue.jpg';

const Collection = () => {
  const { t } = useLanguage();

  const products = [
    { id: 1, image: bootsBlackNappa, name: 'Bottes Nappa Noires', price: '€450' },
    { id: 2, image: bootsGreen, name: 'Bottes Daim Vertes', price: '€420' },
    { id: 3, image: ankleBootsBordeaux, name: 'Bottines Bordeaux', price: '€390' },
    { id: 4, image: ankleBootsBlackSuede, name: 'Bottines Daim Noires', price: '€380' },
    { id: 5, image: ankleBootsBlack, name: 'Bottines Cuir Noires', price: '€395' },
    { id: 6, image: flatsWhite, name: 'Ballerines Blanches', price: '€320' },
    { id: 7, image: slingbackBlue, name: 'Slingback Bleues', price: '€360' },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          {t.nav.collection}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <article key={product.id} className="group cursor-pointer">
              <div className="aspect-[3/4] mb-4 overflow-hidden bg-luxury-cream rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{product.name}</h3>
              <p className="text-muted-foreground">{product.price}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Collection;
