import { useLanguage } from '@/contexts/LanguageContext';
import ankleBootsBordeaux from '@/assets/ankle-boots-bordeaux.jpg';

const LaMarque = () => {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="mx-auto px-8 md:px-12 lg:px-16">
        <h1 className="text-4xl md:text-5xl font-medium text-center mb-16">
          {t.brand.title}
        </h1>

        <div className="space-y-16">
          {/* Hero Image */}
          <div className="aspect-[16/9] rounded-lg overflow-hidden">
            <img
              src={ankleBootsBordeaux}
              alt="Maison Wydeline"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Qui sommes nous */}
          <section>
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
          </section>

          {/* Maison engagée */}
          <section>
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
          </section>

          {/* Values */}
          <section className="bg-luxury-cream rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-medium mb-8 text-center">{t.values.title}</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-3">{t.values.excellence.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.values.excellence.text}</p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">{t.values.elegance.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{t.values.elegance.text}</p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">{t.values.comfort.title}</h3>
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
