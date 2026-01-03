import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs/promises";

// Configuration SEO pour les pages à pré-rendre
const SEO_PAGES = [
  {
    path: '/',
    outputFile: 'index.html',
    title: 'Chaussures femme grande taille 41 à 45 – Maison Wydeline',
    description: 'Maison Wydeline propose des chaussures élégantes pour femmes chaussant du 41 au 45, fabriquées au Portugal avec un confort premium.',
    canonical: 'https://maisonwydeline.com/',
    ogTitle: 'Maison Wydeline | Chaussures de Luxe Grandes Pointures',
    ogDescription: 'Excellence artisanale, élégance intemporelle et confort sans compromis pour grandes pointures.',
  },
  {
    path: '/chaussures-femme-grande-taille',
    outputFile: 'chaussures-femme-grande-taille.html',
    title: 'Chaussures Femme Grande Taille 41-45 | Maison Wydeline',
    description: 'Découvrez notre collection complète de chaussures femme grande taille (41 à 45). Bottines, bottes, ballerines fabriquées au Portugal avec confort et élégance.',
    canonical: 'https://maisonwydeline.com/chaussures-femme-grande-taille',
    ogTitle: 'Chaussures Femme Grande Taille | Maison Wydeline',
    ogDescription: 'Collection complète de chaussures grandes pointures pour femme. Qualité artisanale portugaise.',
  },
  {
    path: '/bottines-grande-taille-femme',
    outputFile: 'bottines-grande-taille-femme.html',
    title: 'Bottines Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Bottines élégantes pour femmes en grandes pointures (41 à 45). Cuir de qualité, fabrication portugaise artisanale. Livraison offerte.',
    canonical: 'https://maisonwydeline.com/bottines-grande-taille-femme',
    ogTitle: 'Bottines Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Bottines femme grandes pointures en cuir, fabriquées au Portugal.',
  },
  {
    path: '/bottes-grande-taille-femme',
    outputFile: 'bottes-grande-taille-femme.html',
    title: 'Bottes Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Bottes plates et à talons pour femmes en grandes pointures (41 à 45). Cuir souple, confort optimal. Fabrication artisanale portugaise.',
    canonical: 'https://maisonwydeline.com/bottes-grande-taille-femme',
    ogTitle: 'Bottes Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Bottes femme grandes pointures en cuir, fabriquées au Portugal.',
  },
  {
    path: '/ballerines-grande-taille-femme',
    outputFile: 'ballerines-grande-taille-femme.html',
    title: 'Ballerines Grande Taille Femme 41-45 | Maison Wydeline',
    description: 'Ballerines et chaussures plates pour femmes en grandes pointures (41 à 45). Confort et élégance au quotidien. Fabrication portugaise.',
    canonical: 'https://maisonwydeline.com/ballerines-grande-taille-femme',
    ogTitle: 'Ballerines Grande Taille Femme | Maison Wydeline',
    ogDescription: 'Ballerines et chaussures plates grandes pointures, fabriquées au Portugal.',
  },
  {
    path: '/la-marque',
    outputFile: 'la-marque.html',
    title: 'La Marque | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Découvrez l\'histoire de Maison Wydeline, marque française de chaussures grandes pointures fabriquées artisanalement au Portugal.',
    canonical: 'https://maisonwydeline.com/la-marque',
    ogTitle: 'La Marque | Maison Wydeline',
    ogDescription: 'Notre histoire, nos valeurs et notre engagement pour des chaussures de qualité.',
  },
  {
    path: '/contact',
    outputFile: 'contact.html',
    title: 'Contact | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Contactez Maison Wydeline pour toute question sur nos chaussures grandes pointures. Service client réactif et personnalisé.',
    canonical: 'https://maisonwydeline.com/contact',
    ogTitle: 'Contact | Maison Wydeline',
    ogDescription: 'Contactez notre équipe pour toute question.',
  },
  {
    path: '/guide-des-tailles',
    outputFile: 'guide-des-tailles.html',
    title: 'Guide des Tailles | Maison Wydeline – Chaussures Grandes Pointures',
    description: 'Trouvez votre pointure idéale avec notre guide des tailles. Conseils pour mesurer votre pied et choisir la bonne taille.',
    canonical: 'https://maisonwydeline.com/guide-des-tailles',
    ogTitle: 'Guide des Tailles | Maison Wydeline',
    ogDescription: 'Comment mesurer votre pied et trouver votre pointure.',
  },
];

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
        
        for (const page of SEO_PAGES) {
          let html = indexHtml;
          
          // Remplacer le title
          html = html.replace(
            /<title>[^<]*<\/title>/,
            `<title>${page.title}</title>`
          );
          
          // Remplacer/ajouter meta description
          if (html.includes('<meta name="description"')) {
            html = html.replace(
              /<meta name="description" content="[^"]*"/,
              `<meta name="description" content="${page.description}"`
            );
          } else {
            html = html.replace(
              '</title>',
              `</title>\n    <meta name="description" content="${page.description}" />`
            );
          }
          
          // Ajouter canonical link
          if (!html.includes('<link rel="canonical"')) {
            html = html.replace(
              '</title>',
              `</title>\n    <link rel="canonical" href="${page.canonical}" />`
            );
          } else {
            html = html.replace(
              /<link rel="canonical" href="[^"]*"/,
              `<link rel="canonical" href="${page.canonical}"`
            );
          }
          
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
          
          // Ajouter og:url (égal à canonical)
          if (html.includes('<meta property="og:url"')) {
            html = html.replace(
              /<meta property="og:url" content="[^"]*"/,
              `<meta property="og:url" content="${page.canonical}"`
            );
          } else {
            html = html.replace(
              /<meta property="og:image"/,
              `<meta property="og:url" content="${page.canonical}" />\n    <meta property="og:image"`
            );
          }
          
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
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && seoStaticPages(),
  ].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
