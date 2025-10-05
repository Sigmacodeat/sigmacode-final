# PNPM Workspace Empfehlung

## Aktuelle Konfiguration:

Die pnpm-workspace.yaml enthält nur das Hauptprojekt und dify/web.

## Empfohlene Änderungen:

### Option A: Vollständiges Monorepo

packages:

- .
- dify/web
- supabase/apps/\*
- superagent/node

### Option B: Einfaches Single-Project

packages:

- .

## Empfehlung:

Da die separate Projekte (dify, supabase, superagent) eigenständige Projekte sind,
empfehle ich Option B: Einfaches Single-Project Setup.

## Schritte:

1. Aktualisieren Sie pnpm-workspace.yaml für Single-Project
2. Entfernen Sie Abhängigkeiten zwischen Projekten
3. Erstellen Sie separate Repositories für eigenständige Projekte

## Vorteile Single-Project:

- Einfachere Dependency-Management
- Weniger Komplexität
- Bessere Performance
- Klare Projektgrenzen
