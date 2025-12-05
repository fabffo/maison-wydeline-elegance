# Documentation Edge Functions - Modifications du 05/12/2025
## Projet: Wydeline - Gestion TVA dynamique par produit

---

## Résumé des modifications

Les trois Edge Functions suivantes ont été modifiées pour supporter la **TVA dynamique par produit** :

1. `stripe-webhook` - Récupération du taux TVA depuis la base de données
2. `send-order-confirmation` - Affichage dynamique du taux TVA dans les emails et PDFs
3. `send-invoice` - Affichage dynamique du taux TVA dans les factures

---

## 1. stripe-webhook/index.ts

### Chemin
`supabase/functions/stripe-webhook/index.ts`

### Modifications apportées

**Ajout de la récupération du taux TVA depuis la base de données (lignes 127-140) :**

```typescript
// Fetch TVA rate for products (use first item's product)
let tvaRate = 20; // Default
if (orderItems && orderItems.length > 0) {
  const productId = orderItems[0].product_id;
  const { data: product } = await supabase
    .from("products")
    .select("tva_rate_id, tva_rates(rate)")
    .eq("id", productId)
    .maybeSingle();
  
  if (product?.tva_rates) {
    tvaRate = Number((product.tva_rates as any).rate);
  }
}
```

**Transmission du taux TVA à l'email de confirmation (lignes 170-177) :**

```typescript
items: orderItems?.map((item: any) => ({
  productName: item.product_name,
  size: item.size,
  quantity: item.quantity,
  unitPrice: Number(item.unit_price),
  totalPrice: Number(item.total_price),
  tvaRate: tvaRate,  // ← Nouveau champ ajouté
})) || [],
```

---

## 2. send-order-confirmation/index.ts

### Chemin
`supabase/functions/send-order-confirmation/index.ts`

### Modifications apportées

**Interface mise à jour (lignes 27-48) :**

```typescript
interface OrderConfirmationRequest {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    size: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    tvaRate?: number;  // ← Nouveau champ optionnel
  }>;
  totalAmount: number;
  invoiceNumber?: string;
  shippingAddress?: { ... };
}
```

**Calcul dynamique de la TVA dans le PDF (lignes 144-151) :**

```typescript
// TVA calculation - use average rate from items or default to 20%
const avgTvaRate = data.items.length > 0 && data.items[0].tvaRate !== undefined
  ? data.items[0].tvaRate / 100
  : 0.20;
const tvaRateDisplay = avgTvaRate * 100;
const totalHT = data.totalAmount / (1 + avgTvaRate);
const tvaAmount = data.totalAmount - totalHT;
```

**Affichage dynamique dans le PDF (lignes 163-165) :**

```typescript
yPos += 7;
doc.text(`TVA ${tvaRateDisplay}%`, 135, yPos + 2);  // ← Taux dynamique
doc.text(`${tvaAmount.toFixed(2)} €`, 170, yPos + 2);
```

**Calcul dynamique dans l'email HTML (lignes 207-212) :**

```typescript
// Calculate TVA rate from items
const tvaRateValue = items.length > 0 && items[0].tvaRate !== undefined ? items[0].tvaRate : 20;
const tvaMultiplier = 1 + (tvaRateValue / 100);
const totalHT = totalAmount / tvaMultiplier;
const tvaAmount = totalAmount - totalHT;
```

**Affichage dynamique dans l'email (lignes 274-278) :**

```html
<p style="margin: 5px 0;">Total HT : ${totalHT.toFixed(2)} €</p>
<p style="margin: 5px 0;">TVA ${tvaRateValue}% : ${tvaAmount.toFixed(2)} €</p>
<p style="font-size: 18px; font-weight: bold;">Total TTC : ${totalAmount.toFixed(2)} €</p>
```

---

## 3. send-invoice/index.ts

### Chemin
`supabase/functions/send-invoice/index.ts`

### Modifications apportées

**Interface mise à jour (lignes 27-49) :**

```typescript
interface InvoiceEmailRequest {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    size: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    tvaRate?: number;  // ← Nouveau champ optionnel
  }>;
  totalAmount: number;
  shippingAddress?: { ... };
}
```

**Calcul dynamique de la TVA dans le PDF (lignes 142-148) :**

```typescript
// TVA calculation - use average rate from items or default to 20%
const avgTvaRate = data.items.length > 0 && data.items[0].tvaRate !== undefined
  ? data.items[0].tvaRate / 100
  : 0.20;
const tvaRateDisplay = avgTvaRate * 100;
const totalHT = data.totalAmount / (1 + avgTvaRate);
const tvaAmount = data.totalAmount - totalHT;
```

**Affichage dynamique dans le PDF - Totaux (lignes 161-163) :**

```typescript
yPos += 7;
doc.text(`TVA ${tvaRateDisplay}%`, 135, yPos + 2);  // ← Taux dynamique
doc.text(`${tvaAmount.toFixed(2)} €`, 170, yPos + 2);
```

**Affichage dynamique dans le PDF - Footer (ligne 177) :**

```typescript
doc.text(`TVA ${tvaRateDisplay}% - N° TVA Intracommunautaire: [À compléter]`, 20, yPos + 5);
```

**Calcul dynamique dans l'email HTML (lignes 206-210) :**

```typescript
// Calculate TVA rate from items
const tvaRateValue = items.length > 0 && items[0].tvaRate !== undefined ? items[0].tvaRate : 20;
const tvaMultiplier = 1 + (tvaRateValue / 100);
const totalHT = totalAmount / tvaMultiplier;
const tvaAmount = totalAmount - totalHT;
```

**Affichage dynamique dans l'email (lignes 280-286) :**

```html
<tr style="background: #fafafa;">
  <td colspan="4" style="text-align: right;">Total HT</td>
  <td style="text-align: right;">${totalHT.toFixed(2)} €</td>
</tr>
<tr style="background: #fafafa;">
  <td colspan="4" style="text-align: right;">TVA ${tvaRateValue}%</td>
  <td style="text-align: right;">${tvaAmount.toFixed(2)} €</td>
</tr>
```

---

## Flux de données TVA

```
┌─────────────────────────────────────────────────────────────────┐
│                         BASE DE DONNÉES                          │
├─────────────────────────────────────────────────────────────────┤
│  tva_rates                    products                          │
│  ┌────────────────┐           ┌────────────────────────┐       │
│  │ id             │◄──────────│ tva_rate_id (FK)       │       │
│  │ name           │           │ id                     │       │
│  │ rate (ex: 20)  │           │ name                   │       │
│  │ is_default     │           │ price                  │       │
│  └────────────────┘           └────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      stripe-webhook                              │
│  1. Récupère order_items                                        │
│  2. Récupère products.tva_rates.rate via JOIN                   │
│  3. Passe tvaRate à send-order-confirmation                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  send-order-confirmation    │   │       send-invoice          │
│                             │   │                             │
│  • Email HTML avec TVA      │   │  • Email HTML avec TVA      │
│    dynamique                │   │    dynamique                │
│  • PDF avec TVA dynamique   │   │  • PDF avec TVA dynamique   │
│  • Total HT calculé         │   │  • Total HT calculé         │
│  • TVA XX% affiché          │   │  • TVA XX% affiché          │
└─────────────────────────────┘   └─────────────────────────────┘
```

---

## Notes importantes

1. **Rétrocompatibilité** : Si `tvaRate` n'est pas fourni, les fonctions utilisent 20% par défaut
2. **Calcul** : Total HT = Total TTC / (1 + taux_TVA)
3. **Affichage** : Le taux est affiché dynamiquement (ex: "TVA 20%", "TVA 5.5%")
4. **Branding** : Le nom "Maison Wydeline" est utilisé dans tous les PDFs

---

## Fichiers complets

Les fichiers complets des Edge Functions sont disponibles dans :
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/send-order-confirmation/index.ts`
- `supabase/functions/send-invoice/index.ts`
