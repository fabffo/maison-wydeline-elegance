import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-main.jpg';
import bootsBlackNappa from '@/assets/boots-black-nappa.jpg';
import bootsGreen from '@/assets/boots-green-suede.jpg';
import ankleBootsBordeaux from '@/assets/ankle-boots-bordeaux.jpg';
import ankleBootsBlack from '@/assets/ankle-boots-black.jpg';

const Home = () => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="h-screen snap-start relative flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-6 text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t.hero.subtitle}
          </p>
          <Link to="/collection">
            <Button size="lg" variant="secondary" className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {t.hero.cta}
            </Button>
          </Link>
        </div>
      </section>

      {/* Product Section 1 */}
      <section className="h-screen snap-start relative">
        <img
          src={bootsBlackNappa}
          alt="Bottes noires en nappa"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>

      {/* Values Section */}
      <section className="min-h-screen snap-start bg-luxury-cream py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">{t.values.title}</h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">{t.values.excellence.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.excellence.text}</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">{t.values.elegance.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.elegance.text}</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">{t.values.comfort.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.values.comfort.text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Section 2 - Split */}
      <section className="h-screen snap-start grid md:grid-cols-2">
        <div
          className="bg-cover bg-center"
          style={{ backgroundImage: `url(${bootsGreen})` }}
        />
        <div
          className="bg-cover bg-center"
          style={{ backgroundImage: `url(${ankleBootsBordeaux})` }}
        />
      </section>

      {/* Product Section 3 */}
      <section className="h-screen snap-start relative">
        <img
          src={ankleBootsBlack}
          alt="Bottines noires"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </section>
    </main>
  );
};

export default Home;
