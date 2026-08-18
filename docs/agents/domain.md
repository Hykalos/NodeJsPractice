# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- CONTEXT.md at the repo root
- docs/adr/ for architecture decisions relevant to the area being changed

If any of these files do not exist, proceed silently. Do not flag their absence and do not suggest creating them upfront. The domain-modeling skill creates them lazily when terms or decisions are actually resolved.

## File structure

Single-context repo (this repo):

/
|- CONTEXT.md
|- docs/adr/
|  |- 0001-example.md
|  \- 0002-example.md
\- src/

## Use the glossary vocabulary

When naming a domain concept (issue titles, refactor proposals, hypotheses, test names), use the term as defined in CONTEXT.md. Avoid drifting to synonyms the glossary avoids.

If a needed concept is missing, either reconsider the term or note a genuine gap for domain-modeling.

## Flag ADR conflicts

If an output contradicts an existing ADR, surface it explicitly instead of silently overriding:
"Contradicts ADR-0007 ... but worth reopening because ..."
