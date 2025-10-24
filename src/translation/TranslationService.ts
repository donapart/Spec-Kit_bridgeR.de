import * as vscode from 'vscode';
import { GoogleTranslationProvider } from './GoogleTranslationProvider';
import { MicrosoftTranslationProvider } from './MicrosoftTranslationProvider';
import { LibreTranslateProvider } from './LibreTranslateProvider';

export interface TranslationOptions {
    sourceLang?: string;
    targetLang: string;
    preserveFormatting?: boolean;
    preserveCodeBlocks?: boolean;
}

export interface TranslationResult {
    text: string;
    provider: string;
    cached: boolean;
}

export interface ITranslationProvider {
    translate(text: string, options: TranslationOptions): Promise<string>;
    isAvailable(): Promise<boolean>;
    getName(): string;
}

export class TranslationService {
    private provider: ITranslationProvider;

    constructor(private context: vscode.ExtensionContext) {
        this.provider = this.getProvider();
        
        // Provider bei Konfigurationsänderung neu laden
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('spec-kit-bridger.translationProvider')) {
                this.provider = this.getProvider();
            }
        });
    }

    private getProvider(): ITranslationProvider {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        const providerName = config.get<string>('translationProvider', 'mock');

        switch (providerName) {
            case 'deepl':
                return new DeepLProvider(config);
            case 'google':
                return new GoogleTranslationProvider(config);
            case 'microsoft':
                return new MicrosoftTranslationProvider(config);
            case 'libretranslate':
                return new LibreTranslateProvider(config);
            case 'mock':
            default:
                return new MockProvider();
        }
    }

    async translate(
        text: string,
        options: TranslationOptions
    ): Promise<TranslationResult> {
        try {
            // Provider-Verfügbarkeit prüfen
            const available = await this.provider.isAvailable();
            if (!available) {
                throw new Error(`Provider ${this.provider.getName()} nicht verfügbar`);
            }

            const translated = await this.provider.translate(text, options);
            
            return {
                text: translated,
                provider: this.provider.getName(),
                cached: false
            };
        } catch (error) {
            console.error('Übersetzungsfehler:', error);
            
            // Fallback: Original-Text zurückgeben
            return {
                text: text,
                provider: 'fallback',
                cached: false
            };
        }
    }

    getProviderName(): string {
        return this.provider.getName();
    }
}

// Mock Provider für Tests ohne API-Kosten
class MockProvider implements ITranslationProvider {
    getName(): string {
        return 'mock';
    }

    async isAvailable(): Promise<boolean> {
        return true;
    }

    async translate(text: string, options: TranslationOptions): Promise<string> {
        // Simuliere Übersetzung durch Präfix/Suffix
        const direction = options.targetLang === 'DE' ? '🇩🇪' : '🇬🇧';
        return `${direction} [MOCK] ${text}`;
    }
}

// DeepL Provider
class DeepLProvider implements ITranslationProvider {
    private apiKey: string;
    private apiType: 'free' | 'pro';

    constructor(config: vscode.WorkspaceConfiguration) {
        this.apiKey = config.get<string>('deepl.apiKey', '');
        this.apiType = config.get<'free' | 'pro'>('deepl.apiType', 'free');
    }

    getName(): string {
        return 'deepl';
    }

    async isAvailable(): Promise<boolean> {
        return this.apiKey.length > 0;
    }

    async translate(text: string, options: TranslationOptions): Promise<string> {
        if (!this.apiKey) {
            throw new Error('DeepL API-Key nicht konfiguriert');
        }

        // Code-Blöcke schützen wenn aktiviert
        if (options.preserveCodeBlocks) {
            text = this.protectCodeBlocks(text);
        }

        const url = this.apiType === 'free'
            ? 'https://api-free.deepl.com/v2/translate'
            : 'https://api.deepl.com/v2/translate';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                text: text,
                target_lang: options.targetLang,
                source_lang: options.sourceLang || 'auto',
                preserve_formatting: options.preserveFormatting ? '1' : '0',
                tag_handling: 'xml'
            })
        });

        if (!response.ok) {
            throw new Error(`DeepL API Fehler: ${response.statusText}`);
        }

        const data = await response.json() as { translations: Array<{ text: string }> };
        let translated = data.translations[0].text;

        // Code-Blöcke wiederherstellen
        if (options.preserveCodeBlocks) {
            translated = this.restoreCodeBlocks(translated);
        }

        return translated;
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
