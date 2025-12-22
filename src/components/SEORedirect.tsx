import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mapping catégorie -> URL SEO
const CATEGORY_TO_SEO_URL: Record<string, string> = {
  'Bottines': '/bottines-grande-taille-femme',
  'bottines': '/bottines-grande-taille-femme',
  'Bottes': '/bottes-plates-grande-taille',
  'bottes': '/bottes-plates-grande-taille',
  'Plates': '/chaussures-plates-grande-taille',
  'plates': '/chaussures-plates-grande-taille',
  'Plats': '/chaussures-plates-grande-taille',
  'plats': '/chaussures-plates-grande-taille',
};

/**
 * Hook qui gère les redirections SEO côté client
 * Conserve tous les query params (color, size, sort, page) sauf category
 */
export const useSEORedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Vérifier si on est sur /collection avec un paramètre category
    if (location.pathname !== '/collection') return;

    const currentParams = new URLSearchParams(location.search);
    const category = currentParams.get('category');

    if (!category) return;

    // Trouver l'URL SEO correspondante
    const seoUrl = CATEGORY_TO_SEO_URL[category];
    if (!seoUrl) return;

    // Supprimer category et conserver tous les autres params
    currentParams.delete('category');
    const remainingParams = currentParams.toString();
    const redirectUrl = remainingParams ? `${seoUrl}?${remainingParams}` : seoUrl;

    navigate(redirectUrl, { replace: true });
  }, [location, navigate]);
};

/**
 * Hook pour mettre à jour les meta tags canonical dynamiquement
 */
export const useCanonicalUrl = (path?: string) => {
  const location = useLocation();

  useEffect(() => {
    const canonicalPath = path || location.pathname;
    const canonicalUrl = `https://maisonwydeline.com${canonicalPath}`;
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    
    canonical.href = canonicalUrl;
  }, [path, location.pathname]);
};

/**
 * Hook pour mettre à jour le title et la meta description
 */
export const useSEOMeta = (title: string, description: string) => {
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
  }, [title, description]);
};

export default useSEORedirect;
