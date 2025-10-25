import * as vscode from 'vscode';
import { TranslationService } from '../translation/TranslationService';
import { TranslationCache } from '../translation/TranslationCache';
import { StreamingTranslator } from '../streaming/StreamingTranslator';
import { ResponseCleaner } from '../formatting/ResponseCleaner';

export interface LanguageModelRequest {
    prompt: string;
    command?: string;
    systemPrompt?: string;
    context?: vscode.ChatContext;
}

export interface LanguageModelResponse {
    text: string;
    model: string;
    translated: boolean;
}

/**
 * Bridge zwischen deutscher User-Eingabe und VS Code Language Model API
 * 
 * Workflow:
 * 1. User Input (DE) → TranslationService → EN
 * 2. EN Prompt → Language Model (GPT-4/GPT-3.5)
 * 3. LLM Response (EN) → TranslationService → DE
 * 4. DE Response → User
 */
export class LanguageModelBridge {
    private static readonly modelPreferences = [
        { vendor: 'copilot', family: 'gpt-4' },
        { vendor: 'copilot', family: 'gpt-3.5-turbo' }
    ];

    constructor(
        private translationService: TranslationService,
        private cache: TranslationCache
    ) {}

    /**
     * Sende übersetzten Prompt an Language Model und übersetze Response zurück
     */
    async sendRequest(
        request: LanguageModelRequest,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<LanguageModelResponse> {
        try {
            const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
            const showStatus = cfg.get<boolean>('chat.showStreamingStatus', true);
            const inputLangSetting = cfg.get<'auto' | 'de' | 'en'>('chat.inputLanguage', 'auto');
            const outputLangSetting = cfg.get<'match-input' | 'de' | 'en'>('chat.outputLanguage', 'match-input');

            // Spracheingabe bestimmen
            const detected = inputLangSetting === 'auto' ? this.detectLanguage(request.prompt) : inputLangSetting;
            const shouldTranslateInput = detected === 'de';

            // 1. Prompt ggf. DE → EN übersetzen
            const translatedPrompt = shouldTranslateInput
                ? await this.translateInput(request.prompt)
                : request.prompt;
            
            // 2. Language Model auswählen
            const model = await this.selectModel();
            
            // 3. Messages konstruieren
            const messages = this.buildMessages(translatedPrompt, request);
            
            // 4. Request an LLM senden
            stream.progress('Anfrage wird verarbeitet...');
            const statusDisposable = showStatus
                ? vscode.window.setStatusBarMessage('$(sync~spin) Anfrage an LLM…')
                : undefined;
            const chatResponse = await model.sendRequest(messages, {}, token);
            
            // 5. Response sammeln
            let fullResponse = '';
            for await (const fragment of chatResponse.text) {
                fullResponse += fragment;
                
                // Optional: Progressives Streaming (später in Phase 2 Task 4)
                // Hier erst mal ganzen Text sammeln
            }
            
            // 6. Response ggf. in gewünschte Zielsprache übersetzen
            const desiredOutputLang = ((): 'DE' | 'EN-US' => {
                if (outputLangSetting === 'de') {
                    return 'DE';
                }
                if (outputLangSetting === 'en') {
                    return 'EN-US';
                }
                // match-input
                return detected === 'de' ? 'DE' : 'EN-US';
            })();

            let finalText: string;
            if (desiredOutputLang === 'DE') {
                const translatedResponse = await this.translateOutput(fullResponse);
                finalText = ResponseCleaner.clean(translatedResponse);
            } else {
                // Keine Übersetzung nötig, nur bereinigen
                finalText = ResponseCleaner.clean(fullResponse);
            }
            
            // 7. Bereinige Markdown-Artefakte
            const cleanedResponse = finalText;
            
            // 8. An Stream ausgeben
            stream.markdown(cleanedResponse);
            statusDisposable?.dispose();
            
            return {
                text: cleanedResponse,
                model: `${model.vendor}/${model.family}`,
                translated: true
            };
        } catch (error) {
            throw new Error(`Language Model Bridge Fehler: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Sende Request mit Streaming-Support (für spätere Optimierung)
     */
    async sendRequestStreaming(
        request: LanguageModelRequest,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<LanguageModelResponse> {
        try {
            const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
            const bufferSize = cfg.get<number>('streaming.bufferSize', 500);
            const sentenceDelayMs = cfg.get<number>('streaming.sentenceDelayMs', 100);
            const showStatus = cfg.get<boolean>('chat.showStreamingStatus', true);
            const inputLangSetting = cfg.get<'auto' | 'de' | 'en'>('chat.inputLanguage', 'auto');
            const outputLangSetting = cfg.get<'match-input' | 'de' | 'en'>('chat.outputLanguage', 'match-input');

            // Spracheingabe bestimmen
            const detected = inputLangSetting === 'auto' ? this.detectLanguage(request.prompt) : inputLangSetting;
            const shouldTranslateInput = detected === 'de';

            const translatedPrompt = shouldTranslateInput
                ? await this.translateInput(request.prompt)
                : request.prompt;
            const model = await this.selectModel();
            const messages = this.buildMessages(translatedPrompt, request);
            
            stream.progress('Übersetze Antwort...');
            const statusDisposable = showStatus
                ? vscode.window.setStatusBarMessage('$(sync~spin) Streaming…')
                : undefined;
            const chatResponse = await model.sendRequest(messages, {}, token);
            
            // Zielsprache bestimmen
            const desiredOutputLang = ((): 'DE' | 'EN-US' => {
                if (outputLangSetting === 'de') {
                    return 'DE';
                }
                if (outputLangSetting === 'en') {
                    return 'EN-US';
                }
                return detected === 'de' ? 'DE' : 'EN-US';
            })();

            // Nur wenn DE-Ziel: Streaming-Übersetzung benutzen; sonst direkt durchreichen
            const useStreamingTranslation = desiredOutputLang === 'DE';
            const streamingTranslator = useStreamingTranslation
                ? new StreamingTranslator(this.translationService, this.cache)
                : undefined;
            
            let fullResponse = '';
            
            // Verarbeite jeden Fragment aus dem LLM-Stream
            for await (const fragment of chatResponse.text) {
                if (useStreamingTranslation && streamingTranslator) {
                    await streamingTranslator.processFragment(
                        fragment,
                        { targetLang: 'DE', bufferSize, sentenceDelayMs },
                        stream
                    );
                } else {
                    // Keine Übersetzung: direkt weiter streamen
                    stream.markdown(fragment);
                }
                fullResponse += fragment;
            }
            
            // Finalisiere Stream (übersetze Rest-Buffer)
            if (useStreamingTranslation && streamingTranslator) {
                await streamingTranslator.finalize(
                    { targetLang: 'DE', bufferSize, sentenceDelayMs },
                    stream
                );
            }
            statusDisposable?.dispose();
            
            return {
                text: fullResponse,
                model: `${model.vendor}/${model.family}`,
                translated: true
            };
        } catch (error) {
            throw new Error(`Streaming Bridge Fehler: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Übersetze User-Input DE → EN mit Cache
     */
    private async translateInput(text: string): Promise<string> {
        // Cache prüfen
        const cached = await this.cache.get(text, 'EN-US');
        if (cached) {
            return cached;
        }

        // Übersetzen
        const result = await this.translationService.translate(text, {
            targetLang: 'EN-US',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        // Cache speichern
        await this.cache.set(text, 'EN-US', result.text, result.provider);

        return result.text;
    }

    /**
     * Übersetze LLM-Response EN → DE mit Cache
     */
    private async translateOutput(text: string): Promise<string> {
        // Cache prüfen
        const cached = await this.cache.get(text, 'DE');
        if (cached) {
            return cached;
        }

        // Übersetzen
        const result = await this.translationService.translate(text, {
            targetLang: 'DE',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        // Cache speichern
        await this.cache.set(text, 'DE', result.text, result.provider);

        return result.text;
    }

    /**
     * Sehr leichte Heuristik zur Spracherkennung (DE/EN)
     */
    private detectLanguage(text: string): 'de' | 'en' | 'unknown' {
        const t = text.toLowerCase();
        // Schnelle Marker für Deutsch
        const hasGermanChars = /[äöüß]/i.test(text);
        const deWords = [' der ', ' die ', ' das ', ' und ', ' nicht ', ' ist ', ' mit ', ' für ', ' von ', ' im ', ' ein ', ' eine ', ' zum ', ' zur '];
        const enWords = [' the ', ' and ', ' not ', ' is ', ' with ', ' for ', ' of ', ' in ', ' on ', ' a ', ' an ', ' to '];

        let deScore = hasGermanChars ? 2 : 0;
        let enScore = 0;

        for (const w of deWords) {
            if (t.includes(w)) {
                deScore++;
            }
        }
        for (const w of enWords) {
            if (t.includes(w)) {
                enScore++;
            }
        }

        if (deScore >= enScore + 1) {
            return 'de';
        }
        if (enScore >= deScore + 1) {
            return 'en';
        }
        return 'unknown';
    }

    /**
     * Wähle bestes verfügbares Language Model
     */
    private async selectModel(): Promise<vscode.LanguageModelChat> {
        for (const preference of LanguageModelBridge.modelPreferences) {
            const models = await vscode.lm.selectChatModels(preference);
            if (models.length > 0) {
                return models[0];
            }
        }

        throw new Error('Kein Language Model verfügbar. Bitte GitHub Copilot aktivieren.');
    }

    /**
     * Baue Language Model Messages mit System-Prompt und Context
     */
    private buildMessages(
        prompt: string,
        request: LanguageModelRequest
    ): vscode.LanguageModelChatMessage[] {
        const messages: vscode.LanguageModelChatMessage[] = [];

        // System-Prompt (falls vorhanden)
        if (request.systemPrompt) {
            messages.push(vscode.LanguageModelChatMessage.User(request.systemPrompt));
        }

        // Context aus vorherigen Turns (falls vorhanden)
        if (request.context) {
            messages.push(...this.buildContextMessages(request.context));
        }

        // Aktueller User-Prompt
        messages.push(vscode.LanguageModelChatMessage.User(prompt));

        return messages;
    }

    private buildContextMessages(context: vscode.ChatContext): vscode.LanguageModelChatMessage[] {
        const ctxMessages: vscode.LanguageModelChatMessage[] = [];
        const previous = context.history.filter((h) => h instanceof vscode.ChatResponseTurn);

        const isMarkdownString = (x: unknown): x is { value: string } => {
            return !!x && typeof (x as { value?: unknown }).value === 'string';
        };

        for (const turn of previous) {
            if (turn instanceof vscode.ChatResponseTurn) {
                let full = '';
                for (const part of turn.response) {
                    const mdPart = part as vscode.ChatResponseMarkdownPart;
                    const v = mdPart.value as unknown;
                    if (typeof v === 'string') {
                        full += v;
                    } else if (isMarkdownString(v)) {
                        full += v.value;
                    }
                }
                if (full) {
                    ctxMessages.push(vscode.LanguageModelChatMessage.Assistant(full));
                }
            }
        }

        return ctxMessages;
    }

    /**
     * Baue Command-spezifische System-Prompts
     */
    static getSystemPromptForCommand(command: string): string {
        switch (command) {
            case 'plan':
                return `You are a software architect creating detailed implementation plans.
Structure your response with:
1. Overview of the task
2. Step-by-step implementation plan
3. Technical considerations
4. Potential risks

Use markdown formatting with clear headings and bullet points.`;

            case 'implement':
                return `You are an expert software developer implementing features.
Provide:
1. Complete, production-ready code
2. Inline comments explaining complex logic
3. Error handling
4. Best practices

Format code blocks with proper language tags.`;

            case 'review':
                return `You are a senior code reviewer providing constructive feedback.
Focus on:
1. Code quality and readability
2. Potential bugs or issues
3. Performance implications
4. Security concerns
5. Suggestions for improvement

Be specific and actionable in your feedback.`;

            case 'debug':
                return `You are a debugging expert helping to identify and fix issues.
Provide:
1. Analysis of the problem
2. Root cause identification
3. Step-by-step debugging approach
4. Suggested fixes with code examples

Be thorough and methodical.`;

            default:
                return 'You are a helpful coding assistant. Provide clear, accurate, and actionable responses.';
        }
    }
}
