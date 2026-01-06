import { Link } from 'react-router-dom';

interface SeoCategoryContentProps {
  slug: string;
}

// Contenu SEO éditorial par catégorie
const SEO_CONTENT: Record<string, {
  sections: Array<{
    h2: string;
    paragraphs: string[];
  }>;
  internalLinks?: {
    text: string;
    links: Array<{ href: string; label: string }>;
  };
}> = {
  'ballerines-grande-taille-femme': {
    sections: [
      {
        h2: 'Ballerines grandes pointures : élégance et confort du 41 au 45',
        paragraphs: [
          'Les ballerines grandes pointures sont une alternative idéale pour les femmes qui recherchent des chaussures plates élégantes sans compromis sur le confort. Chez Maison Wydeline, chaque modèle est conçu pour offrir un chaussant adapté, un bon maintien et une silhouette raffinée, même en pointure 44 ou 45. Nos ballerines grande taille femme accompagnent aussi bien le quotidien professionnel que les moments plus décontractés.',
        ],
      },
      {
        h2: 'Des ballerines grande taille fabriquées au Portugal',
        paragraphs: [
          'Toutes nos ballerines grande taille pour femme sont fabriquées au Portugal, dans des ateliers sélectionnés pour leur savoir-faire artisanal. Nous privilégions des cuirs de qualité, des semelles confortables et des finitions soignées afin de proposer des chaussures durables, élégantes et agréables à porter au fil des saisons.',
        ],
      },
      {
        h2: 'Ballerines femme du 41 au 45 pensées pour le quotidien',
        paragraphs: [
          'Disponibles du 41 au 45, nos ballerines femme grande taille sont pensées pour répondre aux besoins des femmes aux grandes pointures. Que vous cherchiez des ballerines pour le travail, les sorties ou la vie quotidienne, la collection Maison Wydeline allie style intemporel et confort longue durée.',
        ],
      },
    ],
    internalLinks: {
      text: 'Découvrez également notre collection complète de',
      links: [
        { href: '/chaussures-femme-grande-taille', label: 'chaussures femme grande taille' },
        { href: '/bottines-grande-taille-femme', label: 'bottines grande taille élégantes' },
      ],
    },
  },
  // Extensible : ajouter d'autres catégories ici
};

export const SeoCategoryContent = ({ slug }: SeoCategoryContentProps) => {
  const content = SEO_CONTENT[slug];
  
  if (!content) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="max-w-3xl mx-auto space-y-10">
        {content.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h2 className="text-xl md:text-2xl font-medium text-foreground/90">
              {section.h2}
            </h2>
            {section.paragraphs.map((paragraph, pIndex) => (
              <p 
                key={pIndex} 
                className="text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        {content.internalLinks && (
          <p className="text-muted-foreground leading-relaxed">
            {content.internalLinks.text}{' '}
            {content.internalLinks.links.map((link, index) => (
              <span key={link.href}>
                <Link 
                  to={link.href}
                  className="text-primary hover:underline underline-offset-2"
                >
                  {link.label}
                </Link>
                {index < content.internalLinks!.links.length - 1 && ' ainsi que nos '}
              </span>
            ))}
            {' pour toutes les saisons.'}
          </p>
        )}
      </div>
    </section>
  );
};
