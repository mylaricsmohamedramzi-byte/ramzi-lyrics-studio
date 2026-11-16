# Project implementation rules

- Route all browser database access through the generated Cloud client, and expose private interaction data only through authenticated owner policies or narrowly scoped aggregate RPCs; this keeps identity data protected while public gallery statistics remain available.