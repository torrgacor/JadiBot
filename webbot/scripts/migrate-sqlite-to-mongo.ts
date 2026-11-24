/**
 * One-off migration: SQLite (prisma/dev.db) → MongoDB (MONGODB_URI/MONGODB_DB).
 *
 * Reads every table from the legacy Prisma/SQLite database and writes the rows
 * into the MongoDB collections the app now uses, keeping the original `id`
 * values so foreign keys stay consistent across collections.
 *
 *   npx tsx scripts/migrate-sqlite-to-mongo.ts
 *
 * Safe to re-run: it drops each target collection before re-importing, so the
 * result is always a clean copy of the source database. If you want a
 * *fresh* Mongo instead of migrating this one, don't run it.
 *
 * Order matters: parents before children, so a child row's FK always points
 * at an id that already exists in its parent collection.
 */
import { DatabaseSync } from 'node:sqlite'
import { MongoClient, type Document } from 'mongodb'

const SQLITE_PATH = process.env.SQLITE_PATH ?? './prisma/dev.db'
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'
const MONGO_DB = process.env.MONGODB_DB ?? 'nano_gateway'

// Prisma camelCase model → SQLite table name + the order to import in.
const TABLES: Array<{ table: string; collection: string }> = [
  { table: 'User', collection: 'user' },
  { table: 'Plan', collection: 'plan' },
  { table: 'Subscription', collection: 'subscription' },
  { table: 'Payment', collection: 'payment' },
  { table: 'LoginSession', collection: 'loginSession' },
  { table: 'OAuthAccount', collection: 'oauthAccount' },
  { table: 'VerificationToken', collection: 'verificationToken' },
  { table: 'WhatsAppSession', collection: 'whatsAppSession' },
  { table: 'Message', collection: 'message' },
  { table: 'Campaign', collection: 'campaign' },
  { table: 'ScheduledMessage', collection: 'scheduledMessage' },
  { table: 'Contact', collection: 'contact' },
  { table: 'ContactTag', collection: 'contactTag' },
  { table: 'Group', collection: 'group' },
  { table: 'GroupMember', collection: 'groupMember' },
  { table: 'AutomationRule', collection: 'automationRule' },
  { table: 'ApiKey', collection: 'apiKey' },
  { table: 'ApiRequestLog', collection: 'apiRequestLog' },
  { table: 'Notification', collection: 'notification' },
  { table: 'Ticket', collection: 'ticket' },
  { table: 'TicketMessage', collection: 'ticketMessage' },
  { table: 'ActivityLog', collection: 'activityLog' },
  { table: 'Job', collection: 'job' },
  { table: 'Outbox', collection: 'outbox' },
]

/**
 * Prisma/SQLite store DateTime as `YYYY-MM-DD HH:MM:SS.sss`. Node:sqlite's
 * built-in DatabaseSync returns those as strings. Convert to JS Date so the
 * Mongo documents hold real Date objects (Prisma would have, too).
 *
 * Only applied to columns that were DateTime in the schema — we detect a
 * value that looks like one (ISO-ish string with a space separator) rather
 * than re-parsing the schema, which keeps this script schema-agnostic.
 */
function convertDateTimeStrings(doc: Record<string, unknown>): Record<string, unknown> {
  for (const [key, value] of Object.entries(doc)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value)) {
      const d = new Date(value)
      doc[key] = Number.isNaN(d.getTime()) ? value : d
    }
  }
  return doc
}

async function main() {
  const sqlite = new DatabaseSync(SQLITE_PATH)
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  const db = client.db(MONGO_DB)

  console.log(`▸ SQLite: ${SQLITE_PATH}`)
  console.log(`▸ Mongo:   ${MONGO_URI}/${MONGO_DB}`)

  let total = 0
  for (const { table, collection } of TABLES) {
    const rows: Array<Record<string, unknown>> = sqlite
      .prepare(`SELECT * FROM "${table}"`)
      .all() as Array<Record<string, unknown>>

    const docs = rows.map((row) => {
      const converted = convertDateTimeStrings(row)
      // Strip the auto _id if present; the app keys on the `id` column.
      delete (converted as Record<string, unknown>)._id
      // node:sqlite may return numeric timestamps; normalise to Date.
      if (typeof converted.createdAt === 'number') {
        converted.createdAt = new Date(converted.createdAt as number)
      }
      return converted
    })

    await db.collection(collection).drop()
    if (docs.length > 0) {
      await db.collection(collection).insertMany(docs as Document[])
    }
    total += docs.length
    console.log(`  ✓ ${table.padEnd(18)} ${String(docs.length).padStart(7)} → ${collection}`)
  }

  // ── repair dangling FKs left by the original Prisma/SQLite history ──────
  // The legacy DB had plans deleted & re-created at some point, so many
  // subscription.planId values pointed at plan ids that no longer exist.
  // Mongo has no foreign keys, so those would silently break `include`.
  // Map every subscription to a plan id that actually exists: keep the row's
  // own `planId` when it is still valid, otherwise fall back to the Free plan
  // (the always-present default tier).
  const planIds = new Set(
    (await db.collection('plan').find().project({ id: 1 }).toArray())
      .map((p) => p.id)
  )
  const freePlan = await db.collection('plan').findOne({ slug: 'free' })
  const freeId = freePlan?.id
  if (freeId) {
    const subs = await db.collection('subscription')
      .find({})
      .project({ _id: 1, planId: 1 })
      .toArray()
    let repaired = 0
    for (const s of subs) {
      if (s.planId && planIds.has(s.planId)) continue
      await db.collection('subscription').updateOne(
        { _id: s._id },
        { $set: { planId: freeId } }
      )
      repaired += 1
    }
    if (repaired > 0) {
      console.log(`  → repaired ${repaired} dangling subscription.planId → free plan`)
    }
  }

  // ── de-duplicate unique keys so Mongo's unique indexes can build ───────
  // The legacy SQLite had no enforced uniqueness on some columns (or it
  // tolerated dupes the schema no longer does). Two users named "admin"
  // would break `ensureIndexes()`. Keep the most-recently-created row, drop
  // the rest of the duplicate (and log it).
  async function dedupe(
    collectionName: string,
    fields: string[],
    label: string
  ): Promise<number> {
    const col = db.collection(collectionName)
    const toDelete: Array<Record<string, unknown>> = []
    // Keep the row with the largest createdAt per key; delete the rest.
    const rows = await col.find().sort({ createdAt: 1 }).toArray()
    const latestByKey = new Map<string, Record<string, unknown>>()
    for (const row of rows) {
      // Skip rows where any dedupe field is missing/blank — they are not
      // real duplicates, just rows with an optional field.
      if (fields.some((f) => row[f] == null || row[f] === '')) continue
      const key = fields.map((f) => String(row[f])).join('\0')
      latestByKey.set(key, row) // ascending → last write = newest
    }
    // Build the deletion set from the *full* row list (not just key-bearing
    // rows): a row with a blank field must still survive, so it must not be
    // in `toDelete`.
    const blankRows = new Set(
      rows
        .filter((r) => fields.some((f) => r[f] == null || r[f] === ''))
        .map((r) => r._id)
    )
    const keepIds = new Set([
      ...latestByKey.values().map((r) => r._id),
      ...blankRows,
    ])
    for (const row of rows) {
      if (!keepIds.has(row._id)) toDelete.push(row)
    }
    if (toDelete.length > 0) {
      await col.deleteMany({ _id: { $in: toDelete.map((r) => r._id as any) } })
      console.log(
        `  → deduped ${toDelete.length} duplicate ${label} (kept newest)`
      )
    }
    return toDelete.length
  }

  // Dedupe the *scalar* unique keys only. Composite unique keys are skipped
  // because deduping them row-by-row is not well-defined — Mongo's
  // `ensureIndexes()` will surface any real duplicates as an E11000 at
  // index-build time, and the app's upsert logic handles those.
  await dedupe('user', ['username'], 'username')
  await dedupe('user', ['email'], 'email')
  await dedupe('loginSession', ['tokenHash'], 'tokenHash')
  await dedupe('plan', ['slug'], 'plan slug')

  // The seed creates a *new* admin (admin@nanogateway.local) whose username
  // collides with the migrated legacy admin. Re-run the username dedupe
  // after the seed would have already happened — but the seed runs AFTER
  // this script, so we instead rename the legacy admin here to keep the
  // namespace unique for the seed's insert.
  const legacyAdmin = await db
    .collection('user')
    .findOne({ username: 'admin', email: { $ne: 'admin@nanogateway.local' } })
  if (legacyAdmin) {
    await db.collection('user').updateOne(
      { _id: legacyAdmin._id },
      { $set: { username: 'admin-legacy' } }
    )
    console.log('  → renamed legacy admin to "admin-legacy" to free the unique username')
  }

  // Rebuild any collection whose dedupe left a blank key that should be
  // filled in — no-op in practice, but keeps the contract explicit.

  sqlite.close()
  await client.close()
  console.log(`\n✓ Migration complete — ${total} rows across ${TABLES.length} collections.`)
}

main().catch((error) => {
  console.error('✗ Migration failed:', error)
  process.exit(1)
})
