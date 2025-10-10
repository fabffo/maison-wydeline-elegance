import { useLanguage } from '@/contexts/LanguageContext';
import ankleBootsBordeaux from '@/assets/ankle-boots-bordeaux.jpg';

const LaMarque = () => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          {t.brand.title}
        </h1>

        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Image */}
          <div className="aspect-[16/9] rounded-lg overflow-hidden">
            <img
              src={ankleBootsBordeaux}
              alt="Maison Wydeline"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Raison d'être */}
          <section>
            <h2 className="text-3xl font-semibold mb-6">{t.brand.reason}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              {t.brand.reasonText}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Trop longtemps privées de choix, de confort ou de style, les grandes pointures 
              méritent des chaussures pensées pour elles.
            </p>
          </section>

          {/* Mission */}
          <section>
            <h2 className="text-3xl font-semibold mb-6">{t.brand.mission}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              {t.brand.missionText}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nos modèles sont pensés pour vous accompagner au fil des saisons, 
              en alliant confort et allure à chaque pas.
            </p>
          </section>

          {/* Values */}
          <section className="bg-luxury-cream rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">{t.values.title}</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">{t.values.excellence.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.values.excellence.text}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">{t.values.elegance.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.values.elegance.text}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">{t.values.comfort.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.values.comfort.text}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LaMarque;
