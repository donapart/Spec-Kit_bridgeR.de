import * as vscode from 'vscode';
import { TranslationService } from '../translation/TranslationService';
import { TranslationCache } from '../translation/TranslationCache';
import { ResponseCleaner } from '../formatting/ResponseCleaner';

export interface StreamingOptions {
    bufferSize?: number;
    sentenceDelayMs?: number;
    targetLang: string;
}

/**
 * Streaming Translator für progressive Übersetzung
 * 
 * Strategien:
 * 1. Sentence-based: Übersetze sobald vollständiger Satz erkannt
 * 2. Buffer-based: Sammle N Zeichen, dann übersetze
 * 3. Hybrid: Code-Blöcke sofort durchreichen, Text puffern
 */
export class StreamingTranslator {
    private buffer = '';
    private codeBlockBuffer = '';
    private insideCodeBlock = false;
    private readonly defaultBufferSize = 500; // Zeichen
    private readonly defaultSentenceDelay = 100; // ms

    constructor(
        private translationService: TranslationService,
        private cache: TranslationCache
    ) {}

    /**
     * Verarbeite Fragment aus LLM-Stream
     */
    async processFragment(
        fragment: string,
        options: StreamingOptions,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        const bufferSize = options.bufferSize || this.defaultBufferSize;
        
        // Code-Block-Detection
        if (fragment.includes('```')) {
            await this.handleCodeBlockBoundary(fragment, options, stream);
            return;
        }

        // Wenn in Code-Block: Sofort ausgeben (nicht übersetzen)
        if (this.insideCodeBlock) {
            this.codeBlockBuffer += fragment;
            stream.markdown(fragment);
            return;
        }

        // Normaler Text: Puffern
        this.buffer += fragment;

        // Strategie 1: Vollständiger Satz erkannt
        if (this.hasCompleteSentence(this.buffer)) {
            await this.flushSentence(options, stream);
        }
        // Strategie 2: Buffer voll
        else if (this.buffer.length >= bufferSize) {
            await this.flushBuffer(options, stream);
        }
    }

    /**
     * Finalisiere Stream (übersetze Rest-Buffer)
     */
    async finalize(
        options: StreamingOptions,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        // Code-Block schließen falls offen
        if (this.insideCodeBlock && this.codeBlockBuffer.length > 0) {
            stream.markdown(this.codeBlockBuffer);
            this.codeBlockBuffer = '';
        }

        // Rest-Buffer übersetzen
        if (this.buffer.length > 0) {
            await this.flushBuffer(options, stream);
        }

        // Reset
        this.reset();
    }

    /**
     * Prüfe ob Buffer vollständigen Satz enthält
     */
    private hasCompleteSentence(text: string): boolean {
        // Deutsch: Satz endet mit . ! ? gefolgt von Whitespace/Newline
        // Berücksichtige Abkürzungen: z.B., d.h., etc.
        const sentenceEndings = /[.!?](?=\s+[A-ZÄÖÜ]|\s*\n|$)/;
        return sentenceEndings.test(text);
    }

    /**
     * Übersetze und gebe vollständigen Satz aus
     */
    private async flushSentence(
        options: StreamingOptions,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        // Finde letzten Satz
        const match = this.buffer.match(/^(.+?[.!?](?=\s+[A-ZÄÖÜ]|\s*\n|$))/s);
        
        if (!match) {
            return;
        }

        const sentence = match[1];
        const rest = this.buffer.slice(sentence.length);

        // Übersetze Satz
        const translated = await this.translate(sentence, options.targetLang);
        stream.markdown(translated);

        // Aktualisiere Buffer
        this.buffer = rest;
    }

    /**
     * Übersetze und leere gesamten Buffer
     */
    private async flushBuffer(
        options: StreamingOptions,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        if (this.buffer.length === 0) {
            return;
        }

        const translated = await this.translate(this.buffer, options.targetLang);
        stream.markdown(translated);
        this.buffer = '';
    }

    /**
     * Handle Code-Block Boundaries (``` markers)
     */
    private async handleCodeBlockBoundary(
        fragment: string,
        options: StreamingOptions,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        const codeBlockMarkers = fragment.match(/```/g);
        const markerCount = codeBlockMarkers ? codeBlockMarkers.length : 0;

        // Toggle Code-Block State für jeden Marker
        for (let i = 0; i < markerCount; i++) {
            if (this.insideCodeBlock) {
                // Code-Block endet
                this.insideCodeBlock = false;
                
                // Flush Text-Buffer VOR Code-Block
                if (this.buffer.length > 0) {
                    await this.flushBuffer(options, stream);
                }
                
                // Code-Block ausgeben
                stream.markdown(this.codeBlockBuffer + '```');
                this.codeBlockBuffer = '';
            } else {
                // Code-Block beginnt
                this.insideCodeBlock = true;
                this.codeBlockBuffer = '```';
            }
        }

        // Restlichen Fragment verarbeiten
        const withoutMarkers = fragment.replace(/```/g, '');
        if (withoutMarkers.length > 0) {
            if (this.insideCodeBlock) {
                this.codeBlockBuffer += withoutMarkers;
                stream.markdown(withoutMarkers);
            } else {
                this.buffer += withoutMarkers;
            }
        }
    }

    /**
     * Übersetze Text mit Cache und bereinige Markdown
     */
    private async translate(text: string, targetLang: string): Promise<string> {
        // Cache prüfen
        const cached = await this.cache.get(text, targetLang);
        if (cached) {
            return ResponseCleaner.clean(cached);
        }

        // Übersetzen
        const result = await this.translationService.translate(text, {
            targetLang,
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        // Bereinige Übersetzungs-Artefakte
        const cleaned = ResponseCleaner.clean(result.text);

        // Cache speichern (bereits bereinigt)
        await this.cache.set(text, targetLang, cleaned, result.provider);

        return cleaned;
    }

    /**
     * Reset Translator State
     */
    private reset(): void {
        this.buffer = '';
        this.codeBlockBuffer = '';
        this.insideCodeBlock = false;
    }

    /**
     * Get Current Buffer Stats (für Debugging)
     */
    getStats() {
        return {
            bufferLength: this.buffer.length,
            codeBufferLength: this.codeBlockBuffer.length,
            insideCodeBlock: this.insideCodeBlock
        };
    }
}
