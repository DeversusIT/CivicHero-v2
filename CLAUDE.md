# CLAUDE.md — Istruzioni operative per CivicHero

## Behavioral Rules (Karpathy Skills)

Queste regole hanno priorità su qualsiasi altro impulso. Seguile sempre, prima di scrivere codice.

1. **Think Before Coding** — Esplicita le tue assunzioni prima di implementare. Se hai dubbi su come procedere, chiedi invece di assumere silenziosamente.
2. **Simplicity First** — Scrivi il minimo codice necessario. Niente feature speculative, niente architetture premature. Chiediti: "Un senior engineer troverebbe questo overcomplicated?"
3. **Surgical Changes** — Tocca solo ciò che ti è stato chiesto. Non "migliorare" codice adiacente, non rimuovere codice non obsoleto per i tuoi cambiamenti.
4. **Goal-Driven Execution** — Prima di ogni task, trasformala in criteri di successo verificabili. Scrivi un mini-piano in 2-3 step, poi esegui.

---

## Ruolo e Obiettivo

Sei il lead developer di **CivicHero**, un videogioco educativo browser-based (platformer 2D) per ragazzi delle scuole medie. Il tuo compito è costruire l'applicazione dalla Phase 0 alla Phase 9 seguendo esattamente le specifiche del PRD.md e tracciando i progressi in PLANNING.md.

**Prima di ogni sessione di lavoro:**
1. Leggi la sezione corrente di PLANNING.md per capire dove siamo
2. Identifica le task `[ ]` nella fase attiva
3. Lavora su una task alla volta, marcandola `[x]` al completamento
4. Aggiorna `PLANNING.md` con note e blockers se necessario

---

## Stack Obbligatorio

### DA USARE (non sostituire senza esplicita approvazione)

| Layer | Tecnologia |
|---|---|
| Framework | **Next.js 14** con App Router |
| Linguaggio | **TypeScript** (strict mode) |
| Game Engine | **Phaser.js 3** |
| UI Components | **shadcn/ui** |
| Styling | **Tailwind CSS** |
| Database + Auth | **Supabase** |
| Email | **Resend** |
| Audio | **Howler.js** |
| State | **Zustand** |
| Form | **React Hook Form + Zod** |
| Hosting | **Vercel** |

### DA NON USARE (vietati)

- ❌ `create-react-app` o Vite come alternativa a Next.js
- ❌ Firebase o Prisma al posto di Supabase
- ❌ SendGrid, Nodemailer o altri al posto di Resend
- ❌ Redux, Jotai o altri al posto di Zustand
- ❌ MUI, Ant Design o altri al posto di shadcn/ui
- ❌ Unity, Godot, PixiJS o altri game engine al posto di Phaser.js
- ❌ `any` TypeScript (usa `unknown` e type narrowing)
- ❌ `useEffect` per fetch dati (usa Server Components o SWR/React Query)
- ❌ `localStorage` per dati autenticazione (Supabase gestisce tutto)

---

## Struttura Directory

```
civichero/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: pagine auth
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (game)/                   # Route group: pagine gioco
│   │   ├── game/[levelId]/page.tsx
│   │   └── game/[levelId]/loading.tsx
│   ├── admin/                    # Pannello admin (protetto)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── leaderboard/page.tsx
│   ├── profile/[username]/page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css
├── components/
│   ├── game/                     # Componenti specifici del gioco
│   │   ├── GameCanvas.tsx        # Wrapper Phaser + React
│   │   ├── QuizModal.tsx         # Modale checkpoint quiz
│   │   ├── LevelEndModal.tsx     # Modale fine livello
│   │   └── MobileControls.tsx    # Joystick touch
│   ├── ui/                       # shadcn/ui components (auto-generati)
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── LeaderboardTable.tsx
│       ├── BadgeCard.tsx
│       └── ScoreDisplay.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   ├── server.ts             # createServerClient (per Server Components)
│   │   └── middleware.ts         # refreshSession in middleware
│   ├── game/
│   │   ├── engine/
│   │   │   ├── BaseScene.ts      # Classe base per tutti i livelli
│   │   │   ├── GameConfig.ts     # Configurazione Phaser globale
│   │   │   └── AudioManager.ts  # Wrapper Howler.js
│   │   ├── scenes/
│   │   │   ├── TutorialScene.ts
│   │   │   ├── Level1Scene.ts
│   │   │   ├── Level2Scene.ts
│   │   │   ├── Level3Scene.ts
│   │   │   ├── Level4Scene.ts
│   │   │   └── Level5Scene.ts
│   │   ├── data/
│   │   │   ├── quiz-questions.ts # Domande quiz per livello
│   │   │   └── level-config.ts   # Config narrativa e meccaniche per livello
│   │   └── types.ts              # Tipi TypeScript del gioco
│   ├── validations/
│   │   ├── auth.ts               # Zod schemas per auth forms
│   │   └── score.ts              # Zod schema per validazione punteggi
│   └── utils.ts                  # Utility generali (cn, formatScore, ecc.)
├── hooks/
│   ├── useAuth.ts                # Stato autenticazione
│   ├── useLeaderboard.ts         # Fetch leaderboard con SWR
│   └── useProfile.ts             # Fetch e update profilo
├── store/
│   └── gameStore.ts              # Zustand: stato partita corrente
├── public/
│   ├── assets/
│   │   ├── sprites/              # Spritesheet Phaser (PNG)
│   │   ├── tilemaps/             # Mappe livelli (JSON Tiled)
│   │   ├── audio/                # Musica e SFX (WebAudio-compatible)
│   │   │   ├── bgm/              # Musiche di sottofondo (.ogg, .mp3)
│   │   │   └── sfx/              # Effetti sonori (.ogg, .mp3)
│   │   └── ui/                   # Icone UI, badge PNG
│   └── fonts/                    # Font personalizzati (se usati)
├── supabase/
│   ├── migrations/               # Migration SQL numerate
│   │   └── 0001_initial_schema.sql
│   └── seed.sql                  # Dati seed (livelli, badge)
├── emails/
│   └── templates/                # Template email React (react-email)
│       ├── WelcomeEmail.tsx
│       ├── LeaderboardAlert.tsx
│       └── BadgeEarned.tsx
├── middleware.ts                 # Auth middleware Next.js
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                    # NON committare mai
├── .env.example                  # Committare sempre
├── .gitignore
├── PRD.md
├── CLAUDE.md
└── PLANNING.md
```

---

## Convenzioni di Codice

### Naming
- **Componenti React**: PascalCase (`GameCanvas.tsx`, `QuizModal.tsx`)
- **Hooks**: camelCase con prefisso `use` (`useAuth.ts`, `useLeaderboard.ts`)
- **Utility/lib**: camelCase (`formatScore`, `cn`)
- **Tipi TypeScript**: PascalCase (`GameState`, `LevelConfig`, `QuizQuestion`)
- **Costanti**: UPPER_SNAKE_CASE (`MAX_QUIZ_TIME_SECONDS`, `BASE_SCORE_PER_LEVEL`)
- **Variabili d'ambiente**: prefisso `NEXT_PUBLIC_` solo per valori sicuri lato client

### Componenti
- Preferire **Server Components** di default; aggiungere `"use client"` solo se necessario (interattività, hooks, browser API)
- Props: sempre tipizzate con `interface` o `type` espliciti
- Nessun `React.FC` — usa funzioni normali con return type esplicito
- Export named di default per i componenti: `export default function NomeComponente`

### API Routes
- Tutte le route in `app/api/` sono **Route Handlers** Next.js 14
- Sempre validare input con Zod prima di qualsiasi operazione DB
- Restituire sempre `{ data, error }` come struttura di risposta
- Usare `createServerClient` di Supabase per le operazioni server-side
- Mai esporre la `service_role` key nelle route accessibili dall'utente

### Database (Supabase)
- Ogni operazione DB usa il client appropriato (browser vs server)
- RLS sempre attivo — non usare mai `service_role` nel frontend
- Le migration sono file SQL numerati in `supabase/migrations/`
- Per aggiornare lo schema: creare un nuovo file migration, mai editare quelli esistenti
- I tipi TypeScript del DB si generano con: `npx supabase gen types typescript --local > lib/supabase/database.types.ts`

### Gestione Errori
- Errori Supabase: gestire sempre il campo `.error` prima di usare `.data`
- Errori nelle Server Actions: usare `try/catch` e restituire `{ success: false, error: string }`
- Errori di form: gestiti da React Hook Form + Zod, mostrati inline
- Errori fatali in game: `Phaser.Scene.sys.events` per eventi di errore

---

## Variabili d'Ambiente

### File `.env.local` (mai committare)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Solo lato server

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@civichero.vercel.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000   # In produzione: https://civichero.vercel.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com   # Email admin per primo setup
```

### File `.env.example` (committare senza valori reali)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ADMIN_EMAIL=
```

---

## Checklist Sicurezza

Da verificare prima di ogni feature che tocca autenticazione, punteggi o dati utente:

- [ ] RLS abilitato sulla tabella coinvolta?
- [ ] Policy RLS corretta (l'utente può accedere solo ai propri dati)?
- [ ] Input validato con Zod lato server?
- [ ] La `service_role` key NON è usata lato client?
- [ ] I punteggi inviati dal client sono validati server-side (range check)?
- [ ] Le route admin sono protette dal check `isAdmin` nel middleware?
- [ ] Le variabili `NEXT_PUBLIC_*` non contengono secret?
- [ ] Il `.env.local` è nel `.gitignore`?

---

## Workflow Sessione per Sessione

1. **Inizia ogni sessione** leggendo `PLANNING.md` per capire lo stato attuale
2. **Identifica la prima task `[ ]`** nella fase corrente
3. **Prima di scrivere codice**, leggi i file esistenti coinvolti
4. **Implementa la task** in modo atomico e testabile
5. **Aggiorna `PLANNING.md`**: marca la task `[x]` appena completata
6. **Se incontri un blocker**, annotalo in "Note e blockers" di PLANNING.md
7. **Non passare alla fase successiva** finché tutte le task della fase corrente non sono `[x]`
8. **Milestone di verifica**: al completamento di ogni fase, esegui il criterio di verifica scritto in PLANNING.md

---

## Regole Schema DB

- **Aggiungere colonne**: creare una nuova migration (`0002_add_colonna.sql`)
- **Rinominare colonne**: migration con `ALTER TABLE ... RENAME COLUMN`
- **Eliminare colonne**: migration con `ALTER TABLE ... DROP COLUMN` (attenzione ai dati!)
- **Mai modificare** migration già committate — solo aggiungerne di nuove
- **Rigenerare i tipi** dopo ogni migration: `npx supabase gen types typescript`
- **Dati seed** (livelli, badge): in `supabase/seed.sql`, rieseguibile senza errori (usa `INSERT ... ON CONFLICT DO NOTHING`)

---

## Note sul Deployment

### Setup Vercel
1. Connetti la repo GitHub a Vercel (import progetto)
2. Aggiungi tutte le variabili d'ambiente nel pannello Vercel (Settings > Environment Variables)
3. Il deploy avviene automaticamente ad ogni push su `main`
4. Preview deployment automatici per ogni PR/branch

### Setup Supabase
1. Crea progetto su supabase.com (piano Free)
2. Esegui le migration in ordine: `supabase db push` o copia/incolla le SQL nell'editor
3. Esegui il seed: `psql $DATABASE_URL < supabase/seed.sql`
4. Abilita conferma email in Authentication > Settings

### Primo admin
Dopo il deploy, registra l'account con l'email in `NEXT_PUBLIC_ADMIN_EMAIL`, poi esegui manualmente in Supabase SQL Editor:
```sql
INSERT INTO profiles (id, username) VALUES (auth.uid(), 'admin');
-- poi aggiungi il ruolo admin nella tabella user_metadata o con una colonna dedicata
```

### Resend
1. Crea account su resend.com (piano Free: 3000 email/mese)
2. Verifica il dominio o usa il dominio di test Resend per sviluppo
3. Copia l'API key nelle variabili d'ambiente
