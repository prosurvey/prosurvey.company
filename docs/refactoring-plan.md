# План рефакторинга (без изменения функциональности)

## 1) Цели и ограничения

### Цели
- Повысить читаемость, модульность и поддерживаемость кода.
- Перевести клиентские скрипты на TypeScript.
- Исключить «тяжёлые» файлы за счёт декомпозиции по доменам.
- Ввести предсказуемую файловую структуру и единые правила нейминга.
- Максимально переиспользовать стили и дизайн-токены.
- Стандартизировать quality-пайплайн (lint, typecheck, format, проверки на CI).

### Жёсткое ограничение
- **Никаких изменений бизнес-логики и пользовательского поведения**: refactor-only, no feature changes.

---

## 2) Текущее состояние (короткий аудит)

- Главная страница собирается в одном `src/pages/index.astro` с большим количеством пропсов и явных маппингов.
- Есть JS-скрипт галереи `src/scripts/certifications-gallery.js` с высокой плотностью логики.
- Стили централизованы в `src/styles/global.css`, но файл агрегирует токены, базу и компонентные стили одновременно.
- В `package.json` нет полного набора quality-скриптов (`lint`, `typecheck`, `format`, `check`).

---

## 3) Целевая архитектура (senior-level подход)

## 3.1. Структура каталогов

```text
src/
  app/
    layouts/
    pages/
  components/
    common/
    sections/
    forms/
  features/
    certifications/
      ui/
      model/
      lib/
  content/
    home.yml
  lib/
    content/
      loaders/
      mappers/
      schemas/
    utils/
    constants/
    types/
  scripts/
    certifications-gallery/
      index.ts
      lightbox.ts
      input-mode.ts
      types.ts
  styles/
    tokens.css
    base.css
    utilities.css
    components/
```

Примечание: внедрять поэтапно, без «big bang» миграции.

## 3.2. Принципы декомпозиции
- **Page composition only**: страницы только композируют секции.
- **Feature-first для интерактивных зон**: галерея и другие сложные зоны — отдельные модули.
- **Single Responsibility**: 1 файл = 1 ответственность.
- **Public API модулей** через `index.ts` (только осмысленные экспорты).
- **Dependency Direction**: `pages -> features/components -> lib`, но не наоборот.

## 3.3. Ограничения по размеру
- `*.astro`, `*.ts`, `*.css`: целевой порог до ~250 строк.
- Любой файл 300+ строк — кандидат на немедленную декомпозицию.
- Функции до ~40 строк (исключения только с комментарием why).

---

## 4) Пошаговый roadmap

## Фаза 0. Baseline и безопасность изменений
1. Зафиксировать baseline: `npm run build`, smoke-preview, размер клиентского bundle.
2. Ввести рабочее правило PR: «refactor-only» (без изменения контента/маршрутов/якорей).
3. Зафиксировать Definition of Done для каждого PR.

## Фаза 1. Quality scripts и CI-гейт
1. Добавить dev-зависимости:
   - `typescript`, `@types/node`, `eslint`, `@typescript-eslint/*`, `eslint-plugin-astro`, `prettier`, `prettier-plugin-astro`.
2. Обновить `package.json`:
   - `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `check`.
3. Настроить CI:
   - `npm ci`, `npm run check`, `npm run build`.
4. Опционально включить pre-commit (`husky + lint-staged`).

## Фаза 2. TypeScript migration (без изменения логики)
1. Перенести `src/scripts/certifications-gallery.js` в `src/scripts/certifications-gallery/index.ts`.
2. Декомпозировать:
   - `input-mode.ts` (keyboard/pointer detector),
   - `lightbox.ts` (инициализация и custom UI),
   - `types.ts` (типы slides/dataset/events),
   - `index.ts` (оркестрация lifecycle).
3. Включить строгую типизацию по шагам:
   - `noImplicitAny` -> `strict`.
4. Добавить guard-функции для DOM и `dataset`.

## Фаза 3. Рефакторинг контентного слоя
1. Создать `src/lib/content/{loaders,mappers,schemas}`.
2. Разделить:
   - raw-типы контента,
   - view-модели для UI-компонентов.
3. Добавить runtime-валидацию (например, Zod) на границе загрузки YAML.
4. Убрать длинные цепочки `content.sections...` из страницы через map-функции.

## Фаза 4. Декомпозиция страницы и секций
1. Упростить `src/pages/index.astro` до декларативной композиции секций.
2. Стандартизировать интерфейсы props (`SectionProps`, `CTAProps`, `LinkProps`).
3. Вынести повторяемые паттерны в `components/common`:
   - SectionHeader,
   - Container,
   - Button variants,
   - Reusable list/grid wrappers.

## Фаза 5. CSS-архитектура и переиспользование
1. Разделить `src/styles/global.css` на слои:
   - `tokens.css`,
   - `base.css`,
   - `utilities.css`,
   - `components/*.css`.
2. Ввести naming-конвенции:
   - utility-классы `u-*`,
   - component-классы `c-*`,
   - layout-классы `l-*`.
3. Запретить «магические значения» вне `tokens.css`.
4. Выделить общие паттерны секций и кнопок в реиспользуемые классы.

## Фаза 6. Нейминг и инженерные конвенции
1. Добавить `CONTRIBUTING.md` и `ARCHITECTURE.md`.
2. Правила:
   - имена по доменному смыслу (`heroSectionContent`, `contactLinks`),
   - boolean-префиксы `is/has/can/should`,
   - handlers `handle*`,
   - запрет неоднозначных сокращений.

## Фаза 7. Тестируемость и защита от регрессий
1. Добавить smoke-тесты рендера главных секций.
2. Для галереи — e2e-smoke (open slide, caption, download).
3. Добавить 1 визуальный baseline-скрин главной страницы.

---

## 5) Детализированный backlog по текущим файлам

## 5.1. `src/pages/index.astro`
- Убрать inline-маппинги пропсов в отдельный `mapHomeContentToPageModel()`.
- Цель: страница содержит только композицию секций.
- DoD:
  - в файле остаются только импорты + `const pageModel = ...` + JSX/ASTRO markup;
  - пропсы секций приходят из типизированных view-model.

## 5.2. `src/scripts/certifications-gallery.js`
- Перевести в TS и разнести по 3–4 файлам (инициализация, UI-элементы, input-mode, типы).
- Вынести «магические числа» (тайминги, пороги wheel) в константы.
- DoD:
  - нет `any`,
  - все `querySelector` с type guards,
  - файл-оркестратор не более ~120–150 строк.

## 5.3. `src/styles/global.css`
- Расщепить на слои, убрать дубли, зафиксировать токены.
- Добавить карту токенов (`color`, `spacing`, `radius`, `shadow`, `z-index`).
- DoD:
  - 0 прямых hex-цветов вне `tokens.css` (кроме временно разрешённых legacy-блоков);
  - переиспользуемые классы вынесены в utilities/components.

## 5.4. `src/lib/content.ts`
- Разделить на loader/schema/mapper.
- Добавить проверку схемы данных на загрузке контента.
- DoD:
  - runtime-валидация контента,
  - export только через `src/lib/content/index.ts`.

---

## 6) Порядок PR-итераций (рекомендуемый)

1. **PR-1 (P0):** tooling + scripts + CI (без изменения runtime-кода).
2. **PR-2 (P0):** миграция `certifications-gallery` в TS-модули.
3. **PR-3 (P1):** refactor `content.ts` в loader/schema/mapper.
4. **PR-4 (P1):** декомпозиция `index.astro` + common-компоненты.
5. **PR-5 (P1):** CSS layering + tokens/utilities/components.
6. **PR-6 (P2):** smoke/e2e + визуальный baseline.

Каждый PR:
- до ~300–500 строк полезного диффа,
- один фокус,
- обязателен changelog по рискам/rollback.

---

## 7) Definition of Done (для любой рефакторинг-задачи)

- Отсутствуют изменения поведения UI и контента.
- Проходят `format:check`, `lint`, `typecheck`, `build`.
- Покрыты edge-cases по null/undefined/dataset.
- Не нарушены лимиты размеров файлов.
- Обновлена архитектурная документация при изменении слоя.

---

## 8) Метрики успеха

- 100% клиентских скриптов в `src/scripts` на TS.
- 0 критичных ошибок lint/typecheck в CI.
- Снижение количества файлов >300 строк.
- Снижение дублирования CSS-правил.
- Ускорение code review (меньшие, предсказуемые PR).

---

## 9) Риски и митигации

- Риск скрытого изменения поведения.
  - Митигация: маленькие PR, smoke/e2e, сравнение baseline.
- Риск затяжной миграции TS.
  - Митигация: миграция по feature-модулям, строгий scope.
- Риск переусложнения архитектуры.
  - Митигация: YAGNI, только прикладные абстракции.

---

## 10) Шаблон одной итерации

1. Выбрать узкий scope (например, только gallery script).
2. Зафиксировать baseline (build + smoke).
3. Провести декомпозицию/типизацию.
4. Прогнать `check + build`.
5. Сравнить поведение с baseline.
6. Добавить короткую заметку по рискам и rollback.

Этот цикл повторяется до достижения целевого состояния архитектуры.
