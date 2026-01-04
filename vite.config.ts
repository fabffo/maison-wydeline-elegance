import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs/promises";
import { SEO_PAGES as APP_SEO_PAGES, getCanonicalUrl, BASE_URL } from "./src/config/seoConfig";

// Configuration SEO pour les pages à pré-rendre
// Source of truth: src/config/seoConfig.ts
const SEO_STATIC_PAGES = APP_SEO_PAGES.map((p) => {
  const canonical = getCanonicalUrl(p.path);
  const outputFile = p.path === "/" ? "index.html" : `${p.path.replace(/^\//, "")}.html`;

  return {
    path: p.path,
    outputFile,
    title: p.title,
    description: p.description,
    canonical,
    ogTitle: p.ogTitle ?? p.title,
    ogDescription: p.ogDescription ?? p.description,
    ogImage: p.ogImage ?? `${BASE_URL}/og-image.jpg`,
  };
});

/**
 * Plugin Vite pour générer des fichiers HTML statiques avec SEO
 * Crée des copies de index.html avec les meta tags SEO spécifiques à chaque page
 */
function seoStaticPages(): Plugin {
  return {
    name: 'vite-plugin-seo-static-pages',
    apply: 'build' as const,
    enforce: 'post',
    async closeBundle() {
      console.log('\n🔍 Generating SEO static HTML pages...');
      
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.resolve(distDir, 'index.html');
      
      try {
        // Lire le template index.html généré
        let indexHtml = await fs.readFile(indexPath, 'utf-8');
        
        for (const page of SEO_STATIC_PAGES) {
          let html = indexHtml;
          
          // Remplacer le title
          html = html.replace(
            /<title>[^<]*<\/title>/,
            `<title>${page.title}</title>`
          );
          
          // Remplacer meta description
          html = html.replace(
            /<meta name="description" content="[^"]*"/,
            `<meta name="description" content="${page.description}"`
          );
          
          // Remplacer canonical link
          html = html.replace(
            /<link rel="canonical" href="[^"]*"/,
            `<link rel="canonical" href="${page.canonical}"`
          );
          
          // Mettre à jour og:title
          html = html.replace(
            /<meta property="og:title" content="[^"]*"/,
            `<meta property="og:title" content="${page.ogTitle}"`
          );
          
          // Mettre à jour og:description
          html = html.replace(
            /<meta property="og:description" content="[^"]*"/,
            `<meta property="og:description" content="${page.ogDescription}"`
          );
          
          // Mettre à jour og:url (égal à canonical)
          html = html.replace(
            /<meta property="og:url" content="[^"]*"/,
            `<meta property="og:url" content="${page.canonical}"`
          );

          // Mettre à jour og:image si disponible
          html = html.replace(
            /<meta property="og:image" content="[^"]*"/,
            `<meta property="og:image" content="${page.ogImage}"`
          );
          
          // Écrire le fichier HTML
          const outputPath = path.resolve(distDir, page.outputFile);
          await fs.writeFile(outputPath, html, 'utf-8');
          console.log(`✅ Generated: ${page.outputFile}`);
        }
        
        console.log('🎉 SEO static pages generation complete!\n');
      } catch (err) {
        console.error('❌ SEO generation error:', err);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    command === "serve" && mode === "development" && componentTagger(),
    command === "build" && seoStaticPages(),
  ].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
