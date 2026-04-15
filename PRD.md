# CivicHero — Product Requirements Document

## 1. Overview & Obiettivi

**CivicHero** è un videogioco educativo browser-based di tipo platformer 2D progettato per insegnare i concetti di legalità e rispetto delle regole civiche a ragazzi delle scuole medie (11-14 anni). Il giocatore veste i panni di un giovane cittadino/cadetto che attraversa sei livelli tematici affrontando situazioni di illegalità, con la Polizia di Stato come alleata e guida narrativa.

### Obiettivi principali
- Trasmettere 5 temi di legalità in modo coinvolgente e non didattico
- Valorizzare il ruolo della Polizia di Stato come alleata dei cittadini
- Creare competizione sana attraverso leaderboard e sistema di punteggio
- Funzionare su qualsiasi device senza installazione

### KPI di successo
- Completamento di almeno un livello per ogni utente registrato
- Tasso di registrazione > 60% degli utenti che completano il tutorial
- Almeno 3 livelli completati per utente registrato (media)

---

## 2. Utenti Target e Ruoli

### Utenti target primari
- **Studenti delle scuole medie** (11-14 anni): giocatori principali
- **Studenti delle superiori / sviluppatori**: il team di sviluppo (Giuseppe)
- **Insegnanti / dirigenti scolastici**: destinatari della dimostrazione progettuale

### Ruoli nel sistema

| Ruolo | Descrizione | Permessi |
|---|---|---|
| **Guest** | Utente non registrato | Accesso solo al tutorial |
| **Player** | Utente registrato con email | Accesso a tutti i livelli, salvataggio punteggi, leaderboard, badge |
| **Admin** | Amministratore del gioco | Pannello admin: gestione utenti, moderazione, statistiche |

---

## 3. Architettura dell'Informazione

### Gerarchia entità principali

```
CivicHero
├── Utenti (Auth + Profiles)
│   ├── Guest (non autenticato)
│   └── Player (autenticato)
│       ├── Profilo personale
│       ├── Punteggi per livello
│       └── Badge sbloccati
├── Gioco
│   ├── Tutorial (guest + player)
│   ├── Livello 1: Bullismo
│   ├── Livello 2: Vandalismo
│   ├── Livello 3: Strada
│   ├── Livello 4: Cybercrime
│   └── Livello 5: Polizia (boss level)
├── Leaderboard (globale)
└── Admin Panel
    ├── Gestione utenti
    ├── Moderazione punteggi
    └── Statistiche aggregate
```

### Schema dati (ERD testuale)

```
users (gestito da Supabase Auth)
  id            UUID PK
  email         TEXT UNIQUE NOT NULL
  created_at    TIMESTAMPTZ DEFAULT NOW()

profiles
  id            UUID PK FK → users.id ON DELETE CASCADE
  username      TEXT UNIQUE NOT NULL (3-20 chars, alphanumerico)
  avatar_url    TEXT NULLABLE
  created_at    TIMESTAMPTZ DEFAULT NOW()
  updated_at    TIMESTAMPTZ DEFAULT NOW()

levels
  id            INTEGER PK (0=tutorial, 1-5=livelli tematici)
  name          TEXT NOT NULL
  theme         TEXT NOT NULL
  description   TEXT
  order_index   INTEGER UNIQUE NOT NULL
  is_active     BOOLEAN DEFAULT TRUE

scores
  id            UUID PK DEFAULT gen_random_uuid()
  user_id       UUID FK → profiles.id ON DELETE CASCADE
  level_id      INTEGER FK → levels.id
  score         INTEGER NOT NULL CHECK (score >= 0)
  time_seconds  INTEGER NOT NULL CHECK (time_seconds > 0)
  quiz_bonus    INTEGER DEFAULT 0
  completed_at  TIMESTAMPTZ DEFAULT NOW()
  -- UNIQUE(user_id, level_id) → si aggiorna solo se nuovo score > old score

badges
  id            UUID PK DEFAULT gen_random_uuid()
  name          TEXT NOT NULL UNIQUE
  description   TEXT NOT NULL
  icon_url      TEXT NOT NULL
  condition_type TEXT NOT NULL -- 'level_complete', 'score_threshold', 'all_levels', 'quiz_perfect'
  condition_value JSONB -- parametri specifici per la condizione

user_badges
  id            UUID PK DEFAULT gen_random_uuid()
  user_id       UUID FK → profiles.id ON DELETE CASCADE
  badge_id      UUID FK → badges.id
  earned_at     TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(user_id, badge_id)

-- VIEW aggregata per leaderboard
CREATE VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.avatar_url,
  COALESCE(SUM(s.score), 0) AS total_score,
  COUNT(DISTINCT s.level_id) AS levels_completed,
  RANK() OVER (ORDER BY COALESCE(SUM(s.score), 0) DESC) AS rank
FROM profiles p
LEFT JOIN scores s ON s.user_id = p.id
GROUP BY p.id, p.username, p.avatar_url
ORDER BY total_score DESC;
```

---

## 4. Funzionalità per Modulo

### Modulo 1 — Autenticazione e Account

Il sistema di autenticazione è basato su **Supabase Auth** con email e password. Al primo accesso viene richiesto di scegliere uno username univoco. Sono previste le seguenti funzionalità: registrazione con email (con email di conferma), login, logout, reset password via email.

La **guest mode** permette di giocare il tutorial senza registrarsi. Al termine del tutorial, se il giocatore non è loggato, viene mostrato un prompt invitante alla registrazione per salvare i progressi e accedere alla leaderboard. La registrazione è obbligatoria per accedere ai livelli 1-5.

### Modulo 2 — Game Engine (Phaser.js)

Il cuore del gioco è implementato con **Phaser.js 3** integrato come componente React nella pagina Next.js `/game/[levelId]`. Ogni livello è una classe Phaser Scene separata che condivide l'engine comune.

**Meccaniche di base:**
- Personaggio controllabile con tastiera (frecce / WASD) e touch (joystick virtuale su mobile)
- Fisica platformer: gravità, salto, doppio salto (power-up)
- Collisioni con piattaforme, ostacoli e oggetti raccoglibili
- Camera che segue il personaggio orizzontalmente

**Sistema punti:**
- Punti base: +10 per ogni secondo rimasto al tempo (bonus velocità)
- Punti azione: +50 raccolta oggetti positivi, -20 collisione con ostacoli
- Bonus quiz: +100 risposta corretta, +0 risposta sbagliata (nessuna penalità)
- Bonus completamento livello: +200
- Punteggio minimo per passare: 200 punti

**Checkpoint quiz:**
A intervalli regolari nel livello compare un checkpoint (icona punto interrogativo). Il giocatore si avvicina, il gioco si mette in pausa e appare una domanda a scelta multipla (4 opzioni) sul tema del livello. La risposta corretta sblocca un power-up (es. scudo temporaneo, monete extra, velocità aumentata). La risposta sbagliata non penalizza ma non dà il power-up.

**Finale di livello:**
Ogni livello termina con una scena narrativa (dialog box) in cui un agente di Polizia di Stato spiega la lezione appresa, con il nome della legge di riferimento e come contattare le forze dell'ordine in caso di necessità.

### Modulo 3 — Livelli tematici

**Tutorial (Livello 0)**
- Tema: Introduzione al gioco
- Accessibile a tutti (guest inclusi)
- Meccanica guidata: il gioco suggerisce ogni azione tramite tooltip
- Nessuna difficoltà, solo apprendimento dei controlli
- Fine: invito alla registrazione

**Livello 1 — Bullismo e Cyberbullismo**
- Ambientazione: corridoi scolastici e cortile
- Narrativa: il protagonista deve raggiungere un compagno vittima di bullismo e aiutarlo
- Ostacoli: bulli che bloccano il percorso (da schivare/aggirare, NON combattere)
- Oggetti positivi: messaggi di supporto, simboli di amicizia
- Quiz tematico: conseguenze legali del bullismo, come denunciare, numero Telefono Azzurro (19696)
- Lesson finale: Agente spiega art. 612-bis CP (atti persecutori) e cyberbullismo (L. 71/2017)

**Livello 2 — Furto, Vandalismo e Graffiti**
- Ambientazione: zona commerciale di notte, muri colorati da graffiti
- Narrativa: il protagonista deve impedire atti vandalici raccogliendo pennelli e fermare i vandali avvertendo la polizia (telefono/radio nel livello)
- Ostacoli: spray di vernice che rallentano, zone scivolose
- Oggetti positivi: simboli di rispetto, monete (rappresentano contributi fiscali)
- Quiz: differenza tra street art autorizzata e vandalismo, sanzioni art. 639 CP
- Lesson finale: Agente spiega il valore dei beni pubblici e l'art. 635 CP

**Livello 3 — Regole Stradali e Sicurezza**
- Ambientazione: strade cittadine animate (auto, biciclette, pedoni)
- Narrativa: il protagonista deve attraversare la città rispettando tutte le regole del Codice della Strada
- Ostacoli: semafori rossi, auto che sfrecciano, zone di pericolo
- Oggetti positivi: simboli di rispetto (zebre, caschi, cinture)
- Quiz: Codice della Strada, regole per minori (bici, monopattini), cinture di sicurezza
- Lesson finale: Agente della Polizia Stradale spiega DL 285/1992 e sicurezza stradale

**Livello 4 — Cybercrime e Fake News**
- Ambientazione: "mondo digitale" stilizzato (piattaforme flottanti, pixel, icone social)
- Narrativa: il protagonista naviga nel cyberspazio raccogliendo informazioni vere e scartando fake news
- Ostacoli: virus informatici, phishing trap (trappole visive da schivare), hacker
- Oggetti positivi: lucchetti (sicurezza), checkmark (fact-check), scudi (antivirus)
- Quiz: riconoscere fake news, protezione dati personali, GDPR base, cosa è il phishing
- Lesson finale: Agente del Compartimento Polizia Postale spiega i reati informatici (D.Lgs. 231/2017)

**Livello 5 — Polizia di Stato: Missione Speciale (Boss Level)**
- Ambientazione: città in notturna, scenario di emergenza
- Narrativa: il protagonista affianca un agente in una missione di pattuglia, affrontando situazioni che riassumono tutti i temi precedenti
- Meccanica speciale: il personaggio ha un "badge da cadetto" che si riempie man mano
- Ostacoli: situazioni complesse che richiedono la scelta giusta (non la forza)
- Quiz: ruolo della Polizia di Stato, numero 113, come fare una denuncia, diritti dei cittadini
- Lesson finale: Commissario spiega l'organizzazione della Polizia di Stato e i valori del servizio pubblico
- Sblocca il badge "Cittadino Esemplare"

### Modulo 4 — Sistema Punteggio e Leaderboard

La leaderboard globale mostra i primi 100 giocatori ordinati per punteggio totale (somma dei migliori punteggi per ogni livello). È visibile senza login ma l'utente loggato vede evidenziata la propria posizione.

Quando un utente viene superato in classifica, riceve una notifica email (gestita da Resend) con il link per tornare a giocare. Le notifiche possono essere disabilitate dal profilo.

### Modulo 5 — Profilo Utente e Badge

La pagina profilo mostra: username, data registrazione, punteggio totale, posizione in leaderboard, badge sbloccati, riepilogo punteggi per livello.

**Badge previsti:**
| Badge | Condizione |
|---|---|
| Prima Vittoria | Completa il tutorial |
| Giustizia Civica | Completa il Livello 1 |
| Guardiano della Città | Completa il Livello 2 |
| Codice della Strada | Completa il Livello 3 |
| Sentinella Digitale | Completa il Livello 4 |
| Cittadino Esemplare | Completa il Livello 5 |
| Perfectionist | 100% risposta corretta ai quiz in un livello |
| Champion | Posizione nella top 10 leaderboard |
| Speed Runner | Completa un livello in meno di 2 minuti |

### Modulo 6 — Admin Panel

Accessibile solo agli utenti con ruolo `admin` alla route `/admin`. Funzionalità:
- Lista utenti con data registrazione e punteggi
- Possibilità di bannare/sospendere utenti
- Reset punteggio singolo utente
- Visualizzazione statistiche aggregate (utenti totali, partite giocate, livello più giocato)
- Export dati in CSV

### Modulo 7 — Notifiche Email

Gestite tramite **Resend** (3000 email/mese free):
- Email di conferma registrazione (template: benvenuto + link conferma)
- Email reset password
- Email "Sei stato superato in classifica" (optin, max 1 al giorno per utente)
- Email "Hai sbloccato un badge" (optin)

---

## 5. Requisiti Non Funzionali

### Performance
- First Contentful Paint < 2s su connessione 4G
- Game loop target: 60 FPS su device mid-range
- Assets del gioco compressi: totale < 5MB per livello
- Lazy loading degli asset di ogni livello (non caricare tutto al boot)

### Sicurezza
- Autenticazione gestita interamente da Supabase Auth (nessuna password gestita manualmente)
- Row Level Security (RLS) su Supabase: ogni utente accede solo ai propri dati
- Validazione lato server di tutti i punteggi inviati (anti-cheat base: range check)
- Nessun dato sensibile esposto lato client (no service_role key nel browser)
- Rate limiting sulle API routes di Next.js per prevenire spam

### Accessibilità
- Contrasto colori WCAG AA su tutte le UI non-game
- Font dimensione minima 16px per testi leggibili su mobile
- Joystick touch con area di tocco minima 44x44px
- Supporto per riduzione movimento (rispetta `prefers-reduced-motion` per animazioni UI)

### Compatibilità
- Browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 14+, Android 10+
- Risoluzione minima supportata: 375px (iPhone SE)
- Orientamento: landscape per desktop, portrait e landscape per mobile

---

## 6. Ruoli e Permessi

| Risorsa | Guest | Player | Admin |
|---|---|---|---|
| Tutorial | Gioca | Gioca | Gioca |
| Livelli 1-5 | NO | Gioca | Gioca |
| Leaderboard (lettura) | Sì | Sì | Sì |
| Salvare punteggio | NO | Sì | Sì |
| Profilo personale | NO | Legge/modifica il proprio | Legge tutti |
| Badge | NO | Riceve/visualizza i propri | Vede tutti |
| Admin Panel | NO | NO | Accesso completo |
| Disabilitare notifiche | NO | Sì | Sì |

---

## 7. Stack Tecnologico

| Layer | Tecnologia | Versione | Motivazione |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.x | SSR/SSG, API Routes, deploy Vercel nativo |
| Linguaggio | TypeScript | 5.x | Type safety, manutenibilità |
| Game Engine | Phaser.js | 3.x | Standard per browser games 2D, community enorme |
| UI Components | shadcn/ui | latest | Componenti accessibili, flat design, Tailwind |
| Styling | Tailwind CSS | 3.x | Utility-first, ottimo per responsive |
| Database | Supabase (PostgreSQL) | latest | Free tier, RLS, real-time, migrations |
| Auth | Supabase Auth | latest | Email/password, JWT, sessioni persistenti |
| Storage | Supabase Storage | latest | Asset gioco, avatar utenti |
| Email | Resend | latest | 3000 email/mese free, SDK semplice |
| Audio | Howler.js | 2.x | Gestione audio cross-browser, sprite audio |
| State | Zustand | 4.x | State management leggero per UI + game state |
| Form | React Hook Form + Zod | latest | Validazione form con type safety |
| Hosting | Vercel | - | Deploy automatico da GitHub, CDN globale |
| Analytics | Vercel Analytics | - | Free incluso in Vercel, no cookie |

### Servizi free tier utilizzati
- **Supabase Free**: 500MB DB, 1GB storage, 50MB bandwidth/giorno, 500 utenti auth
- **Vercel Hobby**: bandwidth illimitato, 100GB/mese, deploy automatici
- **Resend Free**: 3000 email/mese, 100/giorno
- **GitHub**: repo privato gratuito

---

## 8. Schema Database (ERD Dettagliato)

```sql
-- TABELLE PRINCIPALI

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 20),
  avatar_url  TEXT,
  notify_leaderboard BOOLEAN DEFAULT TRUE,
  notify_badges      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE levels (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  theme       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER UNIQUE NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

-- Dati seed livelli
INSERT INTO levels VALUES
  (0, 'Tutorial', 'Introduzione', 'Impara i controlli', 0, true),
  (1, 'Bullismo e Cyberbullismo', 'bullismo', 'Aiuta i tuoi compagni', 1, true),
  (2, 'Vandalismo e Graffiti', 'vandalismo', 'Proteggi i beni comuni', 2, true),
  (3, 'Regole della Strada', 'strada', 'Attraversa la città in sicurezza', 3, true),
  (4, 'Cybercrime e Fake News', 'cyber', 'Naviga sicuro nel web', 4, true),
  (5, 'Missione Polizia', 'polizia', 'Affianca le forze dell\'ordine', 5, true);

CREATE TABLE scores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_id     INTEGER NOT NULL REFERENCES levels(id),
  score        INTEGER NOT NULL CHECK (score >= 0 AND score <= 10000),
  time_seconds INTEGER NOT NULL CHECK (time_seconds > 0),
  quiz_bonus   INTEGER NOT NULL DEFAULT 0 CHECK (quiz_bonus >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, level_id) -- un solo record per user/level, aggiornato se migliorato
);

CREATE TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  icon_url        TEXT NOT NULL,
  condition_type  TEXT NOT NULL CHECK (condition_type IN (
    'level_complete', 'score_threshold', 'all_levels', 'quiz_perfect', 'speed_run', 'top10'
  )),
  condition_value JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- VIEW LEADERBOARD
CREATE VIEW leaderboard_view AS
SELECT
  p.id          AS user_id,
  p.username,
  p.avatar_url,
  COALESCE(SUM(s.score + s.quiz_bonus), 0)::INTEGER AS total_score,
  COUNT(DISTINCT s.level_id)::INTEGER               AS levels_completed,
  RANK() OVER (ORDER BY COALESCE(SUM(s.score + s.quiz_bonus), 0) DESC) AS rank
FROM profiles p
LEFT JOIN scores s ON s.user_id = p.id
GROUP BY p.id, p.username, p.avatar_url
ORDER BY total_score DESC;

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profili: visibili a tutti (per leaderboard), modificabili solo dal proprietario
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Punteggi: visibili a tutti, inseribili/aggiornabili solo dal proprietario
CREATE POLICY "Scores are viewable by everyone" ON scores FOR SELECT USING (true);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);

-- Badge utenti: visibili a tutti, inseribili solo dal sistema (service role)
CREATE POLICY "User badges viewable by everyone" ON user_badges FOR SELECT USING (true);
```

---

## 9. Wireframe Descrittivi

### Home Page (non loggato)
```
┌─────────────────────────────────────┐
│  🚔 CIVICHERO                [Login]│
├─────────────────────────────────────┤
│                                     │
│     ╔═══════════════════════╗       │
│     ║   🏙️  CIVICHERO        ║       │
│     ║  Impara la legalità   ║       │
│     ║  giocando!            ║       │
│     ╚═══════════════════════╝       │
│                                     │
│  [ ▶ GIOCA ORA  ]  [ CLASSIFICA ]   │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Lv. 1 │ │Lv. 2 │ │Lv. 3 │  ...    │
│  │🔒    │ │🔒    │ │🔒    │         │
│  └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

### Schermata di Gioco
```
┌─────────────────────────────────────┐
│ ⬅MENU  Lv.1: Bullismo  ⏱️02:34 🎯450│
├─────────────────────────────────────┤
│                                     │
│   🏫    [piattaforme]               │
│         🧑 ← personaggio            │
│   🟫▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬       │
│                      ❓ ← quiz      │
│         🏫🏫🏫                      │
│   🟫▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬       │
│                                     │
├─────────────────────────────────────┤
│ [←][→]  [↑ SALTA]      ❤️❤️❤️      │
└─────────────────────────────────────┘
```

### Quiz Checkpoint
```
┌─────────────────────────────────────┐
│         ❓ CHECKPOINT QUIZ          │
│                                     │
│  "Cos'è il cyberbullismo secondo    │
│   la legge italiana?"               │
│                                     │
│  ○ A) Solo il bullismo fisico       │
│  ● B) Atti aggressivi via internet  │
│  ○ C) Un videogioco violento        │
│  ○ D) Un reato solo per adulti      │
│                                     │
│  ⏱️ 15s  [CONFERMA RISPOSTA]        │
└─────────────────────────────────────┘
```

### Leaderboard
```
┌─────────────────────────────────────┐
│  🏆 CLASSIFICA GLOBALE              │
├─────────────────────────────────────┤
│  #  Username      Punti   Livelli   │
│ ─────────────────────────────────── │
│  1  🥇 CivicAce    4.850    5/5     │
│  2  🥈 LegalBoy    4.200    5/5     │
│  3  🥉 SafeCity    3.900    4/5     │
│ ...                                 │
│ ─────────────────────────────────── │
│ 47  ⭐ TU          1.200    2/5     │
└─────────────────────────────────────┘
```

### Profilo Utente
```
┌─────────────────────────────────────┐
│  👤 PROFILO — CivicAce              │
├─────────────────────────────────────┤
│  🏆 Punteggio totale: 4.850         │
│  📊 Posizione: #1 in classifica     │
│  🎮 Livelli completati: 5/5         │
│                                     │
│  BADGE SBLOCCATI:                   │
│  🎖️ Prima Vittoria                  │
│  🏅 Cittadino Esemplare             │
│  ⚡ Speed Runner                    │
│                                     │
│  PUNTEGGI PER LIVELLO:              │
│  Tutorial  ✅  850 pts              │
│  Bullismo  ✅  920 pts              │
│  Vandalismo ✅ 780 pts              │
└─────────────────────────────────────┘
```

---

## 10. Feature Roadmap

### MVP (Phase 0-6)
- Setup progetto (Next.js + Supabase + Vercel)
- Autenticazione (signup/login/logout/reset password)
- Guest mode (tutorial senza login)
- Integrazione Phaser.js
- Tutorial level funzionante
- Livelli 1-5 con meccaniche complete
- Sistema punteggio
- Leaderboard globale
- Profilo utente base

### V2 (Phase 7-9)
- Badge e achievement system
- Admin panel completo
- Notifiche email (Resend)
- Audio completo (musica + effetti)

### V3 (futuro)
- Modalità multiplayer locale (due giocatori, split screen)
- Livelli aggiuntivi su temi nuovi (ambiente, immigrazione, ecc.)
- Versione PWA installabile
- Integrazione con Google Classroom per insegnanti
- Certificati di completamento (PDF generato)
- Supporto multilingua (inglese, spagnolo)

---

## 11. Glossario

| Termine | Definizione |
|---|---|
| **Guest** | Utente non registrato, accede solo al tutorial |
| **Player** | Utente registrato, accede a tutti i livelli |
| **Checkpoint quiz** | Pausa nel livello con domanda di legalità; risposta giusta = power-up |
| **Power-up** | Bonus temporaneo (scudo, velocità, punti extra) sbloccato rispondendo al quiz |
| **Lesson finale** | Dialogo con personaggio della Polizia che spiega la legge di riferimento a fine livello |
| **Total score** | Somma del miglior punteggio dell'utente per ogni livello completato |
| **Badge** | Riconoscimento virtuale sbloccato al raggiungimento di una condizione specifica |
| **RLS** | Row Level Security: sistema Supabase per limitare accesso ai dati per ruolo |
| **Leaderboard** | Classifica globale degli utenti ordinata per punteggio totale |
| **Boss level** | Livello finale (Livello 5) con meccaniche più complesse e narrativa più ricca |
