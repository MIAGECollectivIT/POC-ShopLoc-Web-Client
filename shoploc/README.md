# ShopLoc Web Client - Astro Application

This directory contains the Astro frontend application for the ShopLoc platform.

## Frontend Stack
- **Framework**: Astro 5 (Node.js standalone SSR adapter)
- **UI**: React 19, Shadcn UI
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Available Commands

All commands should be executed from the `shoploc` directory:

| Command | Action |
| :--- | :--- |
| `npm install` | Install all dependencies |
| `npm run dev` | Start the local development server at `http://localhost:3000` |
| `npm run build` | Build the production application into `./dist/` |
| `npm run preview` | Run the built production application locally |

## Project Structure

```text
shoploc/
├── src/
│   ├── components/       # Shadcn UI and custom React components
│   ├── layouts/          # Astro base layouts
│   ├── lib/              # API clients and utilities
│   ├── pages/            # File-based routes (SSR pages)
│   ├── styles/           # Tailwind CSS global styles
│   └── types/            # TypeScript data models
├── astro.config.mjs      # Astro configuration
└── package.json
```
