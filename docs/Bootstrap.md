# Bootstrap

## Purpose

Define the first filesystem-level project skeleton so implementation can start without changing the architecture later.

## Rules

- keep route files thin;
- keep domain logic inside modules;
- keep shared utilities isolated;
- keep database access behind a dedicated library layer;
- keep migrations separate from application code;
- keep tests outside the source tree.

## Target Skeleton

```text
webhouseshops/
  src/
    app/
    modules/
    shared/
    lib/
  prisma/
    migrations/
  public/
  tests/
  docs/
  scripts/
```

## First Implementation Files

When implementation begins, the first files should be:
- `src/lib/db.ts`
- `src/lib/auth.ts`
- `src/lib/permissions.ts`
- `src/shared/types/`
- `src/shared/utils/`
- `src/modules/identity/`
- `src/modules/access-control/`
- `src/modules/listings/`

## Stability Rules

- do not reorganize the root tree casually;
- do not move logic out of module boundaries;
- do not add new top-level folders unless there is a strong reason;
- do not mix documentation, source, and migrations in the same place.

