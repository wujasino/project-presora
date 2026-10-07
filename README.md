# project-presora
About to presora.app

## Uruchamianie testów

Wymagany jest Node.js 22. Z katalogu głównego repozytorium uruchom:

```sh
npm ci --legacy-peer-deps
npx playwright install chromium
npm test
npm run e2e
```

`npm test` uruchamia testy jednostkowe Vitest, a `npm run e2e` testy
przeglądarkowe i API Playwright. Playwright automatycznie uruchamia lokalny
serwer aplikacji; testy API korzystają z lokalnych funkcji Netlify. Nie trzeba
konfigurować prawdziwych danych logowania do Supabase.

Testy E2E można też uruchomić ręcznie w GitHub Actions: **Actions → E2E Tests
→ Run workflow**. Workflow uruchamia się również codziennie.
