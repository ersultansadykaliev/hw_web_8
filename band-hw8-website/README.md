# Noise Division

Сайт музыкальной группы на TypeScript. В приложении доступны:

- регистрация и вход через API;
- загрузочный экран при проверке сессии;
- просмотр и редактирование профиля музыканта;
- выход из системы;
- адаптивная версия для мобильных устройств.

## Запуск

```bash
npm install
npm run dev
```

Production-сборка проверяется командами `npm run build` и `npm run lint`.

## API и деплой

Приложение использует `https://inai-col2.fishrungames.com` и cookie-сессию
эндпоинтов `/api/register/`, `/api/login/`, `/api/logout/`, `/api/profile/`
и `/api/specializations/`. Для работы авторизации на опубликованном сайте
backend должен разрешать CORS-запросы с домена GitHub Pages и credentials.

Workflow `.github/workflows/deploy.yml` собирает проект и публикует папку `dist`
через GitHub Pages при push в `main`. В настройках репозитория выберите
**Settings → Pages → Source: GitHub Actions**.
