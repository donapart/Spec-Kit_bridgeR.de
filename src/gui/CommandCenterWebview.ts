import * as vscode from 'vscode';
import { loadAgentPrompts } from '../data/agentPromptLoader';
import type { AgentPrompt } from '../data/AgentPrompt';
import { toAzureSsml } from '../tts/speechMarkdown';

/**
 * Deutsches Command Center für spec-kit
 * Zentrale GUI für alle spec-kit Funktionen mit deutscher Führung
 */
type WebviewMessage =
    | { command: 'executeCommand'; data: { command: string; prompt: string } }
    | { command: 'openChat' }
    | { command: 'insertSnippet'; data: { code: string; language: string } }
    | { command: 'insertAgentPrompt'; data: { text: string } }
    | { command: 'copyAgentPrompt'; data: { text: string } }
    | { command: 'startWorkflow'; data: string }
    | { command: 'openSettings' }
    | { command: 'openDocumentation'; data: string }
    | { command: 'clearCache' }
    | { command: 'createFromTemplate'; data: string }
    | { command: 'startTutorial'; data: string }
    | { command: 'requestAgents' }
    | { command: 'toggleFavorite'; data: { id: string } }
    | { command: 'exportAgents'; data: { onlyFavorites: boolean } }
    | { command: 'importAgents' }
    | { command: 'exportAgentAsSsml'; data: { text: string } };

export class CommandCenterWebview {
    private panel: vscode.WebviewPanel | undefined;
    private agentsCache: AgentPrompt[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Show the German Command Center
     */
    public show(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'specKitCommandCenter',
            '🚀 Spec-Kit Command Center',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getHtmlContent();
        this.panel.webview.onDidReceiveMessage(
            message => this.handleMessage(message as WebviewMessage),
            undefined,
            this.context.subscriptions
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Agents dynamisch laden und an die Webview senden
        void this.loadAndSendAgents();
    }

    /**
     * Handle messages from webview
     */
    private async handleMessage(message: WebviewMessage): Promise<void> {
        switch (message.command) {
            case 'requestAgents': {
                await this.loadAndSendAgents();
                break;
            }
            case 'executeCommand':
                await this.executeSpecKitCommand(message.data);
                break;
            
            case 'openChat':
                await vscode.commands.executeCommand('workbench.action.chat.open');
                break;

            case 'insertSnippet':
                await this.insertCodeSnippet(message.data);
                break;

            case 'insertAgentPrompt':
                await this.insertAgentPrompt(message.data);
                break;

            case 'copyAgentPrompt':
                await vscode.env.clipboard.writeText(message.data?.text ?? '');
                vscode.window.showInformationMessage('Agent-Prompt in die Zwischenablage kopiert.');
                break;

            case 'startWorkflow':
                await this.startWorkflow(message.data);
                break;

            case 'openSettings':
                await vscode.commands.executeCommand('spec-kit-bridger.openSettings');
                break;

            case 'openDocumentation':
                await this.openDocumentation(message.data);
                break;

            case 'clearCache':
                await vscode.commands.executeCommand('spec-kit-bridger.clearCache');
                break;

            case 'createFromTemplate':
                vscode.window.showInformationMessage(`Template Auswahl: ${message.data}`);
                break;

            case 'startTutorial':
                vscode.window.showInformationMessage(`Tutorial gestartet: ${message.data}`);
                break;

            case 'toggleFavorite':
                if (message.data?.id) {
                    await this.toggleFavorite(message.data.id);
                }
                break;

            case 'exportAgents':
                await this.exportAgents(!!message.data?.onlyFavorites);
                break;

            case 'importAgents':
                await this.importAgents();
                break;

            case 'exportAgentAsSsml':
                await this.exportTextAsSsml(message.data?.text ?? '');
                break;
        }
    }

    private async loadAndSendAgents(): Promise<void> {
        try {
            const agents = await loadAgentPrompts(this.context);
            this.agentsCache = agents;
            const favorites = Array.from(this.getFavorites());
            this.panel?.webview.postMessage({ command: 'setAgents', data: { agents, favorites } });
        } catch (err) {
            console.error('Fehler beim Laden der Agents', err);
        }
    }

    private getFavorites(): Set<string> {
        const ids = this.context.globalState.get<string[]>('agentFavorites', []);
        return new Set(ids);
    }

    private async setFavorites(ids: Set<string>): Promise<void> {
        await this.context.globalState.update('agentFavorites', Array.from(ids));
    }

    private async toggleFavorite(id: string): Promise<void> {
        const favs = this.getFavorites();
        if (favs.has(id)) {
            favs.delete(id);
        } else {
            favs.add(id);
        }
        await this.setFavorites(favs);
        // inform webview
        this.panel?.webview.postMessage({ command: 'favoritesUpdated', data: Array.from(favs) });
    }

    private async exportAgents(onlyFavorites: boolean): Promise<void> {
        const favs = this.getFavorites();
        const data = onlyFavorites ? this.agentsCache.filter(a => favs.has(a.id)) : this.agentsCache;
        const uri = await vscode.window.showSaveDialog({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            filters: { JSON: ['json'] },
            saveLabel: 'Agent-Prompts exportieren',
            defaultUri: vscode.Uri.file('agents-export.json')
        });
        if (!uri) {
            return;
        }
        await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify({ agents: data, favorites: Array.from(favs) }, null, 2), 'utf8'));
        vscode.window.showInformationMessage(`Agent-Prompts exportiert: ${uri.fsPath}`);
    }

    private async importAgents(): Promise<void> {
        const pick = await vscode.window.showOpenDialog({ canSelectMany: false, /* eslint-disable-line @typescript-eslint/naming-convention */ filters: { JSON: ['json'] }, openLabel: 'Agent-Prompts importieren' });
        if (!pick || pick.length === 0) {
            return;
        }
        const file = pick[0];
        const buf = await vscode.workspace.fs.readFile(file);
        try {
            const json = JSON.parse(Buffer.from(buf).toString('utf8')) as { agents?: AgentPrompt[]; favorites?: string[] };
            if (Array.isArray(json.agents)) {
                // merge by id
                const map = new Map<string, AgentPrompt>();
                for (const a of this.agentsCache) {
                    map.set(a.id, a);
                }
                for (const a of json.agents) {
                    if (a?.id) {
                        map.set(a.id, a);
                    }
                }
                this.agentsCache = Array.from(map.values());
            }
            if (Array.isArray(json.favorites)) {
                await this.setFavorites(new Set(json.favorites));
            }
            this.panel?.webview.postMessage({ command: 'setAgents', data: { agents: this.agentsCache, favorites: Array.from(this.getFavorites()) } });
            vscode.window.showInformationMessage('Agent-Prompts importiert.');
        } catch {
            vscode.window.showErrorMessage('Import fehlgeschlagen: Ungültiges JSON');
        }
    }

    private async exportTextAsSsml(text: string): Promise<void> {
        if (!text) {
            vscode.window.showWarningMessage('Kein Text zum Exportieren.');
            return;
        }
        const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
        const fmt = cfg.get<'plain' | 'speechmarkdown' | 'ssml'>('tts.inputFormat', 'plain');
        const ssml = toAzureSsml(text, fmt, 'de-DE-KatjaNeural');
        await vscode.env.clipboard.writeText(ssml);
        vscode.window.showInformationMessage('SSML (Azure) in die Zwischenablage kopiert.');
    }

    /**
     * Execute spec-kit command in chat
     */
    private async executeSpecKitCommand(data: { command: string; prompt: string }): Promise<void> {
        // Open chat
        await vscode.commands.executeCommand('workbench.action.chat.open');
        
        // Send command to chat (simulated - in real implementation would need chat API)
        vscode.window.showInformationMessage(
            `Führe aus: @de /${data.command} ${data.prompt}`
        );

        // Copy to clipboard for easy paste
        await vscode.env.clipboard.writeText(`@de /${data.command} ${data.prompt}`);
        
        this.panel?.webview.postMessage({
            command: 'commandExecuted',
            data: { command: data.command }
        });
    }

    /**
     * Insert code snippet
     */
    private async insertCodeSnippet(data: { code: string; language: string }): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Bitte öffne zuerst eine Datei');
            return;
        }

        await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, data.code);
        });

        vscode.window.showInformationMessage('Code-Snippet eingefügt!');
    }

    /**
     * Insert agent prompt as plain text at cursor
     */
    private async insertAgentPrompt(data: { text: string }): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Bitte öffne zuerst eine Datei');
            return;
        }

        const text = data?.text ?? '';
        if (!text) {
            vscode.window.showWarningMessage('Kein Prompt-Text übergeben');
            return;
        }

        await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, text);
        });

        vscode.window.showInformationMessage('Agent-Prompt eingefügt!');
    }

    /**
     * Start guided workflow
     */
    private async startWorkflow(workflowId: string): Promise<void> {
        this.panel?.webview.postMessage({
            command: 'workflowStarted',
            data: { workflowId }
        });
    }

    /**
     * Open documentation
     */
    private async openDocumentation(topic: string): Promise<void> {
        // In real implementation: open specific documentation
        vscode.window.showInformationMessage(`Öffne Dokumentation: ${topic}`);
    }

    /**
     * Generate HTML content for webview
     */
    private getHtmlContent(): string {
        const ttsFormat = vscode.workspace.getConfiguration('spec-kit-bridger').get<'plain' | 'speechmarkdown' | 'ssml'>('tts.inputFormat', 'plain');
        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spec-Kit Command Center</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
            padding: 0;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        
        .tab {
            padding: 10px 20px;
            background: transparent;
            border: none;
            color: var(--vscode-foreground);
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px 4px 0 0;
            transition: all 0.2s;
        }
        
        .tab:hover {
            background: var(--vscode-list-hoverBackground);
        }
        
        .tab.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .command-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .command-card {
            background: var(--vscode-editor-background);
            border: 2px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .command-card:hover {
            border-color: var(--vscode-focusBorder);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .command-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .command-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }
        
        .command-description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .command-example {
            background: var(--vscode-textBlockQuote-background);
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            margin-bottom: 15px;
        }
        
        .command-input {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .command-input input {
            flex: 1;
            padding: 8px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .btn-primary:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .workflow-section {
            margin-bottom: 30px;
        }
        
        .workflow-card {
            background: var(--vscode-editor-background);
            border: 2px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .workflow-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .workflow-icon {
            font-size: 36px;
        }
        
        .workflow-title {
            font-size: 20px;
            font-weight: 600;
        }
        
        .workflow-steps {
            margin-left: 50px;
        }
        
        .workflow-step {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            padding: 10px;
            background: var(--vscode-list-hoverBackground);
            border-radius: 4px;
        }
        
        .step-number {
            width: 30px;
            height: 30px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        
        .snippet-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .snippet-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
        }
        
        .snippet-title {
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .snippet-code {
            background: var(--vscode-textBlockQuote-background);
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            margin-bottom: 10px;
            overflow-x: auto;
        }
        
        .quick-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .quick-action {
            padding: 12px 20px;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        
        .quick-action:hover {
            background: var(--vscode-button-secondaryHoverBackground);
            transform: translateY(-1px);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-button-background);
        }
        
        .stat-label {
            color: var(--vscode-descriptionForeground);
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Spec-Kit Command Center</h1>
        <p>Deine deutsche Zentrale für effizientes Arbeiten mit VS Code und spec-kit</p>
    </div>
    
    <div class="container">
        <!-- Quick Actions -->
        <div class="quick-actions">
            <button class="quick-action" onclick="openChat()">
                💬 Chat öffnen
            </button>
            <button class="quick-action" onclick="openSettings()">
                ⚙️ Einstellungen
            </button>
            <button class="quick-action" onclick="showStats()">
                📊 Statistiken
            </button>
            <button class="quick-action" onclick="clearCache()">
                🗑️ Cache leeren
            </button>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid" id="statsGrid" style="display: none;">
            <div class="stat-card">
                <div class="stat-value">🧪</div>
                <div class="stat-label">Aktueller Provider: Mock</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">247</div>
                <div class="stat-label">Übersetzte Zeilen heute</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">12</div>
                <div class="stat-label">Gespeicherte Snippets</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">98%</div>
                <div class="stat-label">Cache Hit Rate</div>
            </div>
        </div>
        
        <!-- Tabs -->
        <div class="tabs">
            <button class="tab active" onclick="switchTab('commands')">
                🎯 Commands
            </button>
            <button class="tab" onclick="switchTab('workflows')">
                🔄 Workflows
            </button>
            <button class="tab" onclick="switchTab('snippets')">
                📝 Snippets
            </button>
            <button class="tab" onclick="switchTab('templates')">
                📦 Templates
            </button>
            <button class="tab" onclick="switchTab('learning')">
                📚 Lernen
            </button>
            <button class="tab" onclick="switchTab('agents')">
                🧠 Agents
            </button>
        </div>
        
        <!-- Commands Tab -->
        <div class="tab-content active" id="commands-tab">
            <h2 style="margin-bottom: 20px;">🎯 Spec-Kit Commands - Auf Deutsch erklärt</h2>
            
            <div class="command-grid">
                <div class="command-card">
                    <div class="command-icon">📋</div>
                    <div class="command-name">/plan</div>
                    <div class="command-description">
                        Erstelle einen detaillierten Implementierungsplan für deine Idee
                    </div>
                    <div class="command-example">
                        @de /plan REST-API für Benutzerverwaltung
                    </div>
                    <div class="command-input">
                        <input type="text" id="plan-input" placeholder="Was möchtest du planen?">
                        <button class="btn btn-primary" onclick="executeCommand('plan')">
                            Ausführen
                        </button>
                    </div>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">⚡</div>
                    <div class="command-name">/implement</div>
                    <div class="command-description">
                        Generiere Code für deine Anforderungen
                    </div>
                    <div class="command-example">
                        @de /implement JWT-Authentifizierung
                    </div>
                    <div class="command-input">
                        <input type="text" id="implement-input" placeholder="Was soll implementiert werden?">
                        <button class="btn btn-primary" onclick="executeCommand('implement')">
                            Ausführen
                        </button>
                    </div>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">🔍</div>
                    <div class="command-name">/review</div>
                    <div class="command-description">
                        Lass deinen Code überprüfen und verbessern
                    </div>
                    <div class="command-example">
                        @de /review diese Login-Funktion
                    </div>
                    <div class="command-input">
                        <input type="text" id="review-input" placeholder="Was soll überprüft werden?">
                        <button class="btn btn-primary" onclick="executeCommand('review')">
                            Ausführen
                        </button>
                    </div>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">🐛</div>
                    <div class="command-name">/debug</div>
                    <div class="command-description">
                        Finde und behebe Fehler in deinem Code
                    </div>
                    <div class="command-example">
                        @de /debug Warum funktioniert X nicht?
                    </div>
                    <div class="command-input">
                        <input type="text" id="debug-input" placeholder="Welches Problem hast du?">
                        <button class="btn btn-primary" onclick="executeCommand('debug')">
                            Ausführen
                        </button>
                    </div>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">🧪</div>
                    <div class="command-name">/test</div>
                    <div class="command-description">
                        Erstelle Tests für deinen Code
                    </div>
                    <div class="command-example">
                        @de /test Unit-Tests für UserService
                    </div>
                    <div class="command-input">
                        <input type="text" id="test-input" placeholder="Wofür brauchst du Tests?">
                        <button class="btn btn-primary" onclick="executeCommand('test')">
                            Ausführen
                        </button>
                    </div>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">📚</div>
                    <div class="command-name">/docs</div>
                    <div class="command-description">
                        Generiere Dokumentation für deinen Code
                    </div>
                    <div class="command-example">
                        @de /docs API-Dokumentation erstellen
                    </div>
                    <div class="command-input">
                        <input type="text" id="docs-input" placeholder="Was soll dokumentiert werden?">
                        <button class="btn btn-primary" onclick="executeCommand('docs')">
                            Ausführen
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Workflows Tab -->
        <div class="tab-content" id="workflows-tab">
            <h2 style="margin-bottom: 20px;">🔄 Geführte Workflows</h2>
            
            <div class="workflow-section">
                <div class="workflow-card">
                    <div class="workflow-header">
                        <div class="workflow-icon">🚀</div>
                        <div>
                            <div class="workflow-title">Neues Projekt starten</div>
                            <div class="command-description">Schritt-für-Schritt Anleitung für ein neues Projekt</div>
                        </div>
                    </div>
                    <div class="workflow-steps">
                        <div class="workflow-step">
                            <div class="step-number">1</div>
                            <div>Projekttyp auswählen (Web-App, API, CLI-Tool)</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">2</div>
                            <div>Framework und Technologien festlegen</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">3</div>
                            <div>Projektstruktur generieren lassen</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">4</div>
                            <div>Basis-Implementierung erstellen</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="startWorkflow('new-project')">
                        Workflow starten
                    </button>
                </div>
                
                <div class="workflow-card">
                    <div class="workflow-header">
                        <div class="workflow-icon">🔌</div>
                        <div>
                            <div class="workflow-title">REST-API entwickeln</div>
                            <div class="command-description">Von der Planung bis zur Dokumentation</div>
                        </div>
                    </div>
                    <div class="workflow-steps">
                        <div class="workflow-step">
                            <div class="step-number">1</div>
                            <div>API-Endpunkte planen</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">2</div>
                            <div>Datenmodelle definieren</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">3</div>
                            <div>Controller implementieren</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">4</div>
                            <div>Tests schreiben</div>
                        </div>
                        <div class="workflow-step">
                            <div class="step-number">5</div>
                            <div>API-Dokumentation generieren</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="startWorkflow('rest-api')">
                        Workflow starten
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Snippets Tab -->
        <div class="tab-content" id="snippets-tab">
            <h2 style="margin-bottom: 20px;">📝 Code Snippets</h2>
            
            <div class="snippet-grid">
                <div class="snippet-card">
                    <div class="snippet-title">Express Server Setup</div>
                    <div class="snippet-code">
const express = require('express');
const app = express();
app.use(express.json());
app.listen(3000);
                    </div>
                    <button class="btn btn-primary" onclick="insertSnippet('express-setup')">
                        Einfügen
                    </button>
                </div>
                
                <div class="snippet-card">
                    <div class="snippet-title">JWT Middleware</div>
                    <div class="snippet-code">
const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next) {
  // Token validation
}
                    </div>
                    <button class="btn btn-primary" onclick="insertSnippet('jwt-middleware')">
                        Einfügen
                    </button>
                </div>
                
                <div class="snippet-card">
                    <div class="snippet-title">React Component</div>
                    <div class="snippet-code">
import React from 'react';
const Component = () => {
  return <div>Hello</div>;
};
                    </div>
                    <button class="btn btn-primary" onclick="insertSnippet('react-component')">
                        Einfügen
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Templates Tab -->
        <div class="tab-content" id="templates-tab">
            <h2 style="margin-bottom: 20px;">📦 Projekt Templates</h2>
            
            <div class="command-grid">
                <div class="command-card">
                    <div class="command-icon">⚛️</div>
                    <div class="command-name">React + TypeScript</div>
                    <div class="command-description">
                        Moderne React-App mit TypeScript, Vite und Testing
                    </div>
                    <button class="btn btn-primary" onclick="createFromTemplate('react-ts')">
                        Projekt erstellen
                    </button>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">🟢</div>
                    <div class="command-name">Node.js API</div>
                    <div class="command-description">
                        Express API mit MongoDB, JWT Auth und Tests
                    </div>
                    <button class="btn btn-primary" onclick="createFromTemplate('node-api')">
                        Projekt erstellen
                    </button>
                </div>
                
                <div class="command-card">
                    <div class="command-icon">🔷</div>
                    <div class="command-name">Next.js Full-Stack</div>
                    <div class="command-description">
                        Next.js 14 mit App Router, Prisma und tRPC
                    </div>
                    <button class="btn btn-primary" onclick="createFromTemplate('nextjs-fullstack')">
                        Projekt erstellen
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Learning Tab -->
        <div class="tab-content" id="learning-tab">
            <h2 style="margin-bottom: 20px;">📚 Interaktives Lernen</h2>
            
            <div class="workflow-section">
                <div class="workflow-card">
                    <div class="workflow-header">
                        <div class="workflow-icon">🎓</div>
                        <div>
                            <div class="workflow-title">spec-kit Grundlagen</div>
                            <div class="command-description">Lerne die Basics in 10 Minuten</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="startTutorial('basics')">
                        Tutorial starten
                    </button>
                </div>
                
                <div class="workflow-card">
                    <div class="workflow-header">
                        <div class="workflow-icon">🚀</div>
                        <div>
                            <div class="workflow-title">Fortgeschrittene Techniken</div>
                            <div class="command-description">Nutze spec-kit wie ein Profi</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="startTutorial('advanced')">
                        Tutorial starten
                    </button>
                </div>
            </div>
        </div>

        <!-- Agents Tab -->
        <div class="tab-content" id="agents-tab">
            <h2 style="margin-bottom: 20px;">🧠 Agent Prompt Library</h2>
            <p class="command-description" style="margin-bottom: 15px;">Kuratiertes Set an Rollen-Prompts. Kopiere in den Chat oder füge in den Editor ein.</p>

            <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <input id="agent-search" type="text" placeholder="Suchen…" style="flex:1; padding:8px 12px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px;" oninput="renderAgents()" />
                <select id="agent-category" style="padding:8px 12px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px;" onchange="renderAgents()">
                    <option value="">Alle Kategorien</option>
                    <option>Product</option>
                    <option>Growth</option>
                    <option>Research</option>
                    <option>Revenue</option>
                    <option>Analytics</option>
                    <option>Architecture</option>
                    <option>Code</option>
                    <option>Backend</option>
                    <option>Database</option>
                </select>
                <label style="display:flex; align-items:center; gap:6px; user-select:none;">
                    <input id="only-favorites" type="checkbox" onchange="renderAgents()" /> Nur Favoriten
                </label>
                <button class="btn" onclick="exportAgents()">⬇️ Export</button>
                <button class="btn" onclick="importAgents()">⬆️ Import</button>
            </div>

            <div style="display:flex; gap:8px; margin: 6px 0 14px 0; align-items:center;">
                <button class="btn" onclick="pauseSpeak()">⏸️ Pause</button>
                <button class="btn" onclick="stopSpeak()">⏹️ Stop</button>
            </div>
            <div id="agent-grid" class="command-grid"></div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        const TTS_FORMAT = ${JSON.stringify(ttsFormat)};
        function preprocessForTts(text) {
            try {
                if (TTS_FORMAT === 'speechmarkdown') {
                    return text
                        .replace(/\\:[a-zA-Z-]+\\([^)]*\\)/g, '')
                        .replace(/\\[[^\\]]+\\]/g, '')
                        .replace(/\\{[^}]+\\}/g, '')
                        .replace(/\\s+/g, ' ')
                        .trim();
                }
            } catch {}
            return text;
        }
        
        // Tab switching
        function switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            event.target.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        }
        
        // Execute command
        function executeCommand(command) {
            const input = document.getElementById(command + '-input');
            const prompt = input.value;
            
            if (!prompt) {
                alert('Bitte gib einen Text ein');
                return;
            }
            
            vscode.postMessage({
                command: 'executeCommand',
                data: { command, prompt }
            });
            
            input.value = '';
        }
        
        // Open chat
        function openChat() {
            vscode.postMessage({ command: 'openChat' });
        }
        
        // Open settings
        function openSettings() {
            vscode.postMessage({ command: 'openSettings' });
        }
        
        // Show stats
        function showStats() {
            const statsGrid = document.getElementById('statsGrid');
            statsGrid.style.display = statsGrid.style.display === 'none' ? 'grid' : 'none';
        }
        
        // Clear cache
        function clearCache() {
            if (confirm('Cache wirklich leeren?')) {
                vscode.postMessage({ command: 'clearCache' });
            }
        }
        
        // Start workflow
        function startWorkflow(workflowId) {
            vscode.postMessage({
                command: 'startWorkflow',
                data: workflowId
            });
        }
        
        // Insert snippet
        function insertSnippet(snippetId) {
            const snippets = {
                'express-setup': {
                    code: \`const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: 'Server läuft!' });
});

app.listen(PORT, () => {
    console.log(\\\`Server läuft auf Port \\\${PORT}\\\`);
});\`,
                    language: 'javascript'
                },
                'jwt-middleware': {
                    code: \`const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Kein Token vorhanden' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Ungültiger Token' });
    }
}\`,
                    language: 'javascript'
                },
                'react-component': {
                    code: \`import React, { useState, useEffect } from 'react';

interface ComponentProps {
    title: string;
    onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // Component lifecycle
    }, []);
    
    return (
        <div className="component">
            <h2>{title}</h2>
            <button onClick={onAction}>Action</button>
        </div>
    );
};

export default Component;\`,
                    language: 'typescript'
                }
            };
            
            const snippet = snippets[snippetId];
            if (snippet) {
                vscode.postMessage({
                    command: 'insertSnippet',
                    data: snippet
                });
            }
        }
        
        // Create from template
        function createFromTemplate(templateId) {
            vscode.postMessage({
                command: 'createFromTemplate',
                data: templateId
            });
        }
        
        // Start tutorial
        function startTutorial(tutorialId) {
            vscode.postMessage({
                command: 'startTutorial',
                data: tutorialId
            });
        }
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'commandExecuted':
                    console.log('Command executed:', message.data);
                    break;
                case 'workflowStarted':
                    console.log('Workflow started:', message.data);
                    break;
                case 'setAgents':
                    setAgentsFromExtension(message.data);
                    break;
                case 'favoritesUpdated':
                    setFavoritesFromExtension(message.data);
                    break;
            }
        });

    // ===== Agents Tab Logic =====
    let agents = [
            {
                id: 'product-strategist',
                name: 'Product Strategist',
                category: 'Product',
                description: 'Definiert Produktvision, Roadmap und Prioritäten.',
                prompt: \`You are a Product Strategist. Your job is to identify the highest-impact opportunities and help the team focus. Deliver:

1) Clear problem definition and target user
2) Strategic priorities (RICE or similar)
3) Lean roadmap with milestones
4) Risks and unknowns
5) Decision log and next steps

Ask me 3 questions to calibrate, then propose a concrete plan.\`
            },
            {
                id: 'growth-engineer',
                name: 'Growth Engineer',
                category: 'Growth',
                description: 'Findet Wachstumshebel, baut schnelle Experimente.',
                prompt: \`You are a Growth Engineer. Your job is to identify leverage points (acquisition, activation, retention, referral, revenue) and ship experiments.

Deliver a proposal with:
- Hypothesis and metric
- Experiment design (MVP)
- Implementation steps
- Expected impact and guardrails

Start with 2-3 experiments ranked by ROI.\`
            },
            {
                id: 'user-researcher',
                name: 'User Researcher',
                category: 'Research',
                description: 'Plant Studien und Interviews, extrahiert Insights.',
                prompt: \`You are a User Researcher. Design a research plan to reduce uncertainty about user needs and behavior.

Include:
- Research goals and hypotheses
- Methods (interviews, surveys, usability tests)
- Recruiting criteria and script
- Synthesis framework (affinity map, JTBD, etc.)

Provide a one-pager I can execute this week.\`
            },
            {
                id: 'revenue-optimizer',
                name: 'Revenue Optimizer',
                category: 'Revenue',
                description: 'Monetarisierung, Pricing und Packeting optimieren.',
                prompt: \`You are a Revenue Optimizer. Analyze pricing, packaging, and monetization models.

Deliver:
- Current state and constraints
- 2-3 pricing/packaging options
- Experiment plan to validate willingness to pay
- Rollout risks and fallback

Use real-world examples when relevant.\`
            },
            {
                id: 'market-analyst',
                name: 'Market Analyst',
                category: 'Analytics',
                description: 'Markt, Segmente und Positionierung analysieren.',
                prompt: \`You are a Market Analyst. Map the competitive landscape and positioning.

Deliver a concise brief:
- Market map and key segments
- Competitor table (features, pricing, differentiators)
- Opportunities and threats
- Positioning statement and wedge strategy.\`
            },
            {
                id: 'system-architect',
                name: 'System Architect',
                category: 'Architecture',
                description: 'Entwirft skalierbare System- und Integrationsarchitektur.',
                prompt: \`You are a System Architect. Design a scalable architecture with clear boundaries and interfaces.

Deliver:
- Context diagram and core components
- Data flows and contracts
- Scaling and resilience approach
- Risks and tradeoffs

Keep it pragmatic and implementation-ready.\`
            },
            {
                id: 'code-refactorer',
                name: 'Code Refactorer',
                category: 'Code',
                description: 'Verbessert Struktur, Lesbarkeit und Tests.',
                prompt: \`You are a Code Refactorer. Improve structure, readability, and testability without changing behavior.

Process:
1) Identify smells and risks
2) Propose refactor steps (small, safe)
3) Add/adjust tests
4) Show before/after snippets

Guardrails: preserve public API, avoid over-engineering.\`
            },
            {
                id: 'api-builder',
                name: 'API Builder',
                category: 'Backend',
                description: 'Entwirft klare, robuste API-Contracts.',
                prompt: \`You are an API Builder. Define clean, versioned API contracts and minimal implementation.

Deliver:
- Endpoint list with methods
- Request/response schemas
- Error model and pagination
- Example requests/tests

Bias for simplicity and consistency.\`
            },
            {
                id: 'database-expert',
                name: 'Database Expert',
                category: 'Database',
                description: 'Modelliert Daten, Indizes und Migrationsstrategie.',
                prompt: \`You are a Database Expert. Design a schema that balances correctness and performance.

Deliver:
- ER diagram (textual) and key tables
- Indexing strategy
- Migration plan and rollback
- Data retention and privacy notes.\`
            }
        ];

        let favorites = new Set();

        function renderAgents() {
            const grid = document.getElementById('agent-grid');
            if (!grid) return;
            const qEl = document.getElementById('agent-search');
            const q = qEl && qEl.value ? qEl.value.toLowerCase() : '';
            const catEl = document.getElementById('agent-category');
            const cat = catEl && catEl.value ? catEl.value : '';
            const onlyFavsEl = document.getElementById('only-favorites');
            const onlyFavs = !!(onlyFavsEl && onlyFavsEl.checked);
            const filtered = agents.filter(a =>
                (!q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) &&
                (!cat || a.category === cat) &&
                (!onlyFavs || favorites.has(a.id))
            );
            grid.innerHTML = filtered.map(function(a) {
                const isFav = favorites.has(a.id);
                return '<div class="command-card">'
                    + '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">'
                        + '<div class="command-icon">🧩</div>'
                        + '<button title="Favorit umschalten" class="btn" data-id="' + a.id + '" onclick="toggleFavorite(this.dataset.id)">' + (isFav ? '★' : '☆') + '</button>'
                    + '</div>'
                    + '<div class="command-name">' + a.name + (isFav ? ' <span title="Favorit">★</span>' : '') + '</div>'
                    + '<div class="command-description" style="margin-bottom:10px;">Kategorie: ' + a.category + '</div>'
                    + '<div class="command-description">' + a.description + '</div>'
                    + '<div style="display:flex; gap:10px; margin-top:15px; flex-wrap: wrap;">'
                        + '<button class="btn btn-primary" data-id="' + a.id + '" onclick="copyAgentPrompt(this.dataset.id)">In Chat kopieren</button>'
                        + '<button class="btn" data-id="' + a.id + '" onclick="insertAgentPrompt(this.dataset.id)">In Editor einfügen</button>'
                        + '<button class="btn" data-id="' + a.id + '" onclick="openInChat(this.dataset.id)">→ Chat</button>'
                        + '<button class="btn" data-id="' + a.id + '" onclick="speakAgent(this.dataset.id)">🔊 Vorlesen</button>'
                        + '<button class="btn" data-id="' + a.id + '" onclick="exportAgentAsSsml(this.dataset.id)">🗣️ Als SSML kopieren</button>'
                    + '</div>'
                + '</div>';
            }).join('');
        }

        function copyAgentPrompt(id) {
            const agent = agents.find(a => a.id === id);
            if (!agent) return;
            vscode.postMessage({ command: 'copyAgentPrompt', data: { text: agent.prompt } });
        }

        function insertAgentPrompt(id) {
            const agent = agents.find(a => a.id === id);
            if (!agent) return;
            vscode.postMessage({ command: 'insertAgentPrompt', data: { text: agent.prompt } });
        }

        function openInChat(id) {
            const agent = agents.find(a => a.id === id);
            if (!agent) return;
            vscode.postMessage({ command: 'openChat' });
            vscode.postMessage({ command: 'copyAgentPrompt', data: { text: agent.prompt } });
        }

        function speakAgent(id) {
            const agent = agents.find(a => a.id === id);
            if (!agent) return;
            speakText(agent.prompt);
        }

        function exportAgentAsSsml(id) {
            const agent = agents.find(a => a.id === id);
            if (!agent) return;
            vscode.postMessage({ command: 'exportAgentAsSsml', data: { text: agent.prompt } });
        }

        // Speech helpers (Deutsch)
        function speakText(text) {
            try { speechSynthesis.cancel(); } catch (e) {}
            const u = new SpeechSynthesisUtterance(preprocessForTts(text));
            u.lang = 'de-DE';
            speechSynthesis.speak(u);
        }
        function pauseSpeak() { try { speechSynthesis.pause(); } catch (e) {} }
        function stopSpeak() { try { speechSynthesis.cancel(); } catch (e) {} }

        // Merge loaded agents from extension
        function setAgentsFromExtension(payload) {
            // payload can be either an array of agents or an object { agents, favorites }
            let incomingAgents = [];
            let incomingFavs = [];
            if (Array.isArray(payload)) {
                incomingAgents = payload;
            } else if (payload && Array.isArray(payload.agents)) {
                incomingAgents = payload.agents;
                if (Array.isArray(payload.favorites)) {
                    incomingFavs = payload.favorites;
                }
            }
            const map = new Map();
            for (const a of agents) map.set(a.id, a);
            for (const a of incomingAgents) if (a && a.id) map.set(a.id, a);
            agents = Array.from(map.values());
            if (incomingFavs.length) {
                favorites = new Set(incomingFavs);
            }
            renderAgents();
        }

        function setFavoritesFromExtension(ids) {
            if (Array.isArray(ids)) {
                favorites = new Set(ids);
                renderAgents();
            }
        }

        function toggleFavorite(id) {
            vscode.postMessage({ command: 'toggleFavorite', data: { id } });
        }

        function exportAgents() {
            const onlyFavsEl = document.getElementById('only-favorites');
            const onlyFavorites = !!(onlyFavsEl && onlyFavsEl.checked);
            vscode.postMessage({ command: 'exportAgents', data: { onlyFavorites } });
        }

        function importAgents() {
            vscode.postMessage({ command: 'importAgents' });
        }

        // First render then request agents from extension
        setTimeout(function() {
            renderAgents();
            vscode.postMessage({ command: 'requestAgents' });
        }, 0);
    </script>
</body>
</html>`;
    }
}