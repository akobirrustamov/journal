# Frontend API Documentation

This document covers all API endpoints available to the frontend. Base URL is `http://localhost:8080` in development and `https://ilmiy.bxu.uz` in production. The Axios client is pre-configured in `front/src/config/index.js` and automatically attaches the JWT token and handles token refresh.

---

## Table of Contents

- [Authentication](#authentication)
- [Roles](#roles)
- [Journals](#journals)
- [Issues](#issues)
- [Articles](#articles)
- [Reviews](#reviews)
- [Citations](#citations)
- [Metadata & SEO](#metadata--seo)
- [File Management](#file-management)
- [Admin — User Management](#admin--user-management)
- [OAI-PMH](#oai-pmh)
- [Entities Reference](#entities-reference)
- [Enums Reference](#enums-reference)

---

## Authentication

**Base path:** `/api/v1/auth`

All protected routes require the `Authorization: Bearer <token>` header. The Axios instance handles this automatically from `localStorage`.

---

### POST `/api/v1/auth/login`

Log in with phone and password. Returns access and refresh tokens.

**Request body:**
```json
{
  "phone": "998901234567",
  "password": "secret123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer"
}
```

---

### POST `/api/v1/auth/refresh`

Get a new access token using a refresh token. Send the refresh token as a query parameter.

**Request:**
```
POST /api/v1/auth/refresh?refreshToken=eyJhbGciOiJIUzI1NiJ9...
```

**Response:** Same structure as login response.

---

### GET `/api/v1/auth/decode`

Decode the current JWT token and return the user's profile and roles.

**Headers:** `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Akobir Rustamov",
  "phone": "998901234567",
  "email": "user@example.com",
  "roles": ["ROLE_ADMIN", "ROLE_EDITOR"],
  "activeRole": "ROLE_ADMIN"
}
```

---

### PUT `/api/v1/auth/change-role/{roleId}`

Switch the active role for the current user. Use this when a user has multiple roles and wants to switch between dashboards.

**Headers:** `Authorization: Bearer <token>` (required)

**Request:**
```
PUT /api/v1/auth/change-role/2
```

**Response:** Updated user object with new `activeRole`.

---

### PUT `/api/v1/auth/password/{adminId}`

Update a user's password. Admin only.

**Headers:** `Authorization: Bearer <token>` (required)

**Request body:**
```json
{
  "password": "newSecurePassword123"
}
```

---

## Roles

**Base path:** `/api/v1/roles`

---

### GET `/api/v1/roles`

Returns the list of all available roles. Useful when creating users or building role-selector dropdowns.

**Response:**
```json
[
  { "id": 1, "name": "ROLE_SUPERADMIN" },
  { "id": 2, "name": "ROLE_ADMIN" },
  { "id": 3, "name": "ROLE_EDITOR" },
  { "id": 4, "name": "ROLE_REVIEWER" },
  { "id": 5, "name": "ROLE_AUTHOR" }
]
```

---

## Journals

**Base path:** `/api/v1/journals`

---

### GET `/api/v1/journals`

Returns a paginated list of all active journals. Use for the public journals listing page.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 0 | Page number |
| `size` | int | 20 | Items per page |
| `sort` | string | `title` | Sort field |

**Response:**
```json
{
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "Aniq va tabiiy fanlar jurnali",
      "titleAbbr": "ATF",
      "slug": "aniq-tabiiy-fanlar",
      "issnPrint": "2345-6789",
      "issnOnline": "2345-6790",
      "description": "...",
      "shortDescription": "...",
      "coverImageUrl": "/api/v1/file/img/uuid-here",
      "publicationFrequency": "QUARTERLY",
      "foundedYear": 2018,
      "publisher": "BXU",
      "language": "uz",
      "openAccess": true,
      "active": true
    }
  ],
  "totalElements": 15,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

---

### GET `/api/v1/journals/search`

Search journals by keyword. Searches title and description fields.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search keyword (required) |
| `page`, `size` | int | Pagination |

**Example:**
```
GET /api/v1/journals/search?q=fizika&size=10
```

**Response:** Same paginated structure as journal list.

---

### GET `/api/v1/journals/{slug}`

Get a single journal by its URL-friendly slug. Use this on the journal detail page.

**Example:**
```
GET /api/v1/journals/aniq-tabiiy-fanlar
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-...",
    "title": "Aniq va tabiiy fanlar jurnali",
    "slug": "aniq-tabiiy-fanlar",
    "issn_print": "2345-6789",
    "description": "...",
    "scope": "Physics, Chemistry, Mathematics",
    "email": "journal@bxu.uz",
    "website": "https://journal.bxu.uz",
    "metaTitle": "ATF Journal",
    "metaDescription": "...",
    "coverImageUrl": "/api/v1/file/img/uuid",
    "openAccess": true
  }
}
```

---

### GET `/api/v1/journals/id/{id}`

Get a journal by its UUID. Prefer `/{slug}` for public pages; use this for admin pages where you already have the ID.

**Example:**
```
GET /api/v1/journals/id/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

---

### GET `/api/v1/journals/{id}/issues`

Get all issues (volumes) for a journal, ordered by publication date.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "journalId": "uuid",
      "volumeNumber": 5,
      "issueNumber": 2,
      "title": "2024-yil 2-son",
      "publishedDate": "2024-06-01",
      "current": true,
      "coverImageUrl": "/api/v1/file/img/uuid",
      "articleCount": 12
    }
  ]
}
```

---

### GET `/api/v1/journals/{id}/issues/current`

Get only the latest (current) issue of a journal. Use on the journal homepage to show the newest issue.

---

### GET `/api/v1/journals/{id}/board`

Get the editorial board members for a journal.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Prof. Alisher Karimov",
      "position": "Editor-in-Chief",
      "affiliation": "BXU",
      "country": "UZ",
      "orcid": "0000-0001-2345-6789",
      "email": "editor@bxu.uz",
      "photoUrl": "/api/v1/file/img/uuid",
      "orderIndex": 1,
      "active": true
    }
  ]
}
```

---

### POST `/api/v1/journals` *(Admin)*

Create a new journal. Requires `ADMIN` or `SUPERADMIN` role.

**Headers:** `Authorization: Bearer <token>` (required)

**Request body:**
```json
{
  "title": "Aniq va tabiiy fanlar jurnali",
  "titleAbbr": "ATF",
  "issnPrint": "2345-6789",
  "issnOnline": "2345-6790",
  "description": "Full description of the journal...",
  "shortDescription": "Short description",
  "publicationFrequency": "QUARTERLY",
  "foundedYear": 2018,
  "publisher": "BXU nashriyoti",
  "language": "uz",
  "country": "UZ",
  "scope": "Physics, Chemistry, Biology",
  "openAccess": true,
  "email": "journal@bxu.uz",
  "website": "https://journal.bxu.uz",
  "phone": "+998712345678",
  "license": "CC BY 4.0",
  "metaTitle": "ATF Journal - BXU",
  "metaDescription": "...",
  "metaKeywords": "fizika, kimyo, biologiya"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...journal object with generated id and slug... }
}
```

---

### PUT `/api/v1/journals/{id}` *(Admin)*

Update an existing journal. Same request body as POST.

---

### POST `/api/v1/journals/{id}/cover` *(Admin)*

Upload a cover image for a journal. Send as `multipart/form-data`.

**Request:**
```
POST /api/v1/journals/uuid/cover
Content-Type: multipart/form-data

file: <image file>
```

---

### POST `/api/v1/journals/{id}/board` *(Admin)*

Add a member to the journal's editorial board.

**Request body:**
```json
{
  "userId": "uuid-optional",
  "fullName": "Prof. Alisher Karimov",
  "email": "prof@bxu.uz",
  "orcid": "0000-0001-2345-6789",
  "affiliation": "BXU",
  "country": "UZ",
  "position": "Editor-in-Chief",
  "bio": "Short bio...",
  "photoUrl": "/api/v1/file/img/uuid",
  "orderIndex": 1
}
```

---

### DELETE `/api/v1/journals/board/{memberId}` *(Admin)*

Remove a member from the editorial board.

---

### DELETE `/api/v1/journals/{id}` *(Admin)*

Deactivate a journal (sets `active: false`, does not delete from the database).

---

## Issues

**Base path:** `/api/v1/issues`

---

### GET `/api/v1/issues/{id}`

Get a single issue by its UUID. Returns full issue details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "journalId": "uuid",
    "journalTitle": "ATF Journal",
    "volumeNumber": 5,
    "issueNumber": 2,
    "title": "2024-yil 2-son",
    "description": "...",
    "publishedDate": "2024-06-01",
    "current": true,
    "doi": "10.12345/atf.2024.2",
    "coverImageUrl": "/api/v1/file/img/uuid",
    "articleCount": 12,
    "createdAt": "2024-05-20T10:00:00"
  }
}
```

---

### GET `/api/v1/issues/{id}/articles`

Get all published articles in a specific issue, paginated.

**Query params:** `page`, `size` (default size: 20)

**Response:** Paginated list of `ArticleResponse` objects (see Articles section).

---

### POST `/api/v1/issues` *(Admin/Editor)*

Create a new issue for a journal.

**Request body:**
```json
{
  "journalId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "volumeNumber": 5,
  "issueNumber": 3,
  "title": "2024-yil 3-son",
  "description": "Issue description",
  "publishedDate": "2024-09-01",
  "current": false,
  "doi": "10.12345/atf.2024.3"
}
```

---

### PUT `/api/v1/issues/{id}` *(Admin/Editor)*

Update an existing issue. Same request body as POST.

---

### POST `/api/v1/issues/{id}/cover` *(Admin/Editor)*

Upload a cover image for an issue. Send as `multipart/form-data` with field `file`.

---

## Articles

**Base path:** `/api/v1/articles`

---

### GET `/api/v1/articles`

List all published articles, paginated. Use for the public articles listing page.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 0 | Page number |
| `size` | int | 20 | Items per page |
| `sort` | string | `publishedAt` | Sort field |

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "title": "Kvant mexanikasining asoslari",
        "slug": "kvant-mexanikasining-asoslari",
        "abstractText": "Ushbu maqolada...",
        "keywords": ["kvant", "fizika", "energiya"],
        "status": "PUBLISHED",
        "doi": "10.12345/atf.2024.001",
        "journalId": "uuid",
        "journalTitle": "ATF Journal",
        "journalSlug": "aniq-tabiiy-fanlar",
        "issueId": "uuid",
        "volumeNumber": 5,
        "issueNumber": 2,
        "pdfUrl": "/api/v1/articles/uuid/download",
        "authors": [
          {
            "fullName": "Akobir Rustamov",
            "orcid": "0000-0001-2345-6789",
            "affiliation": "BXU",
            "corresponding": true,
            "orderIndex": 1
          }
        ],
        "pageStart": 14,
        "pageEnd": 22,
        "language": "uz",
        "publishedAt": "2024-06-15T09:00:00",
        "viewCount": 142,
        "downloadCount": 38
      }
    ],
    "totalElements": 200,
    "totalPages": 10,
    "number": 0,
    "size": 20
  }
}
```

---

### GET `/api/v1/articles/search`

Full-text search across article titles, abstracts, and keywords.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search keyword (required) |
| `page`, `size` | int | Pagination |

**Example:**
```
GET /api/v1/articles/search?q=kvant+mexanika&size=10
```

---

### GET `/api/v1/articles/{slug}`

Get a single article by its SEO-friendly slug. **Automatically increments the view counter.** Use this on the public article detail page.

**Example:**
```
GET /api/v1/articles/kvant-mexanikasining-asoslari
```

**Response:** Full `ArticleResponse` object including `authors`, `references`, `hasHtml`.

---

### GET `/api/v1/articles/id/{id}`

Get an article by its UUID. Use on admin/editor pages where you already have the ID.

---

### GET `/api/v1/articles/{id}/download`

Download the article PDF. **Automatically increments the download counter.** The server streams the file or redirects to it.

**Usage (open in new tab):**
```js
window.open(`/api/v1/articles/${id}/download`, '_blank');
```

---

### GET `/api/v1/articles/{id}/html`

Get the HTML rendering of an article's content. Use when displaying formatted article body inline.

**Response:** `text/html` string.

---

### GET `/api/v1/articles/journal/{journalId}`

Get articles belonging to a specific journal. Optionally filter by status.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | ArticleStatus | Filter by status (optional) |
| `page`, `size` | int | Pagination |

**Example:**
```
GET /api/v1/articles/journal/uuid?status=PUBLISHED&size=10
```

---

### GET `/api/v1/articles/my` *(Auth required)*

Get the articles submitted by the currently logged-in user. Use on the author's personal dashboard.

**Headers:** `Authorization: Bearer <token>` (required)

---

### GET `/api/v1/articles/admin/all` *(Admin/Editor)*

Get all articles regardless of status. Use on the editorial management page.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `journalId` | UUID | Filter by journal (optional) |
| `status` | ArticleStatus | Filter by status (optional) |
| `page`, `size` | int | Pagination |

---

### POST `/api/v1/articles/submit` *(Auth required)*

Submit a new article. The article is created with status `SUBMITTED`.

**Headers:** `Authorization: Bearer <token>` (required)

**Request body:**
```json
{
  "journalId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Kvant mexanikasining asoslari",
  "abstractText": "Ushbu maqolada kvant mexanikasining asosiy...",
  "keywords": ["kvant", "fizika", "atom"],
  "authors": [
    {
      "fullName": "Akobir Rustamov",
      "email": "akobir@bxu.uz",
      "orcid": "0000-0001-2345-6789",
      "affiliation": "BXU Fizika kafedrasi",
      "country": "UZ",
      "corresponding": true,
      "orderIndex": 1
    },
    {
      "fullName": "Jasur Yusupov",
      "email": "jasur@bxu.uz",
      "affiliation": "BXU",
      "country": "UZ",
      "corresponding": false,
      "orderIndex": 2
    }
  ],
  "references": [
    {
      "text": "Dirac, P.A.M. (1930). The Principles of Quantum Mechanics. Oxford University Press.",
      "doi": "10.1093/acprof:oso/9780198520115.001.0001",
      "orderIndex": 1
    }
  ],
  "reviewType": "DOUBLE_BLIND",
  "language": "uz",
  "fundingInfo": "Bu tadqiqot BXU granti tomonidan moliyalashtirilgan.",
  "conflictOfInterest": "Muallif manfaatlar ziddiyatini e'lon qilmaydi.",
  "license": "CC BY 4.0"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Kvant mexanikasining asoslari",
    "status": "SUBMITTED",
    ...
  }
}
```

---

### POST `/api/v1/articles/{id}/pdf` *(Auth required)*

Upload the PDF file for an article. Send as `multipart/form-data`. The article must already exist.

**Request:**
```
POST /api/v1/articles/uuid/pdf
Content-Type: multipart/form-data

file: <pdf file>
```

**Response:** Updated `ArticleResponse` with `pdfUrl` filled.

---

### PUT `/api/v1/articles/{id}/status` *(Admin/Editor)*

Update the workflow status of an article. Use to move articles through the editorial pipeline.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | ArticleStatus | New status value (required) |

**Example:**
```
PUT /api/v1/articles/uuid/status?status=UNDER_REVIEW
```

---

### PUT `/api/v1/articles/{id}/assign-issue` *(Admin/Editor)*

Assign an accepted article to a specific issue before publishing.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `issueId` | UUID | Target issue ID (required) |

**Example:**
```
PUT /api/v1/articles/uuid/assign-issue?issueId=issue-uuid
```

---

## Reviews

**Base path:** `/api/v1/reviews`

---

### POST `/api/v1/reviews/assign` *(Admin/Editor)*

Assign a reviewer to an article. Sends an email invitation to the reviewer.

**Headers:** `Authorization: Bearer <token>` (required)

**Request body:**
```json
{
  "articleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reviewerId": "reviewer-user-uuid",
  "dueDate": "2024-08-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "articleId": "uuid",
    "articleTitle": "Kvant mexanikasining asoslari",
    "reviewerId": "uuid",
    "reviewerName": "Prof. Saidakbar",
    "status": "PENDING",
    "dueDate": "2024-08-01",
    "invitedAt": "2024-07-01T09:00:00"
  }
}
```

---

### GET `/api/v1/reviews/article/{articleId}` *(Admin/Editor)*

Get all reviews for a specific article. Use on the article management page to see review history.

**Response:** Array of `ReviewResponse` objects.

---

### GET `/api/v1/reviews/{id}` *(Reviewer/Admin/Editor)*

Get the full details of a single review including scores and comments.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "articleId": "uuid",
    "articleTitle": "Kvant mexanikasining asoslari",
    "reviewerName": "Prof. Saidakbar",
    "status": "COMPLETED",
    "decision": "MINOR_REVISION",
    "commentsForAuthor": "Maqola umumiy jihatdan yaxshi...",
    "commentsForEditor": "Kichik tuzatishlar talab qilinadi...",
    "score": 8,
    "scoreOriginality": 9,
    "scoreMethodology": 7,
    "scoreClarity": 8,
    "dueDate": "2024-08-01",
    "invitedAt": "2024-07-01T09:00:00",
    "respondedAt": "2024-07-02T14:00:00",
    "completedAt": "2024-07-25T16:00:00"
  }
}
```

---

### GET `/api/v1/reviews/my` *(Auth required)*

Get all reviews assigned to the current user. Use on the reviewer dashboard.

**Query params:** `page`, `size` (default size: 20)

---

### GET `/api/v1/reviews/my/pending` *(Auth required)*

Get only pending (not yet responded to) review invitations. Use to show unread invitations badge/list.

---

### PUT `/api/v1/reviews/{id}/respond` *(Auth required)*

Accept or decline a review invitation.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `accept` | boolean | `true` to accept, `false` to decline |

**Example:**
```
PUT /api/v1/reviews/uuid/respond?accept=true
```

---

### POST `/api/v1/reviews/{id}/submit` *(Auth required)*

Submit a completed review with scores and decision.

**Request body:**
```json
{
  "decision": "MINOR_REVISION",
  "commentsForAuthor": "Maqola umumiy jihatdan yaxshi yozilgan, lekin...",
  "commentsForEditor": "Muallif metodologiyani biroz kuchaytirishi kerak.",
  "score": 8,
  "scoreOriginality": 9,
  "scoreMethodology": 7,
  "scoreClarity": 8
}
```

---

### POST `/api/v1/reviews/{id}/files` *(Auth required)*

Upload a supplementary file to attach to a review (e.g. annotated PDF).

**Request:**
```
POST /api/v1/reviews/uuid/files
Content-Type: multipart/form-data

file: <file>
```

---

## Citations

**Base path:** `/api/v1/citations`

These endpoints return citation data in various academic formats. They do not require authentication. Use them to build "Export citation" dropdown buttons on the article page.

---

### GET `/api/v1/citations/{articleId}/bibtex`

Export citation in BibTeX format. The response is a downloadable `.bib` file.

**Example response:**
```bibtex
@article{rustamov2024kvant,
  title={Kvant mexanikasining asoslari},
  author={Rustamov, Akobir},
  journal={Aniq va tabiiy fanlar jurnali},
  year={2024},
  volume={5},
  number={2},
  pages={14--22},
  doi={10.12345/atf.2024.001}
}
```

---

### GET `/api/v1/citations/{articleId}/ris`

Export citation in RIS format (used by Mendeley, Zotero, EndNote).

---

### GET `/api/v1/citations/{articleId}/apa`

Export citation in APA 7th edition format as HTML.

**Example response:**
```html
Rustamov, A. (2024). Kvant mexanikasining asoslari. <i>Aniq va tabiiy fanlar jurnali</i>, <i>5</i>(2), 14–22. https://doi.org/10.12345/atf.2024.001
```

---

### GET `/api/v1/citations/{articleId}/mla`

Export citation in MLA 9th edition format as HTML.

---

### GET `/api/v1/citations/{articleId}/dublin-core`

Export metadata in Dublin Core XML format. Used for metadata interchange and archiving.

---

## Metadata & SEO

**Base path:** `/api/v1/metadata`

Use these endpoints to populate `<meta>` tags, Open Graph data, and Schema.org markup in the article detail page `<head>`.

---

### GET `/api/v1/metadata/articles/{id}`

Get full SEO metadata for an article. Returns all meta tags in one call.

**Response:**
```json
{
  "success": true,
  "data": {
    "metaTitle": "Kvant mexanikasining asoslari | ATF Journal",
    "metaDescription": "Ushbu maqolada kvant mexanikasining...",
    "metaKeywords": "kvant, fizika, atom",
    "canonicalUrl": "https://ilmiy.bxu.uz/articles/kvant-mexanikasining-asoslari",
    "robots": "index, follow",
    "ogTitle": "Kvant mexanikasining asoslari",
    "ogDescription": "Ushbu maqolada...",
    "ogType": "article",
    "ogUrl": "https://ilmiy.bxu.uz/articles/...",
    "ogImage": "https://ilmiy.bxu.uz/api/v1/file/img/uuid",
    "twitterCard": "summary_large_image",
    "twitterTitle": "Kvant mexanikasining asoslari",
    "twitterDescription": "...",
    "citationTitle": "Kvant mexanikasining asoslari",
    "citationAuthorNames": ["Akobir Rustamov"],
    "citationJournalTitle": "Aniq va tabiiy fanlar jurnali",
    "citationPublicationDate": "2024-06-15",
    "citationDoi": "10.12345/atf.2024.001",
    "citationPdfUrl": "https://ilmiy.bxu.uz/api/v1/articles/uuid/download",
    "schemaOrgJsonLd": "{\"@context\":\"https://schema.org\",...}"
  }
}
```

---

### GET `/api/v1/metadata/articles/{id}/schema-org`

Get only the Schema.org JSON-LD string. Inject this directly into a `<script type="application/ld+json">` tag.

---

### GET `/api/v1/metadata/articles/{id}/dublin-core`

Get Dublin Core metadata as XML. Used for advanced metadata embedding.

---

## File Management

**Base path:** `/api/v1/file`

---

### POST `/api/v1/file/upload`

Upload any file (image, PDF, document). Returns the file ID which you then store and reference in other entities.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `prefix` | string | Storage folder prefix (e.g. `journals`, `profiles`) |

**Request:**
```
POST /api/v1/file/upload?prefix=journals
Content-Type: multipart/form-data

photo: <file>
```

**Response:** File ID or file metadata object. Store this ID to use with `/img/{id}` or `/getFile/{id}`.

---

### GET `/api/v1/file/img/{id}`

Display an image inline in the browser. Use this as the `src` for `<img>` tags.

**Example:**
```html
<img src="/api/v1/file/img/3fa85f64-5717-4562-b3fc-2c963f66afa6" alt="Journal cover" />
```

---

### GET `/api/v1/file/getFile/{id}`

Download a file as an attachment. The browser will prompt a download dialog.

**Usage:**
```js
window.location.href = `/api/v1/file/getFile/${fileId}`;
```

---

## Admin — User Management

**Base path:** `/api/v1/admin/users`

All endpoints require `ADMIN` or `SUPERADMIN` role.

---

### POST `/api/v1/admin/users`

Create a new user account.

**Request body:**
```json
{
  "name": "Jasur Yusupov",
  "phone": "998901234567",
  "email": "jasur@bxu.uz",
  "password": "securepass123",
  "orcid": "0000-0001-2345-6789",
  "affiliation": "BXU",
  "country": "UZ",
  "roles": [3, 4]
}
```

---

### GET `/api/v1/admin/users`

Get the full list of all platform users.

**Response:** Array of user objects.

---

### GET `/api/v1/admin/users/{id}`

Get a single user by UUID.

---

### PUT `/api/v1/admin/users/{id}`

Update user details. Same body as POST.

---

### DELETE `/api/v1/admin/users/{id}`

Delete a user account.

---

## OAI-PMH

**Base path:** `/oai-pmh`

OAI-PMH is used for metadata harvesting by academic indexers (Google Scholar, BASE, etc.). You typically don't need to call this from the frontend, but it's documented here for completeness.

| Verb | Query | Description |
|------|-------|-------------|
| `Identify` | `?verb=Identify` | Repository info |
| `ListMetadataFormats` | `?verb=ListMetadataFormats` | Supported formats |
| `ListIdentifiers` | `?verb=ListIdentifiers&from=2024-01-01&until=2024-12-31` | Article identifiers |
| `ListRecords` | `?verb=ListRecords&metadataPrefix=oai_dc` | Full metadata records |
| `GetRecord` | `?verb=GetRecord&identifier=oai:bxu.uz:uuid&metadataPrefix=oai_dc` | Single record |

All responses are `application/xml`.

---

## Entities Reference

### User

Represents a platform user. Can have multiple roles and switch between them.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `phone` | string | Login credential (unique) |
| `name` | string | Display name |
| `email` | string | Email address (unique) |
| `orcid` | string | ORCID identifier (unique) |
| `affiliation` | string | Institution name |
| `country` | string | Country code (ISO 3166-1) |
| `bio` | string | Short biography |
| `profilePhotoUrl` | string | URL to profile image |
| `emailVerified` | boolean | Whether email is confirmed |
| `roles` | Role[] | All assigned roles |
| `activeRole` | Role | Currently active role |
| `createdAt` | DateTime | Account creation time |

---

### Journal

Represents a scientific journal published on the platform.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | string | Full journal name |
| `titleAbbr` | string | Abbreviated title (e.g. "ATF") |
| `slug` | string | URL-friendly identifier (auto-generated) |
| `issnPrint` | string | Print ISSN (format: XXXX-XXXX) |
| `issnOnline` | string | Online ISSN |
| `isbn` | string | ISBN if applicable |
| `doi` | string | Journal-level DOI |
| `description` | string | Full description |
| `shortDescription` | string | Short summary for cards |
| `coverImageUrl` | string | URL to cover image |
| `publicationFrequency` | enum | How often it publishes |
| `foundedYear` | int | Year established |
| `publisher` | string | Publisher name |
| `language` | string | Primary language (ISO 639-1) |
| `country` | string | Country of publication |
| `scope` | string | Research subject areas |
| `openAccess` | boolean | Whether freely accessible |
| `active` | boolean | Whether visible publicly |
| `metaTitle` | string | SEO page title |
| `metaDescription` | string | SEO description |
| `metaKeywords` | string | SEO keywords |
| `email` | string | Contact email |
| `website` | string | External website |
| `phone` | string | Contact phone |
| `license` | string | Default article license |

---

### Issue

Represents a single volume/issue of a journal.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `journalId` | UUID | Parent journal |
| `volumeNumber` | int | Volume number |
| `issueNumber` | int | Issue number within volume |
| `title` | string | Issue title (e.g. "2024-yil 2-son") |
| `description` | string | Issue description |
| `publishedDate` | date | Official publication date |
| `current` | boolean | Whether this is the latest issue |
| `doi` | string | Issue-level DOI |
| `coverImageUrl` | string | URL to cover image |
| `articleCount` | int | Number of articles |

---

### Article

Represents a submitted or published research paper.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `title` | string | Article title |
| `slug` | string | URL-friendly identifier (auto-generated) |
| `abstractText` | string | Article abstract |
| `keywords` | string[] | List of keywords |
| `status` | ArticleStatus | Current workflow status |
| `doi` | string | Article DOI |
| `journalId` | UUID | Parent journal |
| `issueId` | UUID | Assigned issue (null until published) |
| `pdfUrl` | string | Download URL for PDF |
| `hasHtml` | boolean | Whether HTML version exists |
| `authors` | ArticleAuthor[] | Ordered list of authors |
| `references` | Reference[] | Reference list |
| `reviewType` | enum | Review anonymity type |
| `pageStart` | int | First page number |
| `pageEnd` | int | Last page number |
| `language` | string | Article language |
| `license` | string | Article license |
| `receivedDate` | date | When manuscript was received |
| `acceptedDate` | date | When manuscript was accepted |
| `submittedAt` | DateTime | Submission timestamp |
| `publishedAt` | DateTime | Publication timestamp |
| `viewCount` | long | Total page views |
| `downloadCount` | long | Total PDF downloads |
| `metaTitle` | string | SEO title |
| `metaDescription` | string | SEO description |

---

### ArticleAuthor

Represents one author on an article. Can be linked to a platform user or be an external author.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `articleId` | UUID | Parent article |
| `userId` | UUID | Platform user (optional) |
| `fullName` | string | Author's full name |
| `email` | string | Contact email |
| `orcid` | string | ORCID identifier |
| `affiliation` | string | Institution |
| `country` | string | Country code |
| `bio` | string | Short biography |
| `corresponding` | boolean | Whether this is the corresponding author |
| `orderIndex` | int | Display order (1-based) |

---

### Review

Represents a peer review assignment and its outcome.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `articleId` | UUID | Article being reviewed |
| `reviewerId` | UUID | Assigned reviewer |
| `assignedById` | UUID | Editor who assigned the review |
| `status` | ReviewStatus | Current status of the review |
| `decision` | ReviewDecision | Final decision (set when completed) |
| `commentsForAuthor` | string | Feedback visible to the author |
| `commentsForEditor` | string | Private notes for the editor |
| `score` | int (1-10) | Overall score |
| `scoreOriginality` | int (1-10) | Originality score |
| `scoreMethodology` | int (1-10) | Methodology score |
| `scoreClarity` | int (1-10) | Clarity/writing score |
| `dueDate` | date | Review deadline |
| `invitedAt` | DateTime | When reviewer was invited |
| `respondedAt` | DateTime | When reviewer accepted/declined |
| `completedAt` | DateTime | When review was submitted |

---

### Reference

Represents one item in an article's reference list.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `articleId` | UUID | Parent article |
| `orderIndex` | int | Position in reference list |
| `text` | string | Fully formatted reference text |
| `doi` | string | Reference DOI (if available) |
| `url` | string | Reference URL (if available) |

---

### Attachment

Represents an uploaded file (PDF, image, document).

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `prefix` | string | Storage folder prefix |
| `name` | string | Original filename |
| `contentType` | string | MIME type (e.g. `application/pdf`) |
| `size` | long | File size in bytes |
| `storageType` | enum | `LOCAL` or `MINIO` |
| `uploadedAt` | DateTime | Upload timestamp |

---

### EditorialBoardMember

Represents a member of a journal's editorial board.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `journalId` | UUID | Parent journal |
| `userId` | UUID | Platform user (optional) |
| `fullName` | string | Member's full name |
| `email` | string | Contact email |
| `orcid` | string | ORCID identifier |
| `affiliation` | string | Institution |
| `country` | string | Country code |
| `position` | string | Role title (e.g. "Editor-in-Chief") |
| `bio` | string | Biography |
| `photoUrl` | string | URL to profile photo |
| `orderIndex` | int | Display order |
| `active` | boolean | Whether currently active |

---

## Enums Reference

### ArticleStatus

The article moves through these states in order during the editorial workflow.

| Value | Meaning |
|-------|---------|
| `DRAFT` | Saved by author, not yet submitted |
| `SUBMITTED` | Submitted by author, awaiting editor action |
| `UNDER_REVIEW` | Assigned to reviewers |
| `REVISION_REQUIRED` | Author must revise and resubmit |
| `ACCEPTED` | Accepted for publication |
| `PUBLISHED` | Live and publicly visible |
| `ARCHIVED` | No longer active but still accessible |
| `REJECTED` | Rejected at any stage |

---

### ReviewStatus

| Value | Meaning |
|-------|---------|
| `PENDING` | Reviewer invited, no response yet |
| `ACCEPTED` | Reviewer accepted the invitation |
| `DECLINED` | Reviewer declined the invitation |
| `COMPLETED` | Review submitted |
| `EXPIRED` | Due date passed without response |

---

### ReviewDecision

| Value | Meaning |
|-------|---------|
| `ACCEPT` | Accept as-is |
| `REJECT` | Reject the manuscript |
| `MINOR_REVISION` | Accept with small changes |
| `MAJOR_REVISION` | Requires significant rewriting |

---

### PublicationFrequency

| Value | Meaning |
|-------|---------|
| `WEEKLY` | Once per week |
| `MONTHLY` | Once per month |
| `BIMONTHLY` | Every two months |
| `QUARTERLY` | Four times per year |
| `BIANNUAL` | Twice per year |
| `ANNUAL` | Once per year |
| `IRREGULAR` | No fixed schedule |
| `CONTINUOUS` | Published as articles are ready |

---

### UserRoles

| Value | Dashboard Route |
|-------|----------------|
| `ROLE_SUPERADMIN` | `/superadmin/*` |
| `ROLE_ADMIN` | `/admin/*` |
| `ROLE_EDITOR` | (uses admin layout) |
| `ROLE_REVIEWER` | (receives review assignments) |
| `ROLE_AUTHOR` | `/student/*` |
| `ROLE_REKTOR` | `/rektor/*` |
| `ROLE_ILMIY_BOLIM` | `/ilmiy-bolim/*` |
| `ROLE_ILMIY_RAHBAR` | `/ilmiy-rahbar/*` |
| `ROLE_ILMIY_TEXNIK` | `/ilmiy-texnik/*` |
| `ROLE_BUGALTER` | `/bugalter/*` |

---

## Quick Reference

### Axios setup (`src/config/index.js`)

The Axios instance is pre-configured. Import it instead of raw `axios`:

```js
import api from 'config';

// GET example
const journals = await api.get('/api/v1/journals');

// POST example
const article = await api.post('/api/v1/articles/submit', formData);

// File upload example
const form = new FormData();
form.append('file', file);
await api.post(`/api/v1/articles/${id}/pdf`, form, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Common response wrapper

Most endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

Pagination responses include:
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

### Auth flow

```
1. POST /api/v1/auth/login → save accessToken + refreshToken to localStorage
2. All requests → Authorization: Bearer <accessToken> (auto-added by Axios)
3. On 401 → Axios interceptor calls POST /api/v1/auth/refresh automatically
4. On role switch → PUT /api/v1/auth/change-role/{roleId} → navigate to new dashboard
```
