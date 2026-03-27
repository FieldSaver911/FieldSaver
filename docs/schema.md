# Database Schema Reference

## PostgreSQL 16 — FieldSaver

All tables follow these conventions:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ DEFAULT now()`  
- `deleted_at TIMESTAMPTZ` — soft delete, nullable

camelCase in TypeScript ↔ snake_case in PostgreSQL via `knex-stringcase`.

---

## Table: users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| email | TEXT UNIQUE NOT NULL | |
| password_hash | TEXT NOT NULL | bcrypt |
| name | TEXT NOT NULL | |
| role | TEXT NOT NULL | 'admin' \| 'editor' \| 'viewer' |
| monday_access_token | TEXT | AES-256-GCM encrypted |
| monday_account_id | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | soft delete |

**Indexes:** email (unique), role

---

## Table: forms
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | NOT NULL |
| name | TEXT NOT NULL | default 'Untitled Form' |
| description | TEXT | default '' |
| data | JSONB NOT NULL | full form tree: pages[]→sections[]→rows[]→cells[]→fields[] |
| settings | JSONB NOT NULL | submitLabel, formLayout, mondayBoardId, etc. |
| status | TEXT NOT NULL | 'draft' \| 'published' \| 'archived' |
| published_at | TIMESTAMPTZ | nullable |
| version | INTEGER NOT NULL | default 1, increments on publish |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

**Indexes:** user_id, status, (user_id, status, deleted_at) composite  
**GIN index:** data (for JSONB queries inside the form tree)

---

## Table: libraries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| icon | TEXT | default '📚' |
| description | TEXT | |
| color | TEXT | default '#0073EA' |
| version | TEXT | default '1.0' |
| source | TEXT NOT NULL | 'builtin' \| 'monday_board' \| 'custom' |
| monday_board_id | TEXT | nullable |
| columns | JSONB NOT NULL | system column definitions |
| categories | TEXT[] | category labels |
| sub_categories | TEXT[] | sub-category labels |
| permissions | JSONB NOT NULL | { canView[], canEdit[], canDelete[] } |
| is_system | BOOLEAN | true for NEMSIS built-in |
| created_by | UUID FK → users | nullable for system libs |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

**Indexes:** created_by, source, is_system

---

## Table: library_rows
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| library_id | UUID FK → libraries | NOT NULL |
| label | TEXT NOT NULL | |
| code | TEXT | NEMSIS code e.g. '7701001' |
| export_key | TEXT NOT NULL | maps to NEMSIS element path |
| description | TEXT | |
| category | TEXT | 'NOT Value' \| 'Pertinent Negative' \| 'Data Element' \| 'Nillable Marker' |
| sub_category | TEXT | 'Clinical' \| 'Administrative' \| etc. |
| usage | TEXT | 'Optional' \| 'Recommended' \| 'Required' |
| element_id | TEXT | NEMSIS element ID e.g. 'eVitals.06' |
| sort_order | INTEGER | default 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | |

**Indexes:** library_id, category, export_key, (library_id, category, deleted_at) composite

---

## Table: submissions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| form_id | UUID FK → forms | NOT NULL |
| form_version | INTEGER NOT NULL | snapshot of form version at submit time |
| data | JSONB NOT NULL | { fieldId: value } raw field values |
| export_data | JSONB NOT NULL | { exportKey: value } NEMSIS-ready payload |
| not_values | JSONB NOT NULL | { fieldId: exportKey } NOT Value selections |
| submitted_by | UUID FK → users | nullable (public forms) |
| submitted_at | TIMESTAMPTZ NOT NULL | default now() |
| source | TEXT | 'web' \| 'monday_app' \| 'api' |
| monday_item_id | TEXT | nullable, set after monday.com sync |
| created_at | TIMESTAMPTZ | |

**Indexes:** form_id, submitted_at, (form_id, submitted_at) composite

---

## Table: narrative_templates
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| form_id | UUID FK → forms | NOT NULL |
| name | TEXT NOT NULL | |
| content | TEXT NOT NULL | raw template string with {{fieldId\|label}} tokens |
| sort_order | INTEGER | default 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** form_id

---

## Table: refresh_tokens
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | NOT NULL |
| token_hash | TEXT UNIQUE NOT NULL | SHA-256 of the raw token |
| expires_at | TIMESTAMPTZ NOT NULL | |
| revoked_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

**Indexes:** user_id, token_hash (unique)

---

## JSONB Shapes

### forms.data (form tree)
```json
{
  "pages": [
    {
      "id": "uuid",
      "title": "Page 1",
      "description": "",
      "sections": [
        {
          "id": "uuid",
          "title": "Section 1",
          "settings": { "repeatable": false, "repeatLabel": "+ Add Another", "maxRepeats": 5 },
          "rows": [
            {
              "id": "uuid",
              "preset": { "label": "½+½", "cols": [6, 6] },
              "cells": [
                {
                  "id": "uuid",
                  "fields": [ /* Field objects */ ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "libraries": [ /* Library snapshots for rendering */ ],
  "narrativeTemplates": []
}
```

### Field object (inside forms.data)
```json
{
  "id": "uuid",
  "type": "text",
  "label": "Patient Name",
  "required": false,
  "placeholder": "",
  "helpText": "",
  "validation": {},
  "libraryRows": [
    { "libraryId": "lib_nemsis35", "rowId": "de_patient_name", "label": "Patient Name", "exportKey": "ePatient.PatientNameGroup", "code": "", "category": "Data Element", "subCategory": "Patient" }
  ],
  "dataAttrs": { "showCategories": ["NOT Value", "Pertinent Negative"], "isNillable": false },
  "behaviour": {
    "defaultValue": "", "memoryField": false, "geoLocation": false,
    "hideQuestion": false, "enabled": true, "hintText": "",
    "excludeReport": false, "timeStamp": false, "hidden": false, "color": ""
  },
  "narrative": { "valueText": "", "notValueText": "" },
  "options": null,
  "settings": { "maxLength": "" }
}
```

### forms.settings
```json
{
  "submitLabel": "Submit",
  "successMessage": "Thank you! Your response has been submitted.",
  "redirectUrl": "",
  "showProgress": true,
  "allowDraft": false,
  "formLayout": "progress",
  "brandColor": "",
  "showPageNumbers": false,
  "mondayBoardId": "",
  "mondayGroupId": "",
  "webhookUrl": "",
  "notifyEmails": "",
  "dateFormat": "MM/DD/YYYY",
  "emptyFieldHandling": "omit",
  "retentionDays": 90
}
```
