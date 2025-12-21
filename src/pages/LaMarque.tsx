import { useLanguage } from '@/contexts/LanguageContext';
import quiSommesNousImg from '@/assets/qui-sommes-nous.png';
import maisonEngageeImg from '@/assets/maison-engagee.jpg';
import nosValeursImg from '@/assets/nos-valeurs.png';

const LaMarque = () => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto px-8 md:px-12 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-16">
          {t.brand.title}
        </h1>

        <div className="space-y-24">
          {/* Qui sommes nous - Image gauche, texte droite */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={quiSommesNousImg}
                alt="Collection Maison Wydeline"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">{t.brand.whoWeAre}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4 italic">
                {t.brand.whoWeAreDear}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.whoWeAreP1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.whoWeAreP2}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.whoWeAreP3}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.whoWeAreP4}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.brand.whoWeAreP5}
              </p>
            </div>
          </section>

          {/* Maison engagée - Image gauche, texte droite */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <img
              src={maisonEngageeImg}
              alt="Bottines bordeaux Maison Wydeline"
              className="w-full h-auto object-cover rounded-2xl"
            />
            <div>
              <h2 className="text-3xl font-medium mb-6">{t.brand.engaged}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.engagedP1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.engagedP2}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.engagedP3}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                {t.brand.engagedP4}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.brand.engagedP5}
              </p>
            </div>
          </section>

          {/* Nos valeurs - Image gauche, texte droite */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={nosValeursImg}
                alt="Ballerines blanches Maison Wydeline"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">{t.brand.ourValues}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                <span className="font-medium text-foreground">{t.values.excellence.title}</span> — {t.values.excellence.text}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                <span className="font-medium text-foreground">{t.values.elegance.title}</span> — {t.values.elegance.text}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">{t.values.comfort.title}</span> — {t.values.comfort.text}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LaMarque;
