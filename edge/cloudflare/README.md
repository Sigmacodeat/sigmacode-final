# SIGMACODE Edge Policy Sync (Cloudflare Workers)

Dieser Ordner enthält einen minimalen Edge‑Worker, der Firewall‑Policies in Cloudflare KV speichert und einfache Enforcement‑Beispiele bietet.

## Komponenten

- `worker.ts` – Cloudflare Worker mit Endpunkten
  - `POST /edge/policy/sync` – synchronisiert eine Policy (OpenAPI `PolicySyncRequest`)
  - `GET /edge/policy/{id}` – lädt eine Policy
  - `POST /edge/enforce` – Beispiel‑Enforcement gegen einen Input (`decision`, `appliedRules`)
- `wrangler.toml` – Worker‑Konfiguration inkl. KV‑Binding `POLICIES`

## Voraussetzungen

- Cloudflare Account, Wrangler CLI installiert (`npm i -g wrangler`)
- KV Namespace anlegen:
  ```bash
  wrangler kv namespace create POLICIES
  wrangler kv namespace create POLICIES --preview
  ```
- Trage die IDs in `wrangler.toml` ein oder setze Umgebungsvariablen `POLICIES_KV_ID`, `POLICIES_KV_PREVIEW_ID`.

## Lokaler Start

```bash
cd edge/cloudflare
wrangler dev
```

## Deploy

```bash
cd edge/cloudflare
wrangler deploy
```

## API Beispiele

- Policy Sync

```bash
curl -X POST "$EDGE_BASE/edge/policy/sync" \
  -H 'content-type: application/json' \
  -d '{
    "target":"edge:cloudflare",
    "policy":{
      "id":"pol-default",
      "name":"Default",
      "version":"1",
      "mode":"enforce",
      "rules":[{"id":"r1","name":"Block secrets","type":"input_filter","condition":"contains(prompt, 'secret')","action":"block","enabled":true}]
    }
  }'
```

- Policy lesen

```bash
curl "$EDGE_BASE/edge/policy/pol-default"
```

- Enforcement Beispiel

```bash
curl -X POST "$EDGE_BASE/edge/enforce" \
  -H 'content-type: application/json' \
  -d '{"input":"this contains a secret","policyId":"pol-default"}'
```

## Sicherheit

- Für Produktion sollte der Worker mittels `x-api-key` oder mTLS geschützt werden.
- Policies können zusätzlich signiert/versioniert werden.

## Hinweise

- Der Evaluator ist ein POC (string‑basierte Checks). Für echte Nutzung: Regex/JSON‑Rules, Logging, Shadow‑Mode.
