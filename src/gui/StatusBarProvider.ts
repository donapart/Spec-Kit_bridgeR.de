import * as vscode from 'vscode';

/**
 * Status Bar Provider
 * Shows current translation provider in VS Code status bar
 */
export class StatusBarProvider {
    private statusBarItem: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'spec-kit-bridger.quickSwitchProvider';
        this.context.subscriptions.push(this.statusBarItem);
        
        this.updateStatusBar();
        this.statusBarItem.show();

        // Update on config change
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('spec-kit-bridger.translationProvider')) {
                this.updateStatusBar();
            }
        });
    }

    /**
     * Update status bar text based on current provider
     */
    private updateStatusBar(): void {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        const provider = config.get<string>('translationProvider', 'mock');

        const providerIcons: { [key: string]: string } = {
            'mock': '🧪',
            'deepl': '⭐',
            'google': '🔤',
            'microsoft': '🔷',
            'libretranslate': '🔓'
        };

        const providerNames: { [key: string]: string } = {
            'mock': 'Mock',
            'deepl': 'DeepL',
            'google': 'Google',
            'microsoft': 'Azure',
            'libretranslate': 'LibreTranslate'
        };

        const icon = providerIcons[provider] || '🌐';
        const name = providerNames[provider] || provider;

        this.statusBarItem.text = `${icon} ${name}`;
        this.statusBarItem.tooltip = `Spec-Kit Translation: ${name}\nKlicken zum Wechseln`;
    }

    /**
     * Show quick pick for provider selection
     */
    public async showQuickPick(): Promise<void> {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        const currentProvider = config.get<string>('translationProvider', 'mock');

        const items = [
            {
                label: '🧪 Mock',
                description: 'Keine echte Übersetzung (für Tests)',
                detail: 'Sofort verfügbar • Keine API-Keys',
                value: 'mock',
                picked: currentProvider === 'mock'
            },
            {
                label: '⭐ DeepL',
                description: 'Beste Qualität',
                detail: '500k Zeichen/Monat frei • API-Key erforderlich',
                value: 'deepl',
                picked: currentProvider === 'deepl'
            },
            {
                label: '🔤 Google Translate',
                description: 'Sehr gute Qualität',
                detail: '500k Zeichen/Monat frei • API-Key erforderlich',
                value: 'google',
                picked: currentProvider === 'google'
            },
            {
                label: '🔷 Microsoft Azure',
                description: 'Bestes Preis-Leistungs-Verhältnis',
                detail: '2M Zeichen/Monat frei • API-Key + Region erforderlich',
                value: 'microsoft',
                picked: currentProvider === 'microsoft'
            },
            {
                label: '🔓 LibreTranslate',
                description: 'Open Source & Privacy-freundlich',
                detail: 'Komplett kostenlos • Keine API-Keys',
                value: 'libretranslate',
                picked: currentProvider === 'libretranslate'
            },
            {
                label: '$(gear) Erweiterte Einstellungen...',
                description: 'API-Keys konfigurieren',
                detail: 'Öffnet die Einstellungs-GUI',
                value: '__settings__'
            }
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Translation Provider auswählen',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            return;
        }

        if (selected.value === '__settings__') {
            vscode.commands.executeCommand('spec-kit-bridger.openSettings');
            return;
        }

        // Check if API key is configured for paid providers
        const needsApiKey = ['deepl', 'google', 'microsoft'].includes(selected.value);
        if (needsApiKey) {
            const hasKey = await this.checkApiKey(selected.value);
            if (!hasKey) {
                const action = await vscode.window.showWarningMessage(
                    `${selected.label} benötigt einen API-Key. Möchtest du diesen jetzt konfigurieren?`,
                    'Ja, konfigurieren',
                    'Abbrechen'
                );

                if (action === 'Ja, konfigurieren') {
                    vscode.commands.executeCommand('spec-kit-bridger.openSettings');
                }
                return;
            }
        }

        await config.update('translationProvider', selected.value, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`✅ Translation Provider gewechselt zu: ${selected.label}`);
    }

    /**
     * Check if API key is configured for provider
     */
    private async checkApiKey(provider: string): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');

        switch (provider) {
            case 'deepl':
                return (config.get<string>('deepl.apiKey', '')).length > 0;
            case 'google':
                return (config.get<string>('googleApiKey', '')).length > 0;
            case 'microsoft': {
                const azureKey = config.get<string>('azureApiKey', '');
                const azureRegion = config.get<string>('azureRegion', '');
                return azureKey.length > 0 && azureRegion.length > 0;
            }
            default:
                return true;
        }
    }

    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
