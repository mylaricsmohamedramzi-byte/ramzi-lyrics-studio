# Project implementation rules

- Route browser database access through the generated Cloud client, and expose private interaction rows only through owner policies or narrowly scoped aggregate RPCs; this protects identities while public stats remain readable.
- Keep structural architecture decisions documented here; avoid additional client implementations because one configured client prevents credentials and auth sessions from diverging.