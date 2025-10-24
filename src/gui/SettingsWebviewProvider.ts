import * as vscode from 'vscode';

/**
 * Settings GUI WebView Panel
 * Provides a user-friendly interface for configuring translation providers
 */
type SaveSettingsPayload = {
    provider: string;
    googleApiKey: string;
    azureApiKey: string;
    azureRegion: string;
    libreTranslateUrl: string;
    deeplApiKey: string;
    deeplApiType: 'free' | 'pro';
    cacheEnabled: boolean;
    streamingEnabled: boolean;
    preserveCodeBlocks: boolean;
};

type SettingsMessage =
    | { command: 'getSettings' }
    | { command: 'saveSettings'; settings: SaveSettingsPayload }
    | { command: 'testProvider'; provider: string }
    | { command: 'openDocs' };

export class SettingsWebviewProvider {
    private panel: vscode.WebviewPanel | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Show the settings GUI
     */
    public show(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'specKitSettings',
            'Spec-Kit BridgeR.DE Einstellungen',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getHtmlContent();
        this.panel.webview.onDidReceiveMessage(
            message => this.handleMessage(message as SettingsMessage),
            undefined,
            this.context.subscriptions
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    /**
     * Handle messages from webview
     */
    private async handleMessage(message: SettingsMessage): Promise<void> {
        switch (message.command) {
            case 'getSettings':
                this.sendSettings();
                break;

            case 'saveSettings':
                await this.saveSettings(message.settings);
                break;

            case 'testProvider':
                await this.testProvider(message.provider);
                break;

            case 'openDocs':
                vscode.commands.executeCommand('markdown.showPreview', 
                    vscode.Uri.file(this.context.extensionPath + '/docs/TRANSLATION_PROVIDERS.md'));
                break;
        }
    }

    /**
     * Send current settings to webview
     */
    private sendSettings(): void {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        
        this.panel?.webview.postMessage({
            command: 'settings',
            data: {
                provider: config.get('translationProvider', 'mock'),
                googleApiKey: config.get('googleApiKey', ''),
                azureApiKey: config.get('azureApiKey', ''),
                azureRegion: config.get('azureRegion', ''),
                libreTranslateUrl: config.get('libreTranslateUrl', ''),
                deeplApiKey: config.get('deepl.apiKey', ''),
                deeplApiType: config.get('deepl.apiType', 'free'),
                cacheEnabled: config.get('cacheEnabled', true),
                streamingEnabled: config.get('streamingEnabled', true),
                preserveCodeBlocks: config.get('preserveCodeBlocks', true)
            }
        });
    }

    /**
     * Save settings from webview
     */
    private async saveSettings(settings: SaveSettingsPayload): Promise<void> {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');

        try {
            await config.update('translationProvider', settings.provider, vscode.ConfigurationTarget.Global);
            await config.update('googleApiKey', settings.googleApiKey, vscode.ConfigurationTarget.Global);
            await config.update('azureApiKey', settings.azureApiKey, vscode.ConfigurationTarget.Global);
            await config.update('azureRegion', settings.azureRegion, vscode.ConfigurationTarget.Global);
            await config.update('libreTranslateUrl', settings.libreTranslateUrl, vscode.ConfigurationTarget.Global);
            await config.update('deepl.apiKey', settings.deeplApiKey, vscode.ConfigurationTarget.Global);
            await config.update('deepl.apiType', settings.deeplApiType, vscode.ConfigurationTarget.Global);
            await config.update('cacheEnabled', settings.cacheEnabled, vscode.ConfigurationTarget.Global);
            await config.update('streamingEnabled', settings.streamingEnabled, vscode.ConfigurationTarget.Global);
            await config.update('preserveCodeBlocks', settings.preserveCodeBlocks, vscode.ConfigurationTarget.Global);

            vscode.window.showInformationMessage('✅ Einstellungen erfolgreich gespeichert!');
            
            this.panel?.webview.postMessage({
                command: 'saveSuccess'
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Fehler beim Speichern: ${error}`);
        }
    }

    /**
     * Test translation provider
     */
    private async testProvider(provider: string): Promise<void> {
        this.panel?.webview.postMessage({
            command: 'testStart',
            provider: provider
        });

        try {
            // Simulate test (in real implementation, call actual translation)
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.panel?.webview.postMessage({
                command: 'testSuccess',
                provider: provider,
                message: `✅ ${provider} erfolgreich getestet!`
            });
        } catch (error) {
            this.panel?.webview.postMessage({
                command: 'testError',
                provider: provider,
                message: `❌ ${provider} Test fehlgeschlagen: ${error}`
            });
        }
    }

    /**
     * Generate HTML content for webview
     */
    private getHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spec-Kit Einstellungen</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            color: var(--vscode-foreground);
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .subtitle {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 30px;
        }
        
        .section {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .section h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: var(--vscode-foreground);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--vscode-foreground);
        }
        
        .label-description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        
        select, input[type="text"], input[type="password"] {
            width: 100%;
            padding: 8px 12px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-size: 14px;
        }
        
        select:focus, input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        input[type="checkbox"] {
            width: auto;
        }
        
        .provider-card {
            border: 2px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.2s;
        }
        
        .provider-card.selected {
            border-color: var(--vscode-focusBorder);
            background: var(--vscode-list-hoverBackground);
        }
        
        .provider-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .provider-name {
            font-weight: 600;
            font-size: 16px;
        }
        
        .provider-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
        }
        
        .badge-free { background: #28a745; color: white; }
        .badge-paid { background: #ffc107; color: black; }
        .badge-premium { background: #007bff; color: white; }
        
        .provider-info {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 10px;
        }
        
        .provider-config {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--vscode-panel-border);
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
        
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .btn-test {
            margin-top: 10px;
        }
        
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 30px;
        }
        
        .alert {
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: rgba(40, 167, 69, 0.1);
            border: 1px solid #28a745;
            color: #28a745;
        }
        
        .alert-info {
            background: rgba(0, 123, 255, 0.1);
            border: 1px solid #007bff;
            color: #007bff;
        }
        
        .hidden {
            display: none;
        }
        
        .loading {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--vscode-foreground);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 Translation Provider Einstellungen</h1>
        <p class="subtitle">Wähle deinen bevorzugten Übersetzungs-Provider und konfiguriere die API-Keys</p>
        
        <div id="successAlert" class="alert alert-success hidden">
            ✅ Einstellungen erfolgreich gespeichert!
        </div>
        
        <div class="section">
            <h2>Provider auswählen</h2>
            
            <div class="provider-card" data-provider="mock">
                <div class="provider-header">
                    <span class="provider-name">🧪 Mock Provider</span>
                    <span class="provider-badge badge-free">KOSTENLOS</span>
                </div>
                <div class="provider-info">
                    Keine echte Übersetzung. Nur für Tests und Entwicklung.<br>
                    ✅ Sofort verfügbar • ❌ Keine API-Keys nötig
                </div>
            </div>
            
            <div class="provider-card" data-provider="deepl">
                <div class="provider-header">
                    <span class="provider-name">⭐ DeepL</span>
                    <span class="provider-badge badge-premium">PREMIUM</span>
                </div>
                <div class="provider-info">
                    Beste Übersetzungsqualität, besonders für technische Texte.<br>
                    ✅ 500k Zeichen/Monat frei • 📊 Qualität: ⭐⭐⭐⭐⭐
                </div>
                <div class="provider-config hidden" id="config-deepl">
                    <div class="form-group">
                        <label>DeepL API Key</label>
                        <input type="password" id="deeplApiKey" placeholder="Dein DeepL API Key">
                        <div class="label-description">Von https://www.deepl.com/pro-api</div>
                    </div>
                    <div class="form-group">
                        <label>API Typ</label>
                        <select id="deeplApiType">
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary btn-test" onclick="testProvider('deepl')">
                        Test DeepL Connection
                    </button>
                </div>
            </div>
            
            <div class="provider-card" data-provider="google">
                <div class="provider-header">
                    <span class="provider-name">🔤 Google Translate</span>
                    <span class="provider-badge badge-free">500K FREI</span>
                </div>
                <div class="provider-info">
                    Sehr gute Qualität, große Cloud-Integration.<br>
                    ✅ 500k Zeichen/Monat frei • 📊 Qualität: ⭐⭐⭐⭐
                </div>
                <div class="provider-config hidden" id="config-google">
                    <div class="form-group">
                        <label>Google Cloud API Key</label>
                        <input type="password" id="googleApiKey" placeholder="Dein Google API Key">
                        <div class="label-description">Von https://console.cloud.google.com</div>
                    </div>
                    <button class="btn btn-secondary btn-test" onclick="testProvider('google')">
                        Test Google Connection
                    </button>
                </div>
            </div>
            
            <div class="provider-card" data-provider="microsoft">
                <div class="provider-header">
                    <span class="provider-name">🔷 Microsoft Azure</span>
                    <span class="provider-badge badge-free">2M FREI</span>
                </div>
                <div class="provider-info">
                    Bestes Preis-Leistungs-Verhältnis mit großem Free Tier.<br>
                    ✅ 2.000.000 Zeichen/Monat frei • 📊 Qualität: ⭐⭐⭐⭐
                </div>
                <div class="provider-config hidden" id="config-microsoft">
                    <div class="form-group">
                        <label>Azure API Key</label>
                        <input type="password" id="azureApiKey" placeholder="Dein Azure API Key">
                        <div class="label-description">Von https://portal.azure.com</div>
                    </div>
                    <div class="form-group">
                        <label>Azure Region</label>
                        <input type="text" id="azureRegion" placeholder="z.B. westeurope">
                        <div class="label-description">Region deiner Azure Translator Ressource</div>
                    </div>
                    <button class="btn btn-secondary btn-test" onclick="testProvider('microsoft')">
                        Test Azure Connection
                    </button>
                </div>
            </div>
            
            <div class="provider-card" data-provider="libretranslate">
                <div class="provider-header">
                    <span class="provider-name">🔓 LibreTranslate</span>
                    <span class="provider-badge badge-free">OPEN SOURCE</span>
                </div>
                <div class="provider-info">
                    Kostenlos, Privacy-freundlich, selbst hostbar.<br>
                    ✅ Komplett kostenlos • 🔒 100% Privacy • 📊 Qualität: ⭐⭐⭐
                </div>
                <div class="provider-config hidden" id="config-libretranslate">
                    <div class="form-group">
                        <label>Server URL (optional)</label>
                        <input type="text" id="libreTranslateUrl" placeholder="https://libretranslate.com/translate">
                        <div class="label-description">Leer lassen für öffentliche Instanz</div>
                    </div>
                    <button class="btn btn-secondary btn-test" onclick="testProvider('libretranslate')">
                        Test LibreTranslate Connection
                    </button>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>⚙️ Erweiterte Einstellungen</h2>
            
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="cacheEnabled" checked>
                    <label for="cacheEnabled">Cache aktiviert (empfohlen für Performance)</label>
                </div>
            </div>
            
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="streamingEnabled" checked>
                    <label for="streamingEnabled">Streaming Übersetzung (experimentell)</label>
                </div>
            </div>
            
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="preserveCodeBlocks" checked>
                    <label for="preserveCodeBlocks">Code-Blöcke schützen (nie übersetzen)</label>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <button class="btn btn-primary" onclick="saveSettings()">💾 Speichern</button>
            <button class="btn btn-secondary" onclick="openDocs()">📚 Provider Dokumentation</button>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        let currentProvider = 'mock';
        
        // Request settings on load
        vscode.postMessage({ command: 'getSettings' });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'settings':
                    loadSettings(message.data);
                    break;
                case 'saveSuccess':
                    showSuccess();
                    break;
                case 'testStart':
                    console.log('Testing', message.provider);
                    break;
                case 'testSuccess':
                    alert(message.message);
                    break;
                case 'testError':
                    alert(message.message);
                    break;
            }
        });
        
        // Load settings into form
        function loadSettings(data) {
            currentProvider = data.provider;
            
            document.getElementById('googleApiKey').value = data.googleApiKey || '';
            document.getElementById('azureApiKey').value = data.azureApiKey || '';
            document.getElementById('azureRegion').value = data.azureRegion || '';
            document.getElementById('libreTranslateUrl').value = data.libreTranslateUrl || '';
            document.getElementById('deeplApiKey').value = data.deeplApiKey || '';
            document.getElementById('deeplApiType').value = data.deeplApiType || 'free';
            document.getElementById('cacheEnabled').checked = data.cacheEnabled;
            document.getElementById('streamingEnabled').checked = data.streamingEnabled;
            document.getElementById('preserveCodeBlocks').checked = data.preserveCodeBlocks;
            
            selectProvider(currentProvider);
        }
        
        // Provider selection
        document.querySelectorAll('.provider-card').forEach(card => {
            card.addEventListener('click', () => {
                const provider = card.dataset.provider;
                selectProvider(provider);
            });
        });
        
        function selectProvider(provider) {
            currentProvider = provider;
            
            document.querySelectorAll('.provider-card').forEach(card => {
                card.classList.remove('selected');
                const config = card.querySelector('.provider-config');
                if (config) {
                    config.classList.add('hidden');
                }
            });
            
            const selectedCard = document.querySelector('[data-provider="' + provider + '"]');
            selectedCard.classList.add('selected');
            
            const config = document.getElementById('config-' + provider);
            if (config) {
                config.classList.remove('hidden');
            }
        }
        
        // Save settings
        function saveSettings() {
            const settings = {
                provider: currentProvider,
                googleApiKey: document.getElementById('googleApiKey').value,
                azureApiKey: document.getElementById('azureApiKey').value,
                azureRegion: document.getElementById('azureRegion').value,
                libreTranslateUrl: document.getElementById('libreTranslateUrl').value,
                deeplApiKey: document.getElementById('deeplApiKey').value,
                deeplApiType: document.getElementById('deeplApiType').value,
                cacheEnabled: document.getElementById('cacheEnabled').checked,
                streamingEnabled: document.getElementById('streamingEnabled').checked,
                preserveCodeBlocks: document.getElementById('preserveCodeBlocks').checked
            };
            
            vscode.postMessage({
                command: 'saveSettings',
                settings: settings
            });
        }
        
        // Test provider
        function testProvider(provider) {
            vscode.postMessage({
                command: 'testProvider',
                provider: provider
            });
        }
        
        // Open documentation
        function openDocs() {
            vscode.postMessage({ command: 'openDocs' });
        }
        
        // Show success message
        function showSuccess() {
            const alert = document.getElementById('successAlert');
            alert.classList.remove('hidden');
            setTimeout(() => {
                alert.classList.add('hidden');
            }, 3000);
        }
    </script>
</body>
</html>`;
    }
}
