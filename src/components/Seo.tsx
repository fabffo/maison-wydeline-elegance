import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoProps {
  title: string;
  description: string;
  canonical?: string; // Optionnel - sera généré automatiquement si non fourni
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

const BASE_URL = 'https://maisonwydeline.com';

/**
 * Composant SEO réutilisable
 * Injecte dynamiquement les meta tags dans le <head>
 * og:url est TOUJOURS égal à canonical
 * Si canonical n'est pas fourni, il est généré automatiquement depuis location.pathname
 */
export const Seo = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = `${BASE_URL}/og-image.jpg`,
}: SeoProps) => {
  const location = useLocation();
  
  // Générer le canonical automatiquement si non fourni
  // Utilise location.pathname pour obtenir l'URL actuelle sans query string
  const computedCanonical = canonical || `${BASE_URL}${location.pathname}`;
  
  // S'assurer que le canonical ne se termine pas par / sauf pour la home
  const finalCanonical = computedCanonical === `${BASE_URL}/` 
    ? `${BASE_URL}/` 
    : computedCanonical.replace(/\/$/, '');

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
    updateMeta('meta[property="og:title"]', 'content', ogTitle || title);

    // Update og:description
    updateMeta('meta[property="og:description"]', 'content', ogDescription || description);

    // Update og:url - TOUJOURS égal à canonical
    updateMeta('meta[property="og:url"]', 'content', finalCanonical);

    // Update og:image
    updateMeta('meta[property="og:image"]', 'content', ogImage);

    // S'assurer qu'il n'y a pas de noindex
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && robotsMeta.getAttribute('content')?.includes('noindex')) {
      robotsMeta.remove();
    }

    // Cleanup on unmount - ne rien supprimer pour éviter les flashs
    return () => {};
  }, [title, description, finalCanonical, ogTitle, ogDescription, ogImage]);

  return null;
};

export default Seo;
