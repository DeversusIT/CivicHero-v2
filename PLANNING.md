# CivicHero — Planning & Progress Tracker

**Status corrente:** Phase 0 — Setup Progetto
**Creato il:** 2026-04-12
**Ultimo aggiornamento:** 2026-04-12

---

## Stack di riferimento

| Layer | Tecnologia | Free tier |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | ✅ Open source |
| Game Engine | Phaser.js 3 | ✅ Open source |
| Database + Auth | Supabase | ✅ 500MB DB, 50K utenti |
| Hosting | Vercel | ✅ Hobby plan illimitato |
| Email | Resend | ✅ 3000 email/mese |
| Audio | Howler.js | ✅ Open source |
| UI | Tailwind CSS + shadcn/ui | ✅ Open source |
| State | Zustand | ✅ Open source |

**File di riferimento:**
- `PRD.md` — Specifiche prodotto complete
- `CLAUDE.md` — Regole operative e stack vincolante
- `supabase/migrations/` — SQL migrations

---

## Legenda Stati

| Simbolo | Significato |
|---|---|
| `[ ]` | Da fare |
| `[~]` | In corso |
| `[x]` | Completato |
| `[-]` | Rimandato / Non applicabile |

---

## Variabili d'Ambiente Necessarie

```env
NEXT_PUBLIC_SUPABASE_URL=           # Dashboard Supabase > Settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Dashboard Supabase > Settings > API
SUPABASE_SERVICE_ROLE_KEY=          # Dashboard Supabase > Settings > API (solo server)
RESEND_API_KEY=                     # Dashboard Resend > API Keys
RESEND_FROM_EMAIL=                  # Email mittente verificata su Resend
NEXT_PUBLIC_APP_URL=                # https://civichero.vercel.app in produzione
NEXT_PUBLIC_ADMIN_EMAIL=            # Email account admin iniziale
```

---

## Decisioni Architetturali

| Data | Decisione | Motivazione |
|---|---|---|
| 2026-04-12 | Next.js 14 App Router | Routing nativo, Server Components, API Routes integrate, ottimale per Vercel |
| 2026-04-12 | Phaser.js 3 come componente React | Standard per browser games 2D, community enorme, gratuito |
| 2026-04-12 | Supabase per DB + Auth | Free tier generoso, RLS nativo, email auth built-in, real-time subscriptions |
| 2026-04-12 | Vercel per deploy | Deploy automatico da GitHub, CDN globale, free per hobby |
| 2026-04-12 | Resend per email | 3000/mese free, SDK semplice, template React |
| 2026-04-12 | Guest mode solo tutorial | Bilanciamento UX (prova gratis) vs incentivo alla registrazione |
| 2026-04-12 | 5 livelli tematici + tutorial | Bullismo, Vandalismo, Strada, Cybercrime, Missione Polizia |
| 2026-04-12 | Punteggio unico per livello (best score) | Semplifica leaderboard, incentiva il miglioramento |

---

## Phase 0 — Setup Progetto

**Obiettivo:** Progetto funzionante in locale e su Vercel, DB configurato, repo GitHub connessa.

### Task

- [x] Inizializzare progetto Next.js 14 con TypeScript: `npx create-next-app@latest civichero --typescript --tailwind --eslint --app`
- [x] Installare dipendenze: `phaser`, `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `howler`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`
- [x] Installare shadcn/ui e componenti base: `button`, `input`, `label`, `card`, `dialog`, `badge`, `avatar`, `table`, `dropdown-menu`
- [x] Configurare Tailwind CSS (colori brand CivicHero: blu istituzionale #003087, accento giallo #FFD700)
- [x] Creare `lib/supabase/client.ts` (browser client)
- [x] Creare `lib/supabase/server.ts` (server client per Server Components)
- [x] Creare `middleware.ts` per refresh sessione Supabase
- [x] Creare `.env.local` con variabili (non committare) e `.env.example` (committare)
- [ ] Creare progetto Supabase su supabase.com
- [x] Eseguire migration `0001_initial_schema.sql` (tabelle: profiles, levels, scores, badges, user_badges, view leaderboard_view, RLS policies)
- [x] Eseguire seed livelli e badge in Supabase
- [ ] Creare repository GitHub e collegare a Vercel
- [ ] Configurare variabili d'ambiente su Vercel
- [ ] Verificare deploy preview funzionante

**Verifica:** `npm run dev` avvia senza errori, Vercel deploy verde, connessione Supabase OK (SELECT da tabella `levels` restituisce 6 righe).

---

## Phase 1 — Sistema di Autenticazione

**Obiettivo:** Signup, login, logout, reset password funzionanti. Guest mode per il tutorial.

### Task

- [ ] Creare pagina `/login` con form email + password (React Hook Form + Zod)
- [ ] Creare pagina `/register` con form email + password + username (validazione unicità username via Supabase)
- [ ] Creare trigger Supabase per creare automaticamente il record in `profiles` al signup
- [ ] Creare pagina `/reset-password` (invio email reset)
- [ ] Creare pagina `/reset-password/confirm` (inserimento nuova password con token URL)
- [ ] Implementare logout (pulsante in header)
- [ ] Creare hook `useAuth` per stato utente globale
- [ ] Proteggere le route `/game/[levelId]` (livelli 1-5) con redirect al login se non autenticato
- [ ] Implementare guest mode: tutorial accessibile senza login, modal di invito registrazione al termine
- [ ] Aggiungere email di conferma registrazione via Resend (template `WelcomeEmail`)
- [ ] Testare flusso completo: signup → conferma email → login → logout → reset password

**Verifica:** Un utente può registrarsi, riceve email di conferma, accede con le credenziali, accede al tutorial senza login, viene bloccato al livello 1 senza login.

---

## Phase 2 — Integrazione Phaser.js

**Obiettivo:** Phaser.js integrato in Next.js, canvas di gioco funzionante su desktop e mobile.

### Task

- [ ] Installare e configurare Phaser.js 3 (import dinamico per evitare SSR issues)
- [ ] Creare `lib/game/engine/GameConfig.ts` con configurazione Phaser base
- [ ] Creare `components/game/GameCanvas.tsx` (wrapper `"use client"` con lifecycle Phaser)
- [ ] Creare `lib/game/engine/BaseScene.ts` con metodi comuni (score tracking, quiz trigger, level end)
- [ ] Creare `lib/game/types.ts` (GameState, QuizQuestion, LevelConfig, PlayerData)
- [ ] Creare `store/gameStore.ts` (Zustand: score, lives, currentLevel, quizOpen)
- [ ] Creare `components/game/MobileControls.tsx` (joystick touch D-pad per mobile)
- [ ] Creare `components/game/QuizModal.tsx` (modale domanda con timer 15s)
- [ ] Creare `components/game/LevelEndModal.tsx` (modale finale livello con lesson e score)
- [ ] Testare canvas Phaser su Chrome desktop e Safari mobile (iOS)

**Verifica:** La pagina `/game/0` (tutorial) mostra un canvas Phaser vuoto senza errori console. Il joystick touch appare su mobile. La QuizModal si apre e chiude correttamente.

---

## Phase 3 — Tutorial Level

**Obiettivo:** Tutorial completo e giocabile con meccaniche guidate.

### Task

- [ ] Creare asset sprite personaggio principale (o trovare asset free license compatibile)
- [ ] Creare tilemap tutorial con Tiled Editor (esportare in JSON)
- [ ] Creare `lib/game/scenes/TutorialScene.ts` con meccaniche base:
  - [ ] Personaggio con fisiche platformer (salto, movimento)
  - [ ] Collisioni con piattaforme
  - [ ] Camera che segue il personaggio
  - [ ] Timer countdown
  - [ ] Raccolta oggetti (+punti)
  - [ ] Collisione ostacoli (-vite)
  - [ ] Tooltip guidati per ogni meccanica
- [ ] Creare finale tutorial: LevelEndModal con testo introduttivo (nessuna lesson specifica)
- [ ] Per guest: mostrare modal invito registrazione alla fine del tutorial
- [ ] Aggiungere pagina `/game/0` che carica TutorialScene

**Verifica:** Il tutorial è completabile da inizio a fine. Il personaggio salta, raccoglie oggetti, la camera segue. Il tooltip appare sulle prime azioni. La modal di fine tutorial invita alla registrazione se guest.

---

## Phase 4 — Livelli 1, 2, 3

**Obiettivo:** Tre livelli tematici funzionanti (Bullismo, Vandalismo, Strada).

### Task

#### Livello 1 — Bullismo e Cyberbullismo
- [ ] Creare tilemap ambientazione scolastica
- [ ] Creare `Level1Scene.ts` con meccaniche specifiche (bulli da schivare, simboli di supporto da raccogliere)
- [ ] Creare dati quiz in `lib/game/data/quiz-questions.ts` per livello 1 (5 domande)
- [ ] Implementare checkpoint quiz nel livello 1
- [ ] Creare LevelEndModal con lesson "Bullismo" (testo + riferimento L. 71/2017)

#### Livello 2 — Vandalismo e Graffiti
- [ ] Creare tilemap zona commerciale notturna
- [ ] Creare `Level2Scene.ts` con meccaniche specifiche (spray da evitare, telefono per chiamare polizia)
- [ ] Creare dati quiz per livello 2 (5 domande)
- [ ] Implementare checkpoint quiz nel livello 2
- [ ] Creare LevelEndModal con lesson "Vandalismo" (art. 635 e 639 CP)

#### Livello 3 — Regole Stradali
- [ ] Creare tilemap strade cittadine con veicoli
- [ ] Creare `Level3Scene.ts` (semafori interattivi, zebre da attraversare, auto in movimento)
- [ ] Creare dati quiz per livello 3 (5 domande)
- [ ] Implementare checkpoint quiz nel livello 3
- [ ] Creare LevelEndModal con lesson "Strada" (DL 285/1992)

**Verifica:** I livelli 1-3 sono completabili. I quiz si attivano ai checkpoint. Il punteggio viene calcolato correttamente. Ogni livello ha una lesson finale con riferimento di legge.

---

## Phase 5 — Livelli 4 e 5

**Obiettivo:** Livelli 4 e 5 funzionanti, incluso il boss level con la Polizia.

### Task

#### Livello 4 — Cybercrime e Fake News
- [ ] Creare tilemap "mondo digitale" stilizzato (piattaforme flottanti, estetica pixel-digitale)
- [ ] Creare `Level4Scene.ts` (virus da schivare, checkmark da raccogliere, phishing-trap)
- [ ] Creare dati quiz per livello 4 (5 domande su fake news, GDPR, phishing)
- [ ] Creare LevelEndModal con lesson "Cyber" (Polizia Postale, D.Lgs. 231/2017)

#### Livello 5 — Missione Polizia (Boss Level)
- [ ] Creare tilemap città notturna (più ampia degli altri livelli)
- [ ] Creare `Level5Scene.ts` con meccaniche speciali:
  - [ ] "Badge da cadetto" che si riempie (progress bar a schermo)
  - [ ] Scelte multiple in-game (non quiz: dialoghi con NPC)
  - [ ] Scenari che riassumono i temi dei 4 livelli precedenti
- [ ] Creare dati quiz per livello 5 (5 domande su Polizia di Stato, numero 113, diritti)
- [ ] Creare LevelEndModal finale con discorso del Commissario e sblocco badge "Cittadino Esemplare"

**Verifica:** I livelli 4 e 5 sono completabili. Il boss level ha la progress bar del badge. Al completamento del livello 5 si sblocca il badge "Cittadino Esemplare".

---

## Phase 6 — Punteggio e Leaderboard

**Obiettivo:** Sistema di salvataggio punteggi e leaderboard globale funzionante.

### Task

- [ ] Creare API route `POST /api/scores` per salvare/aggiornare punteggio (validazione Zod + check best score)
- [ ] Aggiungere anti-cheat base: range check punteggio (0-10000) e time check (min 30s)
- [ ] Creare hook `useLeaderboard` per fetch classifica (con SWR o React cache)
- [ ] Creare pagina `/leaderboard` con tabella top 100
- [ ] Evidenziare la posizione dell'utente loggato nella leaderboard
- [ ] Integrare il salvataggio punteggio al completamento di ogni livello (LevelEndModal)
- [ ] Aggiungere link "Vai alla leaderboard" nella homepage e nell'header

**Verifica:** Completare un livello salva il punteggio in Supabase. La pagina `/leaderboard` mostra la classifica aggiornata. La posizione dell'utente è evidenziata. Un punteggio più basso del record esistente NON sovrascrive.

---

## Phase 7 — Profilo Utente e Badge

**Obiettivo:** Pagina profilo completa con statistiche e badge.

### Task

- [ ] Creare pagina `/profile/[username]` con:
  - [ ] Username, avatar (placeholder iniziali se no avatar)
  - [ ] Punteggio totale e posizione in leaderboard
  - [ ] Griglia livelli completati con punteggio per ognuno
  - [ ] Griglia badge sbloccati (opachi quelli non ancora ottenuti)
- [ ] Creare API route per aggiornare profilo (username, avatar)
- [ ] Implementare logica di sblocco badge lato server (trigger Supabase o API route post-score)
- [ ] Inserire seed dei badge in `supabase/seed.sql`
- [ ] Testare sblocco badge: Prima Vittoria, livelli singoli, Perfectionist, Speed Runner, Champion

**Verifica:** Completare il tutorial sblocca "Prima Vittoria". Completare tutti i livelli sblocca "Cittadino Esemplare". La pagina profilo mostra tutti i badge con stato locked/unlocked.

---

## Phase 8 — Admin Panel

**Obiettivo:** Pannello admin protetto per gestione utenti e statistiche.

### Task

- [ ] Aggiungere colonna `role` in `profiles` (valori: `player`, `admin`) con migration `0002_add_role.sql`
- [ ] Aggiornare middleware per proteggere le route `/admin/*` (redirect se non admin)
- [ ] Creare `app/admin/page.tsx` con dashboard statistiche:
  - [ ] Totale utenti registrati
  - [ ] Partite giocate per livello
  - [ ] Punteggio medio per livello
- [ ] Creare `app/admin/users/page.tsx` con lista utenti (username, email, data registrazione, punteggio)
- [ ] Implementare funzione "Sospendi utente" (blocca accesso senza eliminare dati)
- [ ] Implementare "Reset punteggio" per utente specifico (con conferma)
- [ ] Creare API route `GET /api/admin/export` per export CSV utenti e punteggi
- [ ] Creare primo admin: documentare procedura SQL manuale in CLAUDE.md

**Verifica:** Accedere a `/admin` senza account admin redirige alla home. Con account admin, la dashboard mostra statistiche reali. Il CSV export funziona.

---

## Phase 9 — Notifiche Email e Audio

**Obiettivo:** Sistema email operativo e audio integrato nel gioco.

### Task

#### Email (Resend)
- [ ] Creare template `WelcomeEmail.tsx` con react-email
- [ ] Creare template `LeaderboardAlert.tsx` (sei stato superato in classifica)
- [ ] Creare template `BadgeEarned.tsx` (hai sbloccato un badge)
- [ ] Creare API route `POST /api/emails/leaderboard-alert` (chiamata dal server quando un punteggio supera un altro)
- [ ] Aggiungere preferenze notifiche nel profilo utente (notify_leaderboard, notify_badges toggle)
- [ ] Testare invio email in sviluppo con Resend test mode

#### Audio (Howler.js)
- [ ] Creare `lib/game/engine/AudioManager.ts` con wrapper Howler.js
- [ ] Trovare/creare audio free license (BGM per ogni livello + SFX: salto, raccolta, quiz, errore, vittoria)
- [ ] Integrare AudioManager in BaseScene
- [ ] Aggiungere toggle mute in-game (pulsante 🔊/🔇 nell'UI di gioco)
- [ ] Testare audio su iOS (richiede user gesture per avviare audio)

**Verifica:** Registrare un utente invia la welcome email. Superare qualcuno in classifica manda l'alert (se preferenza attiva). Il gioco ha audio con possibilità di mutare.

---

## Tabella Riepilogativa Fasi

| Fase | Obiettivo | Stato | Note |
|---|---|---|---|
| Phase 0 | Setup progetto | `[~]` | Supabase project + Vercel deploy da configurare manualmente |
| Phase 1 | Autenticazione | `[ ]` | Dipende da Phase 0 |
| Phase 2 | Integrazione Phaser.js | `[ ]` | Dipende da Phase 1 |
| Phase 3 | Tutorial Level | `[ ]` | Dipende da Phase 2 |
| Phase 4 | Livelli 1-3 | `[ ]` | Dipende da Phase 3 |
| Phase 5 | Livelli 4-5 | `[ ]` | Dipende da Phase 4 |
| Phase 6 | Punteggio + Leaderboard | `[ ]` | Dipende da Phase 2 |
| Phase 7 | Profilo + Badge | `[ ]` | Dipende da Phase 6 |
| Phase 8 | Admin Panel | `[ ]` | Dipende da Phase 7 |
| Phase 9 | Email + Audio | `[ ]` | Dipende da Phase 7 |

---

## Note e Blockers

_Nessun blocker al momento. Aggiungere qui annotazioni in corso d'opera._

---

## Quick Reference — Comandi Utili

```bash
# Sviluppo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Generare tipi Supabase (dopo migration)
npx supabase gen types typescript --local > lib/supabase/database.types.ts

# Eseguire migration in locale (richiede Supabase CLI)
npx supabase db push

# Deploy su Vercel (automatico da push su main)
git push origin main
```
