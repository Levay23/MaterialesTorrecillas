# Materiales Torrecillas CRM

Sistema CRM/ERP profesional para Materiales Torrecillas Medellín, ferretería con módulos de ventas POS, inventario, clientes, cotizaciones, compras, WhatsApp, chatbot IA y reportes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/Materiales Torrecillas run dev` — run the frontend (port 22372)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter (routing), shadcn/ui, recharts, framer-motion, react-hook-form
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Auth: JWT stored in httpOnly cookies (bcrypt + jsonwebtoken)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — All DB table definitions (users, customers, categories, suppliers, products, sales, quotes, purchases, conversations, messages, ai_config, knowledge_items, activity_log)
- `lib/api-spec/openapi.yaml` — OpenAPI 3 spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks and Zod schemas
- `artifacts/api-server/src/routes/` — All Express route handlers
- `artifacts/Materiales Torrecillas/src/pages/` — All frontend page components
- `artifacts/Materiales Torrecillas/src/components/Layout.tsx` — Main sidebar navigation layout
- `artifacts/Materiales Torrecillas/src/components/AuthProvider.tsx` — Auth context

## Architecture decisions

- Auth uses JWT in httpOnly cookies (not localStorage) for security. Cookie is set on login, cleared on logout.
- WhatsApp integration is simulated in demo mode (no real Baileys). In production, would replace `whatsapp.ts` with Baileys/whatsapp-web.js.
- AI uses Groq API. If no apiKey is configured, returns a demo response. Key stored in DB (ai_config table), never in env.
- Currency always formatted as COP using `Intl.NumberFormat('es-CO', {style:'currency',currency:'COP'})`.
- Stock is managed at sale time (auto-decremented) and at purchase receipt (auto-incremented).
- The generated API client hooks include `/api/` prefix in paths. `setBaseUrl(base)` in main.tsx only prepends the app's BASE_URL (not `/api`).

## Product

Materiales Torrecillas CRM incluye:
- **Dashboard**: KPIs, gráficas de ventas, stock bajo, actividad reciente
- **Clientes**: CRUD con tipos (regular, mayorista, VIP, crédito), historial de compras
- **Productos**: CRUD con categorías, precios (venta/mayorista/compra), ajuste de stock manual
- **Ventas / POS**: Punto de venta táctil con carrito, múltiples métodos de pago
- **Cotizaciones**: Crear y convertir a venta con un clic
- **Proveedores**: CRUD con datos de contacto y NIT
- **Compras**: Órdenes de compra, recepción actualiza stock automáticamente
- **WhatsApp**: Chat integrado con lista de conversaciones (demo/simulado)
- **Asistente IA**: Chatbot Groq (llama3) con base de conocimiento configurable
- **Base de conocimiento**: Artículos para el chatbot
- **Reportes**: Ventas, inventario y clientes con gráficas recharts
- **Usuarios**: CRUD con roles (Super Admin, Administrador, Vendedor, Soporte, Solo Lectura)

## User preferences

- Sistema completamente en español (Colombia)
- Precios en COP colombiano
- Ciudad base: Medellín

## Gotchas

- El seeding de usuarios requiere un hash bcrypt generado con `node -e "require('./artifacts/api-server/node_modules/bcrypt').hash('password', 10).then(h => console.log(h))"` desde la raíz.
- `pnpm approve-builds` puede ser necesario para permitir que bcrypt compile sus binarios nativos.
- Las rutas del API client generado incluyen `/api/` en el path. No agregar `/api` al setBaseUrl en main.tsx.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

