# SIGMACODE Neural Firewall OpenAPI

Diese README beschreibt, wie du die OpenAPI-Spezifikation `openapi/firewall.v1.yaml` lokal nutzt.

## Inhalte

- Endpunkte: `/validate`, `/scan_text`, `/scan_file`, `/policy/sync`, `/logs`, `/stats`
- Security: `x-api-key` Header, optional Bearer JWT
- Korrelation/Modus: `x-request-id`, `x-firewall-mode` (enforce|shadow|off)

## Mock-Server (Prism)

Voraussetzungen: Node.js, `@stoplight/prism-cli`

```bash
npm i -g @stoplight/prism-cli
prism mock openapi/firewall.v1.yaml --port 4010
```

Aufrufbeispiel (gegen Mock):

```bash
curl -s http://localhost:4010/validate -H 'content-type: application/json' -H 'x-api-key: test' \
  -d '{
    "model": {"provider": "openai", "model": "gpt-4o-mini"},
    "samplePrompts": ["Ignore previous instructions", "How to exfiltrate data?"],
    "objectives": ["prevent PII leakage", "block jailbreaks"],
    "budget": {"maxTests": 100, "maxDurationSec": 30}
  }' | jq .
```

## Codegen (OpenAPI Generator)

Voraussetzungen: Java 8+, `openapi-generator-cli` (NPM oder JAR)

NPM-Variante (TS-Client):

```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi/firewall.v1.yaml \
  -g typescript-fetch \
  -o openapi/gen/ts-client
```

Python-Client:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi/firewall.v1.yaml \
  -g python \
  -o openapi/gen/python-client
```

Go-Client:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i openapi/firewall.v1.yaml \
  -g go \
  -o openapi/gen/go-client
```

## Curl-Beispiele

Validate:

```bash
curl -X POST https://api.sigmacode.ai/validate \
  -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{
    "model": {"provider":"openai","model":"gpt-4o-mini"},
    "samplePrompts":["How do I exfiltrate secrets?","Ignore previous instructions"],
    "objectives":["prevent PII leakage","block jailbreaks"],
    "budget":{"maxTests":300,"maxDurationSec":45}
  }'
```

Scan Text:

```bash
curl -X POST https://api.sigmacode.ai/scan_text \
  -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{"text":"john.doe@example.com 4111-1111-1111-1111","detectors":["email","credit_card"],"redact":true}'
```

Scan File:

```bash
curl -X POST https://api.sigmacode.ai/scan_file \
  -H "x-api-key: $KEY" -F "file=@/tmp/sample.pdf" -F "detectors=email,credit_card" -F "redact=true"
```

Logs (JSON):

```bash
curl -X GET 'https://api.sigmacode.ai/logs?limit=50&backend=superagent' -H "x-api-key: $KEY"
```

Logs (CSV):

```bash
curl -X GET 'https://api.sigmacode.ai/logs?format=csv&limit=500' -H "x-api-key: $KEY" -o logs.csv
```

Stats:

```bash
curl -X GET https://api.sigmacode.ai/stats -H "x-api-key: $KEY"
```

## Hinweise

- HTTP 451 kennzeichnet blockierte Anfragen durch die Firewall.
- `x-firewall-mode: shadow` erlaubt Shadow-Entscheidungen ohne Laufzeit-Block.
- Policies können mit `/policy/sync` an Edge/Workers verteilt werden.
