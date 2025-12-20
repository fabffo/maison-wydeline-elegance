# Structure d'URL SEO - Maison Wydeline

## ✅ Implémenté

### 1. Routes SEO-friendly

| Mot-clé cible | URL |
|---------------|-----|
| bottines grande taille femme | `/bottines-grande-taille-femme` |
| bottes plates grande taille | `/bottes-plates-grande-taille` |
| chaussures plates grande taille | `/chaussures-plates-grande-taille` |
| escarpins grande pointure | `/escarpins-grande-pointure` |
| chaussures femme grande taille | `/chaussures-femme-grande-taille` |

### 2. Redirections automatiques

Les anciennes URLs avec paramètres sont automatiquement redirigées :
- `/collection?category=Bottines` → `/bottines-grande-taille-femme`
- `/collection?category=Bottes` → `/bottes-plates-grande-taille`
- `/collection?category=Plates` → `/chaussures-plates-grande-taille`
- `/collection?category=Slingback` → `/escarpins-grande-pointure`

### 3. Sitemap.xml mis à jour

Toutes les nouvelles URLs sont incluses avec les priorités appropriées.

### 4. Pages catégories avec contenu unique

Chaque page catégorie dispose de :
- Un H1 optimisé SEO
- Une meta description unique
- Un paragraphe de contenu SEO unique
- Des liens internes vers les autres catégories

### 5. Balises canonical dynamiques

Les hooks `useCanonicalUrl` et `useSEOMeta` permettent de gérer dynamiquement :
- La balise `<link rel="canonical">`
- Le `<title>`
- La `<meta name="description">`

## Architecture des fichiers

```
src/
├── components/
│   └── SEORedirect.tsx          # Hooks SEO (canonical, redirects, meta)
├── pages/
│   ├── CategoryPage.tsx         # Pages catégories avec contenu unique
│   ├── Collection.tsx           # Collection avec liens SEO
│   └── Home.tsx                  # Accueil avec maillage interne
└── App.tsx                       # Routes SEO-friendly

public/
└── sitemap.xml                   # Sitemap mis à jour
```

## Bonnes pratiques appliquées

### Maillage interne (~30% du SEO)
- Liens contextuels dans le contenu éditorial (Home.tsx)
- Liens de navigation entre catégories (Collection.tsx, CategoryPage.tsx)
- Ancres optimisées avec mots-clés longue traîne

### Ancres optimisées
- ✅ "bottines grande taille femme" (pas "voir les bottines")
- ✅ "bottes plates grande taille" (pas "cliquez ici")
- ✅ "chaussures femme grande taille" (pas "découvrir")

### Profondeur de lien
- Maximum 2 clics depuis la home page
- Maillage horizontal entre catégories

### Cohérence sémantique
- Cocon sémantique respecté : chaussures → bottines/bottes/plates/escarpins
- Liens vers La Marque pour le savoir-faire portugais

## Pour aller plus loin

### Redirections 301 côté serveur (Vercel/Netlify)

Pour des redirections 301 réelles (meilleures pour le SEO), ajouter dans `vercel.json` :

```json
{
  "redirects": [
    {
      "source": "/collection",
      "has": [{ "type": "query", "key": "category", "value": "Bottines" }],
      "destination": "/bottines-grande-taille-femme",
      "permanent": true
    },
    {
      "source": "/collection",
      "has": [{ "type": "query", "key": "category", "value": "Bottes" }],
      "destination": "/bottes-plates-grande-taille",
      "permanent": true
    }
  ]
}
```

### Schema.org / JSON-LD

Ajouter des données structurées pour les produits et catégories :

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Bottines grande taille femme",
  "description": "...",
  "url": "https://maisonwydeline.com/bottines-grande-taille-femme"
}
```
