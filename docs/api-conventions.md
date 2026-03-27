# API Conventions

## Base URL
`/api/v1`

## Response envelope
```ts
// Success
{ data: T, meta?: { total: number, page: number, limit: number } }

// Error
{ error: string, details?: { path: string[], message: string }[] }
```

## Core Endpoints

### Forms
| Method | Path | Description |
|--------|------|-------------|
| GET | /forms | List forms (paginated) |
| POST | /forms | Create form |
| GET | /forms/:id | Get form by ID |
| PUT | /forms/:id | Replace form (full update) |
| PATCH | /forms/:id | Partial update |
| DELETE | /forms/:id | Soft delete |
| POST | /forms/:id/publish | Publish form |
| POST | /forms/:id/duplicate | Duplicate form |
| GET | /forms/:id/export | Export form JSON + key map |

### Libraries
| Method | Path | Description |
|--------|------|-------------|
| GET | /libraries | List all libraries |
| POST | /libraries | Create library |
| GET | /libraries/:id | Get library with rows |
| PUT | /libraries/:id | Update library metadata |
| DELETE | /libraries/:id | Soft delete |

### Library Rows
| Method | Path | Description |
|--------|------|-------------|
| GET | /libraries/:id/rows | List rows (filterable) |
| POST | /libraries/:id/rows | Create row |
| PUT | /libraries/:id/rows/:rowId | Update row |
| DELETE | /libraries/:id/rows/:rowId | Delete row |
| POST | /libraries/:id/rows/bulk | Bulk create rows |

### Submissions
| Method | Path | Description |
|--------|------|-------------|
| POST | /forms/:id/submissions | Submit form data |
| GET | /forms/:id/submissions | List submissions |
| GET | /forms/:id/submissions/:subId | Get submission |

### Monday.com Integration
| Method | Path | Description |
|--------|------|-------------|
| GET | /monday/boards | List accessible boards |
| GET | /monday/boards/:boardId/columns | Get board columns |
| POST | /monday/sync/:formId | Sync submission to monday.com board |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login, returns JWT + refresh token |
| POST | /auth/refresh | Exchange refresh token for new JWT |
| POST | /auth/logout | Invalidate refresh token |
| GET | /me | Current user profile |

## Query Parameters
- `?page=1&limit=50` — pagination
- `?sort=created_at&order=desc` — sorting
- `?search=query` — full-text search (where supported)
- `?category=Pertinent+Negative` — library row filtering
- `?subCategory=Clinical` — library row sub-category filter
