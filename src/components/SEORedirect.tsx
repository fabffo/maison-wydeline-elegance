import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mapping des anciennes URLs vers les nouvelles URLs SEO-friendly
const REDIRECT_MAP: Record<string, string> = {
  '/collection?category=Bottines': '/bottines-grande-taille-femme',
  '/collection?category=Bottes': '/bottes-plates-grande-taille',
  '/collection?category=Plates': '/chaussures-plates-grande-taille',
  '/collection?category=Slingback': '/escarpins-grande-pointure',
};

/**
 * Composant qui gère les redirections 301 côté client
 * Pour une vraie redirection 301, il faudrait configurer le serveur (nginx, Vercel, etc.)
 */
export const useSEORedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fullPath = `${location.pathname}${location.search}`;
    
    // Vérifier si l'URL actuelle doit être redirigée
    for (const [oldUrl, newUrl] of Object.entries(REDIRECT_MAP)) {
      if (fullPath === oldUrl || fullPath.startsWith(oldUrl + '&')) {
        // Préserver les autres paramètres de recherche
        const currentParams = new URLSearchParams(location.search);
        currentParams.delete('category');
        
        const remainingParams = currentParams.toString();
        const redirectUrl = remainingParams ? `${newUrl}?${remainingParams}` : newUrl;
        
        navigate(redirectUrl, { replace: true });
        return;
      }
    }
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
