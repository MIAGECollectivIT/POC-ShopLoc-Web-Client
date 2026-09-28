# MIAGE Collectiv'IT - ShopLoc (Front-End Web Client)

ShopLoc is a municipal loyalty and local commerce web platform developed as part of the GLOP (*Génie Logiciel par la Pratique*) course. The application allows citizens to discover partner stores, view detailed merchant profiles, and participate in local loyalty initiatives.

---

## 1. Technology Stack (From A to Z)

The frontend is architected around modern web standards prioritizing extreme performance, minimal resource consumption (eco-design), and a clean developer experience.

### Astro 5 (Core Web Framework)
[Astro](https://astro.build/) serves as the foundational fullstack framework.
- **Server-Side Rendering (SSR)**: Configured in `output: 'server'` mode using `@astrojs/node` standalone adapter. Pages are rendered dynamically on the server upon incoming requests, allowing real-time data fetching from the Spring Boot API.
- **Islands Architecture (Zero JS by Default)**: Unlike traditional Single Page Applications (SPAs) or frameworks like Next.js that hydrate the entire DOM with a JavaScript runtime, Astro compiles all pages and React components to **pure static HTML and CSS**. The client browser receives 0 KB of runtime JavaScript by default.
- **File-Based Routing**:
  - `src/pages/index.astro` maps to `/`.
  - `src/pages/shops/[id].astro` dynamically maps to `/shops/:id`.
  - Dynamic redirects (such as `src/pages/produits/[id].astro`) handle legacy aliases cleanly.
- **Component Syntax (`.astro`)**:
  - **Code Fence (`---`)**: Runs exclusively on the server at request time (fetching data, importing components, parsing parameters).
  - **Template Area**: JSX-like HTML markup rendered to the response stream.

### React 19 (`@astrojs/react`)
React is integrated seamlessly into Astro to enable component-driven UI development.
- React components (such as Shadcn cards and buttons) are pre-rendered into static HTML on the server.
- When client-side interactivity is required, Astro allows opting into partial hydration using client directives (`client:load`, `client:visible`, etc.).

### Shadcn UI (Base-Nova)
[Shadcn UI](https://ui.shadcn.com/) provides high-quality, accessible UI primitives.
- **Not an NPM Dependency**: Components are added directly as source code into `src/components/ui/`, granting complete control over styling, accessibility, and behavior.
- **Strict Composition**: Follows atomic component patterns (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- **Installed Components**:
  - `card.tsx`: Structured layout containers for merchants.
  - `button.tsx`: Variant-driven buttons and accessible link anchors (`buttonVariants`).
  - `badge.tsx`: Status and identifier labels.

### Tailwind CSS v4
[Tailwind CSS v4](https://tailwindcss.com/) powers the design system.
- **Vite Integration**: Uses `@tailwindcss/vite` for instantaneous Hot Module Replacement (HMR).
- **CSS-First Configuration**: Design tokens, color palettes, and container queries are configured directly in `src/styles/globals.css` using modern `@theme inline` blocks and the OKLCH color space.

### Lucide React
[Lucide React](https://lucide.dev/) delivers lightweight, accessible, tree-shakable SVG icons (`Store`, `MapPin`, `ShieldCheck`, `ArrowLeft`, etc.).

### TypeScript
End-to-end type safety across the entire application:
- Centralized data models (`src/types/shop.ts`).
- Strongly-typed API client contracts.
- Static checking of Astro props and component attributes.

---

## 2. Project Directory Structure

```text
ShopLoc-Web-Client/
├── compose.yaml              # Docker Compose service definition
├── Dockerfile                # Multi-stage production container build
├── README.md                 # Project documentation
└── shoploc/                  # Astro frontend root
    ├── astro.config.mjs      # Astro configuration (SSR, React, Tailwind, Node adapter)
    ├── components.json       # Shadcn UI CLI configuration
    ├── package.json          # Node dependencies and scripts
    ├── public/               # Static assets (favicons, public images)
    ├── src/
    │   ├── components/
    │   │   ├── ui/           # Atomic Shadcn components (button, card, badge)
    │   │   └── ShopCard.tsx  # Domain component: merchant card
    │   ├── layouts/
    │   │   └── Layout.astro  # Base HTML shell with navigation header and slot
    │   ├── lib/
    │   │   ├── api.ts        # Spring Boot REST API client
    │   │   └── utils.ts      # Class merging helper (cn utility)
    │   ├── pages/
    │   │   ├── index.astro         # Store directory page (SSR)
    │   │   ├── shops/[id].astro    # Merchant profile detail page (SSR)
    │   │   └── produits/[id].astro # Redirect handler
    │   ├── styles/
    │   │   └── globals.css   # Tailwind v4 theme, design tokens, and base styles
    │   └── types/
    │       └── shop.ts       # TypeScript interfaces (Shop model)
    └── dist/                 # Production build output
```

---

## 3. Architecture and System Coexistence

The complete ShopLoc solution consists of two decoupled repositories operating side by side:
- **Backend (`Service-Shop`)**: Spring Boot 3 REST API + PostgreSQL database.
- **Frontend (`ShopLoc-Web-Client`)**: Astro SSR application.

### Host Port Mapping (`localhost`):

| Service | Host Port | Internal Port | Description |
|---|---|---|---|
| **ShopLoc Web Client** | `3000` | `3000` | Astro SSR frontend container |
| **Service-Shop Backend** | `8080` | `8080` | Spring Boot REST API (`/api/shops`) |
| **PostgreSQL Database** | `5432` | `5432` | PostgreSQL relational storage |

### Cross-Origin & Container Networking:
- **CORS**: The Spring Boot backend explicitly authorizes requests originating from `http://localhost:3000`.
- **Docker Bridge**: When running the frontend inside Docker, `compose.yaml` uses `extra_hosts: ["host.docker.internal:host-gateway"]` to route server-side requests from the Astro container to the backend running on the host machine.

---

## 4. How to Use Astro in this Project

### Understanding the `.astro` Page Lifecycle
Every `.astro` file in `src/pages/` represents a route. When a user requests a URL:
1. The code between the `---` fences runs exclusively on the Node.js server.
2. Data is fetched from the backend REST API via `await getShops()`.
3. If an error occurs, it is captured on the server and an accessible error state is prepared.
4. The template renders down to plain HTML and is streamed to the user's browser.

Example of an Astro page (`src/pages/index.astro`):
```astro
---
import Layout from "../layouts/Layout.astro";
import { ShopCard } from "../components/ShopCard";
import { getShops } from "../lib/api";

// 1. Server execution: data fetching
const shops = await getShops();
---

<!-- 2. Template execution: server-rendered HTML -->
<Layout title="Shops Directory">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {shops.map((shop) => (
      <ShopCard shop={shop} />
    ))}
  </div>
</Layout>
```

### Adding Interactive Islands
By default, React components in Astro render static HTML without client-side JavaScript. If a component requires client interactivity (e.g., modals, search filters, state toggles), add an Astro client directive:

```astro
<!-- Hydrates immediately upon page load -->
<InteractiveFilter client:load />

<!-- Hydrates only when scrolled into the viewport -->
<MerchantReviewCarousel client:visible />
```

### Adding New Shadcn UI Components
To add a new Shadcn UI component, run the following command from the `shoploc` directory:
```bash
cd shoploc
npx shadcn@latest add dialog
```
The CLI automatically places the component source code in `src/components/ui/` configured to work with the project's Tailwind v4 tokens.

---

## 5. Development and Execution Guide

### Option 1: Quick Start with Docker Compose (Recommended)

1. **Start the Backend (`Service-Shop`)**:
   ```bash
   cd Service-Shop
   docker compose up --build -d
   ```
   Confirm the backend is operational:
   ```bash
   curl http://localhost:8080/api/shops
   ```

2. **Start the Frontend (`ShopLoc-Web-Client`)**:
   ```bash
   cd ShopLoc-Web-Client
   docker compose up --build -d
   ```

3. **Open the Application**:
   Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.
   - Home / Stores directory: `http://localhost:3000/`
   - Store detail view: `http://localhost:3000/shops/1`

### Option 2: Local Development (Without Docker)

For instant Hot Module Replacement during development:

```bash
cd ShopLoc-Web-Client/shoploc

# 1. Install dependencies
npm install

# 2. Start Astro development server
npm run dev
```
The development server will be accessible at **[http://localhost:3000](http://localhost:3000)**.

---

## 6. Build and Verification Commands

From the `shoploc` directory:

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite-powered local development server with HMR |
| `npm run build` | Compiles the server-side bundle and assets into `./dist/` |
| `npm run preview` | Starts the production Node.js server locally against `./dist/` |
| `npx astro check` | Executes TypeScript and Astro template type verification |

---

## 7. Docker Management

From the `ShopLoc-Web-Client` root directory:

- **Follow container logs in real time**:
  ```bash
  docker compose logs -f
  ```
- **Stop containers**:
  ```bash
  docker compose down
  ```
- **Rebuild and restart after updates**:
  ```bash
  docker compose up --build -d
  ```

---

## 8. Code Quality and Git Hooks (Husky)

The repository enforces pre-commit checks through Husky to guarantee code formatting and syntax integrity before commits are recorded.

Initialize hooks once at the root of `ShopLoc-Web-Client`:
```bash
npm install
```
Formatting and validation hooks will automatically trigger on subsequent `git commit` commands.