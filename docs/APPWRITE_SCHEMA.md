# Appwrite TablesDB schema for InfoHub

Create one Appwrite database and these tables. Keep the table IDs in Vercel Production environment variables.

| Table | Required fields |
|---|---|
| profiles | user_id string, display_name string, role string |
| categories | name string, slug string, is_active boolean, sort_order integer |
| articles | title string, slug string, excerpt string, content string, status string, category_id string, source_id string, canonical_url string, reading_minutes integer, published_at datetime, image_url string, created_by string, ai_enriched_at datetime |
| article_categories | article_id string, category_id string |
| tags | name string, slug string |
| article_tags | article_id string, tag_id string |
| sources | name string, domain string, homepage_url string, feed_url string, is_active boolean, last_ingested_at datetime |
| ingestion_runs | source_id string, status string, error_message string, started_at datetime, finished_at datetime, items_seen integer, items_created integer, items_skipped integer, items_failed integer, failure_details string |
| audit_logs | article_id string, actor_id string, action string, metadata string, created_at datetime |
| notifications | type string, title string, message string, read_at datetime, created_at datetime |

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

## Permissions

The current application deliberately performs CMS writes server-side with APPWRITE_API_KEY. Do not expose that key as NEXT_PUBLIC_*.

Public article reads can be served through the server repository. Account operations use the user's Appwrite session.

Before production cutover, provision the tables and verify the schema against the exact InfoHub fields. This document is a schema contract, not a claim that the Appwrite project has already been provisioned.