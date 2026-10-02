#!/usr/bin/env node

const endpoint = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1").replace(/\/$/, "");
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6abd3aa6000db661c656";
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || "infohub";

if (!apiKey) {
  throw new Error("APPWRITE_API_KEY is required. Keep it server-side and never commit it.");
}

const tables = [
  ["profiles", [["user_id","string",{size:128,required:true}],["display_name","string",{size:256,required:true}],["role","string",{size:32,required:true}]]],
  ["categories", [["name","string",{size:256,required:true}],["slug","string",{size:256,required:true}],["is_active","boolean",{required:false,default:true}],["sort_order","integer",{required:false,default:0}]]],
  ["articles", [["title","string",{size:512,required:true}],["slug","string",{size:256,required:true}],["excerpt","text",{required:true}],["content","longtext",{required:true}],["status","string",{size:32,required:true}],["category_id","string",{size:128,required:false}],["source_id","string",{size:128,required:false}],["canonical_url","string",{size:2048,required:false}],["canonical_url_hash","string",{size:64,required:false}],["reading_minutes","integer",{required:false,default:1}],["published_at","datetime",{required:false}],["image_url","string",{size:2048,required:false}],["created_by","string",{size:128,required:false}],["ai_enriched_at","datetime",{required:false}]]],
  ["article_categories", [["article_id","string",{size:128,required:true}],["category_id","string",{size:128,required:true}]]],
  ["tags", [["name","string",{size:256,required:true}],["slug","string",{size:256,required:true}]]],
  ["article_tags", [["article_id","string",{size:128,required:true}],["tag_id","string",{size:128,required:true}]]],
  ["sources", [["name","string",{size:256,required:true}],["domain","string",{size:256,required:true}],["homepage_url","string",{size:2048,required:true}],["feed_url","string",{size:2048,required:true}],["feed_url_hash","string",{size:64,required:false}],["is_active","boolean",{required:false,default:true}],["last_ingested_at","datetime",{required:false}]]],
  ["ingestion_runs", [["source_id","string",{size:128,required:true}],["status","string",{size:32,required:true}],["error_message","longtext",{required:false}],["started_at","datetime",{required:true}],["finished_at","datetime",{required:false}],["items_seen","integer",{required:false,default:0}],["items_created","integer",{required:false,default:0}],["items_skipped","integer",{required:false,default:0}],["items_failed","integer",{required:false,default:0}],["failure_details","longtext",{required:false}],["item_details","longtext",{required:false}]]],
  ["audit_logs", [["article_id","string",{size:128,required:true}],["actor_id","string",{size:128,required:true}],["action","string",{size:64,required:true}],["metadata","longtext",{required:true}],["created_at","datetime",{required:true}]]],
  ["notifications", [["type","string",{size:64,required:true}],["title","string",{size:512,required:true}],["message","text",{required:true}],["read_at","datetime",{required:false}],["created_at","datetime",{required:true}]]],
  ["analytics_events", [["event_name","string",{size:64,required:true}],["article_id","string",{size:128,required:true}],["path","string",{size:2048,required:true}],["created_at","datetime",{required:true}]]],
];

const indexes = {
  profiles: [["user_id_unique","unique",["user_id"]]],
  categories: [["slug_unique","unique",["slug"]],["active_order","key",["is_active","sort_order"]]],
  articles: [["slug_unique","unique",["slug"]],["status_published","key",["status","published_at"]],["canonical_url_hash_unique","unique",["canonical_url_hash"]]],
  article_categories: [["article_category_unique","unique",["article_id","category_id"]]],
  tags: [["slug_unique","unique",["slug"]],["name_order","key",["name"]]],
  article_tags: [["article_tag_unique","unique",["article_id","tag_id"]]],
  sources: [["feed_url_hash_unique","unique",["feed_url_hash"]],["active_sources","key",["is_active"]]],
  ingestion_runs: [["source_started","key",["source_id","started_at"]]],
  audit_logs: [["article_created","key",["article_id","created_at"]]],
  notifications: [["created_at","key",["created_at"]]],
  analytics_events: [["article_view","key",["event_name","article_id","created_at"]]],
};

async function request(path, options = {}) {
  const response = await fetch(endpoint + path, {
    ...options,
    headers: {"Content-Type":"application/json","X-Appwrite-Project":projectId,"X-Appwrite-Key":apiKey,...(options.headers || {})},
  });
  let body = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) {
    const error = new Error(body?.message || `Appwrite request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

async function ensureDatabase() {
  try { return await request(`/tablesdb/${encodeURIComponent(databaseId)}`); }
  catch (error) {
    if (error.status !== 404) throw error;
    console.log(`Creating database ${databaseId}...`);
    return request("/tablesdb",{method:"POST",body:JSON.stringify({databaseId,name:"InfoHub",enabled:true,specification:"serverless"})});
  }
}

async function ensureTable(tableId) {
  try { return await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}`); }
  catch (error) {
    if (error.status !== 404) throw error;
    console.log(`Creating table ${tableId}...`);
    return request(`/tablesdb/${encodeURIComponent(databaseId)}/tables`,{method:"POST",body:JSON.stringify({tableId,name:tableId,permissions:[],rowSecurity:false,enabled:true})});
  }
}

async function ensureColumn(tableId,key,type,options) {
  try { return await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/columns/${encodeURIComponent(key)}`); }
  catch (error) { if (error.status !== 404) throw error; }
  const payload = {key,required:Boolean(options.required),...(options.default !== undefined ? {default:options.default} : {})};
  if (type === "string") payload.size = options.size || 256;
  console.log(`  Creating ${tableId}.${key} (${type})...`);
  return request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/columns/${type}`,{method:"POST",body:JSON.stringify(payload)});
}

async function ensureIndex(tableId,key,type,columns) {
  try { return await request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/indexes/${encodeURIComponent(key)}`); }
  catch (error) { if (error.status !== 404) throw error; }
  console.log(`  Creating index ${tableId}.${key}...`);
  return request(`/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/indexes`,{method:"POST",body:JSON.stringify({key,type,columns})});
}

await ensureDatabase();
for (const [tableId,columns] of tables) {
  await ensureTable(tableId);
  for (const [key,type,options] of columns) await ensureColumn(tableId,key,type,options);
  for (const [key,type,columnsForIndex] of indexes[tableId] || []) await ensureIndex(tableId,key,type,columnsForIndex);
}
console.log("Appwrite InfoHub schema provisioning completed.");
console.log(`Database ID: ${databaseId}`);
console.log("Set APPWRITE_*_TABLE_ID variables to the table IDs above (the defaults match this script).");
