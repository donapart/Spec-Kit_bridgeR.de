import * as assert from 'assert';
import * as vscode from 'vscode';
import { TranslationService } from '../../translation/TranslationService';

suite('TranslationService Tests', () => {
    
    test('Mock provider should be available', async () => {
        // Mock VS Code Extension Context
        const mockContext = {
            subscriptions: [],
            globalState: {
                get: () => undefined,
                update: async () => {},
                keys: () => []
            },
            workspaceState: {
                get: () => undefined,
                update: async () => {},
                keys: () => []
            }
        } as unknown as vscode.ExtensionContext;

        const service = new TranslationService(mockContext);
        assert.strictEqual(service.getProviderName(), 'mock');
    });

    test('Mock translation should add prefix', async () => {
        const mockContext = {
            subscriptions: [],
            globalState: {
                get: () => undefined,
                update: async () => {},
                keys: () => []
            },
            workspaceState: {
                get: () => undefined,
                update: async () => {},
                keys: () => []
            }
        } as unknown as vscode.ExtensionContext;

        const service = new TranslationService(mockContext);
        const result = await service.translate('Hello World', {
            targetLang: 'DE'
        });

        assert.ok(result.text.includes('MOCK'));
        assert.ok(result.text.includes('Hello World'));
        assert.strictEqual(result.provider, 'mock');
    });
});
