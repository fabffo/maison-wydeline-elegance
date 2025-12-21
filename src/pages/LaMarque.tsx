import { useLanguage } from '@/contexts/LanguageContext';
import quiSommesNousImg from '@/assets/qui-sommes-nous.png';
import bottinesBordeauxImg from '@/assets/ankle-boots-bordeaux.jpg';
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
              src={bottinesBordeauxImg}
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

          {/* Social Media Section */}
          <section className="bg-luxury-cream rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-medium mb-4">{t.brand.socialTitle}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {t.brand.socialText}
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://www.instagram.com/maisonwydeline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivre Maison Wydeline sur Instagram"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300 font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@maisonwydeline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Suivre Maison Wydeline sur TikTok"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background text-luxury-dark hover:bg-luxury-dark hover:text-white transition-all duration-300 font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                TikTok
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LaMarque;
