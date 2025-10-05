#!/bin/bash

# Skript zum Erstellen fehlender E2E-Test-Routen

BASE_DIR="/Users/msc/Desktop/Sigmacode2/app"

# Liste der erwarteten Routen aus den Tests
routes=(
  "chat"
  "agents"
  "mas"
  "firewall"
  "docs"
  "changelog"
  "contact"
  "login"
  "signup"
  "workflows"
  "dashboard/firewall/monitor"
)

for route in "${routes[@]}"; do
  dir_path="$BASE_DIR/$route"
  file_path="$dir_path/page.tsx"

  if [ ! -f "$file_path" ]; then
    echo "Erstelle $file_path"
    mkdir -p "$dir_path"

    # Generiere eine einfache Platzhalter-Seite
    cat > "$file_path" << EOF
export default function ${route//[\/-]/_}Page() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          ${route^}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Seite wird entwickelt.
        </p>
      </div>
    </div>
  );
}
EOF
  else
    echo "Überspringe $file_path (existiert bereits)"
  fi
done

echo "Fertig! Alle fehlenden Routen erstellt."
