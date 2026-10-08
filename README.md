# Presora

Presora pomaga firmom sprawdzać i poprawiać widoczność marki w odpowiedziach generowanych przez AI oraz w wynikach wyszukiwania.

## Szybki start

Wymagane: **Node.js 22** i npm.

W katalogu głównym repozytorium zainstaluj zależności i uruchom aplikację:

```sh
npm ci --legacy-peer-deps
npm run dev
```

Adres aplikacji pojawi się w terminalu (zwykle <http://localhost:5173>).
Aby zatrzymać serwer, naciśnij `Ctrl+C`.

## Testy

Przed pierwszym uruchomieniem testów przeglądarkowych doinstaluj Chromium:

```sh
npx playwright install chromium
```

Uruchom testy:

```sh
npm test
npm run e2e
```

- `npm test` — testy jednostkowe Vitest z katalogu `src/test/`.
- `npm run e2e` — testy API i testy przeglądarkowe Playwright z katalogu `e2e/`. Obejmują widoki desktopowe i mobilne, m.in. strony publiczne, logowanie, rejestrację, dashboard, ustawienia i czat sprzedażowy. Testy API sprawdzają lokalne funkcje Netlify.
- Obecnie zestaw zawiera **5 testów jednostkowych** i **84 testy E2E**.
- Playwright sam uruchamia lokalny serwer aplikacji. Uwierzytelnianie i odpowiedzi backendu są mockowane — **nie potrzeba konta Supabase, kluczy API ani pliku `.env`**.

Kontrolny build produkcyjny:

```sh
npm run build
```

## GitHub Actions

Workflow **E2E Tests** uruchamia się codziennie. Można go też uruchomić ręcznie:

1. Otwórz w repozytorium zakładkę **Actions**.
2. Wybierz **E2E Tests**.
3. Kliknij **Run workflow**.

Workflow instaluje zależności i Chromium, a następnie uruchamia testy Playwright w dwóch częściach. Raport i artefakty błędów znajdziesz przy danym uruchomieniu workflow.

## Przydatne polecenia

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` | Uruchamia aplikację lokalnie |
| `npm test` | Uruchamia testy jednostkowe |
| `npm run e2e` | Uruchamia testy API i przeglądarkowe |
| `npm run e2e:report` | Otwiera raport HTML Playwright |
| `npm run build` | Tworzy build produkcyjny |
| `npm run lint` | Uruchamia ESLint |
