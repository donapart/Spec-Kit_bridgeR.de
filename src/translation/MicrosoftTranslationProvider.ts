import * as vscode from 'vscode';

export interface TranslationOptions {
    sourceLang?: string;
    targetLang: string;
    preserveFormatting?: boolean;
    preserveCodeBlocks?: boolean;
}

export interface ITranslationProvider {
    translate(text: string, options: TranslationOptions): Promise<string>;
    isAvailable(): Promise<boolean>;
    getName(): string;
}

/**
 * Microsoft Azure Translator API Provider (REST API)
 * 
 * Setup:
 * 1. Create Azure Account: https://portal.azure.com
 * 2. Create "Translator" resource
 * 3. Get API Key and Region from resource
 * 4. Set in VS Code Settings:
 *    - spec-kit-bridger.azureApiKey
 *    - spec-kit-bridger.azureRegion (e.g., "westeurope")
 * 
 * Pricing: Free up to 2M characters/month
 */
export class MicrosoftTranslationProvider implements ITranslationProvider {
    private readonly endpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    private apiKey: string;
    private region: string;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.apiKey = config.get<string>('azureApiKey', '');
        this.region = config.get<string>('azureRegion', '');
    }

    getName(): string {
        return 'microsoft';
    }

    async isAvailable(): Promise<boolean> {
        return this.apiKey.length > 0 && this.region.length > 0;
    }

    /**
     * Translate text using Microsoft Azure Translator API
     */
    async translate(text: string, options: TranslationOptions): Promise<string> {
        try {
            if (!this.apiKey || this.apiKey.trim() === '') {
                throw new Error(
                    'Azure API Key nicht konfiguriert. Bitte setzen Sie "spec-kit-bridger.azureApiKey" in den VS Code Einstellungen.'
                );
            }

            if (!this.region || this.region.trim() === '') {
                throw new Error(
                    'Azure Region nicht konfiguriert. Bitte setzen Sie "spec-kit-bridger.azureRegion" (z.B. "westeurope").'
                );
            }

            // Code-Blöcke schützen wenn aktiviert
            if (options.preserveCodeBlocks) {
                text = this.protectCodeBlocks(text);
            }

            // Build API URL
            const url = new URL(this.endpoint);
            url.searchParams.append('api-version', '3.0');
            if (options.sourceLang) {
                url.searchParams.append('from', options.sourceLang);
            }
            url.searchParams.append('to', options.targetLang);

            // Make API request
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                    'Ocp-Apim-Subscription-Region': this.region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ text }])
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure Translator API Error (${response.status}): ${errorText}`);
            }

            const result = await response.json() as Array<{
                translations: Array<{ text: string; to: string }>;
            }>;

            if (!result[0]?.translations[0]?.text) {
                throw new Error('Azure Translator: Unerwartetes Response-Format');
            }

            let translatedText = result[0].translations[0].text;

            // Code-Blöcke wiederherstellen
            if (options.preserveCodeBlocks) {
                translatedText = this.restoreCodeBlocks(translatedText);
            }

            console.log(`[MicrosoftTranslation] ${options.sourceLang} → ${options.targetLang}: ${text.substring(0, 50)}...`);

            return translatedText;
        } catch (error) {
            console.error('[MicrosoftTranslation] Translation failed:', error);

            // User-friendly error messages
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    throw new Error('Azure API Key ungültig. Bitte überprüfen Sie Ihre Konfiguration.');
                }
                if (error.message.includes('403')) {
                    throw new Error('Azure API Zugriff verweigert. Überprüfen Sie Region und Key.');
                }
                if (error.message.includes('429')) {
                    throw new Error('Azure Translator API Rate Limit erreicht. Bitte später erneut versuchen.');
                }
            }

            throw new Error(`Microsoft Translation fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        }
    }

    private protectCodeBlocks(text: string): string {
        // Code-Blöcke mit XML-Tags schützen
        return text.replace(/```[\s\S]*?```/g, (match) => {
            return `<code>${match}</code>`;
        }).replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    private restoreCodeBlocks(text: string): string {
        // XML-Tags entfernen
        return text.replace(/<\/?code>/g, '');
    }
}
