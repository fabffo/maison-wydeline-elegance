import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * Composant SEO réutilisable
 * Injecte dynamiquement les meta tags dans le <head>
 * og:url est TOUJOURS égal à canonical
 */
export const Seo = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = 'https://maisonwydeline.com/og-image.jpg',
}: SeoProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;

    // Update canonical - supprimer l'ancien et créer le nouveau
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonical;
    document.head.appendChild(canonicalLink);

    // Update og:title
    let ogTitleMeta = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (!ogTitleMeta) {
      ogTitleMeta = document.createElement('meta');
      ogTitleMeta.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleMeta);
    }
    ogTitleMeta.content = ogTitle || title;

    // Update og:description
    let ogDescMeta = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (!ogDescMeta) {
      ogDescMeta = document.createElement('meta');
      ogDescMeta.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescMeta);
    }
    ogDescMeta.content = ogDescription || description;

    // Update og:url - TOUJOURS égal à canonical
    let ogUrlMeta = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.content = canonical;

    // Update og:image
    let ogImageMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
    if (!ogImageMeta) {
      ogImageMeta = document.createElement('meta');
      ogImageMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImageMeta);
    }
    ogImageMeta.content = ogImage;

    // S'assurer qu'il n'y a pas de noindex
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && robotsMeta.getAttribute('content')?.includes('noindex')) {
      robotsMeta.remove();
    }

    // Cleanup on unmount - ne rien supprimer pour éviter les flashs
    return () => {};
  }, [title, description, canonical, ogTitle, ogDescription, ogImage]);

  return null;
};

export default Seo;
