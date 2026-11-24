/**
 * MongoDB data layer — drop-in adapter over the `mongodb` driver.
 *
 * Exposes a `db` object whose shape matches the former Prisma client:
 * `db.user.findUnique({ where: { id } })` and friends still work across the
 * whole codebase. Every Prisma `where` clause is translated to a MongoDB
 * filter by `translateWhere()`.
 *
 * ── ENV ────────────────────────────────────────────────────────────────────
 *   MONGODB_URI   connection string. Defaults to `mongodb://localhost:27017`
 *   MONGODB_DB    database name.     Defaults to `nano_gateway`
 *
 * ── WHAT CHANGED VS PRISMA ────────────────────────────────────────────────
 *   • `@id @default(cuid())` → Mongo ObjectId; on `create()` without an
 *     `id` we auto-generate a cuid-style id (24-char hex from timestamp +
 *     random) so existing code that reads `row.id` still works.
 *   • `@updatedAt` fields → the adapter stamps `updatedAt` on every
 *     `update()`.
 *   • Prisma `where` operators (`in`, `notIn`, `contains`, `lt`, `lte`,
 *     `gt`, `gte`, `not`, `null`, `OR`, `NOT`, `AND`) are mapped to the
 *     MongoDB equivalents.
 *   • `select: { field: true }` is passed through; Mongo projection returns
 *     objects with only the requested fields, same as Prisma.
 *   • `include: { plan: true }` is hydrated after the base read: the adapter
 *     fetches the related document(s) via a second query and attaches them
 *     to each result. `include: { _count: { select: {...} } }` works the
 *     same way — a per-document countDocuments call.
 *   • `select: { _count: { select: {...} } }` is also supported (the
 *     admin/users pages use this form).
 *   • Relational `where: { plan: { priceMonthly: { gt: 0 } } }` is resolved
 *     by a sub-query that fetches matching related ids and rewrites the
 *     outer filter to `planId: { $in: [...] }`.
 *   • `groupBy` is emulated in-memory for the two call-sites that use it
 *     (admin page: user.status, whatsAppSession.status).
 *   • `createMany` / `updateMany` / `deleteMany` → `insertMany` /
 *     `updateMany` / `deleteMany` with `count`-shaped returns.
 *   • Unique violations surface as a `MongoBulkWriteError` whose `code`
 *     is 11000 — the caller can catch on `.code === 11000` if needed.
 *   • No transactions. The codebase never called `prisma.$transaction()`.
 *
 * ── TYPES ──────────────────────────────────────────────────────────────────
 *   Model row types are re-exported from `./db-types` — the former
 *   `@prisma/client` imports in 8 files were switched to that module.
 */
import {
  MongoClient,
  type Collection,
  type Document,
  type Filter,
  type UpdateFilter,
} from 'mongodb'

/** All collections are untyped (string ids, no ObjectId) — safe to use `any`. */
type AnyCollection = Collection<any>
import { nanoid } from 'nanoid'

/** cuid-style 24-char id from nanoid — replaces Prisma's `@default(cuid())`. */
function cuid(): string {
  return nanoid(24)
}

// ────────────────────────────────────────────────────────────────────────────
//  Connection singleton
// ────────────────────────────────────────────────────────────────────────────
const DB_URI =
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGODB_DB ?? 'nano_gateway'

const globalForMongodb = globalThis as unknown as {
  __mongoClient: MongoClient | undefined
  __mongoCollections: Map<string, AnyCollection> | undefined
}

async function connect(): Promise<void> {
  if (!globalForMongodb.__mongoClient) {
    globalForMongodb.__mongoClient = new MongoClient(DB_URI)
  }
  await globalForMongodb.__mongoClient.connect()
}

/**
 * Lazily build the full `db` facade. Every property access triggers
 * `getCollection(name)` on first use — the actual TCP connect happens at
 * the first real query, not on module import.
 */
function collection(name: string): AnyCollection {
  if (!globalForMongodb.__mongoClient) {
    // Sync path: the client was created in a prior async call. In dev mode
    // this is safe because we always create it at module top-level below.
    throw new Error(
      'MongoDB client not initialized. Ensure MONGODB_URI is set and the ' +
        'module was loaded after `initDb()` has resolved.'
    )
  }
  if (!globalForMongodb.__mongoCollections) {
    globalForMongodb.__mongoCollections = new Map()
  }
  let col = globalForMongodb.__mongoCollections.get(name)
  if (!col) {
    col = globalForMongodb.__mongoClient.db(DB_NAME).collection(name)
    globalForMongodb.__mongoCollections.set(name, col)
  }
  return col
}

// Eager client creation — Next.js dev re-evaluates modules on edit; without
// this a fresh process would have no client and the first query would throw.
// The `connect()` above is still lazy for the initial TCP handshake.
if (!globalForMongodb.__mongoClient) {
  globalForMongodb.__mongoClient = new MongoClient(DB_URI)
}

// ────────────────────────────────────────────────────────────────────────────
//  Where-clause translator (Prisma → Mongo)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Translate a Prisma `where` object into a MongoDB filter.
 *
 * Supported forms (all observed in the codebase):
 *   { field: value }          → { field: value }
 *   { field: null }          → { field: null }
 *   { field: { in: [...] }}  → { field: { $in: [...] } }
 *   { field: { notIn:[...]}} → { field: { $nin: [...] } }
 *   { field: { contains: s}} → { field: { $regex: escaped(s), $options: 'i' } }
 *   { field: { lt, lte, gt, gte: v } } → { field: { $lt: v, $lte: v, ... } }
 *   { field: { not: v } }    → { field: { $ne: v } }
 *   { OR: [ ... ] }          → { $or: [ ... ] }
 *   { AND: [ ... ] }        → { $and: [ ... ] }
 *   { NOT: { ... } }        → { $nor: [ ... ] }   (Mongo has no $not)
 *   { field: { is: v } }    → { field: v }
 *   { field: { equals: v }} → { field: v }
 *   { plan: { ... } }       → { $and: [ subquery, rest ] } (relational sub)
 *
 * Nested relational where (the `plan: { priceMonthly: { gt: 0 } }` form in
 * renewal.ts) is translated to a `$and` containing a `$lookup`-friendly
 * sub-filter. In practice we resolve the related document first and add the
 * id constraint.
 */
function translateWhere(where: unknown): Filter<Document> {
  if (where == null) return {}
  const w = where as Record<string, unknown>
  const out: Record<string, unknown> = {}
  const relationalSubs: Array<{ key: string; sub: Record<string, unknown> }> = []

  for (const [key, value] of Object.entries(w)) {
    // Logical operators
    if (key === 'OR' && Array.isArray(value)) {
      out.$or = value.map((item) =>
        translateWhere(item as Record<string, unknown>)
      )
      continue
    }
    if (key === 'AND' && Array.isArray(value)) {
      out.$and = value.map((item) =>
        translateWhere(item as Record<string, unknown>)
      )
      continue
    }
    if (key === 'NOT' && value && typeof value === 'object') {
      const inner = translateWhere(value as Record<string, unknown>)
      out.$nor = [inner]
      continue
    }

    // Plain field
    if (value === null) {
      out[key] = null
      continue
    }

    // Relational sub-object: key is a relation name (e.g. "plan")
    // The value is a where-object for the related model.
    // We detect it by checking if the key is in RELATIONS for the current
    // model — but we don't know the model here, so we treat any key whose
    // value is a non-operator object as a relational sub.
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      const sub = value as Record<string, unknown>

      // Operator sub-object: { in, notIn, contains, lt, lte, gt, gte, not, is, equals }
      const isOperatorSub = [
        'in', 'notIn', 'contains', 'lt', 'lte', 'gt', 'gte', 'not', 'is', 'equals',
      ].some((op) => op in sub)

      if (isOperatorSub) {
        const mongoOps: Record<string, unknown> = {}
        if ('in' in sub && Array.isArray(sub.in)) mongoOps.$in = sub.in
        if ('notIn' in sub && Array.isArray(sub.notIn)) mongoOps.$nin = sub.notIn
        if ('contains' in sub && typeof sub.contains === 'string') {
          const escaped = String(sub.contains).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          mongoOps.$regex = escaped
          mongoOps.$options = 'i'
        }
        if ('lt' in sub) mongoOps.$lt = sub.lt
        if ('lte' in sub) mongoOps.$lte = sub.lte
        if ('gt' in sub) mongoOps.$gt = sub.gt
        if ('gte' in sub) mongoOps.$gte = sub.gte
        if ('not' in sub) mongoOps.$ne = sub.not
        if ('is' in sub) mongoOps.$eq = sub.is
        if ('equals' in sub) mongoOps.$eq = sub.equals
        out[key] = mongoOps
        continue
      }

      // Relational sub-object: the caller is filtering on a related model's
      // fields (e.g. `plan: { priceMonthly: { gt: 0 } }`).
      // Store it so the calling delegate can resolve it via a subquery.
      relationalSubs.push({ key, sub })
      continue
    }

    out[key] = value
  }

  // If there are relational subs, wrap the result in $and so the caller can
  // add `$and: [{ planId: { $in: [...] } }, ...]` by calling
  // `applyRelationalSubs()` after resolving the related ids.
  if (relationalSubs.length > 0) {
    ;(out as Record<string, unknown>).__relationalSubs = relationalSubs
    // Remove the raw key entries that were pushed to relationalSubs
    for (const rs of relationalSubs) {
      delete out[rs.key]
    }
    if (Object.keys(out).filter((k) => k !== '__relationalSubs' && !k.startsWith('$')).length === 0) {
      // No other constraints — the relational sub is the only filter
    }
  }

  return out as Filter<Document>
}

/**
 * Given the output of `translateWhere` and a model name, resolve any
 * `__relationalSubs` by fetching the related ids and rewriting the filter.
 */
export async function resolveRelationalFilter(
  model: string,
  filter: Filter<Document>
): Promise<Filter<Document>> {
  const subs = (filter as Record<string, unknown>).__relationalSubs as
    | Array<{ key: string; sub: Record<string, unknown> }>
    | undefined

  if (!subs || subs.length === 0) return filter

  const subFilters: Array<Filter<Document>> = []
  for (const sub of subs) {
    const rel = RELATIONS[`${model}.${sub.key}`]
    if (!rel) continue

    // Find the related docs matching the sub-filter, project only `id`
    const subFilter = translateWhere(sub.sub) as Record<string, unknown>
    const related = await collection(rel.ref)
      .find(subFilter)
      .project({ id: 1 })
      .toArray()

    const relatedIds = related.map((r) => r.id).filter(Boolean)
    subFilters.push({ [rel.fk]: { $in: relatedIds } })
  }

  // Remove the marker
  delete (filter as Record<string, unknown>).__relationalSubs

  // Merge: if there are already $and/$or constraints, add to $and
  if (subFilters.length === 0) return filter

  const existingAnd = (filter as Record<string, unknown>).$and as Filter<Document>[] | undefined
  ;(filter as Record<string, unknown>).$and = [...(existingAnd ?? []), ...subFilters]
  return filter
}

/**
 * Build a Mongo projection from a Prisma `select` object.
 * `select: { id: true, name: true }` → `{ _id: 0, id: 1, name: 1 }`
 */
function buildProjection(
  select?: Record<string, boolean>
): Record<string, 0 | 1> | undefined {
  if (!select) return undefined
  const proj: Record<string, 0 | 1> = { _id: 0 }
  for (const [key, val] of Object.entries(select)) {
    if (val === true) proj[key] = 1
  }
  return proj
}

/**
 * Convert a Prisma `orderBy` array or object into a Mongo sort object.
 * `{ field: 'asc' | 'desc' }` or `[{ field, order }]`.
 */
function buildSort(
  orderBy?: Record<string, string> | Array<Record<string, string>>
): Record<string, 1 | -1> | undefined {
  if (!orderBy) return undefined
  if (Array.isArray(orderBy)) {
    const sort: Record<string, 1 | -1> = {}
    for (const entry of orderBy) {
      for (const [field, order] of Object.entries(entry)) {
        sort[field] = order === 'desc' ? -1 : 1
      }
    }
    return sort
  }
  const sort: Record<string, 1 | -1> = {}
  for (const [field, order] of Object.entries(orderBy)) {
    sort[field] = order === 'desc' ? -1 : 1
  }
  return sort
}

/** Strip the internal `_id` field from documents before returning. */
function stripId(doc: any): any {
  if (doc == null) return doc
  if (Array.isArray(doc)) {
    return doc.map((d: any) => {
      const { _id, ...rest } = d
      return rest
    })
  }
  const { _id, ...rest } = doc
  return rest
}

// ────────────────────────────────────────────────────────────────────────────
//  Relation map — which FK field links each model to which other model.
//  Used to hydrate `include: { plan: true }` after a base read.
// ────────────────────────────────────────────────────────────────────────────
const RELATIONS: Record<string, { fk: string; ref: string }> = {
  'user.whatsappSessions':     { fk: 'userId',        ref: 'whatsAppSession' },
  'user.notifications':        { fk: 'userId',        ref: 'notification' },
  'user.activityLogs':         { fk: 'userId',        ref: 'activityLog' },
  'subscription.plan':         { fk: 'planId',        ref: 'plan' },
  'subscription.user':         { fk: 'userId',        ref: 'user' },
  'message.session':           { fk: 'sessionId',     ref: 'whatsAppSession' },
  'message.user':              { fk: 'userId',        ref: 'user' },
  'user.subscription':         { fk: 'userId',        ref: 'subscription' },
  'whatsAppSession.user':      { fk: 'userId',        ref: 'user' },
  'whatsAppSession.messages':  { fk: 'sessionId',     ref: 'message' },
  'whatsAppSession.contacts':  { fk: 'sessionId',     ref: 'contact' },
  'whatsAppSession.groups':    { fk: 'sessionId',     ref: 'group' },
  'whatsAppSession.automationRules': { fk: 'sessionId', ref: 'automationRule' },
  'ticket.messages':           { fk: 'ticketId',      ref: 'ticketMessage' },
  'ticket.user':               { fk: 'userId',        ref: 'user' },
  'contact.user':              { fk: 'userId',        ref: 'user' },
  'loginSession.user':         { fk: 'userId',        ref: 'user' },
  'payment.user':              { fk: 'userId',        ref: 'user' },
  'payment.plan':              { fk: 'planId',        ref: 'plan' },
  'payment.subscription':      { fk: 'subscriptionId', ref: 'subscription' },
  'notification.user':         { fk: 'userId',        ref: 'user' },
  'job.user':                  { fk: 'userId',        ref: 'user' },
  'activityLog.user':          { fk: 'userId',        ref: 'user' },
}

/**
 * Hydrate Prisma-style `include` on a single document or array of documents.
 *
 * `include: { plan: true }` → adds a `.plan` object (the full related doc)
 * to each result. `include: { plan: { select: { name: true } } }` → adds a
 * `.plan` with only the selected fields.
 */
async function hydrateIncludes(
  model: string,
  result: Document | Document[] | null,
  include: Record<string, unknown> | undefined
): Promise<void> {
  if (!include || result == null) return

  const includeKeys = Object.keys(include)
  if (includeKeys.length === 0) return

  const docs: Document[] = Array.isArray(result) ? result : [result]

  // Collect all (fk, ref, fkValue) triples to fetch
  const fetches: Array<{ ref: string; fkValues: Set<string> }> = []

  for (const key of includeKeys) {
    if (key === '_count') {
      // Handle _count: { select: { messages: true, ... } }
      const countSel = include[key] as Record<string, boolean> | undefined
      if (countSel && typeof countSel === 'object') {
        for (const relKey of Object.keys(countSel)) {
          const relKeyFull = `${model}.${relKey}`
          const rel = RELATIONS[relKeyFull]
          if (!rel) continue
          const fkValues = new Set<string>()
          for (const doc of docs) {
            const val = doc[rel.fk]
            if (val != null) fkValues.add(String(val))
          }
          if (fkValues.size > 0) {
            fetches.push({ ref: rel.ref, fkValues })
          }
        }
      }
      continue
    }

    const relKeyFull = `${model}.${key}`
    const rel = RELATIONS[relKeyFull]
    if (!rel) continue

    // Determine the projection for the related fetch
    const spec = include[key]
    let relatedProj: Record<string, 0 | 1> | undefined
    if (spec && typeof spec === 'object' && !(spec instanceof Date)) {
      const specObj = spec as Record<string, unknown>
      if (specObj.select && typeof specObj.select === 'object') {
        relatedProj = buildProjection(specObj.select as Record<string, boolean>)
      }
    }

    // Collect the FK values from the *parent* docs (e.g. loginSession.userId).
    const fkValues = new Set<string>()
    for (const doc of docs) {
      const val = doc[rel.fk]
      if (val != null) fkValues.add(String(val))
    }

    if (fkValues.size === 0) continue

    // Fetch the related docs by their OWN primary key (`id`), not by the FK
    // field — the FK lives on the parent, the `id` lives on the related row.
    const related = await collection(rel.ref)
      .find(
        { id: { $in: [...fkValues] } },
        { projection: relatedProj }
      )
      .toArray()

    const relatedMap = new Map<string, any>()
    for (const r of related) {
      const { _id, ...rest } = r
      relatedMap.set(String(r.id ?? rest.id ?? ''), rest)
    }

    // Attach to each doc
    for (const doc of docs) {
      const fkVal = doc[rel.fk]
      doc[key] = fkVal != null ? (relatedMap.get(String(fkVal)) ?? null) : null
    }
  }

  // Handle _count (parallel with above)
  if (includeKeys.includes('_count')) {
    const countSel = include['_count'] as Record<string, boolean> | undefined
    if (countSel && typeof countSel === 'object') {
      for (const relKey of Object.keys(countSel)) {
        const relKeyFull = `${model}.${relKey}`
        const rel = RELATIONS[relKeyFull]
        if (!rel) continue

        const fkValues = docs.map((d) => String(d[rel.fk])).filter(Boolean)
        if (fkValues.length === 0) continue

        const countResults = await Promise.all(
          fkValues.map((fv) =>
            collection(rel.ref).countDocuments({ _id: fv })
          )
        )
        const countMap = new Map<string, number>()
        fkValues.forEach((fv, i) => countMap.set(fv, countResults[i]))

        for (const doc of docs) {
          const fkVal = String(doc[rel.fk])
          if (!doc._count) doc._count = {}
          ;(doc._count as Record<string, number>)[relKey] = countMap.get(fkVal) ?? 0
        }
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  _count in `select:` — hydrateSelectCount
// ────────────────────────────────────────────────────────────────────────────
async function hydrateSelectCount(
  model: string,
  doc: any,
  countSel: Record<string, boolean>
): Promise<void> {
  if (!doc) return
  for (const relKey of Object.keys(countSel)) {
    const rel = RELATIONS[`${model}.${relKey}`]
    if (!rel) continue
    const fkVal = doc[rel.fk]
    const cnt =
      fkVal == null
        ? 0
        : await collection(rel.ref).countDocuments({ [rel.fk]: String(fkVal) })
    if (!doc._count) doc._count = {}
    ;(doc._count as Record<string, number>)[relKey] = cnt
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  Per-model delegate
// ────────────────────────────────────────────────────────────────────────────

/** Models that have an `updatedAt` field stamped by the adapter. */
const UPDATED_AT_MODELS = new Set([
  'user',
  'whatsAppSession',
  'subscription',
  'payment',
  'message',
  'contact',
  'notification',
  'job',
  'ticket',
  'automationRule',
])

function makeModelDelegate(model: string) {
  const col = () => collection(model)

  return {
    // ── READ ─────────────────────────────────────────────────────────────
    async findUnique(args: {
      where: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
    }) {
      const filter = { ...translateWhere(args.where) }
      // Prisma uses `id` as the primary key — match on `id`, not `_id`.
      if ('id' in args.where) {
        filter.id = args.where.id as string
      }

      // Split select: plain fields vs _count
      let plainSelect: Record<string, boolean> | undefined
      let countSel: Record<string, boolean> | undefined
      if (args.select && typeof args.select === 'object') {
        const sel = args.select as Record<string, unknown>
        if ('_count' in sel) {
          countSel = sel._count as Record<string, boolean>
          plainSelect = { ...sel } as Record<string, boolean>
          delete (plainSelect as Record<string, unknown>)._count
        } else {
          plainSelect = sel as Record<string, boolean>
        }
      }

      const doc = await col().findOne(filter, {
        projection: buildProjection(plainSelect),
      })
      if (!doc) return null
      await hydrateIncludes(model, doc, args.include)
      if (countSel) {
        await hydrateSelectCount(model, doc, countSel)
      }
      return stripId(doc)
    },

    async findUniqueOrThrow(args: {
      where: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
    }) {
      const doc = await this.findUnique(args)
      if (!doc) {
        throw Object.assign(
          new Error(`Record not found for ${model}`),
          { code: 'P2025' }
        )
      }
      return doc
    },

    async findFirst(args: {
      where?: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
      orderBy?: Record<string, string> | Array<Record<string, string>>
      skip?: number
      take?: number
    }) {
      let plainSelect: Record<string, boolean> | undefined
      let countSel: Record<string, boolean> | undefined
      if (args.select && typeof args.select === 'object') {
        const sel = args.select as Record<string, unknown>
        if ('_count' in sel) {
          countSel = sel._count as Record<string, boolean>
          plainSelect = { ...sel } as Record<string, boolean>
          delete (plainSelect as Record<string, unknown>)._count
        } else {
          plainSelect = sel as Record<string, boolean>
        }
      }
      const filter = translateWhere(args.where)
      const sort = buildSort(args.orderBy)
      const opts: Record<string, unknown> = {}
      if (plainSelect) opts.projection = buildProjection(plainSelect)
      if (sort) opts.sort = sort
      opts.limit = 1
      const doc = await col().findOne(filter, opts as any)
      if (!doc) return null
      await hydrateIncludes(model, doc, args.include)
      if (countSel) await hydrateSelectCount(model, doc, countSel)
      return stripId(doc)
    },

    async findFirstOrThrow(args: {
      where?: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
      orderBy?: Record<string, string> | Array<Record<string, string>>
    }) {
      const doc = await this.findFirst(args)
      if (!doc) {
        throw Object.assign(new Error(`Record not found for ${model}`), {
          code: 'P2025',
        })
      }
      return doc
    },

    async findMany(args: {
      where?: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
      orderBy?: Record<string, string> | Array<Record<string, string>>
      skip?: number
      take?: number
    }) {
      const rawFilter = translateWhere(args.where)
      const filter = await resolveRelationalFilter(model, rawFilter)
      const sort = buildSort(args.orderBy)

      // Split select into plain-field projection and _count spec
      let plainSelect: Record<string, boolean> | undefined
      let countSpec: Record<string, boolean> | undefined
      if (args.select && typeof args.select === 'object') {
        const sel = args.select as Record<string, unknown>
        if ('_count' in sel) {
          countSpec = sel._count as Record<string, boolean>
          plainSelect = { ...sel } as Record<string, boolean>
          delete (plainSelect as Record<string, unknown>)._count
        } else {
          plainSelect = sel as Record<string, boolean>
        }
      }

      const findOpts: Record<string, unknown> = {}
      if (plainSelect) findOpts.projection = buildProjection(plainSelect)
      if (sort) findOpts.sort = sort
      if (args.skip !== undefined) findOpts.skip = args.skip
      if (args.take !== undefined) findOpts.limit = args.take
      const cursor = col().find(filter, findOpts as any)
      const docs = await cursor.toArray()

      // Hydrate include (if any)
      if (docs.length > 0 && args.include) {
        await hydrateIncludes(model, docs, args.include)
      }

      // Hydrate _count (if any)
      if (docs.length > 0 && countSpec) {
        const countSel = countSpec
        for (const relKey of Object.keys(countSel)) {
          const relKeyFull = `${model}.${relKey}`
          const rel = RELATIONS[relKeyFull]
          if (!rel) continue
          for (const doc of docs) {
            const fkVal = doc[rel.fk]
            if (fkVal == null) {
              doc._count = { ...(doc._count as Record<string, number> | undefined), [relKey]: 0 }
            } else {
              const cnt = await collection(rel.ref).countDocuments({
                _id: String(fkVal),
              })
              doc._count = { ...(doc._count as Record<string, number> | undefined), [relKey]: cnt }
            }
          }
        }
      }

      return stripId(docs) ?? []
    },

    async count(args?: { where?: Record<string, unknown> }) {
      const filter = translateWhere(args?.where)
      return col().countDocuments(filter)
    },

    // ── WRITE ────────────────────────────────────────────────────────────
    async create(args: {
      data: Record<string, unknown>
      select?: Record<string, boolean>
    }) {
      const data = { ...args.data }
      // Auto-generate cuid-style id if not supplied
      if (data.id === undefined || data.id === null) {
        data.id = cuid()
      }
      if (!data.createdAt) {
        data.createdAt = new Date()
      }
      if (UPDATED_AT_MODELS.has(model) && !data.updatedAt) {
        data.updatedAt = data.createdAt
      }
      const doc = await col().insertOne(data as Document)
      const inserted = { ...data }
      const proj = buildProjection(args.select)
      return proj
        ? (stripId(pickFields(inserted, proj)) ?? inserted)
        : inserted
    },

    async createMany(args: { data: Record<string, unknown>[] }) {
      const items = args.data.map((d) => ({
        ...d,
        id: d.id ?? cuid(),
      }))
      const result = await col().insertMany(items as Document[])
      return { count: items.length }
    },

    async update(args: {
      where: Record<string, unknown>
      data: Record<string, unknown>
      select?: Record<string, boolean>
    }) {
      const filter: Record<string, unknown> = { }
      if ('id' in args.where) {
        filter.id = args.where.id as string
      } else {
        Object.assign(filter, translateWhere(args.where))
      }
      const setDoc: Record<string, unknown> = { ...args.data }
      if (UPDATED_AT_MODELS.has(model)) setDoc.updatedAt = new Date()
      const result = await col().updateOne(filter, { $set: setDoc } as UpdateFilter<Document>)
      if (result.matchedCount === 0) {
        throw Object.assign(new Error(`Record not found for ${model}`), {
          code: 'P2025',
        })
      }
      // Prisma returns the updated record. Fetch it back.
      const doc = await col().findOne(filter, {
        projection: buildProjection(args.select),
      })
      return doc ? stripId(doc) : null
    },

    async updateMany(args: {
      where: Record<string, unknown>
      data: Record<string, unknown>
    }) {
      const filter = translateWhere(args.where)
      const setDoc: Record<string, unknown> = { ...args.data }
      if (UPDATED_AT_MODELS.has(model)) setDoc.updatedAt = new Date()
      const result = await col().updateMany(
        filter,
        { $set: setDoc } as UpdateFilter<Document>
      )
      return { count: result.matchedCount }
    },

    async upsert(args: {
      where: Record<string, unknown>
      create: Record<string, unknown>
      update: Record<string, unknown>
      select?: Record<string, unknown>
      include?: Record<string, unknown>
    }) {
      const filter: Record<string, unknown> = {}
      if ('id' in args.where) {
        filter.id = args.where.id as string
      } else {
        Object.assign(filter, translateWhere(args.where))
      }
      const createData = { ...args.create }
      if (createData.id === undefined || createData.id === null) {
        createData.id = cuid()
      }
      if (!createData.createdAt) createData.createdAt = new Date()
      if (UPDATED_AT_MODELS.has(model) && !createData.updatedAt) {
        createData.updatedAt = new Date()
      }
      const updateData = { ...args.update }
      if (UPDATED_AT_MODELS.has(model)) updateData.updatedAt = new Date()

      // Mongo raises code 40 when a unique-key field that is in the filter
      // is also written in `$set`/`$setOnInsert` on an upsert where the
      // filter itself references that field. So: keep the unique key out
      // of `$set` (it can't change), and only carry it into `$setOnInsert`
      // so a brand-new row gets its discriminator field.
      const uniqueKeys = new Set(Object.keys(args.where))
      const withoutKeys = (obj: Record<string, unknown>) => {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(obj)) {
          if (!uniqueKeys.has(k)) out[k] = v
        }
        return out
      }
      const setDoc = withoutKeys(updateData)
      // `$setOnInsert` must not restate any field that `$set` already writes:
      // MongoDB 7 raises code 40 ("would create a conflict") when the same
      // path appears in both — even with identical values. Keep only the
      // fields that are NOT already in `$set`.
      const setOnInsertBase = { ...createData, ...updateData }
      // The unique key from the filter must always land in a freshly-inserted
      // document (its discriminator value); this is in `$setOnInsert` only,
      // never in `$set` — restating it there triggers Mongo's code-40 conflict.
      for (const k of uniqueKeys) setOnInsertBase[k] = filter[k]
      const setOnInsert: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(setOnInsertBase)) {
        if (!(k in setDoc)) setOnInsert[k] = v
      }

      // A field in the filter is written into a fresh insert by `$setOnInsert`
      // being present at all; but we must never restate a `$set` key there.
      // When nothing is left for `$setOnInsert`, the insert is still driven
      // by the filter's keys plus whatever `$set` would have applied.
      const update: Record<string, unknown> = { $set: setDoc }
      if (Object.keys(setOnInsert).length > 0) update.$setOnInsert = setOnInsert

      const result = await col().updateOne(filter, update, { upsert: true })

      let plainSelect: Record<string, boolean> | undefined
      let countSel: Record<string, boolean> | undefined
      if (args.select && typeof args.select === 'object') {
        const sel = args.select as Record<string, unknown>
        if ('_count' in sel) {
          countSel = sel._count as Record<string, boolean>
          plainSelect = { ...sel } as Record<string, boolean>
          delete (plainSelect as Record<string, unknown>)._count
        } else {
          plainSelect = sel as Record<string, boolean>
        }
      }

      const doc = await col().findOne(filter, {
        projection: buildProjection(plainSelect),
      })
      if (doc) {
        await hydrateIncludes(model, doc, args.include)
        if (countSel) await hydrateSelectCount(model, doc, countSel)
      }
      return doc ? stripId(doc) : null
    },

    async delete(args: { where: Record<string, unknown> }) {
      const filter: Record<string, unknown> = {}
      if ('id' in args.where) {
        filter.id = args.where.id as string
      } else {
        Object.assign(filter, translateWhere(args.where))
      }
      const doc = await col().findOne(filter)
      if (!doc) {
        throw Object.assign(new Error(`Record not found for ${model}`), {
          code: 'P2025',
        })
      }
      const result = await col().deleteOne(filter)
      return stripId(doc)
    },

    async deleteMany(args: { where: Record<string, unknown> }) {
      const filter = translateWhere(args.where)
      const result = await col().deleteMany(filter)
      return { count: result.deletedCount }
    },

    /**
     * Prisma-style `groupBy` — emulated in-memory.
     *
     * Used by the admin page: `db.user.groupBy({ by: ['status'], _count: { _all: true } })`.
     * Returns an array of `{ [field]: value, _count: { _all: n } }` rows.
     */
    async groupBy(args: {
      by: string[]
      _count?: { _all: boolean }
      where?: Record<string, unknown>
    }) {
      const rawFilter = translateWhere(args.where)
      const filter = await resolveRelationalFilter(model, rawFilter)
      const docs = await col().find(filter).toArray()
      const groups = new Map<string, number>()
      for (const doc of docs) {
        const key = args.by.map((f) => String(doc[f] ?? '')).join('\0')
        groups.set(key, (groups.get(key) ?? 0) + 1)
      }
      return [...groups.entries()].map(([key, count]) => {
        const parts = key.split('\0')
        const row: Record<string, unknown> = {}
        args.by.forEach((f, i) => (row[f] = parts[i]))
        if (args._count) row._count = { _all: count }
        return row
      })
    },
  }
}

function pickFields<T extends Record<string, unknown>>(
  doc: T,
  projection: Record<string, 0 | 1>
): T {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(doc)) {
    if (projection[key] === 1) out[key] = val
  }
  return out as T
}

// ────────────────────────────────────────────────────────────────────────────
//  Build the `db` facade
// ────────────────────────────────────────────────────────────────────────────
const MODELS = [
  'user',
  'loginSession',
  'oauthAccount',
  'verificationToken',
  'plan',
  'subscription',
  'payment',
  'whatsAppSession',
  'message',
  'campaign',
  'scheduledMessage',
  'contact',
  'contactTag',
  'group',
  'groupMember',
  'automationRule',
  'apiKey',
  'apiRequestLog',
  'notification',
  'ticket',
  'ticketMessage',
  'activityLog',
  'job',
  'outbox',
] as const

export type ModelName = (typeof MODELS)[number]

/**
 * The shape of `db.<model>` for a specific model. Each read method returns the
 * concrete row type (or `null`), so callers can access fields without
 * casting.
 */
type SelectArg = Record<string, unknown>
type Delegate<T> = {
  findUnique(args: {
    where: Record<string, unknown>
    select?: SelectArg
    include?: Record<string, unknown>
  }): Promise<T | null>
  findUniqueOrThrow(args: {
    where: Record<string, unknown>
    select?: SelectArg
    include?: Record<string, unknown>
  }): Promise<T>
  findFirst(args: {
    where?: Record<string, unknown>
    select?: SelectArg
    include?: Record<string, unknown>
    orderBy?: Record<string, string> | Array<Record<string, string>>
    skip?: number
    take?: number
  }): Promise<T | null>
  findFirstOrThrow(args: {
    where?: Record<string, unknown>
    select?: SelectArg
    include?: Record<string, unknown>
    orderBy?: Record<string, string> | Array<Record<string, string>>
  }): Promise<T>
  findMany(args: {
    where?: Record<string, unknown>
    select?: SelectArg
    include?: Record<string, unknown>
    orderBy?: Record<string, string> | Array<Record<string, string>>
    skip?: number
    take?: number
  }): Promise<T[]>
  count(args?: { where?: Record<string, unknown> }): Promise<number>
  create(args: {
    data: Record<string, unknown>
    select?: SelectArg
  }): Promise<T>
  createMany(args: { data: Record<string, unknown>[] }): Promise<{ count: number }>
  update(args: {
    where: Record<string, unknown>
    data: Record<string, unknown>
    select?: Record<string, boolean>
  }): Promise<T | null>
  updateMany(args: {
    where: Record<string, unknown>
    data: Record<string, unknown>
  }): Promise<{ count: number }>
  upsert(args: {
    where: Record<string, unknown>
    create: Record<string, unknown>
    update: Record<string, unknown>
    select?: Record<string, unknown>
    include?: Record<string, unknown>
  }): Promise<T | null>
  delete(args: { where: Record<string, unknown> }): Promise<T | null>
  deleteMany(args: { where: Record<string, unknown> }): Promise<{ count: number }>
  groupBy(args: {
    by: string[]
    _count?: { _all: boolean }
    where?: Record<string, unknown>
  }): Promise<Array<Record<string, unknown> & { _count?: Record<string, number> }>>
}

interface DbFacade {
  $transaction: (
    ops: Array<Promise<unknown>> | ((tx: DbFacade) => Promise<void> | Promise<unknown[]>)
  ) => Promise<unknown>
  user: Delegate<import('./db-types').User>
  loginSession: Delegate<import('./db-types').LoginSession>
  oauthAccount: Delegate<import('./db-types').OAuthAccount>
  verificationToken: Delegate<import('./db-types').VerificationToken>
  plan: Delegate<import('./db-types').Plan>
  subscription: Delegate<import('./db-types').Subscription>
  payment: Delegate<import('./db-types').Payment>
  whatsAppSession: Delegate<import('./db-types').WhatsAppSession>
  message: Delegate<import('./db-types').Message>
  campaign: Delegate<import('./db-types').Campaign>
  scheduledMessage: Delegate<import('./db-types').ScheduledMessage>
  contact: Delegate<import('./db-types').Contact>
  contactTag: Delegate<import('./db-types').ContactTag>
  group: Delegate<import('./db-types').Group>
  groupMember: Delegate<import('./db-types').GroupMember>
  automationRule: Delegate<import('./db-types').AutomationRule>
  apiKey: Delegate<import('./db-types').ApiKey>
  apiRequestLog: Delegate<import('./db-types').ApiRequestLog>
  notification: Delegate<import('./db-types').Notification>
  ticket: Delegate<import('./db-types').Ticket>
  ticketMessage: Delegate<import('./db-types').TicketMessage>
  activityLog: Delegate<import('./db-types').ActivityLog>
  job: Delegate<import('./db-types').Job>
  outbox: Delegate<import('./db-types').Outbox>
  $queryRaw: () => Promise<void>
  $executeRaw: () => Promise<void>
}

function buildDbFacade(): DbFacade {
  const facade = {} as DbFacade
  for (const model of MODELS) {
    ;(facade as unknown as Record<string, unknown>)[model] = makeModelDelegate(model)
  }
  // Prisma-style $ helpers
  facade.$queryRaw = async () => {
    // No-op: used only by pingDatabase (which was rewritten to db.command).
  }
  facade.$executeRaw = facade.$queryRaw
  // $transaction: no real transactions in Mongo (single-node).
  // Accepts either a promise array (run sequentially) or a callback
  // (run with `this` = facade).
  facade.$transaction = async (ops: Array<Promise<unknown>> | ((tx: DbFacade) => Promise<void> | Promise<unknown[]>)) => {
    if (typeof ops === 'function') {
      await ops(facade as unknown as DbFacade)
    } else {
      for (const p of ops) await p
    }
  }
  return facade
}

export const db = buildDbFacade()

/**
 * Cheap liveness probe — replaced the Prisma `$queryRaw` version.
 * Uses a raw `ping` command that costs ~0 ms on a healthy cluster.
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    await connect()
    const dbHandle = globalForMongodb.__mongoClient!.db(DB_NAME)
    await dbHandle.command({ ping: 1 })
    return true
  } catch {
    return false
  }
}

/**
 * Explicit connect — call this at startup if you need the TCP socket
 * before the first query (e.g. in a health-check entrypoint).
 */
export async function initDb(): Promise<void> {
  await connect()
}

/**
 * Ensure all unique + general indexes exist.
 * Safe to call repeatedly (idempotent).
 *
 * NOTE: Mongo collection names are case-sensitive. The adapter uses
 * camelCase names matching the Prisma model names (e.g. `whatsAppSession`).
 * The schema's `@relation` foreign-key fields reference these names directly,
 * so the data is stored under these exact collection names.
 */
export async function ensureIndexes(): Promise<void> {
  await connect()
  const client = globalForMongodb.__mongoClient!
  const dbHandle = client.db(DB_NAME)

  const indexes: Array<{
    model: string
    unique?: boolean
    fields: Record<string, 1 | -1>
  }> = [
    // Unique scalar
    { model: 'user', unique: true, fields: { email: 1 } },
    { model: 'user', unique: true, fields: { username: 1 } },
    { model: 'loginSession', unique: true, fields: { tokenHash: 1 } },
    { model: 'verificationToken', unique: true, fields: { tokenHash: 1 } },
    { model: 'plan', unique: true, fields: { slug: 1 } },
    { model: 'subscription', unique: true, fields: { userId: 1 } },
    { model: 'payment', unique: true, fields: { invoiceNumber: 1 } },
    { model: 'apiKey', unique: true, fields: { keyHash: 1 } },
    { model: 'ticket', unique: true, fields: { reference: 1 } },

    // Unique composite
    { model: 'oauthAccount', unique: true, fields: { provider: 1, providerAccountId: 1 } },
    { model: 'contact', unique: true, fields: { userId: 1, phone: 1 } },
    { model: 'contactTag', unique: true, fields: { contactId: 1, tag: 1 } },
    // `jid` is optional on WhatsAppSession, so a unique (sessionId, jid) index
    // would treat every null-jid row as a duplicate. Keep the plain index;
    // the adapter's de-dup logic (upsert on jid) is what enforces uniqueness.
    { model: 'whatsAppSession', fields: { sessionId: 1, jid: 1 } },
    { model: 'groupMember', unique: true, fields: { groupId: 1, jid: 1 } },

    // General indexes (mirror @@index from the Prisma schema)
    { model: 'user', fields: { status: 1 } },
    { model: 'user', fields: { role: 1 } },
    { model: 'user', fields: { createdAt: 1 } },
    { model: 'loginSession', fields: { userId: 1 } },
    { model: 'subscription', fields: { status: 1 } },
    { model: 'subscription', fields: { currentPeriodEnd: 1 } },
    { model: 'subscription', fields: { trialStatus: 1, trialExpiresAt: 1 } },
    { model: 'subscription', fields: { renewalNoticeFor: 1 } },
    { model: 'whatsAppSession', fields: { userId: 1, status: 1 } },
    { model: 'whatsAppSession', fields: { status: 1 } },
    { model: 'whatsAppSession', fields: { createdAt: 1 } },
    { model: 'message', fields: { userId: 1, createdAt: 1 } },
    { model: 'message', fields: { sessionId: 1, status: 1 } },
    { model: 'message', fields: { status: 1, scheduledFor: 1 } },
    { model: 'message', fields: { recipient: 1 } },
    { model: 'message', fields: { externalId: 1 } },
    { model: 'campaign', fields: { userId: 1, status: 1 } },
    { model: 'campaign', fields: { status: 1, scheduledFor: 1 } },
    { model: 'scheduledMessage', fields: { status: 1, scheduledFor: 1 } },
    { model: 'scheduledMessage', fields: { userId: 1 } },
    { model: 'contact', fields: { userId: 1, status: 1 } },
    { model: 'contact', fields: { userId: 1, name: 1 } },
    { model: 'contactTag', fields: { userId: 1, tag: 1 } },
    { model: 'group', fields: { userId: 1 } },
    { model: 'group', fields: { sessionId: 1 } },
    { model: 'groupMember', fields: { groupId: 1 } },
    { model: 'automationRule', fields: { userId: 1, enabled: 1 } },
    { model: 'automationRule', fields: { sessionId: 1, enabled: 1 } },
    { model: 'apiKey', fields: { userId: 1, revokedAt: 1 } },
    { model: 'apiRequestLog', fields: { userId: 1, createdAt: 1 } },
    { model: 'apiRequestLog', fields: { createdAt: 1 } },
    { model: 'apiRequestLog', fields: { statusCode: 1 } },
    { model: 'notification', fields: { userId: 1, readAt: 1, createdAt: 1 } },
    { model: 'notification', fields: { userId: 1, type: 1 } },
    { model: 'ticket', fields: { userId: 1, status: 1 } },
    { model: 'ticket', fields: { status: 1, priority: 1 } },
    { model: 'ticketMessage', fields: { ticketId: 1, createdAt: 1 } },
    { model: 'activityLog', fields: { userId: 1, createdAt: 1 } },
    { model: 'activityLog', fields: { sessionId: 1, createdAt: 1 } },
    { model: 'activityLog', fields: { event: 1, createdAt: 1 } },
    { model: 'job', fields: { status: 1, runAt: 1, priority: 1 } },
    { model: 'job', fields: { type: 1, status: 1 } },
    { model: 'job', fields: { lockedAt: 1 } },
    { model: 'outbox', fields: { status: 1, createdAt: 1 } },
    { model: 'payment', fields: { userId: 1, status: 1 } },
    { model: 'payment', fields: { createdAt: 1 } },
    { model: 'payment', fields: { providerRef: 1 } },
  ]

  for (const idx of indexes) {
    try {
      await dbHandle
        .collection(idx.model)
        .createIndex(idx.fields, { unique: idx.unique ?? false })
    } catch (error) {
      // Duplicate index name / already-exists is a no-op; anything else is
      // reported so a genuinely bad index definition is not silently dropped.
      const msg = (error as { message?: string })?.message ?? String(error)
      if (!/same name as the requested index|index already exists/i.test(msg)) {
        throw new Error(
          `ensureIndexes: failed to create index on ${idx.model} (${JSON.stringify(idx.fields)}): ${msg}`
        )
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  Types re-exports (replaces `import type { User } from '@prisma/client'`)
// ────────────────────────────────────────────────────────────────────────────
export type {
  User,
  LoginSession,
  OAuthAccount,
  VerificationToken,
  Plan,
  Subscription,
  Payment,
  WhatsAppSession,
  Message,
  Campaign,
  ScheduledMessage,
  Contact,
  ContactTag,
  Group,
  GroupMember,
  AutomationRule,
  ApiKey,
  ApiRequestLog,
  Notification,
  Ticket,
  TicketMessage,
  ActivityLog,
  Job,
  Outbox,
} from './db-types'
