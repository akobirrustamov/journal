# 📚 ДОКУМЕНТАЦИЯ БЭКЕНДА - JOURNAL PLATFORM

## 🎯 Общая информация

**Технологический стек:**
- Java 17
- Spring Boot 3.1.2
- PostgreSQL (база данных)
- JWT Authentication (аутентификация)
- MinIO (хранилище файлов, опционально)
- Maven (сборка проекта)

**Порт:** 8080  
**База данных:** `journal` (PostgreSQL на localhost:5432)

---

## 📂 Структура проекта

```
back/src/main/java/com/example/backend/
├── Config/              # Конфигурации (CORS, MinIO, Mail, Security)
├── Controller/          # REST API контроллеры
├── Entity/              # JPA сущности (модели БД)
├── Repository/          # Spring Data JPA репозитории
├── Services/            # Бизнес-логика
├── Security/            # JWT и Spring Security
├── DTO/                 # Data Transfer Objects
├── Payload/             # Request/Response классы
├── Enums/               # Перечисления (статусы, роли)
└── exceptions/          # Кастомные исключения
```

---

## 🗄️ БАЗОВЫЕ СУЩНОСТИ (Entity)

### 1. **User** (Пользователь)
**Таблица:** `users`

**Поля:**
- `id` (UUID) - уникальный идентификатор
- `phone` (String, unique) - телефон (используется как username)
- `password` (String) - хешированный пароль
- `number` (Integer, unique) - номер пользователя
- `name` (String) - имя
- `email` (String, unique) - email
- `orcid` (String, unique) - Open Researcher and Contributor ID
- `affiliation` (String) - аффилиация (организация)
- `country` (String) - страна
- `bio` (TEXT) - биография
- `profilePhotoUrl` (String) - URL фото профиля
- `emailVerified` (boolean) - подтверждение email
- `created_at` (LocalDateTime) - дата создания
- `roles` (List<Role>) - список ролей (ManyToMany)
- `activeRole` (Role) - активная роль (ManyToOne)

**Связи:**
- Может иметь несколько ролей
- Может подавать статьи (submittedBy в Article)
- Может быть рецензентом (reviewer в Review)

---

### 2. **Role** (Роль)
**Таблица:** `role`

**Поля:**
- `id` (int) - ID роли
- `name` (UserRoles enum) - название роли

**Доступные роли (UserRoles enum):**
- `ROLE_SUPERADMIN` - суперадминистратор
- `ROLE_ADMIN` - администратор
- `ROLE_USER` - обычный пользователь
- `ROLE_JOURNAL_ADMIN` - администратор журнала
- `ROLE_EDITOR` - редактор
- `ROLE_REVIEWER` - рецензент
- `ROLE_AUTHOR` - автор
- `ROLE_READER` - читатель

---

### 3. **Journal** (Журнал)
**Таблица:** `journals`

**Поля:**
- `id` (UUID)
- `title` (String) - полное название журнала
- `titleAbbr` (String) - сокращенное название
- `slug` (String, unique) - SEO-friendly URL
- `issnPrint` (String) - ISSN печатной версии
- `issnOnline` (String) - ISSN онлайн версии
- `isbn` (String) - ISBN
- `doi` (String, unique) - DOI журнала
- `description` (TEXT) - полное описание
- `shortDescription` (TEXT) - краткое описание
- `coverImage` (Attachment) - обложка журнала
- `publicationFrequency` (PublicationFrequency enum) - частота публикации
- `foundedYear` (Integer) - год основания
- `publisher` (String) - издатель
- `language` (String, default: "en") - язык
- `country` (String) - страна
- `scope` (TEXT) - область исследований
- `metaTitle`, `metaDescription`, `metaKeywords` - SEO метаданные
- `openAccess` (boolean, default: true) - открытый доступ
- `website`, `email`, `phone` - контактная информация
- `license` (String) - лицензия (например, "CC BY 4.0")
- `active` (boolean, default: true) - активен ли журнал
- `created_at`, `updated_at` (LocalDateTime)

**Связи:**
- `issues` (OneToMany) - выпуски журнала
- `editorialBoard` (OneToMany) - редакционная коллегия

---

### 4. **Issue** (Выпуск журнала)
**Таблица:** `issues`

**Поля:**
- `id` (UUID)
- `journal` (Journal, ManyToOne) - журнал
- `volumeNumber` (Integer) - номер тома
- `issueNumber` (Integer) - номер выпуска
- `title` (String) - название (для спецвыпусков)
- `description` (TEXT) - описание
- `publishedDate` (LocalDate) - дата публикации
- `current` (boolean, default: false) - текущий выпуск
- `coverImage` (Attachment) - обложка выпуска
- `doi` (String, unique) - DOI выпуска
- `created_at` (LocalDateTime)

**Связи:**
- `articles` (OneToMany) - статьи в выпуске

**Уникальное ограничение:** (journal_id, volume_number, issue_number)

---

### 5. **Article** (Статья)
**Таблица:** `articles`

**Поля:**
- `id` (UUID)
- `title` (String) - название статьи
- `slug` (String, unique) - SEO URL
- `abstractText` (TEXT) - аннотация
- `keywords` (List<String>) - ключевые слова
- `status` (ArticleStatus enum, default: SUBMITTED) - статус статьи
- `doi` (String, unique) - DOI статьи
- `journal` (Journal, ManyToOne) - журнал
- `issue` (Issue, ManyToOne) - выпуск (назначается при принятии)
- `pdfFile` (Attachment) - PDF файл
- `htmlContent` (TEXT) - HTML версия статьи
- `submittedBy` (User) - кто подал статью
- `submittedAt` (LocalDateTime) - дата подачи
- `publishedAt` (LocalDateTime) - дата публикации
- `reviewType` (ReviewType enum, default: DOUBLE_BLIND) - тип рецензирования
- `pageStart`, `pageEnd` (Integer) - страницы в выпуске
- `language` (String, default: "en") - язык
- `license` (String) - лицензия
- `fundingInfo` (TEXT) - информация о финансировании
- `conflictOfInterest` (TEXT) - конфликт интересов
- `receivedDate`, `acceptedDate` (LocalDate) - даты получения/принятия
- `metaTitle`, `metaDescription` - SEO метаданные
- `viewCount`, `downloadCount` (Long) - статистика просмотров/скачиваний
- `created_at`, `updated_at` (LocalDateTime)

**Связи:**
- `authors` (OneToMany) - авторы статьи
- `references` (OneToMany) - список литературы
- `reviews` (OneToMany) - рецензии

**Статусы статьи (ArticleStatus enum):**
- `DRAFT` - черновик (сохранен, но не отправлен)
- `SUBMITTED` - отправлена, ожидает назначения редактора
- `UNDER_REVIEW` - на рецензировании
- `REVISION_REQUIRED` - требуются исправления
- `ACCEPTED` - принята редактором
- `PUBLISHED` - опубликована
- `ARCHIVED` - архивирована
- `REJECTED` - отклонена

**Жизненный цикл:** DRAFT → SUBMITTED → UNDER_REVIEW → REVISION_REQUIRED → ACCEPTED → PUBLISHED → ARCHIVED

---

### 6. **Review** (Рецензия)
**Таблица:** `reviews`

**Поля:**
- `id` (UUID)
- `article` (Article, ManyToOne) - статья
- `reviewer` (User, ManyToOne) - рецензент
- `assignedBy` (User, ManyToOne) - кто назначил
- `status` (ReviewStatus enum, default: PENDING) - статус рецензии
- `decision` (ReviewDecision enum) - решение рецензента
- `commentsForAuthor` (TEXT) - комментарии для автора (публичные)
- `commentsForEditor` (TEXT) - комментарии для редактора (приватные)
- `score` (Integer) - общая оценка (1-10)
- `scoreOriginality` (Integer) - оценка оригинальности (0-10)
- `scoreMethodology` (Integer) - оценка методологии (0-10)
- `scoreClarity` (Integer) - оценка ясности изложения (0-10)
- `dueDate` (LocalDate) - срок сдачи рецензии
- `invitedAt` (LocalDateTime) - дата приглашения
- `respondedAt` (LocalDateTime) - дата ответа на приглашение
- `completedAt` (LocalDateTime) - дата завершения
- `createdAt` (LocalDateTime)

**Связи:**
- `files` (OneToMany) - файлы рецензии

**Статусы рецензии (ReviewStatus enum):**
- `PENDING` - ожидает ответа рецензента
- `ACCEPTED` - рецензент принял приглашение
- `DECLINED` - рецензент отклонил
- `COMPLETED` - рецензия завершена
- `EXPIRED` - истек срок

**Решения рецензента (ReviewDecision enum):**
- `ACCEPT` - принять статью
- `REJECT` - отклонить
- `MINOR_REVISION` - незначительные исправления
- `MAJOR_REVISION` - значительные исправления

---

## 🔐 АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ

### JWT Authentication

**Сервис:** `JwtService`

**Методы:**
- `generateJwtToken(User user)` - генерация access token (срок: ~100 минут)
- `generateJwtRefreshToken(User user)` - генерация refresh token (срок: 24 часа)
- `extractSubjectFromJwt(String token)` - извлечение user ID из токена
- `validateToken(String token)` - валидация токена

**Секретный ключ:** Хранится в коде (в production должен быть в переменных окружения)

### Endpoints аутентификации

**Base URL:** `/api/v1/auth`

| Метод | Endpoint | Описание | Body |
|-------|----------|----------|------|
| POST | `/login` | Вход в систему | `{phone, password}` |
| POST | `/refresh` | Обновление токена | `?refreshToken=...` |
| GET | `/decode` | Декодирование токена | Header: `Authorization` |
| PUT | `/change-role/{roleId}` | Смена активной роли | Header: `Authorization` |
| PUT | `/password/{adminId}` | Смена пароля | `{password}` |

---

## 📡 API ENDPOINTS

### 1. **Articles API** (`/api/v1/articles`)

#### Публичные endpoints:

| Метод | Endpoint | Описание | Параметры |
|-------|----------|----------|-----------|
| GET | `/` | Список опубликованных статей | `?page=0&size=20&sort=publishedAt` |
| GET | `/search` | Поиск статей | `?q=keyword&page=0&size=20` |
| GET | `/{slug}` | Получить статью по slug | - |
| GET | `/id/{id}` | Получить статью по ID | - |
| GET | `/{id}/download` | Скачать PDF | - |
| GET | `/{id}/html` | HTML версия статьи | - |
| GET | `/journal/{journalId}` | Статьи журнала | `?status=PUBLISHED&page=0` |

#### Endpoints для авторов (требуется аутентификация):

| Метод | Endpoint | Описание | Body/Params |
|-------|----------|----------|-------------|
| POST | `/submit` | Подать статью | `ArticleSubmitRequest` |
| POST | `/{id}/pdf` | Загрузить PDF | `multipart/form-data` |
| GET | `/my` | Мои статьи | `?page=0&size=20` |

#### Endpoints для редакторов/админов:

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| PUT | `/{id}/status` | Изменить статус | ADMIN, EDITOR |
| PUT | `/{id}/assign-issue` | Назначить в выпуск | ADMIN, EDITOR |
| GET | `/admin/all` | Все статьи (любой статус) | ADMIN, EDITOR |

---

### 2. **Journals API** (`/api/v1/journals`)

#### Публичные endpoints:

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Список журналов |
| GET | `/search` | Поиск журналов |
| GET | `/{slug}` | Журнал по slug |
| GET | `/id/{id}` | Журнал по ID |
| GET | `/{id}/issues` | Выпуски журнала |
| GET | `/{id}/issues/current` | Текущий выпуск |
| GET | `/{id}/board` | Редколлегия |

#### Endpoints для админов:

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| POST | `/` | Создать журнал | ADMIN, JOURNAL_ADMIN |
| PUT | `/{id}` | Обновить журнал | ADMIN, JOURNAL_ADMIN |
| POST | `/{id}/cover` | Загрузить обложку | ADMIN, JOURNAL_ADMIN |
| DELETE | `/{id}` | Деактивировать | SUPERADMIN, ADMIN |
| POST | `/{id}/board` | Добавить в редколлегию | ADMIN, JOURNAL_ADMIN |
| DELETE | `/board/{memberId}` | Удалить из редколлегии | ADMIN, JOURNAL_ADMIN |

---

### 3. **Reviews API** (`/api/v1/reviews`)

#### Endpoints для редакторов:

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| POST | `/assign` | Назначить рецензента | ADMIN, EDITOR |
| GET | `/article/{articleId}` | Все рецензии статьи | ADMIN, EDITOR |
| GET | `/{id}` | Получить рецензию | Authenticated |

#### Endpoints для рецензентов:

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| PUT | `/{id}/respond` | Принять/отклонить приглашение | REVIEWER, EDITOR |
| POST | `/{id}/submit` | Отправить рецензию | REVIEWER, EDITOR |
| POST | `/{id}/files` | Загрузить файл | REVIEWER, EDITOR |
| GET | `/my` | Мои рецензии | REVIEWER, EDITOR |
| GET | `/my/pending` | Ожидающие приглашения | REVIEWER, EDITOR |

---

### 4. **Issues API** (`/api/v1/issues`)

| Метод | Endpoint | Описание | Роли |
|-------|----------|----------|------|
| POST | `/` | Создать выпуск | ADMIN, JOURNAL_ADMIN |
| PUT | `/{id}` | Обновить выпуск | ADMIN, JOURNAL_ADMIN |
| GET | `/{id}` | Получить выпуск | Public |
| POST | `/{id}/cover` | Загрузить обложку | ADMIN, JOURNAL_ADMIN |

---

## 🔧 СЕРВИСЫ (Services)

### ArticleService
- `submit()` - подача статьи
- `uploadPdf()` - загрузка PDF
- `getPublished()` - получение опубликованных статей
- `search()` - поиск статей
- `updateStatus()` - изменение статуса
- `assignToIssue()` - назначение в выпуск
- `trackView()` - учет просмотров
- `trackDownload()` - учет скачиваний

### ReviewService
- `assign()` - назначение рецензента
- `respondToInvitation()` - ответ на приглашение
- `submitReview()` - отправка рецензии
- `uploadReviewFile()` - загрузка файла рецензии
- `getMyReviews()` - получение рецензий пользователя

### JournalService
- `create()` - создание журнала
- `update()` - обновление журнала
- `getAll()` - получение всех журналов
- `search()` - поиск журналов
- `uploadCoverImage()` - загрузка обложки
- `deactivate()` - деактивация журнала

### AuthService
- `login()` - вход в систему
- `refreshToken()` - обновление токена
- `decode()` - декодирование токена
- `changeRole()` - смена активной роли
- `password()` - смена пароля

### MinioStorageService
- Управление файлами в MinIO (если включен)
- Загрузка/скачивание файлов
- Генерация presigned URLs

---

## 📦 РЕПОЗИТОРИИ (Repository)

Все репозитории наследуются от `JpaRepository`:

- `UserRepo` - пользователи
- `RoleRepo` - роли
- `ArticleRepo` - статьи
- `JournalRepo` - журналы
- `IssueRepo` - выпуски
- `ReviewRepo` - рецензии
- `AttachmentRepo` - вложения
- `ArticleAuthorRepo` - авторы статей
- `ReferenceRepo` - ссылки
- `EditorialBoardMemberRepo` - редколлегия

---

## 🎨 DTO И PAYLOAD КЛАССЫ

### Request классы:
- `ArticleSubmitRequest` - подача статьи
- `ReviewAssignRequest` - назначение рецензента
- `ReviewSubmitRequest` - отправка рецензии
- `JournalRequest` - создание/обновление журнала
- `IssueRequest` - создание/обновление выпуска
- `UserDTO` - данные пользователя для логина

### Response классы:
- `ArticleResponse` - данные статьи
- `ReviewResponse` - данные рецензии
- `JournalResponse` - данные журнала
- `IssueResponse` - данные выпуска
- `ApiResponse<T>` - обертка для всех ответов API

---

## ⚙️ КОНФИГУРАЦИЯ

### application.properties

**База данных:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/journal
spring.datasource.username=postgres
spring.datasource.password=4415
```

**Сервер:**
```properties
server.port=8080
```

**Файлы:**
```properties
spring.servlet.multipart.max-file-size=300MB
spring.servlet.multipart.max-request-size=300MB
```

**MinIO (опционально):**
```properties
minio.enabled=false
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
```

**Email (SMTP):**
```properties
spring.mail.host=localhost
spring.mail.port=1025
```

**Swagger UI:**
```properties
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
```

---

## 🚀 ЗАПУСК ПРОЕКТА

### Требования:
- Java 17+
- PostgreSQL
- Maven

### Шаги:

1. **Создать базу данных:**
```sql
CREATE DATABASE journal;
```

2. **Запустить приложение:**
```bash
cd back
mvn spring-boot:run
```

3. **Проверить работу:**
- API: http://localhost:8080/api/v1/
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

---

## 📝 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ API

### 1. Вход в систему
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "roles": ["ROLE_AUTHOR"]
    }
  }
}
```

### 2. Подача статьи
```http
POST /api/v1/articles/submit
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Machine Learning in Healthcare",
  "abstractText": "This paper explores...",
  "keywords": ["ML", "Healthcare", "AI"],
  "journalId": "journal-uuid",
  "authors": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "affiliation": "University",
      "orderIndex": 0
    }
  ]
}
```

### 3. Назначение рецензента
```http
POST /api/v1/reviews/assign
Authorization: Bearer {editorToken}
Content-Type: application/json

{
  "articleId": "article-uuid",
  "reviewerId": "reviewer-uuid",
  "dueDate": "2026-06-01"
}
```

### 4. Получение списка статей
```http
GET /api/v1/articles?page=0&size=20&sort=publishedAt,desc
```

---

## 🔍 ПОЛЕЗНЫЕ ЗАПРОСЫ

### Получить все статьи журнала:
```http
GET /api/v1/articles/journal/{journalId}?status=PUBLISHED
```

### Поиск статей:
```http
GET /api/v1/articles/search?q=machine+learning
```

### Мои статьи (для автора):
```http
GET /api/v1/articles/my
Authorization: Bearer {token}
```

### Мои рецензии (для рецензента):
```http
GET /api/v1/reviews/my
Authorization: Bearer {token}
```

---

## 🛡️ БЕЗОПАСНОСТЬ

### Защищенные endpoints требуют:
1. Header `Authorization: Bearer {accessToken}`
2. Соответствующую роль (проверяется через `@PreAuthorize`)

### Роли и доступ:
- **SUPERADMIN** - полный доступ
- **ADMIN** - управление журналами, статьями, пользователями
- **JOURNAL_ADMIN** - управление конкретным журналом
- **EDITOR** - редактирование статей, назначение рецензентов
- **REVIEWER** - рецензирование статей
- **AUTHOR** - подача статей
- **READER** - чтение опубликованных статей

---

## 📊 ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ

### 1. SEO оптимизация
- Автоматическая генерация slug из заголовков
- Meta tags для статей и журналов
- Sitemap generation (SitemapController)

### 2. Цитирование
- CitationController - генерация цитат в разных форматах
- Поддержка форматов: APA, MLA, Chicago, BibTeX

### 3. OAI-PMH
- OaiPmhController - протокол для индексации в академических базах
- Поддержка Dublin Core metadata

### 4. Метаданные
- MetadataController - встраивание метаданных в PDF
- Поддержка CrossRef DOI

### 5. Статистика
- Учет просмотров статей (viewCount)
- Учет скачиваний PDF (downloadCount)

---

## 🐛 ОБРАБОТКА ОШИБОК

### GlobalExceptionHandler
Централизованная обработка исключений:

- `ResourceNotFoundException` - ресурс не найден (404)
- `InvalidCredentialsException` - неверные учетные данные (401)
- `InvalidStudentDataException` - неверные данные (400)
- `StudentNotFoundException` - студент не найден (404)

**Формат ответа при ошибке:**
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```

---

## 📚 ЗАВИСИМОСТИ (pom.xml)

### Основные:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- PostgreSQL Driver
- Lombok
- JWT (jjwt)

### Дополнительные:
- MinIO (хранилище файлов)
- Apache POI (работа с Excel)
- iText PDF (генерация PDF)
- OpenHTMLToPDF (HTML в PDF)
- ZXing (QR коды)
- Springdoc OpenAPI (Swagger)
- Spring Mail
- Apache PDFBox

---

## 💡 СОВЕТЫ ПО РАБОТЕ

### Для фронтенда:

1. **Всегда отправляйте токен в заголовке:**
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

2. **Обрабатывайте refresh token:**
```javascript
if (response.status === 401) {
  // Обновить токен через /api/v1/auth/refresh
}
```

3. **Используйте pagination:**
```javascript
const params = {
  page: 0,
  size: 20,
  sort: 'publishedAt,desc'
};
```

4. **Проверяйте роли пользователя:**
```javascript
const hasRole = (user, role) => {
  return user.roles.some(r => r.name === role);
};
```

---

## 🔄 WORKFLOW СТАТЬИ

```
1. DRAFT (автор создает черновик)
   ↓
2. SUBMITTED (автор отправляет статью)
   ↓
3. UNDER_REVIEW (редактор назначает рецензентов)
   ↓
4. REVISION_REQUIRED (рецензенты запрашивают исправления)
   ↓ (автор вносит правки и отправляет снова)
5. ACCEPTED (редактор принимает статью)
   ↓
6. PUBLISHED (статья публикуется в выпуске)
   ↓
7. ARCHIVED (опционально, архивирование)
```

**Альтернативный путь:** SUBMITTED → REJECTED (отклонена)

---

## 📞 КОНТАКТЫ И ПОДДЕРЖКА

При возникновении вопросов обращайтесь к этой документации.

**Swagger UI:** http://localhost:8080/swagger-ui.html - интерактивная документация API

---

**Дата создания документации:** 2026-05-16  
**Версия бэкенда:** 0.0.1-SNAPSHOT  
**Автор документации:** Claude Code
