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
 * Google Cloud Translation API Provider
 * 
 * Setup:
 * 1. Create Google Cloud Project: https://console.cloud.google.com
 * 2. Enable Translation API
 * 3. Create API Key or Service Account
 * 4. Set in VS Code Settings: spec-kit-bridger.googleApiKey
 * 
 * Pricing: Free up to 500,000 characters/month
 */
type GoogleTranslateClient = {
    translate: (
        text: string,
        options: { from?: string; to: string; format?: string }
    ) => Promise<[string, unknown?, unknown?]>;
};

export class GoogleTranslationProvider implements ITranslationProvider {
    // lazy client; typed minimal surface to avoid any
    private translator: GoogleTranslateClient | null = null;
    private readonly apiKey: string;

    constructor(config: vscode.WorkspaceConfiguration) {
        this.apiKey = config.get<string>('googleApiKey', '');
    }

    getName(): string {
        return 'google';
    }

    async isAvailable(): Promise<boolean> {
        return this.apiKey.length > 0;
    }

    /**
     * Initialize Google Translate client with API key from settings
     */
    private async initializeClient(): Promise<GoogleTranslateClient> {
        if (this.translator) {
            return this.translator;
        }

        if (!this.apiKey || this.apiKey.trim() === '') {
            throw new Error(
                'Google API Key nicht konfiguriert. Bitte setzen Sie "spec-kit-bridger.googleApiKey" in den VS Code Einstellungen.'
            );
        }

        try {
            // Lazy-require to avoid crashing activation if dependency missing
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const googleTranslate = require('@google-cloud/translate') as {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                v2?: { /* eslint-disable-next-line @typescript-eslint/naming-convention */ Translate: new (config: { key: string }) => GoogleTranslateClient };
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Translate?: new (config: { key: string }) => GoogleTranslateClient;
            };
            const v2 = googleTranslate.v2 ?? googleTranslate;
            // @ts-expect-error runtime constructor presence varies by version
            this.translator = new v2.Translate({ key: this.apiKey });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        catch (err) {
            throw new Error('Google Cloud Translation client is not available. Bitte installieren Sie das Paket "@google-cloud/translate" oder wählen Sie einen anderen Übersetzungs-Provider in den Einstellungen.');
        }

        return this.translator;
    }

    /**
     * Translate text using Google Cloud Translation API
     */
    async translate(text: string, options: TranslationOptions): Promise<string> {
        try {
            const client = await this.initializeClient();

            // Code-Blöcke schützen wenn aktiviert
            if (options.preserveCodeBlocks) {
                text = this.protectCodeBlocks(text);
            }

            // Google Translate API call
            const [translation] = await client.translate(text, {
                from: options.sourceLang || 'auto',
                to: options.targetLang,
                format: 'text'
            });

            let result = translation;

            // Code-Blöcke wiederherstellen
            if (options.preserveCodeBlocks) {
                result = this.restoreCodeBlocks(result);
            }

            console.log(`[GoogleTranslation] ${options.sourceLang} → ${options.targetLang}: ${text.substring(0, 50)}...`);

            return result;
        } catch (error) {
            console.error('[GoogleTranslation] Translation failed:', error);
            
            // User-friendly error messages
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    throw new Error('Google API Key ungültig. Bitte überprüfen Sie Ihre Konfiguration.');
                }
                if (error.message.includes('quota')) {
                    throw new Error('Google Translation API Quota überschritten. Bitte später erneut versuchen.');
                }
            }

            throw new Error(`Google Translation fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
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
