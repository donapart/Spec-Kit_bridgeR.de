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
 * LibreTranslate API Provider (Open Source, Self-Hostable)
 * 
 * Setup Options:
 * 1. Use public instance (default): https://libretranslate.com
 * 2. Self-host: https://github.com/LibreTranslate/LibreTranslate
 * 3. Set custom URL in VS Code Settings: spec-kit-bridger.libreTranslateUrl
 * 
 * Pricing: Free (public instance rate-limited), unlimited if self-hosted
 */
export class LibreTranslateProvider implements ITranslationProvider {
    private readonly defaultUrl = 'https://libretranslate.com/translate';
    private serverUrl: string;

    constructor(config: vscode.WorkspaceConfiguration) {
        const customUrl = config.get<string>('libreTranslateUrl', '');
        this.serverUrl = customUrl && customUrl.trim() !== '' ? customUrl : this.defaultUrl;
    }

    getName(): string {
        return 'libretranslate';
    }

    async isAvailable(): Promise<boolean> {
        // LibreTranslate ist immer verfügbar (öffentlich oder selbst gehostet)
        return true;
    }

    /**
     * Translate text using LibreTranslate API
     */
    async translate(text: string, options: TranslationOptions): Promise<string> {
        try {
            // Code-Blöcke schützen wenn aktiviert
            if (options.preserveCodeBlocks) {
                text = this.protectCodeBlocks(text);
            }

            // LibreTranslate API request
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    source: options.sourceLang || 'auto',
                    target: options.targetLang,
                    format: 'text'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`LibreTranslate API Error (${response.status}): ${errorText}`);
            }

            const result = await response.json() as { translatedText: string };

            if (!result.translatedText) {
                throw new Error('LibreTranslate: Unerwartetes Response-Format');
            }

            let translatedText = result.translatedText;

            // Code-Blöcke wiederherstellen
            if (options.preserveCodeBlocks) {
                translatedText = this.restoreCodeBlocks(translatedText);
            }

            console.log(`[LibreTranslate] ${options.sourceLang} → ${options.targetLang}: ${text.substring(0, 50)}...`);

            return translatedText;
        } catch (error) {
            console.error('[LibreTranslate] Translation failed:', error);

            // User-friendly error messages
            if (error instanceof Error) {
                if (error.message.includes('429')) {
                    throw new Error('LibreTranslate Rate Limit erreicht. Erwägen Sie Self-Hosting oder warten Sie.');
                }
                if (error.message.includes('Failed to fetch')) {
                    throw new Error('LibreTranslate Server nicht erreichbar. Überprüfen Sie die URL.');
                }
            }

            throw new Error(`LibreTranslate Translation fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
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
