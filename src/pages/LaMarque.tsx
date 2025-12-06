import { useLanguage } from '@/contexts/LanguageContext';
import quiSommesNousImg from '@/assets/qui-sommes-nous.png';
import maisonEngageeImg from '@/assets/maison-engagee.png';
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
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={quiSommesNousImg}
                alt="Collection Maison Wydeline"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">QUI SOMMES NOUS</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4 italic">
                À nos chères clientes,
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                «Se chausser sans compromis — sans se demander si sa taille existera dans le modèle de ses rêves — c'est ce qui a poussé Wydeline à créer, avec son équipe, une marque dédiée aux femmes chaussant du 41 au 45.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Maison Wydeline est née de cette volonté : offrir à toutes des chaussures élégantes, confortables et durables, conçues avec soin et pensées pour sublimer chaque silhouette.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Maison Wydeline, c'est avant tout une histoire de confiance — celle que l'on accorde à une marque, mais surtout celle que l'on cultive envers soi-même.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                C'est aussi une question de place : la vôtre.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Parce que vous comptez, parce que vous méritez de trouver votre style, votre confort et votre taille sans concession, nous pensons à vous chaque jour.
              </p>
            </div>
          </section>

          {/* Maison engagée - Image gauche, texte droite */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={maisonEngageeImg}
                alt="Bottines bordeaux Maison Wydeline"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">MAISON ENGAGÉE</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Chez Maison Wydeline, l'élégance rime avec responsabilité.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Nous nous engageons à faire, avec nos moyens et notre taille, le meilleur pour nos clientes et pour notre environnement.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Nos chaussures, nos étuis et nos boîtes sont fabriqués en Europe, dans des ateliers que nous avons personnellement visités.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Chaque détail de nos colis est pensé pour limiter notre empreinte écologique : aucun plastique inutile, des matériaux durables, et une production raisonnée.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nous savons que le chemin du progrès est continu. Notre promesse : avancer, évoluer et toujours faire mieux.
              </p>
            </div>
          </section>

          {/* Nos valeurs - Image gauche, texte droite */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={nosValeursImg}
                alt="Ballerines blanches Maison Wydeline"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-medium mb-6">{t.values.title}</h2>
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
