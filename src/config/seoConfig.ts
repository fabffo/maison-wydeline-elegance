/**
 * Configuration SEO centralisée pour toutes les pages
 * Utilisé pour le pré-rendu SSG et le composant Seo dynamique
 */

const BASE_URL = 'https://maisonwydeline.com';

export interface SeoPageConfig {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export const SEO_PAGES: SeoPageConfig[] = [
  {
    path: '/',
    title: 'Chaussures femme grande taille 41 à 45 – Maison Wydeline',
    description: 'Maison Wydeline propose des chaussures élégantes pour femmes chaussant du 41 au 45, fabriquées au Portugal avec un confort premium.',
    ogTitle: 'Maison Wydeline | Chaussures de Luxe Grandes Pointures',
    ogDescription: 'Excellence artisanale, élégance intemporelle et confort sans compromis pour grandes pointures.',
  },
  {
    path: '/chaussures-femme-grande-taille',
    title: 'Chaussures Femme Grande Taille 41-45 | Maison Wydeline',
    description: 'Découvrez notre collection complète de chaussures femme grande taille (41 à 45). Bottines, bottes, ballerines fabriquées au Portugal avec confort et élégance.',
    ogTitle: 'Chaussures Femme Grande Taille | Maison Wydeline',
    ogDescription: 'Collection complète de chaussures grandes pointures pour femme. Qualité artisanale portugaise.',
  },
  {
    path: '/bottines-grande-taille-femme',
    title: 'Bottines Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Bottines élégantes pour femmes en grandes pointures (41 à 45). Cuir de qualité, fabrication portugaise artisanale. Livraison offerte.',
    ogTitle: 'Bottines Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Bottines femme grandes pointures en cuir, fabriquées au Portugal.',
  },
  {
    path: '/bottes-grande-taille-femme',
    title: 'Bottes Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Bottes plates et à talons pour femmes en grandes pointures (41 à 45). Cuir souple, confort optimal. Fabrication artisanale portugaise.',
    ogTitle: 'Bottes Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Bottes femme grandes pointures en cuir, fabriquées au Portugal.',
  },
  {
    path: '/ballerines-grande-taille-femme',
    title: 'Ballerines Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Ballerines et chaussures plates pour femmes en grandes pointures (41 à 45). Confort et élégance au quotidien. Fabrication portugaise.',
    ogTitle: 'Ballerines Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Ballerines et chaussures plates grandes pointures, fabriquées au Portugal.',
  },
  {
    path: '/la-marque',
    title: 'La Marque | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Découvrez l\'histoire de Maison Wydeline, marque française de chaussures grandes pointures fabriquées artisanalement au Portugal.',
    ogTitle: 'La Marque | Maison Wydeline',
    ogDescription: 'Notre histoire, nos valeurs et notre engagement pour des chaussures de qualité.',
  },
  {
    path: '/contact',
    title: 'Contact | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Contactez Maison Wydeline pour toute question sur nos chaussures grandes pointures. Service client réactif et personnalisé.',
    ogTitle: 'Contact | Maison Wydeline',
    ogDescription: 'Contactez notre équipe pour toute question.',
  },
  {
    path: '/guide-des-tailles',
    title: 'Guide des Tailles | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Trouvez votre pointure idéale avec notre guide des tailles. Conseils pour mesurer votre pied et choisir la bonne taille.',
    ogTitle: 'Guide des Tailles | Maison Wydeline',
    ogDescription: 'Comment mesurer votre pied et trouver votre pointure.',
  },
];

/**
 * Récupère la configuration SEO pour une route donnée
 */
export function getSeoConfig(pathname: string): SeoPageConfig | undefined {
  // Normaliser le pathname (sans trailing slash sauf pour /)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return SEO_PAGES.find(page => page.path === normalizedPath);
}

/**
 * Génère l'URL canonique pour une route
 */
export function getCanonicalUrl(pathname: string): string {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return `${BASE_URL}${normalizedPath}`;
}

export { BASE_URL };
