# Security Policy

## Unterstützte Versionen

Wir bieten Security-Updates für folgende Versionen:

| Version | Unterstützt          |
| ------- | -------------------- |
| 0.1.x   | :white_check_mark:   |
| < 0.1   | :x:                  |

## Sicherheitslücke melden

**Bitte melde Security-Probleme NICHT über öffentliche GitHub Issues!**

Wenn du eine Sicherheitslücke in Spec-Kit BridgeR.DE findest:

1. **Email**: Sende eine Email an security@spec-kit.de
2. **Betreff**: "Security Vulnerability: [Kurzbeschreibung]"
3. **Inhalt**:
   - Beschreibung der Schwachstelle
   - Schritte zur Reproduktion
   - Mögliche Auswirkungen
   - Vorschläge zur Behebung (optional)

### Was du erwarten kannst:

- **Bestätigung**: Innerhalb von 48 Stunden
- **Erstbewertung**: Innerhalb von 7 Tagen
- **Fix & Update**: Abhängig von Schweregrad
  - Critical: 1-3 Tage
  - High: 1-2 Wochen
  - Medium: 2-4 Wochen
  - Low: Nächstes reguläres Update

### Responsible Disclosure

Wir bitten dich:

- Gib uns Zeit, das Problem zu beheben, bevor du es öffentlich machst
- Nutze die Schwachstelle nicht aus
- Teste nur an deinen eigenen Systemen

Als Dank:

- Nennung in den Release-Notes (falls gewünscht)
- Anerkennung im Security-Changelog
- Unsere tiefe Dankbarkeit! 🙏

## Bekannte Sicherheitsüberlegungen

### API-Keys

DeepL API-Keys werden in VS Code Settings gespeichert:
- ✅ Nicht in Git committed (Settings sind lokal)
- ✅ Nicht in Extension-Code eingebettet
- ⚠️ Nutzer-Verantwortung: Keys sicher aufbewahren

### Translation-Cache

Übersetzungen werden lokal gespeichert:
- ✅ Nur in VS Code GlobalState (lokal)
- ✅ Keine Cloud-Synchronisation
- ✅ Nutzer kann Cache jederzeit löschen

### Webview Security

Documentation-Viewer verwendet Content Security Policy:
- ✅ CSP aktiviert
- ✅ Kein inline-script ohne nonce
- ✅ Keine externen Resources

## Security Best Practices

Für Nutzer:

1. **API-Keys schützen**
   - Niemals in Git committed
   - Nicht in Screenshots teilen
   - Regelmäßig rotieren

2. **Extension-Updates**
   - Immer aktuellste Version nutzen
   - Release-Notes für Security-Fixes prüfen

3. **Berechtigungen**
   - Extension hat nur minimale Berechtigungen
   - Keine Netzwerk-Zugriff außer zu Translation-APIs

Für Entwickler:

1. **Dependencies**
   - Regelmäßig `npm audit` durchführen
   - Dependencies aktuell halten
   - Nur vertrauenswürdige Packages nutzen

2. **Code-Review**
   - Alle PRs werden reviewed
   - Security-kritischer Code besonders prüfen
   - Input-Validierung überall

3. **Testing**
   - Security-Tests in CI/CD
   - Regelmäßige Security-Audits

## Kontakt

- **Security Issues**: security@spec-kit.de
- **Allgemeine Fragen**: GitHub Discussions
- **Bugs**: GitHub Issues

---

**Vielen Dank, dass du zur Sicherheit von Spec-Kit BridgeR.DE beiträgst!** 🔒
