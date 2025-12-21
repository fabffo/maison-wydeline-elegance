# Structure d'URL SEO - Maison Wydeline

## Stratégie SEO principale

**Objectif prioritaire** : Maximiser la visibilité sur "chaussures femme grande taille"

### Architecture SEO

```
Accueil (/) - Branding, pas de requête money
    ↓
Page Pilier (/chaussures-femme-grande-taille) - Requête principale
    ↓
Pages Catégories (requêtes longue traîne)
    ├── /bottines-grande-taille-femme
    ├── /bottes-plates-grande-taille
    └── /chaussures-plates-grande-taille
```

## ✅ Pages implémentées

### 1. Page Pilier (Priority 0.95)

| URL | Fichier | Rôle |
|-----|---------|------|
| `/chaussures-femme-grande-taille` | `PillarPage.tsx` | Page pilier SEO principale |

**Caractéristiques :**
- H1 optimisé : "Chaussures femme grande taille : élégance et confort du 41 au 45"
- Contenu long (~800 mots)
- FAQ intégrée (4 questions)
- Maillage interne vers toutes les catégories + Home + La Marque
- Canonical self
- Indexable

### 2. Pages Catégories (Priority 0.8)

| URL | Catégorie | H1 |
|-----|-----------|-----|
| `/bottines-grande-taille-femme` | Bottines | Bottines grande taille femme |
| `/bottes-plates-grande-taille` | Bottes | Bottes plates grande taille |
| `/chaussures-plates-grande-taille` | Plates | Chaussures plates grande taille |

**Caractéristiques :**
- Title + meta description uniques
- H1 optimisé
- Contenu SEO unique
- Canonical self
- Lien contextuel vers page pilier
- Indexable

### 3. Page Collection (noindex)

| URL | Fichier | Rôle |
|-----|---------|------|
| `/collection` | `Collection.tsx` | Page UX filtres/pagination |

**Caractéristiques :**
- `<meta name="robots" content="noindex, follow">`
- Canonical fixe vers `/collection` (sans paramètres)
- Transmet le jus SEO via liens internes

### 4. Home (/)

**H1 branding** (pas de requête money) :
```
Maison Wydeline – Chaussures du 41 au 45 fabriquées au Portugal
```

**Lien fort vers page pilier** : Oui (section contenu éditorial)

## Maillage interne

### Depuis la page pilier
- → Bottines grande taille femme
- → Bottes plates grande taille
- → Chaussures plates grande taille
- → Accueil
- → La Marque

### Depuis les pages catégories
- → Page pilier (lien contextuel prominent)
- → Autres catégories

### Depuis Collection
- → Page pilier (lien contextuel prominent)
- → Toutes les catégories

### Depuis Home
- → Page pilier (lien contextuel dans contenu éditorial)
- → Collection
- → La Marque

## Sitemap.xml

Priorités configurées :
- Home : 1.0
- Page pilier : 0.95
- Catégories : 0.8
- La Marque : 0.7
- Contact : 0.5

**Note** : `/collection` n'est PAS dans le sitemap car noindex.

## Anti-cannibalisation

| Page | Requête ciblée |
|------|----------------|
| Home | Aucune (branding) |
| Page pilier | "chaussures femme grande taille" |
| Bottines | "bottines grande taille femme" |
| Bottes | "bottes plates grande taille" |
| Plates | "chaussures plates grande taille" |
| Collection | Aucune (noindex) |

## Redirections 301

Configurées dans `SEORedirect.tsx` (client-side) :
- `/collection?category=Bottines` → `/bottines-grande-taille-femme`
- `/collection?category=Bottes` → `/bottes-plates-grande-taille`
- `/collection?category=Plates` → `/chaussures-plates-grande-taille`

### Pour des 301 serveur (Vercel)

```json
{
  "redirects": [
    {
      "source": "/collection",
      "has": [{ "type": "query", "key": "category", "value": "Bottines" }],
      "destination": "/bottines-grande-taille-femme",
      "permanent": true
    }
  ]
}
```

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `src/pages/PillarPage.tsx` | **Nouveau** - Page pilier SEO complète |
| `src/pages/Home.tsx` | H1 branding, lien vers pilier |
| `src/pages/Collection.tsx` | noindex,follow, canonical fixe |
| `src/pages/CategoryPage.tsx` | Lien contextuel vers pilier |
| `src/App.tsx` | Route PillarPage |
| `public/sitemap.xml` | Priorités mises à jour |
