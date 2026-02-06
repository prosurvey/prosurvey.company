# Prosurvey (Astro)

Копия текущего сайта `prosurvey.company` на Astro, с редактируемым контентом “по блокам”.

## Контент

- Главная страница: `src/content/home.yml`
- Якоря секций: `#about`, `#services`, `#request`, `#certifications`, `#contacts`

## Команды

Все команды запускайте из папки `new_design/`.

```sh
nvm use
npm install
npm run dev
```

Сборка в прод: `npm run build` (результат в `dist/`).

## GitHub Pages

- Production URL: https://prosurvey.github.io/prosurvey.company/
- Автодеплой настроен через GitHub Actions (`.github/workflows/deploy-pages.yml`).

## Для редакторов контента

Смотрите инструкцию: `CONTENT_GUIDE.md`.
