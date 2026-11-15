# Tropina

Карта локальных маршрутов, еды и событий по Европе. Первый слой — рождественские ярмарки Польши.

- Задание для агента: `docs/tropina-start-prompt.md` — начинать отсюда.
- Контекст и принятые решения: `docs/context.md`.
- Журнал разработки: `docs/journal.md` (ведёт агент).

## Запуск

Нужен Node.js 22.12+ (или 24+).

```bash
npm install
npm run dev            # http://localhost:3000, с TEST-записями
```

| Команда                | Что делает                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run typecheck`    | TypeScript strict                                                                     |
| `npm run lint`         | ESLint, включая jsx-a11y                                                              |
| `npm run format:check` | Prettier                                                                              |
| `npm test`             | Vitest (схема данных, языки, даты)                                                    |
| `npm run e2e`          | Playwright + axe на десктопе и мобильном (`npx playwright install chromium` один раз) |
| `npm run build`        | Продакшен-сборка: проверка данных zod, без TEST-записей                               |
