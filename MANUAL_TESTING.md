# Manuelle Test-Anleitung für Spec-Kit BridgeR.DE

## Vorbereitung

1. **Extension laden**
   ```
   - Öffne VS Code
   - Navigiere zu diesem Projekt
   - Drücke F5 (oder Debug → "Start Debugging")
   - Ein neues VS Code Fenster öffnet sich (Extension Development Host)
   ```

2. **GitHub Copilot Chat öffnen**
   ```
   - Im Extension Development Host
   - Ctrl+Shift+I oder View → Command Palette → "GitHub Copilot: Open Chat"
   ```

## Test-Szenarien

### ✅ Test 1: /de /test Command

**Input:**
```
@de /test Hallo Welt, wie geht es dir?
```

**Erwartete Ausgabe:**
```
🧪 **Test-Modus**: Übersetzungsfunktion wird getestet...

**Original (DE):**
> Hallo Welt, wie geht es dir?

**Übersetzt nach EN:**
> 🇩🇪 [MOCK] Hallo Welt, wie geht es dir?

**Zurück nach DE:**
> 🇩🇪 [MOCK] 🇩🇪 [MOCK] Hallo Welt, wie geht es dir?

📊 **Cache-Statistik:**
- Einträge: 2
- Maximale Größe: 1000
```

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 2: /de /plan Command

**Input:**
```
@de /plan Erstelle eine neue User-Klasse mit Name und Email
```

**Erwartete Ausgabe:**
```
📋 **Plan-Modus**: Anfrage wird für spec-kit übersetzt...

**An spec-kit weitergeleitet:**
`@spec-kit /plan 🇩🇪 [MOCK] Erstelle eine neue User-Klasse mit Name und Email`

💡 *Tipp: Die Antwort von spec-kit wird automatisch ins Deutsche übersetzt.*
```

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 3: /de /implement Command

**Input:**
```
@de /implement Implementiere eine Login-Funktion
```

**Erwartete Ausgabe:**
```
⚙️ **Implementierungs-Modus**: Anfrage wird für spec-kit übersetzt...

**An spec-kit weitergeleitet:**
`@spec-kit /implement 🇩🇪 [MOCK] Implementiere eine Login-Funktion`
```

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 4: /de /docs Command

**Input:**
```
@de /docs
```

**Erwartete Ausgabe:**
```
📚 **Dokumentations-Modus**: Dokumentation wird geladen...

✅ Dokumentation wurde geöffnet. Nutze die Buttons, um den Anzeigemodus zu wechseln.
```

**Zusätzliche Prüfung:**
- Ein Webview-Panel sollte sich öffnen
- Buttons für Mode-Switching sollten sichtbar sein (EN/DE/Parallel/TTS)

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 5: Code-Block Preservation

**Input:**
```
@de /test Hier ist ein Code-Beispiel:
```typescript
function hello() {
    console.log("Hello");
}
```
Bitte übersetze den Text drumherum
```

**Erwartung:**
- Der Code-Block sollte unverändert bleiben
- Nur der umgebende Text sollte übersetzt werden
- `console.log` sollte NICHT übersetzt werden

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

## Settings Tests

### ✅ Test 6: Provider Switching

**Schritte:**
1. Öffne Settings (File → Preferences → Settings)
2. Suche "Spec-Kit BridgeR"
3. Ändere "Translation Provider" von "mock" zu "deepl"
4. Führe `@de /test` aus

**Erwartung ohne API-Key:**
- Sollte eine Fehlermeldung zeigen: "DeepL API-Key ist nicht konfiguriert"
- Sollte auf Mock-Provider zurückfallen

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 7: Cache Clearing

**Schritte:**
1. Führe `@de /test Hallo` mehrfach aus
2. Notiere Cache-Stats
3. Command Palette → "Spec-Kit: Übersetzungs-Cache leeren"
4. Führe `@de /test Hallo` erneut aus

**Erwartung:**
- Cache-Einträge sollten auf 0 zurückgesetzt werden
- Nach erneutem Test sollte Cache wieder Einträge haben

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

### ✅ Test 8: Documentation View Mode Switching

**Schritte:**
1. Führe `@de /docs` aus
2. Klicke auf "DE" Button
3. Klicke auf "Parallel" Button
4. Klicke auf "EN" Button

**Erwartung:**
- Jeder Klick sollte die Ansicht ändern
- Parallel sollte beide Sprachen nebeneinander zeigen
- Keine Fehler in der Developer Console

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

## Debug Console Prüfung

### Erwartete Log-Meldungen

Im Extension Development Host Output sollten erscheinen:
```
[Spec-Kit BridgeR] Extension activated
[Spec-Kit BridgeR] Translation Service initialized with provider: mock
[Spec-Kit BridgeR] Chat Participant registered: spec-kit-bridger.de
```

**Status:** ⬜ Nicht getestet | ✅ Erfolgreich | ❌ Fehlgeschlagen

---

## Bekannte Limitations (Phase 1)

- ⚠️ **Mock-Provider nur:** Übersetzungen sind nur Platzhalter mit `🇩🇪 [MOCK]` Prefix
- ⚠️ **Keine echte spec-kit Integration:** Commands werden nur weitergeleitet, nicht ausgeführt
- ⚠️ **Mock-Dokumentation:** Dokumentation ist statisch, keine GitHub-Integration
- ⚠️ **Keine Streaming-Übersetzung:** Ganze Antwort wird auf einmal übersetzt

Diese werden in Phase 2 behoben.

---

## Fehler-Reporting

Bei Fehlern bitte dokumentieren:
1. **Was wurde getestet?**
2. **Was war die Erwartung?**
3. **Was ist tatsächlich passiert?**
4. **Fehlermeldung** (falls vorhanden)
5. **VS Code Version**
6. **Extension Log Output**

---

## Nächste Schritte nach erfolgreichem Test

✅ Alle Tests bestanden → **Phase 2 kann beginnen**  
❌ Tests fehlgeschlagen → **Bugs fixen** → Erneut testen
