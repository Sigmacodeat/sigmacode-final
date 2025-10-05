# SIGMACODE AI - Benutzerhandbuch

## 🚀 Schnellstart

### 1. Agent erstellen

1. Gehe zu **Dashboard → Agents**
2. Klicke **"Neuen Agent erstellen"**
3. Gib einen Namen und optionale Beschreibung ein
4. Wähle eine Firewall-Richtlinie (optional)
5. **Erstelle** den Agent

### 2. Tools zuweisen

1. Öffne deinen Agent
2. Gehe zu **"Tools"** Tab
3. Wähle verfügbare Tools aus der Liste
4. **Speichere** die Konfiguration

### 3. AI-Provider konfigurieren

1. Gehe zu **Einstellungen → AI Provider**
2. Füge deinen API-Key hinzu (OpenAI, Anthropic, etc.)
3. **Teste** die Verbindung

## 📚 Detaillierte Anleitungen

### Agents verwalten

#### Agent erstellen

- **Name**: Eindeutiger Name für deinen Agent
- **Beschreibung**: Optionale Beschreibung der Agent-Funktionen
- **Firewall-Modus**:
  - `off`: Keine Sicherheitsprüfung
  - `shadow`: Prüfung ohne Blockierung (für Tests)
  - `enforce`: Strenge Prüfung mit Blockierung

#### Agent konfigurieren

- **Model Tier**: Wähle die AI-Modell-Klasse (kostenbasiert)
- **Firewall-Policy**: Wähle eine vordefinierte Sicherheitsrichtlinie
- **Custom Config**: Erweiterte Firewall-Einstellungen

### Tools verwenden

#### Verfügbare Tool-Kategorien

- **LLM**: Sprachmodelle (ChatGPT, Claude, etc.)
- **Database**: Datenbank-Tools (SQL, Vector Search)
- **API**: Externe API-Aufrufe
- **Search**: Suchmaschinen und Recherche-Tools
- **Custom**: Eigene benutzerdefinierte Tools

#### Tool konfigurieren

Jedes Tool hat spezifische Parameter:

- **API Keys**: Für externe Dienste
- **Auth Type**: OAuth, Bearer Token, etc.
- **Firewall**: Einige Tools unterstützen Firewall-Prüfung

### Workflows erstellen

#### Grundlegende Workflow-Struktur

1. **Input**: Benutzereingabe oder Trigger
2. **Processing**: Agent + Tools
3. **Output**: Ergebnis an Benutzer

#### Workflow-Komponenten

- **Agent Node**: Haupt-AI-Engine
- **Tool Nodes**: Externe Funktionen
- **Condition Nodes**: Logik-Verzweigungen
- **Output Nodes**: Ergebnisformatierung

## 🔒 Sicherheit & Firewall

### Firewall-Modi erklärt

- **Off**: Keine Einschränkungen (Entwicklung)
- **Shadow**: Test-Modus - prüft aber blockiert nicht
- **Enforce**: Produktionsmodus - blockiert gefährliche Anfragen

### Richtlinien erstellen

1. Gehe zu **Firewall → Policies**
2. Erstelle eine neue Policy
3. Definiere Regeln für verschiedene Bedrohungen
4. Weise die Policy einem Agent zu

## 🛠️ Erweiterte Konfiguration

### API-Provider hinzufügen

Unterstützte Provider:

- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude)
- **Google** (Gemini)
- **Azure OpenAI**
- **Custom** (eigene Modelle)

### Custom Tools entwickeln

1. Erstelle ein Tool im `/api/tools/` Verzeichnis
2. Definiere Parameter und Authentifizierung
3. Teste das Tool gründlich
4. Weise es einem Agent zu

## 📊 Monitoring & Analytics

### Dashboard-Metriken

- **Agent Usage**: Wie oft wird dein Agent verwendet?
- **Tool Performance**: Welche Tools sind am beliebtesten?
- **Security Events**: Firewall-Blockierungen und Warnungen
- **Cost Tracking**: API-Kosten pro Agent/Tool

### Logs einsehen

- **Agent Logs**: Gespräche und Entscheidungen
- **Tool Logs**: Externe API-Aufrufe
- **Security Logs**: Firewall-Ereignisse
- **Error Logs**: Fehler und Ausnahmen

## 🚨 Fehlerbehebung

### Häufige Probleme

#### Agent antwortet nicht

- Prüfe AI-Provider-Konfiguration
- Teste den Agent einzeln
- Prüfe Firewall-Einstellungen

#### Tools funktionieren nicht

- Prüfe API-Keys und Berechtigungen
- Teste Tool separat
- Prüfe Firewall-Konfiguration

#### Firewall blockiert zu viel

- Passe Richtlinien an
- Verwende Shadow-Modus zum Testen
- Erstelle spezifischere Regeln

### Support kontaktieren

- Prüfe Logs zuerst
- Dokumentiere das Problem genau
- Kontaktiere das Entwicklerteam

## 📖 API-Referenz

### Wichtige Endpunkte

#### Agents

- `GET /api/agents` - Liste alle Agents
- `POST /api/agents` - Erstelle neuen Agent
- `GET /api/agents/[id]` - Agent-Details
- `PUT /api/agents/[id]` - Agent aktualisieren
- `DELETE /api/agents/[id]` - Agent löschen

#### Tools

- `GET /api/tools` - Liste verfügbare Tools
- `GET /api/tools?category=llm` - Tools nach Kategorie filtern

#### Firewall

- `GET /api/firewall/policies` - Sicherheitsrichtlinien
- `POST /api/firewall/policies` - Neue Richtlinie erstellen

#### SigmaCode AI

- `POST /api/sigmacode-ai/chat` - Chat mit AI
- `POST /api/sigmacode-ai/workflow` - Workflow ausführen

## 🔧 Entwicklung

### Lokale Entwicklung

1. Backend: `pnpm dev` (Port 3000)
2. API: `./dev/start-api` (Port 5001)
3. Worker: `./dev/start-worker`

### Tests

- Unit-Tests: `pnpm test`
- Integration-Tests: `pnpm test:integration`
- E2E-Tests: `pnpm test:e2e`

### Deployment

- Staging: Automatisch bei Push zu `develop`
- Production: Bei Merge zu `main`
- Rollback: Über Git-Revert und Redeploy

## 🎯 Best Practices

### Agent-Design

- **KISS**: Keep It Simple, Stupid - einfache, fokussierte Agents
- **Single Responsibility**: Ein Agent = eine Hauptfunktion
- **Error Handling**: Immer Fehlerfälle berücksichtigen
- **Logging**: Ausreichend Logs für Debugging

### Sicherheit

- **Principle of Least Privilege**: Minimal notwendige Berechtigungen
- **Defense in Depth**: Mehrere Sicherheitsebenen
- **Regular Audits**: Regelmäßige Sicherheitsüberprüfungen
- **Update Dependencies**: Halte alle Pakete aktuell

### Performance

- **Caching**: Nutze Redis für häufige Abfragen
- **Async Processing**: Lange Aufgaben in den Background
- **Monitoring**: Beobachte Performance-Metriken
- **Scaling**: Horizontale Skalierung bei Bedarf

## 📞 Support & Community

### Hilfe bekommen

- **Dokumentation**: Dieses Handbuch
- **GitHub Issues**: Bugs und Feature-Requests
- **Discord**: Community-Diskussionen
- **Email**: Direkter Support

### Beitragen

- **Code**: Pull Requests willkommen
- **Dokumentation**: Verbesserungen an diesem Guide
- **Tests**: Mehr Test-Coverage
- **Übersetzungen**: In andere Sprachen

---

**Erstellt mit ❤️ für die SIGMACODE AI Community**

_Letzte Aktualisierung: Oktober 2024_
