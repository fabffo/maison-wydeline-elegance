# Documentation Base de Données - Maison Wydeline

## Vue d'ensemble

La base de données Maison Wydeline est une plateforme e-commerce complète pour la vente de chaussures de luxe en grandes tailles (41-46). Elle utilise PostgreSQL via Supabase avec Row Level Security (RLS) pour la sécurité des données.

**Date de documentation :** 18 décembre 2025

---

## Architecture des Tables

### 📦 Catalogue Produits

#### `products`
Table principale des produits.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT | Identifiant unique (ex: `mw-bottes-noires-nappa`) |
| `name` | TEXT | Nom commercial du produit |
| `category` | TEXT | Catégorie (`Bottes`, `Bottines`, `Plats`, `Slingbacks`) |
| `price` | NUMERIC | Prix en euros |
| `description` | TEXT | Description longue avec détails marketing |
| `color` | TEXT | Couleur principale |
| `material` | TEXT | Matière (`Cuir`, `Cuir Nappa`, `Daim`) |
| `slug` | TEXT | URL-friendly identifier |
| `alt_text` | TEXT | Texte alternatif pour accessibilité |
| `tags` | TEXT[] | Tags pour recherche et filtrage |
| `tva_rate_id` | UUID | Référence vers `tva_rates` |
| `heel_height_cm` | NUMERIC | Hauteur du talon en cm |
| `characteristics` | JSONB | Caractéristiques détaillées (Bout, Talon, Matière, etc.) |
| `reference_fournisseur` | TEXT | Référence chez le fournisseur |
| `description_fournisseur` | TEXT | Description technique fournisseur |
| `is_featured` | BOOLEAN | Produit mis en avant |
| `featured_priority` | INTEGER | Priorité d'affichage |
| `featured_area` | TEXT | Zone de mise en avant |
| `featured_label` | TEXT | Label promotionnel |
| `featured_start_at` | TIMESTAMPTZ | Début de mise en avant |
| `featured_end_at` | TIMESTAMPTZ | Fin de mise en avant |
| `preorder` | BOOLEAN | Disponible en précommande |
| `preorder_pending_count` | INTEGER | Nombre de précommandes en attente |
| `preorder_notification_threshold` | INTEGER | Seuil pour notifier le backoffice |
| `preorder_notification_sent` | BOOLEAN | Notification envoyée |

**RLS Policies :**
- Public : Lecture seule
- Admin/Backoffice : CRUD complet

---

#### `product_variants`
Gestion des tailles et stocks par produit.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `product_id` | TEXT | Référence produit |
| `size` | INTEGER | Taille (41-46) |
| `stock_quantity` | INTEGER | Quantité en stock |
| `alert_threshold` | INTEGER | Seuil d'alerte stock bas (défaut: 5) |
| `low_stock_threshold` | INTEGER | Seuil stock très bas (défaut: 3) |

**Particularité :** La gamme de tailles est 41-46 (grandes tailles).

---

#### `product_images`
Images associées aux produits.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `product_id` | TEXT | Référence produit |
| `image_url` | TEXT | URL publique de l'image |
| `storage_path` | TEXT | Chemin dans Supabase Storage |
| `position` | INTEGER | Ordre d'affichage (0 = principale) |

**Storage Bucket :** `product-images` (public)

---

### 🛒 Commandes

#### `orders`
Commandes clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence utilisateur (nullable pour guests) |
| `customer_email` | TEXT | Email client |
| `customer_name` | TEXT | Nom client |
| `status` | ENUM | Statut de commande |
| `total_amount` | NUMERIC | Montant total en euros |
| `currency` | TEXT | Devise (défaut: EUR) |
| `shipping_address` | JSONB | Adresse de livraison |
| `stripe_payment_intent_id` | TEXT | ID Stripe |

**Statuts disponibles (`order_status`) :**
- `PENDING` - En attente de paiement
- `PAID` - Payée
- `CANCELLED` - Annulée
- `REFUNDED` - Remboursée
- `A_PREPARER` - À préparer
- `EXPEDIE` - Expédiée
- `LIVRE` - Livrée
- `RETOUR` - Retour

---

#### `order_items`
Articles d'une commande.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `order_id` | UUID | Référence commande |
| `product_id` | TEXT | Référence produit |
| `product_name` | TEXT | Nom du produit (snapshot) |
| `size` | INTEGER | Taille commandée |
| `quantity` | INTEGER | Quantité |
| `unit_price` | NUMERIC | Prix unitaire |
| `total_price` | NUMERIC | Prix total ligne |
| `is_preorder` | BOOLEAN | Article en précommande |

---

### 📄 Facturation

#### `invoices`
Factures générées.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `order_id` | UUID | Référence commande |
| `invoice_number` | TEXT | Numéro de facture (MW-YYYY-XXXXXX) |
| `invoice_date` | TIMESTAMPTZ | Date de facturation |
| `pdf_url` | TEXT | URL du PDF (si stocké) |

**Format numéro :** `MW-2025-000001` (année + séquence 6 chiffres)

---

#### `tva_rates`
Taux de TVA applicables.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | TEXT | Nom du taux |
| `rate` | NUMERIC | Taux en % |
| `description` | TEXT | Description |
| `is_default` | BOOLEAN | Taux par défaut |

**Taux configurés :**
- **TVA 20%** (défaut) - Chaussures, vêtements
- TVA 10% - Restauration, transports
- TVA 5.5% - Alimentation, livres
- TVA 2.1% - Médicaments, presse
- Exonéré - TVA non applicable

---

### 📦 Logistique

#### `shipments`
Expéditions.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `order_id` | UUID | Référence commande |
| `carrier` | TEXT | Transporteur |
| `tracking_number` | TEXT | Numéro de suivi |
| `shipment_date` | TIMESTAMPTZ | Date d'expédition |
| `delivery_date` | TIMESTAMPTZ | Date de livraison |
| `notes` | TEXT | Notes internes |

**Trigger :** Met à jour automatiquement le statut commande (`EXPEDIE` / `LIVRE`)

---

#### `stock_movements`
Historique des mouvements de stock.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `product_id` | TEXT | Référence produit |
| `size` | INTEGER | Taille concernée |
| `quantity_change` | INTEGER | Variation (+/-) |
| `movement_type` | TEXT | Type (`SALE`, `ADJUSTMENT`, etc.) |
| `reference_id` | UUID | ID de référence (commande) |
| `created_by` | UUID | Utilisateur ayant créé |
| `notes` | TEXT | Notes |

---

### 👤 Utilisateurs

#### `profiles`
Profils utilisateurs (extension de auth.users).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID utilisateur (= auth.users.id) |
| `first_name` | TEXT | Prénom |
| `last_name` | TEXT | Nom |

**Trigger :** Créé automatiquement à l'inscription via `handle_new_user()`

---

#### `user_roles`
Rôles assignés aux utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Référence utilisateur |
| `role` | ENUM | Rôle assigné |

**Rôles disponibles (`app_role`) :**
- `ADMIN` - Administrateur complet
- `BACKOFFICE` - Gestion opérationnelle
- `USER` - Client standard

---

### 📧 Communication

#### `notifications`
Notifications internes (admin/backoffice).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Destinataire |
| `type` | TEXT | Type de notification |
| `title` | TEXT | Titre |
| `message` | TEXT | Contenu |
| `reference_id` | UUID | ID de référence |
| `read` | BOOLEAN | Lu/Non lu |

**Types :** `ORDER_CREATED`, `INVOICE_GENERATED`, `PREORDER_THRESHOLD`

---

#### `email_logs`
Journal des emails envoyés.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email_type` | TEXT | Type d'email |
| `recipient_email` | TEXT | Destinataire |
| `subject` | TEXT | Sujet |
| `status` | TEXT | Statut (sent/failed) |
| `error_message` | TEXT | Message d'erreur si échec |
| `metadata` | JSONB | Données additionnelles |

**Types :** `ORDER_CONFIRMATION`, `INVOICE`, `CONTACT`

---

#### `contact_recipients`
Destinataires des emails de contact.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | TEXT | Nom |
| `email` | TEXT | Adresse email |
| `is_active` | BOOLEAN | Actif |

---

#### `newsletter_subscribers`
Abonnés à la newsletter.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | TEXT | Adresse email |
| `is_active` | BOOLEAN | Actif |
| `source` | TEXT | Source d'inscription |
| `subscribed_at` | TIMESTAMPTZ | Date d'inscription |

---

## Fonctions Database

### `generate_invoice_number()`
Génère un numéro de facture unique au format `MW-YYYY-XXXXXX`.

### `has_role(user_id UUID, role app_role)`
Vérifie si un utilisateur possède un rôle spécifique.

### `reserve_stock_for_order(order_id UUID)`
Réserve le stock pour une commande et enregistre les mouvements.

### `notify_admins(type, title, message, reference_id)`
Crée des notifications pour tous les admins/backoffice.

### `notify_backoffice(type, title, message, reference_id)`
Crée des notifications uniquement pour le backoffice.

### `increment_preorder_count(product_id, quantity)`
Incrémente le compteur de précommandes et notifie si seuil atteint.

### `handle_new_user()`
Trigger : crée automatiquement un profil lors de l'inscription.

### `update_order_status_from_shipment()`
Trigger : met à jour le statut commande selon l'expédition.

---

## Sécurité (Row Level Security)

Toutes les tables ont RLS activé avec des politiques basées sur :

1. **Lecture publique** : `products`, `product_variants`, `product_images`, `tva_rates`
2. **Lecture propriétaire** : `orders`, `order_items`, `invoices`, `profiles`, `notifications`
3. **Admin/Backoffice** : Accès complet aux données de gestion
4. **Insertion publique** : `newsletter_subscribers` (inscription), `orders` (achat guest)

---

## Edge Functions

| Fonction | Description |
|----------|-------------|
| `create-checkout` | Crée une session Stripe Checkout |
| `stripe-webhook` | Reçoit les webhooks Stripe |
| `send-order-confirmation` | Envoie email de confirmation |
| `send-invoice` | Envoie la facture par email |
| `send-contact-email` | Gère le formulaire de contact |
| `send-auth-email` | Emails d'authentification |
| `create-admin-user` | Création d'utilisateurs admin |

---

## Intégrations

- **Stripe** : Paiements et webhooks
- **Resend** : Envoi d'emails transactionnels
- **Supabase Storage** : Stockage des images produits

---

## Statistiques Actuelles (18/12/2025)

| Table | Nombre d'enregistrements |
|-------|--------------------------|
| Produits | 9 |
| Variantes (tailles) | ~54 |
| Commandes | ~45 |
| Factures | 21 |
| Utilisateurs | 11 |
| Abonnés newsletter | 1 |
