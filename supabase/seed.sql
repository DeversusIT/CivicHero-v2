-- CivicHero Seed Data
-- Run after 0001_initial_schema.sql migration

-- Seed levels
INSERT INTO levels (id, name, theme, description, order_index, is_active) VALUES
  (0, 'Tutorial', 'Introduzione', 'Impara i controlli', 0, true),
  (1, 'Bullismo e Cyberbullismo', 'bullismo', 'Aiuta i tuoi compagni', 1, true),
  (2, 'Vandalismo e Graffiti', 'vandalismo', 'Proteggi i beni comuni', 2, true),
  (3, 'Regole della Strada', 'strada', 'Attraversa la città in sicurezza', 3, true),
  (4, 'Cybercrime e Fake News', 'cyber', 'Naviga sicuro nel web', 4, true),
  (5, 'Missione Polizia', 'polizia', 'Affianca le forze dell''ordine', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Seed badges
INSERT INTO badges (name, description, icon_url, condition_type, condition_value) VALUES
  (
    'Prima Vittoria',
    'Hai completato il tutorial!',
    '/assets/ui/badge-prima-vittoria.png',
    'level_complete',
    '{"level_id": 0}'
  ),
  (
    'Giustizia Civica',
    'Hai completato il Livello 1 — Bullismo',
    '/assets/ui/badge-giustizia-civica.png',
    'level_complete',
    '{"level_id": 1}'
  ),
  (
    'Guardiano della Città',
    'Hai completato il Livello 2 — Vandalismo',
    '/assets/ui/badge-guardiano.png',
    'level_complete',
    '{"level_id": 2}'
  ),
  (
    'Codice della Strada',
    'Hai completato il Livello 3 — Regole Stradali',
    '/assets/ui/badge-codice-strada.png',
    'level_complete',
    '{"level_id": 3}'
  ),
  (
    'Sentinella Digitale',
    'Hai completato il Livello 4 — Cybercrime',
    '/assets/ui/badge-sentinella.png',
    'level_complete',
    '{"level_id": 4}'
  ),
  (
    'Cittadino Esemplare',
    'Hai completato tutti i livelli! Sei un vero eroe civico.',
    '/assets/ui/badge-cittadino-esemplare.png',
    'all_levels',
    '{"required_levels": [0, 1, 2, 3, 4, 5]}'
  ),
  (
    'Perfectionist',
    'Hai risposto correttamente a tutti i quiz in un livello',
    '/assets/ui/badge-perfectionist.png',
    'quiz_perfect',
    '{}'
  ),
  (
    'Champion',
    'Sei nella top 10 della classifica globale',
    '/assets/ui/badge-champion.png',
    'top10',
    '{}'
  ),
  (
    'Speed Runner',
    'Hai completato un livello in meno di 2 minuti',
    '/assets/ui/badge-speedrunner.png',
    'speed_run',
    '{"max_seconds": 120}'
  )
ON CONFLICT (name) DO NOTHING;
