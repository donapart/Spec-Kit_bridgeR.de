# Spec-Kit BridgeR.DE 🌉🇩🇪

**Deutsche Übersetzungs-Bridge für spec-kit GitHub Copilot Chat**

Schreibe mit GitHub Copilot auf Deutsch und nutze die volle Power von spec-kit!

## 🎯 Features

### ✨ Bidirektionale Chat-Übersetzung
- Schreibe deine Anfragen auf Deutsch
- Automatische Übersetzung für spec-kit
- Antworten werden zurück ins Deutsche übersetzt
- Code-Blöcke bleiben unberührt

### 📚 Mehrsprachige Dokumentation
- **Deutsch-Modus**: Vollständig übersetzte Dokumentation
- **English-Modus**: Original-Dokumentation
- **Parallel-Modus**: Deutsch und Englisch nebeneinander
- **TTS-Modus**: Dokumentation vorlesen lassen (Barrierefreiheit)
  - 🔊 Vorlesen, ⏸️/⏹️ Steuerung
  - 🗣️ Als SSML (Azure) kopieren – erzeugt valides Azure-SSML aus dem aktuellen Inhalt

### 🚀 Performance
- Intelligentes Caching (bis zu 7 Tage)
- Lazy-Loading für große Dokumente
- Offline-Fallbacks
- Minimale API-Kosten

### 🧠 Command Center (deutsch)
- Zentrale Webview mit Tabs: Commands, Workflows, Snippets, Templates, Lernen, Agents
- Schnelle Aktionen: Chat öffnen, Einstellungen, Cache leeren, Statistiken
- Vollständig lokal (kein Backend nötig)

### 🧠 Agents Prompt Library
- Dynamisches Laden aus `docs/system_prompts_leaks-main` (Markdown/TXT)
- Suche und Kategorie-Filter
- Aktionen: In Chat kopieren, In Editor einfügen, → Chat (öffnet Chat + kopiert)
- Favoriten: Stern-Button pro Agent, Filter „Nur Favoriten“
- Export/Import als JSON (inkl. Favoriten)
- 🔊 Vorlesen (de-DE, Web Speech API)
 - 🗣️ Als SSML (Azure) kopieren – generiert SSML und legt es in die Zwischenablage
 - 🇩🇪 German-first Anzeige mit 🇬🇧 Original-Begriffen dezent daneben (kleiner, blasser)
 - 🔁 Sprachumschalter (DE/EN) direkt in der Toolbar der Agents-Ansicht
 - 🎨 Visualisierungsmodi: minimal | standard | rich
   - standard/rich: Kategorie-Icons und Mini-Skizze „Input → Agent → Output“ je Karte
   - rich: vorbereitet für erweiterte Previews (Vorher/Nachher)

## 📦 Installation

### Aus dem Marketplace
```bash
code --install-extension spec-kit.spec-kit-bridger-de
```

### Aus Source
```bash
git clone https://github.com/spec-kit/bridger-de.git
cd bridger-de
npm install
npm run compile
code --install-extension .
```

## ⚙️ Konfiguration

### Translation Provider

**Mock-Modus** (Standard, kostenlos):
```json
{
  "spec-kit-bridger.translationProvider": "mock"
}
```

**DeepL** (empfohlen):
```json
{
  "spec-kit-bridger.translationProvider": "deepl",
  "spec-kit-bridger.deepl.apiKey": "your-api-key-here",
  "spec-kit-bridger.deepl.apiType": "free"
}
```

DeepL API-Key: [https://www.deepl.com/pro-api](https://www.deepl.com/pro-api)
- **Free**: 500.000 Zeichen/Monat kostenlos
- **Pro**: Ab €5,49/Monat

### Dokumentations-Modus
```json
{
  "spec-kit-bridger.documentationMode": "german"
}
```

Optionen: `"english"`, `"german"`, `"parallel"`, `"tts"`

### Text-to-Speech Eingabeformat
```json
{
  "spec-kit-bridger.tts.inputFormat": "plain" // oder "speechmarkdown" | "ssml"
}
```

Hinweis:
- Bei "speechmarkdown" werden einfache Markups clientseitig entfernt, bevor gesprochen/konvertiert wird.
- Beim SSML-Export wird automatisch Azure-SSML mit Stimme `de-DE-KatjaNeural` erzeugt.

  ### Agents-Anzeige (Sprache & Visualisierung)
  ```json
  {
    "spec-kit-bridger.agents.language": "de",      // oder "en" (initiale UI-Sprache)
    "spec-kit-bridger.agents.visualMode": "standard" // "minimal" | "standard" | "rich"
  }
  ```
  Hinweise:
  - Die Sprachwahl kann zusätzlich live in der Agents-Toolbar (DE/EN) umgeschaltet werden.
  - Im DE-Modus wird die deutsche Fassung groß gezeigt; das englische Original erscheint dezent daneben.

### Command Center öffnen

Öffne die Befehls-Palette und wähle:

- „Spec-Kit: 🚀 Command Center öffnen“
- „Spec-Kit: ⚙️ Einstellungen öffnen“

Im Command Center → Tab „🧠 Agents“:

- Suche/Kategorie-Filter nutzen, Stern für Favoriten toggeln
- „Nur Favoriten“ toggelt die Ansicht
- ⬇️ Export / ⬆️ Import: Agents und Favoriten als JSON sichern/laden
- „→ Chat“ öffnet den Chat und kopiert den Prompt automatisch
- 🔊 Vorlesen: deutscher TTS mit Pause/Stop
 - DE/EN: Anzeige-Sprache live wechseln
 - Visualisierungsmodus: je nach Einstellung (Icons, Mini-Flow)

## 🎮 Verwendung

### Chat-Commands

```typescript
// Plan erstellen
@de /plan Erstelle eine REST-API für Benutzerverwaltung

// Implementierung
@de /implement Füge JWT-Authentifizierung hinzu

// Code-Review
@de /review Überprüfe die Sicherheit dieser Funktion

// Debugging
@de /debug Warum wirft diese Funktion einen Fehler?

// Dokumentation
@de /docs
```

### Keyboard Shortcuts

- `Ctrl+Shift+P` → "Spec-Kit: Dokumentation anzeigen"
- `Ctrl+Shift+P` → "Spec-Kit: Anzeigemodus wechseln"

## 🏗️ Entwicklung

### Setup
```bash
npm install
npm run watch
```

### Debugging
1. Drücke `F5` in VS Code
2. Extension Host öffnet sich
3. Teste Commands im Extension Host

### Testing
```bash
npm test
```

### Build
```bash
npm run compile
npm run package
```

Optional: VSIX lokal installieren

```bash
code --install-extension spec-kit-bridger-de-*.vsix
```

## 📋 Roadmap

### Phase 1: Foundation ✅ (Aktuelle Version)
- [x] VS Code Extension Boilerplate
- [x] Translation Service (Mock + DeepL)
- [x] Chat Participant Integration
- [x] Basis-Commands

### Phase 2: Chat-Integration (Woche 3-4)
- [ ] Bidirektionale Übersetzung
- [ ] Streaming-Support
- [ ] Response-Bereinigung
- [ ] Error Handling

### Phase 3: Dokumentations-Viewer (Woche 5-6)
- [ ] Webview mit GitHub API
- [ ] Markdown-Rendering
- [ ] Mode-Switching

### Phase 4: Übersetzungs-Integration (Woche 7-8)
- [ ] HTML-aware Translation
- [ ] Multi-Mode Implementation
- [ ] Progress-Indicator

### Phase 5: Performance (Woche 9-10)
- [ ] IndexedDB Caching
- [ ] API-Call-Batching
- [ ] Memory Management

### Phase 6: Polish (Woche 11-12)
- [ ] Onboarding-Wizard
- [ ] Keyboard-Shortcuts
- [ ] Such-Funktion
- [ ] Web Speech API

## 🤝 Contributing

Wir freuen uns über Beiträge!

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

### Entwicklungs-Guidelines
- TypeScript Strict Mode
- ESLint ohne Warnings
- Mindestens 80% Test-Coverage
- Dokumentation für neue Features

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details

## 🙏 Credits

- [spec-kit](https://github.com/microsoft/vscode-copilot-release) - Das Original
- [DeepL](https://www.deepl.com) - Übersetzungs-API
- [VS Code Extension API](https://code.visualstudio.com/api)

## 📞 Support

- 🐛 [Bug Reports](https://github.com/spec-kit/bridger-de/issues)
- 💡 [Feature Requests](https://github.com/spec-kit/bridger-de/issues)
- 📧 Email: support@spec-kit.de

## 🌟 Zeig deine Unterstützung

Wenn dir dieses Projekt gefällt, gib ihm einen ⭐ auf GitHub!

---

**Made with ❤️ for the German Developer Community**
