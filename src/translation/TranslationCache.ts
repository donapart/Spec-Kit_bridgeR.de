import * as vscode from 'vscode';
import * as crypto from 'crypto';

interface CacheEntry {
    text: string;
    timestamp: number;
    provider: string;
}

export class TranslationCache {
    private cache: Map<string, CacheEntry>;
    private readonly MAX_CACHE_SIZE = 1000;
    private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

    constructor(private context: vscode.ExtensionContext) {
        this.cache = new Map();
        this.load();
    }

    private generateKey(text: string, targetLang: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(`${text}:${targetLang}`);
        return hash.digest('hex');
    }

    async get(text: string, targetLang: string): Promise<string | null> {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        if (!config.get<boolean>('cacheEnabled', true)) {
            return null;
        }

        const key = this.generateKey(text, targetLang);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Prüfe Alter
        const age = Date.now() - entry.timestamp;
        if (age > this.MAX_AGE_MS) {
            this.cache.delete(key);
            return null;
        }

        return entry.text;
    }

    async set(text: string, targetLang: string, translated: string, provider: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        if (!config.get<boolean>('cacheEnabled', true)) {
            return;
        }

        const key = this.generateKey(text, targetLang);
        
        this.cache.set(key, {
            text: translated,
            timestamp: Date.now(),
            provider
        });

        // Cache-Größe begrenzen (LRU)
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        await this.save();
    }

    async clear(): Promise<void> {
        this.cache.clear();
        await this.save();
    }

    private async load(): Promise<void> {
        try {
            const data = this.context.globalState.get<[string, CacheEntry][]>('translationCache', []);
            this.cache = new Map(data);
        } catch (error) {
            console.error('Fehler beim Laden des Cache:', error);
        }
    }

    private async save(): Promise<void> {
        try {
            const data = Array.from(this.cache.entries());
            await this.context.globalState.update('translationCache', data);
        } catch (error) {
            console.error('Fehler beim Speichern des Cache:', error);
        }
    }

    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            maxAge: this.MAX_AGE_MS
        };
    }
}
