<!-- markdownlint-disable MD024 MD022 MD032 -->
# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [0.2.5] - 2025-10-24

### Added

- 🌳 Prompt Explorer (Sidebar-View)
  - Baumansicht des gesamten Prompt-Katalogs (Vendor → Ordner → Datei → Prompt)
  - Kontextmenü: Prompt kopieren / in Editor einfügen
  - Titel-Aktionen: Aktualisieren, Prompt Map öffnen, Korpus scannen
- 🗺️ Prompt Map (leichte Webview)
  - Klick zum Kopieren einzelner Prompts

### Notes

- Manifest: Neue View (`specKitPromptExplorer`) im Activitybar-Container „Spec‑Kit“ und zugehörige Commands/Menüs
- Keine Breaking Changes; bestehende Features unverändert

## [0.2.4] - 2025-10-24

### Added

- 🇩🇪 German-first Agents UI mit 🇬🇧 Original-Begriffen dezent daneben (kleiner, blasser)
- 🔁 Sprachumschalter (DE/EN) in der Agents-Toolbar (nur Webview-Ansicht)
- 🎨 Visualisierungsmodi für Agent-Karten
  - `minimal` | `standard` | `rich`
  - `standard`/`rich`: Kategorie-Icons und Mini-Skizze „Input → Agent → Output“
  - `rich`: vorbereitet für zukünftige Vorher/Nachher-Previews

### Config

- `spec-kit-bridger.agents.language` (de|en, default: de)
- `spec-kit-bridger.agents.visualMode` (minimal|standard|rich, default: standard)

### Notes

- Aktionen (Kopieren/Einfügen/→ Chat/Vorlesen/SSML-Export) verwenden, falls vorhanden, die lokalisierte Prompt-Variante.

## [0.2.3] - 2025-10-24

### Added

- 🗣️ SSML-Export (Azure) direkt aus der UI
  - Agents-Tab: Button „Als SSML kopieren“ pro Agent (kopiert Azure-SSML in die Zwischenablage)
  - Dokumentation (TTS-Modus): Button „Als SSML kopieren“ für den sichtbaren Inhalt
- Respektiert die Einstellung `spec-kit-bridger.tts.inputFormat` (plain | speechmarkdown | ssml) bei der SSML-Erzeugung

### Notes

- Standardstimme: `de-DE-KatjaNeural`. Anpassung folgt als Setting.

## [0.2.2] - 2025-10-24

### Added
- 🔊 TTS: Grundsupport für Speech Markdown
  - Neue Einstellung: `spec-kit-bridger.tts.inputFormat` (plain | speechmarkdown | ssml)
  - Webviews (Dokumentation, Agents) berücksichtigen Speech Markdown (Preprocessing im Client)

### Notes
- SSML-Export ist vorbereitet und folgt in einem separaten Schritt.


### Geplant

- Sidebar Panel für Übersetzungs-Historie
- Welcome Screen mit Onboarding
- Context Memory für Gesprächsverlauf
- Custom Prompts (Nutzer-definierbar)

## [0.2.1] - 2025-10-24

### Added

- 🧠 Agents: Favoriten-Unterstützung
  - Stern-Button pro Agent, Filter „Nur Favoriten“
  - Export/Import von Agents inkl. Favoriten (JSON)
  - „→ Chat“ Schnellaktion (Chat öffnen + Prompt kopieren)

### Changed

- Webview-Messaging: `setAgents` akzeptiert jetzt `{ agents, favorites }`
- UI-Verbesserungen im Agents-Tab, inkl. TTS-Steuerung oben

### Fixed

- Lint-Korrekturen in Webview-Code (Klammern, optionale Verkettung, JSON-Filter-Key)
- Serialisierung der Favoriten (Array statt Set für postMessage)

## [0.2.0] - 2025-10-24

### Added

- 🚀 Deutsches Command Center (Webview) mit Tabs:
  - Commands, Workflows, Snippets, Templates, Lernen, Agents
- 🧠 Agents Tab (Agent Prompt Library):
  - Dynamisches Laden aus `docs/system_prompts_leaks-main` (Markdown/TXT)
  - Suche, Kategorie-Filter, Aktionen: In Chat kopieren, In Editor einfügen
  - 🔊 TTS pro Agent (de-DE)
- 📚 Dokumentations-Viewer mit TTS-Modus (de-DE)

### Changed

- Google Translation Provider: Lazy-Load des SDKs (stabile Aktivierung)
- Typisierte Webview-Nachrichten und robustere Fehlerbehandlung

### Fixed

- Aktivierungsfehler („command not found“) durch onCommand-Events und Lazy-Import beseitigt

## [0.1.1] - 2025-10-24

### Added
- 🎨 **Grafische Benutzeroberfläche!**
  - ⚙️ Settings Webview mit visueller Provider-Konfiguration
  - 📊 Status Bar Integration (zeigt aktuellen Provider)
  - ⚡ Quick Pick Menu für schnellen Provider-Wechsel
  - 🔑 Visuelles API-Key Management
  
- 🌐 **4 neue Translation Provider!**
  - ✅ Google Cloud Translation (500k Zeichen/Monat frei)
  - ✅ Microsoft Azure Translator (2M Zeichen/Monat frei!)
  - ✅ LibreTranslate (Open Source, kostenlos, selbst hostbar)
  - ✅ DeepL weiterhin verfügbar (beste Qualität)
  
- 📚 **Dokumentation**
  - `docs/TRANSLATION_PROVIDERS.md` - Komplette Setup-Anleitung
  - Vergleichstabelle für alle Provider
  - Schritt-für-Schritt Tutorials
  - Troubleshooting Guide

### Changed
- TranslationService erweitert mit Factory Pattern
- Package.json mit neuen Config-Optionen
- Provider können jetzt per GUI oder Quick Pick gewechselt werden

### Features im Detail

#### Settings GUI (Webview)
- Provider-Cards mit Badges (Free/Premium/Paid)
- Inline-Konfiguration pro Provider
- Test-Buttons für API-Verbindungen
- Erweiterte Einstellungen (Cache, Streaming, Code-Protection)
- Erfolgs-/Fehler-Feedback
- Direkter Link zur Provider-Dokumentation

#### Status Bar
- Icon-basierte Provider-Anzeige
- Tooltip mit Details
- Click öffnet Quick Pick
- Auto-Update bei Config-Änderung

#### Quick Pick Provider-Switcher
- Alle Provider mit Icons & Beschreibungen
- Zeigt Free Tier Details
- Warnung bei fehlenden API-Keys
- Direkter Link zu Settings GUI

### Developer Experience
- TypeScript Compilation: 0 Errors
- Code-Block Preservation in allen Providern
- Einheitliches Error Handling
- Deutsche Fehlermeldungen

## [0.1.0] - 2025-10-24

### Added
- ✨ Initiales Release der Extension
- 🎯 Chat Participant `@de` für deutsche spec-kit Anfragen
- 🔄 TranslationService mit Mock und DeepL Provider
- 💾 Intelligentes Caching-System (7 Tage Retention)
- 📋 Chat-Commands: `/test`, `/plan`, `/implement`, `/review`, `/debug`, `/docs`
- 📚 Dokumentations-Viewer mit 4 Modi (EN/DE/Parallel/TTS)
- ⚙️ VS Code Settings für Provider-Konfiguration
- 🛠️ Development Setup mit TypeScript, ESLint
- 🚀 CI/CD Pipeline mit GitHub Actions
- 📖 Umfassende README und CONTRIBUTING Dokumentation

### Features im Detail

#### Translation Service
- Mock-Provider für kostenlose Tests
- DeepL-Provider mit Free/Pro API Support
- Code-Block-Preservation (Code wird nie übersetzt)
- Automatisches Formatting-Preservation

#### Chat Integration
- Test-Command zur Übersetzungsvalidierung
- Routing zu spec-kit Commands
- Cache-Statistiken im Test-Modus
- Error Handling mit Fallbacks

#### Documentation View
- Webview mit Mode-Switcher
- English-Modus: Original-Dokumentation
- German-Modus: Vollübersetzung
- Parallel-Modus: EN/DE nebeneinander
- TTS-Modus: Vorlesen mit Web Speech API

#### Entwicklung
- TypeScript Strict Mode
- ESLint Konfiguration
- Debugging-Setup für Extension Development
- VS Code Tasks für Build & Test

### Developer Experience
- 📦 npm scripts für alle wichtigen Tasks
- 🔧 Launch-Konfiguration für F5-Debugging
- 📊 ESLint für Code-Qualität
- 🧪 Test-Framework Setup (vorbereitet)

### Bekannte Limitierungen
- Dokumentation zeigt Placeholder-Content (GitHub API kommt in Phase 3)
- Response-Übersetzung noch nicht implementiert
- Streaming-Support fehlt noch
- Keine E2E-Tests vorhanden

## [0.0.1] - 2025-10-24 (Pre-Release)

### Added
- Projekt-Setup
- Basis-Struktur

---

## Format-Erklärung

- `Added` - Neue Features
- `Changed` - Änderungen an bestehenden Features
- `Deprecated` - Features, die bald entfernt werden
- `Removed` - Entfernte Features
- `Fixed` - Bug-Fixes
- `Security` - Security-Fixes

[Unreleased]: https://github.com/spec-kit/bridger-de/compare/v0.1.0...HEAD
[0.2.3]: https://github.com/spec-kit/bridger-de/releases/tag/v0.2.3
[0.2.2]: https://github.com/spec-kit/bridger-de/releases/tag/v0.2.2
[0.2.1]: https://github.com/spec-kit/bridger-de/releases/tag/v0.2.1
[0.2.0]: https://github.com/spec-kit/bridger-de/releases/tag/v0.2.0
[0.1.0]: https://github.com/spec-kit/bridger-de/releases/tag/v0.1.0
