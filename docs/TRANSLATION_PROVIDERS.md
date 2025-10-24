# Translation Provider Setup Guide

Spec-Kit BridgeR.DE unterstützt mehrere Übersetzungs-Provider. Wähle den für dich passenden aus!

## 🔧 Provider-Übersicht

| Provider | Kosten | Qualität | Setup-Schwierigkeit |
|----------|--------|----------|---------------------|
| **Mock** | ❌ Kostenlos | ⚠️ Keine echte Übersetzung | ✅ Sofort verfügbar |
| **DeepL** | ✅ 500k Zeichen/Monat frei | ⭐⭐⭐⭐⭐ Beste | 🟡 API-Key nötig |
| **Google Translate** | ✅ 500k Zeichen/Monat frei | ⭐⭐⭐⭐ Sehr gut | 🟡 API-Key nötig |
| **Microsoft Translator** | ✅ 2M Zeichen/Monat frei | ⭐⭐⭐⭐ Sehr gut | 🟠 API-Key + Region |
| **LibreTranslate** | ✅ Kostenlos (immer) | ⭐⭐⭐ Gut | ✅ Kein Setup (public) oder selbst hosten |

---

## 1️⃣ Mock Provider (Default)

**Verwendung:** Nur für Tests ohne Übersetzung.

**Setup:**
```json
// settings.json
{
  "spec-kit-bridger.translationProvider": "mock"
}
```

**Ausgabe:** `🇩🇪 [MOCK] Originaltext`

---

## 2️⃣ DeepL API

**Beste Qualität**, besonders für technische Texte.

### Setup-Schritte:

1. **Account erstellen:** https://www.deepl.com/pro-api
2. **API-Key kopieren** (nach Registrierung verfügbar)
3. **VS Code Settings öffnen:** `Ctrl+,` → "Spec-Kit"
4. **Konfigurieren:**
   ```json
   {
     "spec-kit-bridger.translationProvider": "deepl",
     "spec-kit-bridger.deepl.apiKey": "DEIN_API_KEY_HIER",
     "spec-kit-bridger.deepl.apiType": "free"  // oder "pro"
   }
   ```

### Preise:
- **Free:** 500.000 Zeichen/Monat kostenlos
- **Pro:** $5.49/Monat für 500k Zeichen (danach $25/Million)

---

## 3️⃣ Google Cloud Translation

**Sehr gute Qualität**, große Free Tier.

### Setup-Schritte:

1. **Google Cloud Account:** https://console.cloud.google.com
2. **Neues Projekt erstellen**
3. **Translation API aktivieren:**
   - Navigation: "APIs & Services" → "Library"
   - Suche: "Cloud Translation API"
   - Klick: "Enable"
4. **API-Key erstellen:**
   - Navigation: "APIs & Services" → "Credentials"
   - Klick: "Create Credentials" → "API Key"
   - **Wichtig:** API-Key einschränken auf "Cloud Translation API" (Sicherheit!)
5. **VS Code Settings:**
   ```json
   {
     "spec-kit-bridger.translationProvider": "google",
     "spec-kit-bridger.googleApiKey": "DEIN_API_KEY_HIER"
   }
   ```

### Preise:
- **Free:** 500.000 Zeichen/Monat
- **Danach:** $20/Million Zeichen

---

## 4️⃣ Microsoft Azure Translator

**Bestes Preis-Leistungs-Verhältnis** (2M Zeichen/Monat frei).

### Setup-Schritte:

1. **Azure Account:** https://portal.azure.com
2. **Translator Resource erstellen:**
   - Klick: "Create a resource"
   - Suche: "Translator"
   - Klick: "Create"
   - Wähle: Region (z.B. "West Europe")
   - Pricing Tier: "Free F0" (für 2M Zeichen/Monat)
3. **API-Key und Region notieren:**
   - Nach Erstellung: Resource öffnen
   - Navigation: "Keys and Endpoint"
   - Kopiere: **Key 1** und **Location/Region**
4. **VS Code Settings:**
   ```json
   {
     "spec-kit-bridger.translationProvider": "microsoft",
     "spec-kit-bridger.azureApiKey": "DEIN_API_KEY_HIER",
     "spec-kit-bridger.azureRegion": "westeurope"  // Deine Region!
   }
   ```

### Preise:
- **Free:** 2.000.000 Zeichen/Monat (!)
- **Danach:** $10/Million Zeichen

---

## 5️⃣ LibreTranslate (Open Source)

**Komplett kostenlos**, Privacy-freundlich, selbst hostbar.

### Option A: Öffentliche Instanz (Einfach)

**Setup:**
```json
{
  "spec-kit-bridger.translationProvider": "libretranslate"
  // Kein API-Key nötig!
}
```

**Limitierung:** Rate-Limited (langsamer bei hoher Last)

### Option B: Selbst hosten (Unbegrenzt)

1. **Docker installieren:** https://www.docker.com/get-started
2. **LibreTranslate starten:**
   ```bash
   docker run -d -p 5000:5000 libretranslate/libretranslate
   ```
3. **VS Code Settings:**
   ```json
   {
     "spec-kit-bridger.translationProvider": "libretranslate",
     "spec-kit-bridger.libreTranslateUrl": "http://localhost:5000/translate"
   }
   ```

**Vorteile:**
- ✅ Unbegrenzte Nutzung
- ✅ Keine API-Keys
- ✅ 100% Privacy (Daten bleiben lokal)
- ✅ Offline-fähig

**GitHub:** https://github.com/LibreTranslate/LibreTranslate

---

## 🎯 Empfehlung

### Für Hobby-Projekte:
→ **LibreTranslate** (kostenlos, privacy-freundlich)

### Für professionelle Nutzung:
→ **Microsoft Azure Translator** (2M Zeichen/Monat frei, beste Value)

### Für höchste Qualität:
→ **DeepL** (beste Übersetzungen, speziell für DE ↔ EN)

### Für Entwickler mit Google Cloud:
→ **Google Translate** (wenn bereits GCP-Account vorhanden)

---

## 🔧 Provider wechseln

1. **Settings öffnen:** `Ctrl+,`
2. **Suche:** "spec-kit-bridger.translationProvider"
3. **Auswählen:** Dropdown-Menü
4. **Neuladen:** Extension lädt automatisch neu

---

## ❗ Troubleshooting

### "API Key nicht konfiguriert"
→ Überprüfe Settings, API-Key muss genau kopiert sein (keine Leerzeichen!)

### "API Quota überschritten"
→ Free Tier aufgebraucht, warte bis Monatsende oder Upgrade

### "LibreTranslate Server nicht erreichbar"
→ URL überprüfen, bei Self-Hosting: Docker-Container läuft?

### "Azure API Zugriff verweigert"
→ API-Key UND Region müssen beide korrekt sein

---

## 💡 Performance-Tipps

1. **Cache aktiviert lassen:**
   ```json
   { "spec-kit-bridger.cacheEnabled": true }
   ```

2. **Code-Block Preservation:**
   ```json
   { "spec-kit-bridger.preserveCodeBlocks": true }
   ```

3. **Streaming für schnellere Antworten:**
   ```json
   { "spec-kit-bridger.streamingEnabled": true }
   ```

---

**Fragen?** → [GitHub Issues](https://github.com/spec-kit/bridger-de/issues)
