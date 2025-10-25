import * as vscode from 'vscode';
import { TranslationService } from '../translation/TranslationService';
import { TranslationCache } from '../translation/TranslationCache';
import { toAzureSsml } from '../tts/speechMarkdown';

export class DocumentationView {
    private panel: vscode.WebviewPanel | undefined;
    private currentMode: 'english' | 'german' | 'parallel' | 'tts' = 'german';

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly translationService: TranslationService,
        private readonly cache: TranslationCache
    ) {
        // Lade gespeicherten Modus
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        this.currentMode = config.get<'english' | 'german' | 'parallel' | 'tts'>('documentationMode', 'german');
    }

    async show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'specKitDocs',
            'Spec-Kit Dokumentation',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = await this.getWebviewContent();

        // Message-Handling
        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'switchMode':
                        this.currentMode = message.mode;
                        await this.refresh();
                        break;
                    case 'loadPage':
                        await this.loadPage(message.url);
                        break;
                    case 'exportAsSsml':
                        await this.exportAsSsml(typeof message.text === 'string' ? message.text : '');
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Lade Initial-Content
        await this.loadDefaultPage();
    }

    async refresh() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.html = await this.getWebviewContent();
        await this.loadDefaultPage();
    }

    private async loadDefaultPage() {
        // Lade spec-kit README von GitHub
        await this.loadPage('https://github.com/microsoft/vscode-copilot-release/blob/main/README.md');
    }

    private async loadPage(url: string) {
        try {
            // Hole Content von GitHub (vereinfacht - in Produktion GitHub API nutzen)
            const content = await this.fetchGitHubContent(url);
            
            // Rendere basierend auf Modus
            let html = '';
            switch (this.currentMode) {
                case 'english':
                    html = this.renderEnglish(content);
                    break;
                case 'german':
                    this.panel?.webview.postMessage({ command: 'updateContent', html: '<p>Übersetze…</p>' });
                    html = await this.renderGerman(content);
                    break;
                case 'parallel':
                    this.panel?.webview.postMessage({ command: 'updateContent', html: '<p>Übersetze…</p>' });
                    html = await this.renderParallel(content);
                    break;
                case 'tts':
                    this.panel?.webview.postMessage({ command: 'updateContent', html: '<p>Übersetze…</p>' });
                    html = await this.renderTTS(content);
                    break;
            }

            this.panel?.webview.postMessage({
                command: 'updateContent',
                html: html
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Fehler beim Laden: ${error}`);
        }
    }

    private async fetchGitHubContent(_url: string): Promise<string> {
        // Placeholder - wird in Phase 3 mit GitHub API implementiert
        return `# Spec-Kit Documentation

## Welcome to Spec-Kit

Spec-Kit is a powerful extension for GitHub Copilot that helps you write better specifications.

### Features

- **Plan Mode**: Create detailed implementation plans
- **Implement Mode**: Generate code from specifications
- **Review Mode**: Review code against specifications
- **Debug Mode**: Debug with specification context

### Getting Started

1. Install spec-kit extension
2. Open GitHub Copilot Chat
3. Use \`@spec-kit\` to interact

\`\`\`typescript
// Example: Create a plan
@spec-kit /plan Create a REST API for user management
\`\`\`

### Commands

- \`/plan\` - Create implementation plan
- \`/implement\` - Implement from specification
- \`/review\` - Review code
- \`/debug\` - Debug with context
`;
    }

    private renderEnglish(markdown: string): string {
        return this.markdownToHtml(markdown);
    }

    private async renderGerman(markdown: string): Promise<string> {
        // Übersetze Markdown nach Deutsch
        const result = await this.translationService.translate(markdown, {
            targetLang: 'DE',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        return this.markdownToHtml(result.text);
    }

    private async renderParallel(markdown: string): Promise<string> {
        const result = await this.translationService.translate(markdown, {
            targetLang: 'DE',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        const englishHtml = this.markdownToHtml(markdown);
        const germanHtml = this.markdownToHtml(result.text);

        return `
            <div class="parallel-container">
                <div class="parallel-column">
                    <h2>🇬🇧 English</h2>
                    ${englishHtml}
                </div>
                <div class="parallel-column">
                    <h2>🇩🇪 Deutsch</h2>
                    ${germanHtml}
                </div>
            </div>
        `;
    }

    private async renderTTS(markdown: string): Promise<string> {
        const result = await this.translationService.translate(markdown, {
            targetLang: 'DE',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        const html = this.markdownToHtml(result.text);

        return `
            <div class="tts-container">
                <div class="tts-controls">
                    <button onclick="speakContent()">🔊 Vorlesen</button>
                    <button onclick="copyAsSsml()">🗣️ Als SSML kopieren</button>
                    <button onclick="pauseSpeech()">⏸️ Pause</button>
                    <button onclick="stopSpeech()">⏹️ Stop</button>
                </div>
                <div class="tts-content">
                    ${html}
                </div>
            </div>
        `;
    }

    private markdownToHtml(markdown: string): string {
        // Vereinfachte Markdown-Konvertierung
        // In Produktion: markdown-it Library verwenden
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replaceAll(/^- (.*$)/gim, '<li>$1</li>')
            .replaceAll(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replaceAll('\n', '<br>');
    }

    private async getWebviewContent(): Promise<string> {
        const nonce = this.getNonce();
        const ttsFormat = vscode.workspace.getConfiguration('spec-kit-bridger').get<'plain' | 'speechmarkdown' | 'ssml'>('tts.inputFormat', 'plain');

        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Spec-Kit Dokumentation</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }
        .mode-switcher {
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            background: var(--vscode-editor-background);
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        .mode-button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .mode-button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .mode-button.active {
            background: var(--vscode-button-secondaryBackground);
        }
        .content {
            max-width: 900px;
            margin: 60px auto 0;
        }
        .parallel-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .parallel-column {
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 5px;
        }
        .tts-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        pre {
            background: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            background: var(--vscode-textBlockQuote-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }
        h1, h2, h3 {
            margin-top: 24px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="mode-switcher">
        <button class="mode-button" onclick="switchMode('english')">🇬🇧 EN</button>
        <button class="mode-button active" onclick="switchMode('german')">🇩🇪 DE</button>
        <button class="mode-button" onclick="switchMode('parallel')">⚖️ Parallel</button>
        <button class="mode-button" onclick="switchMode('tts')">🔊 TTS</button>
    </div>
    
    <div class="content" id="content">
        <p>Dokumentation wird geladen...</p>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let currentMode = '${this.currentMode}';
        const TTS_FORMAT = ${JSON.stringify(ttsFormat)};

        function preprocessForTts(text) {
            try {
                if (TTS_FORMAT === 'speechmarkdown') {
                    // Minimaler Fallback: Speech Markdown Markup grob entfernen
                    return text
                        .replace(/\\:[a-zA-Z-]+\\([^)]*\\)/g, '') // :mark(x)
                        .replace(/\\[[^\\]]+\\]/g, '')            // [word]
                        .replace(/\\{[^}]+\\}/g, '')              // {options}
                        .replace(/\\s+/g, ' ')                    // Whitespace komprimieren
                        .trim();
                }
            } catch {}
            return text;
        }

        function switchMode(mode) {
            currentMode = mode;
            updateActiveButton(mode);
            vscode.postMessage({
                command: 'switchMode',
                mode: mode
            });
        }

        function updateActiveButton(mode) {
            document.querySelectorAll('.mode-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(\`button[onclick="switchMode('\${mode}')"]\`)?.classList.add('active');
        }

        function speakContent() {
            const text = document.getElementById('content').innerText;
            const utterance = new SpeechSynthesisUtterance(preprocessForTts(text));
            utterance.lang = 'de-DE';
            speechSynthesis.speak(utterance);
        }

        function copyAsSsml() {
            const text = document.getElementById('content').innerText;
            vscode.postMessage({ command: 'exportAsSsml', text });
        }

        function pauseSpeech() {
            speechSynthesis.pause();
        }

        function stopSpeech() {
            speechSynthesis.cancel();
        }

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateContent':
                    document.getElementById('content').innerHTML = message.html;
                    break;
            }
        });

        // Initial active button setzen
        updateActiveButton(currentMode);
    </script>
</body>
</html>`;
    }

    private async exportAsSsml(text: string): Promise<void> {
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

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
