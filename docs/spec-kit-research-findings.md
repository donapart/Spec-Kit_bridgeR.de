# Spec-Kit API Research - Findings

## 🔍 Recherche-Ergebnisse (24. Dezember 2025)

### ❌ **Kritische Erkenntnis: "spec-kit" Extension existiert nicht**

Nach umfangreicher Recherche muss festgestellt werden:

1. **VS Code Marketplace**: Keine Extension namens "spec-kit" gefunden
2. **GitHub Repository**: `microsoft/vscode-copilot-release` ist **deprecated** (Hinweis auf Migration zu Open Source)
3. **Alternative Repository**: Verweis auf `microsoft/vscode-copilot-chat` für Open Source Contributions

### 📚 Was existiert tatsächlich?

#### GitHub Copilot Chat Extensions:
- **GitHub Copilot** (`github.copilot`) - Hauptextension für Code-Completion
- **GitHub Copilot Chat** (`github.copilot-chat`) - Chat-Interface für Copilot
- **GitHub Copilot for Azure** (`ms-azuretools.vscode-azure-github-copilot`) - Azure-spezifischer Chat Participant `@azure`

#### Weitere Chat Participants im Marketplace:
- `@azure` - Azure Development Assistent
- `@github` - GitHub-Integration (Pull Requests, Issues)
- `@remote-ssh` - Remote SSH Support
- `@mssql` - SQL Server Support
- `@mongodb` - MongoDB Support

### 🤔 Mögliche Interpretationen

#### Hypothese 1: "spec-kit" war ein Projektname
Das Projekt könnte ursprünglich unter einem anderen Namen entwickelt worden sein oder eine interne Bezeichnung gewesen sein.

#### Hypothese 2: Verwechslung mit GitHub Copilot Chat
Die beschriebenen Commands `/plan`, `/implement`, `/review`, `/debug` klingen nach **generischen GitHub Copilot Chat Features**, nicht nach einer spezifischen Extension.

#### Hypothese 3: Zukunfts-Extension
"spec-kit" könnte eine geplante, aber noch nicht veröffentlichte Extension sein.

---

## 🎯 Strategische Neuausrichtung

### Option A: Standard GitHub Copilot Chat Integration (EMPFOHLEN)

**Ansatz:**
- Integriere mit **Standard GitHub Copilot Chat** (`@github`)
- Nutze VS Code Chat Participant API
- Implementiere eigene `/plan`, `/implement`, `/review` Commands im `@de` Participant
- Nutze `request.model.sendRequest()` für LLM-Integration

**Vorteile:**
- ✅ Keine Abhängigkeit von hypothetischer Extension
- ✅ Volle Kontrolle über Feature-Set
- ✅ Direkter Zugriff auf VS Code Language Models
- ✅ Zukunftssicher

**Implementation:**
```typescript
// In ChatParticipantHandler.ts
const [model] = await vscode.lm.selectChatModels({
    vendor: 'copilot',
    family: 'gpt-4'
});

const messages = [
    vscode.LanguageModelChatMessage.User(translatedPrompt)
];

const chatResponse = await model.sendRequest(messages, {}, token);

for await (const fragment of chatResponse.text) {
    stream.markdown(fragment);
}
```

### Option B: Azure Copilot Pattern nachahmen

**Ansatz:**
- Analysiere `@azure` Extension als Blueprint
- Implementiere ähnliches Command-Routing
- Nutze Language Model API direkt

**Vorteile:**
- ✅ Bewährtes Muster
- ✅ Microsoft-dokumentiert
- ✅ Produktionsreif

---

## 📋 Revidierter Phase 2 Plan

### Sprint 2.1: Language Model Integration (statt spec-kit API)

#### Task 1: VS Code Language Model API Integration ✅ STARTEN
**Deliverables:**
- [ ] `src/middleware/LanguageModelBridge.ts`
- [ ] Translation Pipeline für Requests
- [ ] Translation Pipeline für Responses
- [ ] Code Block Preservation

**Code-Architektur:**
```
User Input (DE)
  ↓
TranslationService.translate() → EN
  ↓
LanguageModelBridge.sendRequest()
  ↓
VS Code Language Model (GPT-4)
  ↓
TranslationService.translate() → DE
  ↓
User Output (DE)
```

#### Task 2: Command Implementation
**Commands:**
1. `/plan` - Projektplanung auf Deutsch
2. `/implement` - Code-Generierung mit deutschen Prompts
3. `/review` - Code-Review auf Deutsch
4. `/debug` - Debugging-Hilfe auf Deutsch

#### Task 3: Streaming Translation
- Line-by-Line Translation
- Progressive Output
- Cancellation Support

---

## 📚 Wichtige API-Referenzen

### VS Code Chat Participant API
```typescript
interface ChatRequest {
    command: string;
    prompt: string;
    model: LanguageModelChat;
}

interface ChatResponseStream {
    markdown(value: string): void;
    push(part: ChatResponsePart): void;
}

interface LanguageModelChat {
    sendRequest(
        messages: LanguageModelChatMessage[],
        options: LanguageModelChatRequestOptions,
        token: CancellationToken
    ): Thenable<LanguageModelChatResponse>;
}
```

### Language Model Selection
```typescript
const models = await vscode.lm.selectChatModels({
    vendor: 'copilot',      // GitHub Copilot
    family: 'gpt-4'         // GPT-4 oder GPT-3.5
});
```

---

## 🚨 Risiken & Mitigation

### ALTE ANNAHME (spec-kit existiert)
- ❌ Extension nicht auffindbar
- ❌ Keine öffentliche API-Dokumentation
- ❌ Unklare Lizenzierung

### NEUE STRATEGIE (Language Model API)
- ✅ Microsoft-offiziell dokumentiert
- ✅ Teil von VS Code Extension API
- ✅ Open Source freundlich
- ✅ Produktionsreif

---

## 🎯 Nächste Schritte

### Sofort (Heute):
1. ✅ **Research abgeschlossen** - spec-kit existiert nicht als Extension
2. 🚀 **Pivot zu Language Model API** - Implementierung starten
3. 📝 **PHASE_2_ROADMAP.md aktualisieren** - Strategie anpassen

### Diese Woche:
1. Implementiere `LanguageModelBridge.ts`
2. Integriere Translation Pipeline
3. Teste `/plan` Command mit echtem GPT-4

### Nächste Woche:
1. Implementiere alle Commands
2. Streaming-Translation
3. Beta Testing

---

## 📖 Referenzen

- [VS Code Chat Extension API](https://code.visualstudio.com/api/extension-guides/chat)
- [Language Model API](https://code.visualstudio.com/api/references/vscode-api#lm)
- [GitHub Copilot Chat Example](https://github.com/microsoft/vscode-copilot-chat)
- [@azure Chat Participant](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azure-github-copilot)

---

## 💡 Key Insight

**Das Projekt muss NICHT auf eine hypothetische "spec-kit" Extension warten.**

Stattdessen nutzen wir:
- ✅ VS Code Language Model API (offiziell)
- ✅ GitHub Copilot als Backend (bereits vom User installiert)
- ✅ Eigene Command-Implementierung im `@de` Participant
- ✅ Translation-Layer wie geplant

**Das Projekt ist nicht nur machbar, sondern sogar EINFACHER als ursprünglich gedacht!**

---

**Status**: ✅ Research Complete - Ready for Implementation  
**Recommendation**: Proceed with Language Model API Integration (Option A)  
**Risk Level**: 🟢 LOW (offizielle API, gut dokumentiert)
