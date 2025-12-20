# Structure d'URL SEO - Maison Wydeline

## Structure actuelle (avec paramètres)

```
/collection?category=Bottines
/collection?category=Bottes
/collection?category=Plates
/collection?category=Slingback
```

## Structure cible (SEO-friendly)

### URLs recommandées par catégorie

| Mot-clé cible | URL actuelle | URL cible |
|---------------|--------------|-----------|
| bottines grande taille femme | `/collection?category=Bottines` | `/bottines-grande-taille-femme` |
| bottes plates grande taille | `/collection?category=Bottes` | `/bottes-plates-grande-taille` |
| chaussures femme grande taille | `/collection` | `/chaussures-femme-grande-taille` |
| chaussures plates grande taille | `/collection?category=Plates` | `/chaussures-plates-grande-taille` |
| escarpins grande pointure | `/collection?category=Slingback` | `/escarpins-grande-pointure` |

## Implémentation technique (React Router)

```tsx
// Dans App.tsx - Routes SEO-friendly
<Route path="/bottines-grande-taille-femme" element={<Collection defaultCategory="Bottines" />} />
<Route path="/bottes-plates-grande-taille" element={<Collection defaultCategory="Bottes" />} />
<Route path="/chaussures-plates-grande-taille" element={<Collection defaultCategory="Plates" />} />
<Route path="/escarpins-grande-pointure" element={<Collection defaultCategory="Slingback" />} />

// Garder les anciennes URLs pour rétrocompatibilité
<Route path="/collection" element={<Collection />} />
```

## Bonnes pratiques SEO appliquées

### 1. Ancres optimisées
- Utiliser des mots-clés longue traîne dans les ancres
- Éviter les ancres génériques ("cliquez ici", "en savoir plus")
- Varier les ancres pour éviter la sur-optimisation

### 2. Profondeur de lien
- Maximum 3 clics depuis la home page
- Maillage horizontal entre catégories similaires
- Liens contextuels dans le contenu éditorial

### 3. Cohérence sémantique
- Lier les pages thématiquement proches
- Respecter le cocon sémantique (chaussures → bottines → bottines cuir)
- Éviter les liens vers des pages non pertinentes

### 4. Attributs des liens
- Utiliser `rel="nofollow"` uniquement pour les liens externes non approuvés
- Pas de `rel="nofollow"` sur les liens internes
- Pas de `target="_blank"` sur les liens internes

## Exemple de bloc SEO avec maillage

```tsx
<p>
  Découvrez notre collection de{" "}
  <Link to="/bottines-grande-taille-femme">
    bottines grande taille femme
  </Link>{" "}
  fabriquées au Portugal. Nos{" "}
  <Link to="/bottes-plates-grande-taille">
    bottes plates grande taille
  </Link>{" "}
  allient confort et élégance pour toutes les occasions.
</p>
```

## Prochaines étapes

1. [ ] Implémenter les routes SEO-friendly
2. [ ] Ajouter les redirections 301 (anciennes URLs → nouvelles)
3. [ ] Mettre à jour le sitemap.xml
4. [ ] Créer des pages catégories avec contenu unique
5. [ ] Ajouter les balises canonical
