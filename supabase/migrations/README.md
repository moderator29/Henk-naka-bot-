# Aurora · Supabase migrations

Idempotent SQL migrations applied via the Supabase CLI or psql on a fresh
project.

- `0001_initial_schema.sql` — the entire schema from RPD §5.3 plus full RLS
  policies, `pg_trgm` + full-text indexes, and helper functions
  (`is_adult`, `has_active_subscription`) that the RLS policies depend on.

## Applying

With the Supabase CLI logged into the project:

```
supabase db push
```

Or via psql with the project's pooler URL:

```
psql "$DATABASE_URL" -f supabase/migrations/0001_initial_schema.sql
```

## Generating diffs from Drizzle

After editing `apps/web/lib/db/schema.ts`:

```
pnpm --filter web db:generate
```

This emits a new numbered migration file into this directory. Review the
generated SQL, then commit it alongside the schema change.
