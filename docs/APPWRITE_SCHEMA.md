# Appwrite TablesDB schema for InfoHub

Create one Appwrite TablesDB database and these tables. Keep the table IDs in Vercel Production environment variables.

| Table | Required fields |
|---|---|
| profiles | user_id string, display_name string, role string |
| categories | name string, slug string, is_active boolean, sort_order integer |
| articles | title string, slug string, excerpt text, content longtext, status string, category_id string, source_id string, canonical_url string, reading_minutes integer, published_at datetime, image_url string, created_by string, ai_enriched_at datetime |
| article_categories | article_id string, category_id string |
| tags | name string, slug string |
| article_tags | article_id string, tag_id string |
| sources | name string, domain string, homepage_url string, feed_url string, is_active boolean, last_ingested_at datetime |
| ingestion_runs | source_id string, status string, error_message longtext, started_at datetime, finished_at datetime, items_seen integer, items_created integer, items_skipped integer, items_failed integer, failure_details longtext |
| audit_logs | article_id string, actor_id string, action string, metadata longtext, created_at datetime |
| notifications | type string, title string, message text, read_at datetime, created_at datetime |

## Provisioning

The repository includes an idempotent setup script:

```bash
APPWRITE_API_KEY=... npm run setup:appwrite
```

The script uses `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, and `APPWRITE_DATABASE_ID` when provided. Otherwise it uses the existing InfoHub Appwrite endpoint/project and database ID `infohub`.

The API key is read only from the process environment and is never written to the repository. Appwrite's REST API requires the project ID and server API key for database provisioning; the key must remain server-side. citeturn0search1turn0search10

The script creates the database, tables, columns, and the indexes required by the repository's common equality/order queries. New tables are created with no table-level permissions because InfoHub performs CMS/database access through the server API key; public reads are exposed by the application's server repository. Appwrite grants no table access by default, so permissions should not be opened to public clients unless the architecture is intentionally changed. citeturn0search0turn0search3

## IDs

Set these variables in Vercel Production:

- APPWRITE_DATABASE_ID
- APPWRITE_PROFILES_TABLE_ID
- APPWRITE_CATEGORIES_TABLE_ID
- APPWRITE_ARTICLES_TABLE_ID
- APPWRITE_ARTICLE_CATEGORIES_TABLE_ID
- APPWRITE_TAGS_TABLE_ID
- APPWRITE_ARTICLE_TAGS_TABLE_ID
- APPWRITE_SOURCES_TABLE_ID
- APPWRITE_INGESTION_RUNS_TABLE_ID
- APPWRITE_NOTIFICATIONS_TABLE_ID
- APPWRITE_AUDIT_LOGS_TABLE_ID

The provisioning script defaults table IDs to the names above, so those environment variables can use the same values unless an existing Appwrite schema uses different IDs.

## Permissions

The current application deliberately performs CMS writes server-side with `APPWRITE_API_KEY`. Do not expose that key as `NEXT_PUBLIC_*`.

Public article reads can be served through the server repository. Account operations use the user's Appwrite session.

This document is a schema contract plus a repeatable provisioning path; it is **not** a claim that the connected Appwrite project has already been provisioned. Production cutover still requires running the setup against the intended Appwrite project and then verifying the resulting IDs/configuration.
