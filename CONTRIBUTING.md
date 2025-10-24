# Contributing to Spec-Kit BridgeR.DE

Danke, dass du zu Spec-Kit BridgeR.DE beitragen möchtest! 🎉

## 🏗️ Entwicklungsumgebung

### Voraussetzungen
- Node.js 18.x oder 20.x
- VS Code 1.85.0 oder höher
- Git

### Setup
```bash
# Repository klonen
git clone https://github.com/spec-kit/bridger-de.git
cd bridger-de

# Dependencies installieren
npm install

# Extension in VS Code öffnen
code .
```

### Entwickeln
```bash
# TypeScript im Watch-Modus
npm run watch

# In neuem Terminal: Extension debuggen
# Drücke F5 in VS Code
```

## 📋 Contribution Guidelines

### Code-Standards
- **TypeScript Strict Mode**: Alle TypeScript-Dateien müssen im Strict Mode kompilieren
- **ESLint**: Keine Warnings oder Errors
- **Formatierung**: Konsistent mit bestehenden Code-Style
- **Kommentare**: Komplexe Logik dokumentieren (Deutsch oder Englisch)

### Commit Messages
Wir folgen [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Neue Feature hinzufügen
fix: Bug-Fix
docs: Dokumentation anpassen
style: Code-Formatierung
refactor: Code-Refactoring
test: Tests hinzufügen/ändern
chore: Maintenance-Tasks
```

Beispiele:
```bash
git commit -m "feat: Streaming-Support für Chat-Übersetzung"
git commit -m "fix: Code-Block-Escaping in DeepL-Provider"
git commit -m "docs: Installation-Anleitung erweitern"
```

### Branch-Strategie
- `main`: Stabile Releases
- `develop`: Aktuelle Entwicklung
- `feature/name`: Neue Features
- `fix/name`: Bug-Fixes

```bash
# Feature-Branch erstellen
git checkout -b feature/streaming-support

# Commits durchführen
git commit -m "feat: Streaming-API implementieren"

# Push zum Fork
git push origin feature/streaming-support

# Pull Request erstellen
```

## 🧪 Testing

### Tests ausführen
```bash
# Alle Tests
npm test

# Nur Unit-Tests
npm run test:unit

# Mit Coverage
npm run test:coverage
```

### Test-Anforderungen
- Mindestens 80% Code-Coverage für neue Features
- Unit-Tests für alle Service-Klassen
- Integration-Tests für Chat-Commands
- E2E-Tests für kritische User-Flows

## 📝 Dokumentation

### Code-Dokumentation
```typescript
/**
 * Übersetzt Text mit dem konfigurierten Provider
 * @param text - Zu übersetzender Text
 * @param options - Übersetzungs-Optionen
 * @returns Übersetztes Ergebnis mit Metadaten
 */
async translate(text: string, options: TranslationOptions): Promise<TranslationResult> {
    // ...
}
```

### README aktualisieren
Wenn du neue Features hinzufügst:
- Füge Beispiele in README.md hinzu
- Update die Roadmap
- Dokumentiere neue Settings

## 🐛 Bug Reports

### Gute Bug Reports enthalten:
1. **Zusammenfassung**: Kurze Beschreibung des Problems
2. **Schritte zur Reproduktion**: Wie kann man den Bug nachstellen?
3. **Erwartetes Verhalten**: Was sollte passieren?
4. **Aktuelles Verhalten**: Was passiert stattdessen?
5. **Environment**: VS Code Version, OS, Extension-Version
6. **Logs**: Relevante Console-Ausgaben

### Template
```markdown
**Zusammenfassung**
DeepL-Übersetzung schlägt bei langen Texten fehl

**Schritte zur Reproduktion**
1. Öffne Chat
2. Gib @de /test mit 5000 Zeichen Text ein
3. Warte auf Übersetzung

**Erwartetes Verhalten**
Text wird übersetzt

**Aktuelles Verhalten**
Fehler: "DeepL API Timeout"

**Environment**
- VS Code: 1.85.0
- OS: Windows 11
- Extension: 0.1.0
- Provider: DeepL Free

**Logs**
[Logs hier einfügen]
```

## 💡 Feature Requests

### Gute Feature Requests enthalten:
1. **Use Case**: Warum brauchst du das Feature?
2. **Vorschlag**: Wie könnte es implementiert werden?
3. **Alternativen**: Hast du Workarounds ausprobiert?
4. **Priorität**: Wie wichtig ist das Feature für dich?

## 🎯 Priorisierung

### High Priority
- Security-Fixes
- Kritische Bugs (Extension funktioniert nicht)
- Performance-Probleme
- Breaking Changes von VS Code API

### Medium Priority
- Feature-Requests mit vielen Upvotes
- Verbesserungen der UX
- Dokumentations-Updates
- Test-Coverage erhöhen

### Low Priority
- Code-Refactoring
- Nice-to-have Features
- Cosmetic Changes

## 🔍 Code Review

### Was wir prüfen:
- **Funktionalität**: Funktioniert das Feature wie beschrieben?
- **Tests**: Sind Tests vorhanden und aussagekräftig?
- **Code-Qualität**: Ist der Code lesbar und wartbar?
- **Performance**: Gibt es Performance-Implikationen?
- **Security**: Gibt es Security-Risiken?
- **Dokumentation**: Ist das Feature dokumentiert?

### Review-Prozess
1. Automatische Checks (CI/CD)
2. Code Review durch Maintainer
3. Feedback umsetzen
4. Approval & Merge

## 📦 Release-Prozess

### Versioning
Wir folgen [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0): Breaking Changes
- **Minor** (0.1.0): Neue Features (backward-compatible)
- **Patch** (0.0.1): Bug-Fixes

### Release-Schritte
1. Version in `package.json` erhöhen
2. CHANGELOG.md aktualisieren
3. Tag erstellen: `git tag v0.1.0`
4. Push: `git push --tags`
5. GitHub Release erstellen
6. Automatisches Publish zum Marketplace (CI/CD)

## 🤝 Community

### Kommunikation
- **GitHub Issues**: Bug Reports & Feature Requests
- **GitHub Discussions**: Allgemeine Fragen & Ideen
- **Pull Requests**: Code-Contributions

### Code of Conduct
- Sei respektvoll und freundlich
- Konstruktives Feedback geben
- Diverse Perspektiven wertschätzen
- Hilfsbereitschaft zeigen

## 🙏 Danke!

Jeder Beitrag macht Spec-Kit BridgeR.DE besser!

Ob Bug Report, Feature Request, Code-Contribution oder Dokumentation - 
wir schätzen deine Zeit und dein Engagement! ❤️

---

**Fragen?** Öffne ein [GitHub Discussion](https://github.com/spec-kit/bridger-de/discussions)
