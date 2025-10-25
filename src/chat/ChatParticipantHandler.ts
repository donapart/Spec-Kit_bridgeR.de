import * as vscode from 'vscode';
import { TranslationService } from '../translation/TranslationService';
import { TranslationCache } from '../translation/TranslationCache';
import { LanguageModelBridge } from '../middleware/LanguageModelBridge';

export class ChatParticipantHandler {
    private languageModelBridge: LanguageModelBridge;

    constructor(
        private translationService: TranslationService,
        private cache: TranslationCache
    ) {
        this.languageModelBridge = new LanguageModelBridge(translationService, cache);
    }

    async handleRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        _token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        const command = request.command;
        const userMessage = request.prompt;

        try {
            // Routing nach Command
            switch (command) {
                case 'test':
                    return await this.handleTest(userMessage, stream, _token);
                case 'plan':
                    return await this.handlePlan(userMessage, context, stream, _token);
                case 'implement':
                    return await this.handleImplement(userMessage, context, stream, _token);
                case 'review':
                    return await this.handleReview(userMessage, context, stream, _token);
                case 'debug':
                    return await this.handleDebug(userMessage, context, stream, _token);
                case 'docs':
                    return await this.handleDocs(userMessage, stream, _token);
                default:
                    return await this.handleGeneral(userMessage, context, stream, _token);
            }
        } catch (error) {
            stream.markdown(`❌ **Fehler:** ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async handleTest(
        userMessage: string,
        stream: vscode.ChatResponseStream,
        _token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('🧪 **Test-Modus**: Übersetzungsfunktion wird getestet...\n\n');

        // Zeige Original
        stream.markdown(`**Original (DE):**\n> ${userMessage}\n\n`);

        // Übersetze DE -> EN
        const cached = await this.cache.get(userMessage, 'EN-US');
        let translatedEN: string;
        
        if (cached) {
            translatedEN = cached;
            stream.markdown('✅ *Aus Cache geladen*\n\n');
        } else {
            const result = await this.translationService.translate(userMessage, {
                targetLang: 'EN-US',
                preserveCodeBlocks: true,
                preserveFormatting: true
            });
            translatedEN = result.text;
            await this.cache.set(userMessage, 'EN-US', translatedEN, result.provider);
            stream.markdown(`✅ *Übersetzt mit ${result.provider}*\n\n`);
        }

        stream.markdown(`**Übersetzt (EN):**\n> ${translatedEN}\n\n`);

        // Zeige Cache-Stats
        const stats = this.cache.getStats();
        stream.markdown(`📊 **Cache-Statistik:** ${stats.size}/${stats.maxSize} Einträge\n`);

        return { metadata: { command: 'test' } };
    }

    private async handlePlan(
        userMessage: string,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('📋 **Plan-Modus**: Erstelle detaillierten Implementierungsplan...\n\n');

        try {
            const config = vscode.workspace.getConfiguration('spec-kit-bridger');
            const useStreaming = config.get<boolean>('streamingEnabled', true);

            // Wähle Streaming oder Batch-Mode
            if (useStreaming) {
                await this.languageModelBridge.sendRequestStreaming(
                    {
                        prompt: userMessage,
                        command: 'plan',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('plan'),
                        context
                    },
                    stream,
                    token
                );
            } else {
                await this.languageModelBridge.sendRequest(
                    {
                        prompt: userMessage,
                        command: 'plan',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('plan'),
                        context
                    },
                    stream,
                    token
                );
            }

            return { 
                metadata: { 
                    command: 'plan',
                    usedLLM: true,
                    streaming: useStreaming
                } 
            };
        } catch (error) {
            stream.markdown(`\n\n❌ **Fehler beim Plan erstellen:** ${error instanceof Error ? error.message : String(error)}\n`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async handleImplement(
        userMessage: string,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('⚙️ **Implementierungs-Modus**: Generiere Code...\n\n');

        try {
            const config = vscode.workspace.getConfiguration('spec-kit-bridger');
            const useStreaming = config.get<boolean>('streamingEnabled', true);

            if (useStreaming) {
                await this.languageModelBridge.sendRequestStreaming(
                    {
                        prompt: userMessage,
                        command: 'implement',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('implement'),
                        context
                    },
                    stream,
                    token
                );
            } else {
                await this.languageModelBridge.sendRequest(
                    {
                        prompt: userMessage,
                        command: 'implement',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('implement'),
                        context
                    },
                    stream,
                    token
                );
            }

            return { 
                metadata: { 
                    command: 'implement',
                    usedLLM: true,
                    streaming: config.get<boolean>('streamingEnabled', true)
                } 
            };
        } catch (error) {
            stream.markdown(`\n\n❌ **Fehler bei Implementierung:** ${error instanceof Error ? error.message : String(error)}\n`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async handleReview(
        userMessage: string,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('🔍 **Review-Modus**: Analysiere Code...\n\n');

        try {
            const config = vscode.workspace.getConfiguration('spec-kit-bridger');
            const useStreaming = config.get<boolean>('streamingEnabled', true);

            if (useStreaming) {
                await this.languageModelBridge.sendRequestStreaming(
                    {
                        prompt: userMessage,
                        command: 'review',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('review'),
                        context
                    },
                    stream,
                    token
                );
            } else {
                await this.languageModelBridge.sendRequest(
                    {
                        prompt: userMessage,
                        command: 'review',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('review'),
                        context
                    },
                    stream,
                    token
                );
            }

            return { 
                metadata: { 
                    command: 'review',
                    usedLLM: true,
                    streaming: config.get<boolean>('streamingEnabled', true)
                } 
            };
        } catch (error) {
            stream.markdown(`\n\n❌ **Fehler beim Review:** ${error instanceof Error ? error.message : String(error)}\n`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async handleDebug(
        userMessage: string,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('🐛 **Debug-Modus**: Analysiere Problem...\n\n');

        try {
            const config = vscode.workspace.getConfiguration('spec-kit-bridger');
            const useStreaming = config.get<boolean>('streamingEnabled', true);

            if (useStreaming) {
                await this.languageModelBridge.sendRequestStreaming(
                    {
                        prompt: userMessage,
                        command: 'debug',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('debug'),
                        context
                    },
                    stream,
                    token
                );
            } else {
                await this.languageModelBridge.sendRequest(
                    {
                        prompt: userMessage,
                        command: 'debug',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('debug'),
                        context
                    },
                    stream,
                    token
                );
            }

            return { 
                metadata: { 
                    command: 'debug',
                    usedLLM: true,
                    streaming: config.get<boolean>('streamingEnabled', true)
                } 
            };
        } catch (error) {
            stream.markdown(`\n\n❌ **Fehler beim Debugging:** ${error instanceof Error ? error.message : String(error)}\n`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async handleDocs(
        userMessage: string,
        stream: vscode.ChatResponseStream,
        _token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('📚 **Dokumentations-Modus**: Dokumentation wird geladen...\n\n');

        // Öffne Documentation View
        await vscode.commands.executeCommand('spec-kit-bridger.showDocs');

        stream.markdown('✅ Dokumentation wurde geöffnet. Nutze die Buttons, um den Anzeigemodus zu wechseln.\n');

        return { 
            metadata: { 
                command: 'docs'
            } 
        };
    }

    private async handleGeneral(
        userMessage: string,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        stream.markdown('💬 **Allgemeine Anfrage**: Verarbeite mit Copilot und Übersetzung...\n\n');

        try {
            const config = vscode.workspace.getConfiguration('spec-kit-bridger');
            const useStreaming = config.get<boolean>('streamingEnabled', true);

            if (useStreaming) {
                await this.languageModelBridge.sendRequestStreaming(
                    {
                        prompt: userMessage,
                        command: 'general',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('general'),
                        context
                    },
                    stream,
                    token
                );
            } else {
                await this.languageModelBridge.sendRequest(
                    {
                        prompt: userMessage,
                        command: 'general',
                        systemPrompt: LanguageModelBridge.getSystemPromptForCommand('general'),
                        context
                    },
                    stream,
                    token
                );
            }

            return { 
                metadata: { 
                    command: 'general',
                    usedLLM: true,
                    streaming: useStreaming
                } 
            };
        } catch (error) {
            stream.markdown(`\n\n❌ **Fehler bei allgemeiner Anfrage:** ${error instanceof Error ? error.message : String(error)}\n`);
            return { errorDetails: { message: String(error) } };
        }
    }

    private async translateForCopilot(text: string): Promise<string> {
        // Prüfe Cache
        const cached = await this.cache.get(text, 'EN-US');
        if (cached) {
            return cached;
        }

        // Übersetze
        const result = await this.translationService.translate(text, {
            targetLang: 'EN-US',
            preserveCodeBlocks: true,
            preserveFormatting: true
        });

        // Cache speichern
        await this.cache.set(text, 'EN-US', result.text, result.provider);

        return result.text;
    }
}
