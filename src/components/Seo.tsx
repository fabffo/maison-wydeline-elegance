import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoConfig, getCanonicalUrl, BASE_URL } from '@/config/seoConfig';

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * Composant SEO réutilisable
 * Injecte dynamiquement les meta tags dans le <head>
 * 
 * IMPORTANT: Pour le pré-rendu SSG, les valeurs par défaut sont récupérées
 * depuis la configuration centralisée (seoConfig.ts) basée sur le pathname
 * 
 * og:url est TOUJOURS égal à canonical
 */
export const Seo = ({
  title: titleProp,
  description: descriptionProp,
  canonical: canonicalProp,
  ogTitle: ogTitleProp,
  ogDescription: ogDescriptionProp,
  ogImage,
}: SeoProps) => {
  const location = useLocation();
  
  // Récupérer la config SEO depuis le fichier centralisé si disponible
  const seoConfig = getSeoConfig(location.pathname);
  
  // Utiliser les props fournis ou les valeurs de la config centralisée
  const title = titleProp || seoConfig?.title || 'Maison Wydeline | Chaussures de Luxe Grandes Pointures';
  const description = descriptionProp || seoConfig?.description || 'Excellence artisanale pour grandes pointures.';
  const ogTitle = ogTitleProp || seoConfig?.ogTitle || title;
  const ogDescription = ogDescriptionProp || seoConfig?.ogDescription || description;
  const finalOgImage = ogImage || seoConfig?.ogImage || `${BASE_URL}/og-image.jpg`;
  
  // Générer le canonical automatiquement depuis le pathname
  const finalCanonical = canonicalProp || getCanonicalUrl(location.pathname);

  useEffect(() => {
    // Update title
    document.title = title;

    // Helper pour créer ou mettre à jour une meta tag
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (selector.includes('property=')) {
          meta.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        } else if (selector.includes('name=')) {
          meta.name = selector.match(/name="([^"]+)"/)?.[1] || '';
        }
        document.head.appendChild(meta);
      }
      meta.content = value;
    };

    // Update meta description
    updateMeta('meta[name="description"]', 'content', description);

    // Update canonical - supprimer l'ancien et créer le nouveau
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = finalCanonical;
    document.head.appendChild(canonicalLink);

    // Update og:title
    updateMeta('meta[property="og:title"]', 'content', ogTitle);

    // Update og:description
    updateMeta('meta[property="og:description"]', 'content', ogDescription);

    // Update og:url - TOUJOURS égal à canonical
    updateMeta('meta[property="og:url"]', 'content', finalCanonical);

    // Update og:image
    updateMeta('meta[property="og:image"]', 'content', finalOgImage);

    // S'assurer qu'il n'y a pas de noindex
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && robotsMeta.getAttribute('content')?.includes('noindex')) {
      robotsMeta.remove();
    }

    // Cleanup on unmount - ne rien supprimer pour éviter les flashs
    return () => {};
  }, [title, description, finalCanonical, ogTitle, ogDescription, finalOgImage]);

  return null;
};

export default Seo;
