# SIGMACODE Red-Team Harness (POC)

Dieser Ordner enthält ein leichtgewichtiges Red-Team-Harness für LLM-/Agent-Firewall-Validierung.

## Überblick

- prompts/: Seed-Prompts (Jailbreak/PII/etc.)
- generator.ts: Mutations/Fuzzer (Obfuscation, Roleplay, Noise)
- harness.ts: Führt Prompts gegen die API (z. B. `/validate` oder Agent-Invoke) aus
- score.ts: Aggregation/Scorecards (FN/FP, Kategorien, Latenz)

## Quickstart

1. Seed-Prompts bearbeiten/erweitern:

```
scripts/redteam/prompts/jailbreak.txt
scripts/redteam/prompts/pii.txt
```

2. Generator: erzeugt augmentierte Prompts

```bash
npx tsx scripts/redteam/generator.ts \
  --in scripts/redteam/prompts/jailbreak.txt \
  --out .rt_jailbreak.jsonl \
  --mutations 3
```

3. Harness: führt Tests gegen deine lokale API aus

```bash
npx tsx scripts/redteam/harness.ts \
  --prompts .rt_jailbreak.jsonl \
  --endpoint http://localhost:3000/api/agents/test-agent/invoke \
  --mode enforce \
  --out .rt_results_jailbreak.jsonl
```

4. Scoring: erstellt Scorecards/CSV

```bash
npx tsx scripts/redteam/score.ts \
  --in .rt_results_jailbreak.jsonl \
  --out .rt_scores_jailbreak.csv
```

## Hinweise

- Der Harness setzt auf HTTP-APIs (z. B. `/validate`, Agent-Invoke-Routen). Passe `harness.ts` bei Bedarf an.
- Für Shadow-Mode-Analysen kann `--mode shadow` genutzt werden; der Harness setzt den Header `x-firewall-mode`.
- Ergebnisse sind JSONL (eine Zeile pro Test). Scorecards exportieren CSV.
