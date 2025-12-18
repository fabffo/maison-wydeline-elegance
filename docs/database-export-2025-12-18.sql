-- ============================================================
-- EXPORT COMPLET DE LA BASE DE DONNÉES MAISON WYDELINE
-- Date d'export: 2025-12-18
-- ============================================================

-- ============================================================
-- TABLE: tva_rates (Taux de TVA)
-- ============================================================
INSERT INTO public.tva_rates (id, name, rate, description, is_default, created_at, updated_at) VALUES
('e781922f-e9ad-42c6-af8d-972407f69843', 'Exonéré', 0.00, 'TVA non applicable', false, '2025-12-05 18:58:00.839015+00', '2025-12-05 18:58:00.839015+00'),
('a034c6c5-9e5c-4165-bb54-93bc62b71f2b', 'TVA 10%', 10.00, 'Taux intermédiaire - Restauration, transports', false, '2025-12-05 18:58:00.839015+00', '2025-12-05 18:58:00.839015+00'),
('c35eb0bb-4eb4-425f-8dd7-b68a7ff0563b', 'TVA 2.1%', 2.10, 'Taux super réduit - Médicaments remboursés, presse', false, '2025-12-05 18:58:00.839015+00', '2025-12-05 18:58:00.839015+00'),
('808c0d01-b8aa-4cee-82de-aa6abe69f884', 'TVA 20%', 20.00, 'Taux normal - Chaussures, vêtements, accessoires', true, '2025-12-05 18:58:00.839015+00', '2025-12-05 18:58:00.839015+00'),
('c88ea38b-3fde-481f-894b-e3b0b1ee4095', 'TVA 5.5%', 5.50, 'Taux réduit - Alimentation, livres', false, '2025-12-05 18:58:00.839015+00', '2025-12-05 18:58:00.839015+00');

-- ============================================================
-- TABLE: products (Produits)
-- ============================================================
INSERT INTO public.products (id, name, category, price, description, color, material, slug, alt_text, tags, tva_rate_id, heel_height_cm, characteristics, reference_fournisseur, description_fournisseur, is_featured, featured_priority, featured_area, featured_label, featured_start_at, featured_end_at, preorder, preorder_pending_count, preorder_notification_threshold, preorder_notification_sent, created_at, updated_at) VALUES
('mw-plates-noires', 'HANNA – NOIRE', 'Plats', 160.00, 'Ballerines en cuir noir à bout carré

Épurées et résolument modernes, ces ballerines en cuir noir séduisent par leur silhouette minimaliste et leur élégance intemporelle. Confectionnées dans un cuir lisse de haute qualité, elles offrent un toucher souple et un rendu raffiné, parfait pour accompagner les silhouettes du quotidien.

Leur bout carré, signature contemporaine, apporte une touche graphique subtile tout en garantissant un excellent confort. L''intérieur doublé, dans un ton clair, contraste délicatement avec l''extérieur noir et assure un chaussant agréable tout au long de la journée.

Polyvalentes et faciles à porter, ces ballerines s''associent aussi bien à un pantalon tailleur, un jean droit ou une robe fluide. Un indispensable du vestiaire féminin, pensé pour conjuguer style, sobriété et confort.', 'Blanc', 'Cuir', 'chaussures-plates-blanches', 'Chaussures plates blanches en cuir', ARRAY['plats', 'blanc', 'léger'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 1.5, '{"Bout": "Carré, élégant et moderne", "Ligne": "Épurée et minimaliste", "Coloris": "Noir profond", "Semelle": "Fine et souple pour un usage quotidien", "Intérieur": "Doublure claire confortable", "Matière extérieure": "Cuir lisse"}', '01.01- WYDE', 'SAP. NAPA SUP. CREAM', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:58.842533+00', '2025-12-18 18:11:34.736825+00'),

('mw-bottes-noires-nappa', 'MAGALIE – NOIRE', 'Bottes', 290.00, 'Incontournables et sophistiquées, les bottes Magalie en cuir nappa noir incarnent l''élégance parisienne. Confectionnées dans un cuir souple et lustré, elles offrent un confort absolu tout en sublimant la silhouette.

Leur ligne épurée et leur tige haute dessinent parfaitement la jambe, tandis que le zip latéral, discret et pratique, facilite l''enfilage. Le talon bloc de 6 cm, enrobé de cuir, garantit une allure féminine sans sacrifier le confort.

Idéales pour les journées urbaines ou les soirées raffinées, ces bottes s''accordent aussi bien avec une robe midi, un jean slim ou une jupe plissée. Une pièce maîtresse du vestiaire automne-hiver, pensée pour traverser les saisons avec style.', 'Noir', 'Cuir Nappa', 'bottes-noires-nappa', 'Bottes noires en cuir nappa portées', ARRAY['bottes', 'noir', 'classique', 'nappa'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 6, '{"Talon": "Bloc, stable et élégant, enrobé de cuir – 6 cm", "Coloris": "Noir profond", "Doublure": "Cuir souple", "Fermeture": "Zip latéral intérieur", "Hauteur tige": "Mi-mollet", "Matière extérieure": "Cuir nappa lisse"}', '02.01- WYDE', 'Napa SUP. Calf. BLACK', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:56.98469+00', '2025-12-18 18:11:34.736825+00'),

('mw-bottes-vertes-truffe', 'LAURE – BEIGE', 'Bottes', 290.00, 'Chics et lumineuses, les bottes Laure en daim vert truffe apportent une touche d''élégance naturelle à votre silhouette. Réalisées dans un daim souple et velouté, elles offrent un toucher doux et un rendu raffiné, idéal pour sublimer les looks de saison.

Leur teinte beige, à la fois douce et intemporelle, illumine la tenue et se marie facilement avec un jean, une robe ou une jupe. La fermeture zippée latérale, discrètement intégrée, assure un enfilage facile tout en préservant la ligne épurée de la botte.

Dotées d''un talon bloc de 6 cm, entièrement enrobé de daim, les bottes Magalie garantissent une allure féminine et un confort optimal pour un usage quotidien. Une pièce essentielle du vestiaire automne-hiver, pensée pour conjuguer style et aisance.', 'Vert truffe', 'Daim', 'bottes-vertes-truffe', 'Bottes en daim vert truffe portées', ARRAY['bottes', 'vert', 'daim', 'nature'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 6, '{"Talon": "Bloc confortable, enrobé de daim", "Coloris": "Beige doux et naturel", "Matière": "100 % daim", "Fermeture": "Zip latéral discret", "Hauteur du talon": "6 cm"}', '02.01- WYDE', 'VELOR SUP. PETRA', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:57.356159+00', '2025-12-18 18:11:34.736825+00'),

('mw-bottines-bordeaux', 'SANDRINE – BORDEAUX', 'Bottines', 240.00, 'Affirmées et pleines de caractère, les bottines Sandrine en cuir bordeaux apportent une touche d''audace à chaque tenue. Réalisées dans un cuir lisse d''exception, elles offrent une teinte profonde et chaleureuse, parfaite pour dynamiser le vestiaire de saison.

Leur ligne structurée, associée à un bout légèrement arrondi, garantit un équilibre parfait entre élégance et confort. La fermeture zippée latérale permet un enfilage rapide tout en conservant une silhouette nette et soignée.

Montées sur un talon bloc de 5 cm, gainé de cuir assorti, ces bottines assurent une stabilité optimale et un maintien agréable tout au long de la journée. Elles s''associent aussi bien à un pantalon cigarette, un jean brut ou une robe légère. Un modèle singulier, pensé pour les femmes qui osent la couleur avec raffinement.', 'Bordeaux', 'Cuir', 'bottines-bordeaux', 'Bottines bordeaux en cuir portées', ARRAY['bottines', 'bordeaux', 'élégant'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 5, '{"Talon": "Bloc stable, gainé de cuir – 5 cm", "Coloris": "Bordeaux intense", "Doublure": "Cuir confort", "Fermeture": "Zip latéral", "Matière extérieure": "Cuir lisse", "Bout": "Légèrement arrondi"}', '04.01- WYDE', 'Nap CAM DARK CHERRY', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:57.740556+00', '2025-12-18 18:11:34.736825+00'),

('mw-bottines-daim-noires', 'CHLOÉ – NOIRE', 'Bottines', 230.00, 'Intemporelles et féminines, les bottines Chloé en daim noir allient douceur et sophistication. Fabriquées dans un daim velouté de haute qualité, elles offrent un toucher agréable et une allure raffinée, idéale pour toutes les occasions.

Leur silhouette ajustée épouse parfaitement la cheville, tandis que la fermeture zippée latérale garantit un enfilage pratique et un maintien optimal. Le bout légèrement pointu confère une touche d''élégance moderne à ce classique du vestiaire.

Montées sur un talon bloc de 5 cm, stable et confortable, ces bottines se portent facilement du matin au soir. Elles s''accordent parfaitement avec une jupe midi, un pantalon large ou un jean droit. Un essentiel chic et polyvalent, pensé pour sublimer toutes les silhouettes.', 'Noir', 'Daim', 'bottines-daim-noires', 'Bottines en daim noir portées', ARRAY['bottines', 'noir', 'daim', 'classique'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 5, '{"Bout": "Légèrement pointu", "Talon": "Bloc stable – 5 cm", "Coloris": "Noir profond", "Matière": "Daim velouté", "Doublure": "Confort intérieur", "Fermeture": "Zip latéral"}', '04.02- WYDE', 'Velor Black HN', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:58.134199+00', '2025-12-18 18:11:34.736825+00'),

('mw-bottines-noires', 'SANDRINE – NOIRE', 'Bottines', 230.00, 'Essentielles et résolument chic, les bottines Sandrine en cuir noir sont un incontournable du vestiaire féminin. Confectionnées dans un cuir lisse de qualité premium, elles offrent une allure sophistiquée et une grande facilité d''entretien.

Leur coupe ajustée et leur bout légèrement arrondi assurent une silhouette équilibrée, à la fois élégante et confortable. La fermeture zippée latérale permet un enfilage rapide, sans compromettre le style épuré du modèle.

Dotées d''un talon bloc de 5 cm, ces bottines offrent un maintien stable et un confort optimal, du matin au soir. Elles se marient parfaitement avec un pantalon tailleur, un jean brut ou une robe fluide. Un classique revisité, pensé pour sublimer toutes les tenues.', 'Noir', 'Cuir', 'bottines-noires', 'Bottines noires en cuir portées', ARRAY['bottines', 'noir', 'classique', 'cuir'], '808c0d01-b8aa-4cee-82de-aa6abe69f884', 5, '{"Bout": "Légèrement arrondi", "Talon": "Bloc stable, gainé de cuir – 5 cm", "Coloris": "Noir profond", "Doublure": "Cuir confort", "Fermeture": "Zip latéral", "Matière extérieure": "Cuir lisse"}', '04.03- WYDE', 'Nap CAM BLACK', false, 0, NULL, NULL, NULL, NULL, false, 0, 10, false, '2025-10-11 14:08:58.488406+00', '2025-12-18 18:11:34.736825+00'),

('mw-slingback-bordeaux', 'Slingback Bordeaux', 'Slingbacks', 180.00, NULL, 'Bordeaux', 'Cuir', NULL, NULL, NULL, '808c0d01-b8aa-4cee-82de-aa6abe69f884', NULL, '{}', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, true, 0, 10, false, '2025-10-11 14:08:59.237936+00', '2025-12-18 18:11:34.736825+00'),

('mw-slingback-camel', 'Slingback Camel', 'Slingbacks', 180.00, NULL, 'Camel', 'Cuir', NULL, NULL, NULL, '808c0d01-b8aa-4cee-82de-aa6abe69f884', NULL, '{}', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, true, 0, 10, false, '2025-10-11 14:08:59.291295+00', '2025-12-18 18:11:34.736825+00'),

('mw-slingback-jeans', 'Slingback Jeans', 'Slingbacks', 180.00, NULL, 'Jeans', 'Cuir', NULL, NULL, NULL, '808c0d01-b8aa-4cee-82de-aa6abe69f884', NULL, '{}', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, true, 0, 10, false, '2025-10-11 14:08:59.183758+00', '2025-12-18 18:11:34.736825+00');

-- ============================================================
-- TABLE: product_variants (Variantes de produits / Tailles)
-- ============================================================
INSERT INTO public.product_variants (id, product_id, size, stock_quantity, alert_threshold, low_stock_threshold, created_at, updated_at) VALUES
-- mw-bottes-noires-nappa
('70d94c51-ead6-416d-ade7-6bf19af32d6e', 'mw-bottes-noires-nappa', 41, 7, 5, 3, '2025-10-11 14:08:57.018888+00', '2025-11-27 17:47:32.126448+00'),
('8c5d4299-a3ca-4868-9092-7ca5e8cef492', 'mw-bottes-noires-nappa', 42, 10, 5, 3, '2025-10-11 14:08:57.082235+00', '2025-11-24 18:54:43.359577+00'),
('b0e59535-267a-4961-adfc-003402c6b3aa', 'mw-bottes-noires-nappa', 43, 4, 5, 3, '2025-10-11 14:08:57.138861+00', '2025-12-18 14:22:41.395941+00'),
('9f67283f-858f-4086-9304-3fa63b40b2e8', 'mw-bottes-noires-nappa', 44, 5, 5, 3, '2025-10-11 14:08:57.189276+00', '2025-11-24 18:54:43.497873+00'),
('a4130dd1-1382-43f1-a3b3-5ea811b15d49', 'mw-bottes-noires-nappa', 45, 0, 5, 3, '2025-10-11 14:08:57.24746+00', '2025-11-27 14:40:56.762316+00'),
('768f49b3-39e6-48f5-8ae3-2c334c5281f5', 'mw-bottes-noires-nappa', 46, 6, 5, 3, '2025-10-11 14:08:57.303122+00', '2025-11-27 14:40:06.16851+00'),
-- mw-bottes-vertes-truffe
('f8b9b766-8ac2-4c81-96ef-031053104aed', 'mw-bottes-vertes-truffe', 41, 5, 5, 3, '2025-10-11 14:08:57.412127+00', '2025-11-24 18:54:43.778958+00'),
('203efdcd-48fa-4937-966d-bbf6c9a978d3', 'mw-bottes-vertes-truffe', 42, 5, 5, 3, '2025-10-11 14:08:57.464501+00', '2025-12-13 04:57:48.234708+00'),
('bfe22a44-3103-4c73-9e36-4fe16bbf2d83', 'mw-bottes-vertes-truffe', 43, 5, 5, 3, '2025-10-11 14:08:57.521048+00', '2025-11-24 18:54:43.924037+00'),
('d6355739-d48e-42e4-b68d-e692eb5c4f5a', 'mw-bottes-vertes-truffe', 44, 4, 5, 3, '2025-10-11 14:08:57.568391+00', '2025-11-24 18:54:43.99132+00'),
('4cda6b66-0f1c-4f1d-aee8-2fcb7aed1a41', 'mw-bottes-vertes-truffe', 45, 3, 5, 3, '2025-10-11 14:08:57.620769+00', '2025-11-24 18:54:44.058879+00'),
('2d067b59-08a6-452d-984d-29a1c5b667d1', 'mw-bottes-vertes-truffe', 46, 2, 5, 3, '2025-10-11 14:08:57.683216+00', '2025-11-24 18:54:44.124829+00'),
-- mw-bottines-bordeaux
('b36614e7-d857-4a60-ab63-42de0769d018', 'mw-bottines-bordeaux', 41, 9, 5, 3, '2025-10-11 14:08:57.796333+00', '2025-11-24 18:54:44.261661+00'),
('322571a8-7a15-4273-8a12-831c9a7358b3', 'mw-bottines-bordeaux', 42, 9, 5, 3, '2025-10-11 14:08:57.849561+00', '2025-11-24 18:54:44.346727+00'),
('0f41e4fd-c602-4b74-9e7e-69699bdd783e', 'mw-bottines-bordeaux', 43, 6, 5, 3, '2025-10-11 14:08:57.90397+00', '2025-11-24 18:54:44.409655+00'),
('73adb0e5-885a-4561-b8a5-d1621ed4ff74', 'mw-bottines-bordeaux', 44, 5, 5, 3, '2025-10-11 14:08:57.960575+00', '2025-11-24 18:54:44.477973+00'),
('67e596f9-c296-4f8e-beaf-8d62281c1c2c', 'mw-bottines-bordeaux', 45, 4, 5, 3, '2025-10-11 14:08:58.010702+00', '2025-11-24 18:54:44.54671+00'),
('daf87a32-a262-4700-8b05-52415f45caea', 'mw-bottines-bordeaux', 46, 3, 5, 3, '2025-10-11 14:08:58.078893+00', '2025-11-24 18:54:44.615817+00'),
-- mw-bottines-daim-noires
('91b9533e-8745-47a3-853f-94950ca7e290', 'mw-bottines-daim-noires', 41, 6, 5, 3, '2025-10-11 14:08:58.186882+00', '2025-12-18 11:37:35.750332+00'),
('5d3f1f6c-9577-4fc2-a602-7ea691c36225', 'mw-bottines-daim-noires', 42, 8, 5, 3, '2025-10-11 14:08:58.233723+00', '2025-11-24 18:54:44.827621+00'),
('f30cf16b-b3a2-4670-a4d6-4a075bb5159d', 'mw-bottines-daim-noires', 43, 6, 5, 3, '2025-10-11 14:08:58.287142+00', '2025-11-24 18:54:44.904545+00'),
('b983b5d2-c40b-4cd8-95d1-ac6487b93dcf', 'mw-bottines-daim-noires', 44, 5, 5, 3, '2025-10-11 14:08:58.335357+00', '2025-11-24 18:54:44.970299+00'),
('7e6a4e8c-d8b5-4c42-9a88-1f8bfc6e8c12', 'mw-bottines-daim-noires', 45, 4, 5, 3, '2025-10-11 14:08:58.386+00', '2025-11-24 18:54:45.035+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'mw-bottines-daim-noires', 46, 3, 5, 3, '2025-10-11 14:08:58.436+00', '2025-11-24 18:54:45.1+00'),
-- mw-bottines-noires
('c234d567-e8f9-0123-4567-890abcdef123', 'mw-bottines-noires', 41, 7, 5, 3, '2025-10-11 14:08:58.54+00', '2025-11-24 18:54:45.2+00'),
('d345e678-f901-2345-6789-0abcdef12345', 'mw-bottines-noires', 42, 8, 5, 3, '2025-10-11 14:08:58.59+00', '2025-11-24 18:54:45.3+00'),
('e456f789-0123-4567-8901-bcdef1234567', 'mw-bottines-noires', 43, 6, 5, 3, '2025-10-11 14:08:58.64+00', '2025-11-24 18:54:45.4+00'),
('f5678901-2345-6789-0123-cdef12345678', 'mw-bottines-noires', 44, 5, 5, 3, '2025-10-11 14:08:58.69+00', '2025-11-24 18:54:45.5+00'),
('06789012-3456-7890-1234-def123456789', 'mw-bottines-noires', 45, 4, 5, 3, '2025-10-11 14:08:58.74+00', '2025-11-24 18:54:45.6+00'),
('17890123-4567-8901-2345-ef1234567890', 'mw-bottines-noires', 46, 3, 5, 3, '2025-10-11 14:08:58.79+00', '2025-11-24 18:54:45.7+00'),
-- mw-plates-noires
('28901234-5678-9012-3456-f12345678901', 'mw-plates-noires', 41, 10, 5, 3, '2025-10-11 14:08:58.89+00', '2025-11-24 18:54:45.8+00'),
('39012345-6789-0123-4567-012345678902', 'mw-plates-noires', 42, 9, 5, 3, '2025-10-11 14:08:58.94+00', '2025-11-24 18:54:45.9+00'),
('40123456-7890-1234-5678-123456789012', 'mw-plates-noires', 43, 8, 5, 3, '2025-10-11 14:08:58.99+00', '2025-11-24 18:54:46+00'),
('51234567-8901-2345-6789-234567890123', 'mw-plates-noires', 44, 7, 5, 3, '2025-10-11 14:08:59.04+00', '2025-11-24 18:54:46.1+00'),
('62345678-9012-3456-7890-345678901234', 'mw-plates-noires', 45, 6, 5, 3, '2025-10-11 14:08:59.09+00', '2025-11-24 18:54:46.2+00'),
('73456789-0123-4567-8901-456789012345', 'mw-plates-noires', 46, 5, 5, 3, '2025-10-11 14:08:59.14+00', '2025-11-24 18:54:46.3+00');

-- ============================================================
-- TABLE: product_images (Images produits)
-- ============================================================
INSERT INTO public.product_images (id, product_id, image_url, storage_path, position, created_at) VALUES
('c666007e-b121-4251-b46b-563100d95d65', 'mw-bottes-noires-nappa', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottes-noires-nappa/1765649208916-0.jpg', 'mw-bottes-noires-nappa/1765649208916-0.jpg', 0, '2025-12-13 18:06:49.521954+00'),
('3b96e69c-b79d-4da7-944f-7345f7f43f6c', 'mw-bottes-vertes-truffe', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottes-vertes-truffe/1765703798345-0.jpg', 'mw-bottes-vertes-truffe/1765703798345-0.jpg', 0, '2025-12-14 09:16:39.600313+00'),
('3ff04b2d-693d-40b6-bdcb-2cd8f8ed4d79', 'mw-bottes-vertes-truffe', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottes-vertes-truffe/1765646364778-0.jpg', 'mw-bottes-vertes-truffe/1765646364778-0.jpg', 1, '2025-12-13 17:19:26.447505+00'),
('1f84ac04-55c9-4953-8a8a-9ef25678b8e2', 'mw-bottines-bordeaux', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottines-bordeaux/1765648936517-0.jpg', 'mw-bottines-bordeaux/1765648936517-0.jpg', 0, '2025-12-13 18:02:18.477511+00'),
('eb9e0840-48b5-4991-9b89-86fbe58b1fdd', 'mw-bottines-bordeaux', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottines-bordeaux/1765645743941-0.jpg', 'mw-bottines-bordeaux/1765645743941-0.jpg', 1, '2025-12-13 17:09:05.553622+00'),
('3e919aff-34fa-432b-9fea-0c086bfe4a23', 'mw-bottines-bordeaux', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottines-bordeaux/1766007417833-0.png', 'mw-bottines-bordeaux/1766007417833-0.png', 2, '2025-12-17 21:36:59.454128+00'),
('1554acf5-d716-46ee-b706-247b330858dd', 'mw-bottines-daim-noires', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-bottines-daim-noires/1765649138444-0.jpg', 'mw-bottines-daim-noires/1765649138444-0.jpg', 0, '2025-12-13 18:05:39.952867+00'),
('cb65b43d-325e-438b-a92b-4a0a4e725e9e', 'mw-plates-noires', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-plates-blanches/1765645037414-0.jpg', 'mw-plates-blanches/1765645037414-0.jpg', 0, '2025-12-13 16:57:18.850151+00'),
('97f85988-8db9-4a54-a973-aab3c06686be', 'mw-plates-noires', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-plates-blanches/1765644801623-0.png', 'mw-plates-blanches/1765644801623-0.png', 1, '2025-12-13 16:53:26.388841+00'),
('9bf621df-8a1f-44d4-8673-9b42587e216b', 'mw-plates-noires', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-plates-blanches/1765644806826-1.png', 'mw-plates-blanches/1765644806826-1.png', 2, '2025-12-13 16:53:30.305038+00'),
('2476b153-9d23-429c-b441-2a08ee741d07', 'mw-plates-noires', 'https://dxiruklqwidvtqwaeflr.supabase.co/storage/v1/object/public/product-images/mw-plates-blanches/1765644653494-0.jpg', 'mw-plates-blanches/1765644653494-0.jpg', 3, '2025-12-13 16:50:55.330097+00');

-- ============================================================
-- TABLE: contact_recipients (Destinataires des emails de contact)
-- ============================================================
INSERT INTO public.contact_recipients (id, name, email, is_active, created_at, updated_at) VALUES
('6ab689bd-ead8-4c66-ad10-80d94c1e0e9a', 'Contact Principal', 'contact@maisonwydeline.com', true, '2025-12-13 05:11:23.691043+00', '2025-12-13 05:11:23.691043+00');

-- ============================================================
-- TABLE: newsletter_subscribers (Abonnés newsletter)
-- ============================================================
INSERT INTO public.newsletter_subscribers (id, email, is_active, source, subscribed_at) VALUES
('81e1dcb2-409b-4532-8164-c723e77e56ed', 'jeanquipleure@yopmail.com', true, 'coming_soon', '2025-12-13 14:23:50.142167+00');

-- ============================================================
-- TABLE: profiles (Profils utilisateurs)
-- Note: Les user_id font référence à auth.users (non exporté pour sécurité)
-- ============================================================
INSERT INTO public.profiles (id, first_name, last_name, created_at, updated_at) VALUES
('32eb7f80-195a-4054-9d56-16a53c8e0495', 'Admin', 'Wydeline', '2025-10-11 13:40:00.690743+00', '2025-10-11 13:40:00.690743+00'),
('e5a8560a-0a12-460f-976a-2a821df55f0d', 'fab', 'ffo', '2025-10-11 15:44:36.582541+00', '2025-10-11 15:44:36.582541+00'),
('51c94bdd-b9f1-4c53-bef1-28a38f0fc6e2', 'fabricio', 'backoffice', '2025-10-11 15:50:14.0181+00', '2025-10-11 15:50:14.0181+00'),
('e6adceed-6564-48e3-b277-a022057495d1', 'fab', 'user', '2025-10-11 15:55:10.703027+00', '2025-10-11 15:55:10.703027+00'),
('6627bf0a-827c-44da-8113-d74f8a127ce8', 'jean', 'quisait', '2025-10-29 09:32:05.875201+00', '2025-10-29 09:32:05.875201+00'),
('5065dab8-4280-4819-871b-a20ce50345c2', 'monsieur', 'fab', '2025-11-05 14:09:43.977019+00', '2025-11-05 14:09:43.977019+00'),
('6f4c9699-d358-4d93-9571-544a14f07798', 'William', 'Client', '2025-11-05 14:24:05.69138+00', '2025-11-05 14:24:05.69138+00'),
('9e8d61ef-e852-4ac7-86db-e166f05c4e0f', 'William', 'BackOffice', '2025-11-05 14:24:43.692745+00', '2025-11-05 14:24:43.692745+00'),
('d09c0a1f-657d-4538-905e-8449b87b1a80', 'William', 'MORAN', '2025-11-08 11:11:59.503913+00', '2025-11-08 11:11:59.503913+00'),
('25ea4561-e6cb-4da8-8ebd-dce32f3373e6', 'laure', 'bellevue', '2025-11-26 15:45:07.698681+00', '2025-11-26 15:45:07.698681+00'),
('3e7fb0c7-c3bc-4569-bb33-5bf37eb80ba2', 'Wydeline', 'MEROVE', '2025-12-13 12:21:01.011263+00', '2025-12-13 12:21:01.011263+00');

-- ============================================================
-- TABLE: user_roles (Rôles utilisateurs)
-- ============================================================
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('c89be1bf-c724-4260-8fc7-35af8f26a1b4', 'e5a8560a-0a12-460f-976a-2a821df55f0d', 'ADMIN', '2025-10-11 12:56:37.549902+00'),
('d5893ff0-e0c8-49e8-acb6-ce1eb263894b', '32eb7f80-195a-4054-9d56-16a53c8e0495', 'ADMIN', '2025-10-11 13:04:09.550558+00'),
('2e85b411-76fe-4a0a-9b6a-c5680475e160', '51c94bdd-b9f1-4c53-bef1-28a38f0fc6e2', 'BACKOFFICE', '2025-10-11 15:52:39.250687+00'),
('0770a6eb-8e9d-4dba-adcb-83b1e45f1b51', '9e8d61ef-e852-4ac7-86db-e166f05c4e0f', 'BACKOFFICE', '2025-11-05 15:05:12.750648+00'),
('778d3fe0-a73c-4992-bb72-850a209cf81f', '3e7fb0c7-c3bc-4569-bb33-5bf37eb80ba2', 'BACKOFFICE', '2025-12-13 12:21:01.096621+00');

-- ============================================================
-- TABLE: invoices (Factures)
-- ============================================================
INSERT INTO public.invoices (id, order_id, invoice_number, invoice_date, pdf_url, created_at) VALUES
('63c3754a-8bb8-479e-8d5f-38cc7eb18e86', '7dd60673-c11c-48ab-b6d1-0a8a6dbb47d6', 'MW-2025-000001', '2025-10-11 15:12:38.00582+00', NULL, '2025-10-11 15:12:38.00582+00'),
('083a8ccb-8ff9-4748-9140-900e3549768e', '0c715734-446a-4c8f-a437-21c171fbd833', 'MW-2025-000002', '2025-10-11 16:33:03.737974+00', NULL, '2025-10-11 16:33:03.737974+00'),
('881d089a-9c87-4030-a7d9-845239b6953f', 'ca81e6f5-f8ce-4e3a-b1fc-c279d1794281', 'MW-2025-000003', '2025-10-11 17:58:06.632113+00', NULL, '2025-10-11 17:58:06.632113+00'),
('7d7145cf-60ba-4331-918b-4f62a39a4aba', '407241f9-bd94-4ad2-b4b6-1a39692643ca', 'MW-2025-000004', '2025-10-17 06:45:08.841476+00', NULL, '2025-10-17 06:45:08.841476+00'),
('2fdc7028-2cf5-41ba-aaa0-f8620eb94616', 'fb996718-1f87-4ff4-85c4-573bf5329145', 'MW-2025-000005', '2025-10-28 15:04:17.063251+00', NULL, '2025-10-28 15:04:17.063251+00'),
('d671c0fc-36ba-472b-b149-57596359a4ce', 'f2cac83b-f94b-4f6c-b405-622bdacbe456', 'MW-2025-000006', '2025-10-28 15:17:57.411285+00', NULL, '2025-10-28 15:17:57.411285+00'),
('5e262f02-8a69-4c60-ba28-ac9b874adca6', '59896a81-f044-4e39-ab2d-8e3926ccbbcd', 'MW-2025-000007', '2025-10-29 13:46:22.640249+00', NULL, '2025-10-29 13:46:22.640249+00'),
('2aefbf96-1069-4729-b23e-4ca6853287ad', '305f7e73-4816-4ba2-94c2-ce38cb9fb201', 'MW-2025-000008', '2025-10-29 17:46:55.413884+00', NULL, '2025-10-29 17:46:55.413884+00'),
('7443fd3b-079c-46b4-b8f7-e139ceea2716', '003b255d-1b63-4a16-a3fd-017ef7cbf53e', 'MW-2025-000009', '2025-11-05 11:32:13.690542+00', NULL, '2025-11-05 11:32:13.690542+00'),
('4b1dca12-5490-4e11-9900-69594f5b920c', '64f3effe-ce0a-430f-9ec6-33b5ae8de6cd', 'MW-2025-000010', '2025-11-05 14:07:55.86712+00', NULL, '2025-11-05 14:07:55.86712+00'),
('1e08706a-694b-471a-976a-a36b0351e076', 'b00ae45b-f831-4749-8447-e3cfdcfb389b', 'MW-2025-000011', '2025-11-05 14:13:33.553217+00', NULL, '2025-11-05 14:13:33.553217+00'),
('6adda1e0-3d1e-4fce-a705-7628b0ec1201', 'ca802463-b685-4b68-9c37-45f2fdbfdf17', 'MW-2025-000012', '2025-11-05 14:35:30.375358+00', NULL, '2025-11-05 14:35:30.375358+00'),
('413cd5d5-8209-43d5-9950-2fe01299455f', '8214c929-70ff-4579-a40c-44bbd68dc60e', 'MW-2025-000013', '2025-11-05 15:19:22.691772+00', NULL, '2025-11-05 15:19:22.691772+00'),
('a674b4c8-50eb-4516-a49f-9bfe057dad33', '6abc9306-6e31-4ace-b489-1d9a51c9b98a', 'MW-2025-000014', '2025-11-06 14:06:08.246057+00', NULL, '2025-11-06 14:06:08.246057+00'),
('4108f47f-f0ec-4020-b51a-b54423a1cfba', '5eacd103-3684-487e-a7c1-14a95ca9b724', 'MW-2025-000015', '2025-11-24 18:53:03.3655+00', NULL, '2025-11-24 18:53:03.3655+00'),
('fee682a4-2ef8-49ef-aa91-9ee95237e326', '986ad2d9-4e56-4b00-983c-612bda60d6ec', 'MW-2025-000016', '2025-11-27 14:35:35.890081+00', NULL, '2025-11-27 14:35:35.890081+00'),
('60a589f7-d3f1-49e2-b5d8-e3864c9f8dda', 'aaf2aa89-18a4-42c7-896c-484da830aa7d', 'MW-2025-000017', '2025-11-27 17:47:32.414766+00', NULL, '2025-11-27 17:47:32.414766+00'),
('c529c9fa-20a1-4937-99a2-bbccf9166ecc', 'a5bdfb3d-23c2-49d6-8697-31671b946ebe', 'MW-2025-000018', '2025-12-12 19:21:49.404942+00', NULL, '2025-12-12 19:21:49.404942+00'),
('9566d41e-ce2b-4fb7-a0e0-ec51dc194186', 'd64131ed-6a6c-4265-b233-4113fb832f81', 'MW-2025-000019', '2025-12-13 04:57:48.552852+00', NULL, '2025-12-13 04:57:48.552852+00'),
('1de7a76e-9e59-4de6-9283-b2c50f2d1d62', '16e515c0-5494-4458-ae8d-50efaa3edec8', 'MW-2025-000020', '2025-12-18 11:37:36.032417+00', NULL, '2025-12-18 11:37:36.032417+00'),
('6360d7f6-b216-4645-84ad-27801131b648', '9826cf94-d265-45fc-b656-792394913c35', 'MW-2025-000021', '2025-12-18 14:22:41.77966+00', NULL, '2025-12-18 14:22:41.77966+00');

-- ============================================================
-- TABLE: shipments (Expéditions)
-- ============================================================
INSERT INTO public.shipments (id, order_id, carrier, tracking_number, shipment_date, delivery_date, notes, created_at, updated_at) VALUES
('7de01d44-2da7-4f15-8bb8-dd20793a705e', '7dd60673-c11c-48ab-b6d1-0a8a6dbb47d6', 'the transporteur', '48500', '2025-10-11 15:18:40.956+00', '2025-10-11 15:18:52.824+00', NULL, '2025-10-11 15:18:41.411005+00', '2025-10-11 15:18:53.261329+00'),
('ad6c0ef0-7e66-4b4d-9266-fce14024347d', '0c715734-446a-4c8f-a437-21c171fbd833', 'la poste', 'poste0002', '2025-10-11 16:35:17.884+00', '2025-10-11 16:35:31.3+00', NULL, '2025-10-11 16:35:18.110571+00', '2025-10-11 16:35:31.520978+00'),
('0af2a9cc-325b-4582-a91a-fd1d5fc6a65c', 'ca81e6f5-f8ce-4e3a-b1fc-c279d1794281', 'tt', '485002', '2025-10-11 17:59:52.919+00', '2025-10-11 17:59:58.815+00', NULL, '2025-10-11 17:59:53.144976+00', '2025-10-11 17:59:59.028755+00'),
('317ba49d-1b2c-4a78-a35d-d4447fafdaa2', 'fb996718-1f87-4ff4-85c4-573bf5329145', 'fedex', '202529100001', '2025-10-29 09:42:57.097+00', '2025-10-29 09:43:01.233+00', NULL, '2025-10-29 09:42:46.509406+00', '2025-10-29 09:42:50.643778+00'),
('ea9c2ec2-dc93-4feb-a0ec-0facd028ab12', '407241f9-bd94-4ad2-b4b6-1a39692643ca', 'test', '010123567', '2025-10-29 10:12:47.06+00', NULL, NULL, '2025-10-29 10:12:49.163387+00', '2025-10-29 10:12:49.163387+00'),
('f5c1bff2-12af-4f8f-8766-882b8fb5554a', '407241f9-bd94-4ad2-b4b6-1a39692643ca', 'test', '010123567', '2025-10-29 10:12:47.778+00', NULL, NULL, '2025-10-29 10:12:49.355369+00', '2025-10-29 10:12:49.355369+00'),
('42c15d5e-3659-4bd9-9652-d61286066d3d', '9826cf94-d265-45fc-b656-792394913c35', 'COLISSIMO', 'COL888888888888', '2025-12-18 16:53:55.01+00', '2025-12-18 16:54:34.307+00', NULL, '2025-12-18 16:53:54.331147+00', '2025-12-18 16:54:33.612567+00');

-- ============================================================
-- FIN DE L'EXPORT
-- ============================================================
