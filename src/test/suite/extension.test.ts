import * as assert from 'assert';
import * as vscode from 'vscode';
import { TranslationService } from '../../translation/TranslationService';
import { TranslationCache } from '../../translation/TranslationCache';

suite('TranslationService Test Suite', () => {
    let context: vscode.ExtensionContext;
    let translationService: TranslationService;
    let translationCache: TranslationCache;

    suiteSetup(async () => {
        // Extension Context für Tests
        const extension = vscode.extensions.getExtension('spec-kit.spec-kit-bridger-de');
        assert.ok(extension, 'Extension nicht gefunden');
        
        context = await extension.activate();
    });

    setup(() => {
        translationService = new TranslationService(context);
        translationCache = new TranslationCache(context);
    });

    teardown(async () => {
        await translationCache.clear();
    });

    test('TranslationService sollte initialisiert werden', () => {
        assert.ok(translationService);
        assert.strictEqual(typeof translationService.translate, 'function');
    });

    test('Mock Provider sollte verfügbar sein', async () => {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        await config.update('translationProvider', 'mock', vscode.ConfigurationTarget.Global);
        
        const result = await translationService.translate('Hallo Welt', {
            targetLang: 'EN-US'
        });
        
        assert.ok(result);
        assert.ok(result.text.includes('MOCK'));
        assert.strictEqual(result.provider, 'mock');
    });

    test('Code-Blöcke sollten geschützt werden', async () => {
        const textWithCode = 'Hier ist Code: `console.log("test")` und mehr Text';
        
        const result = await translationService.translate(textWithCode, {
            targetLang: 'EN-US',
            preserveCodeBlocks: true
        });
        
        assert.ok(result.text.includes('console.log'));
    });

    test('Cache sollte funktionieren', async () => {
        const text = 'Testtext für Cache';
        const targetLang = 'EN-US';

        // Erste Übersetzung
        const result1 = await translationService.translate(text, { targetLang });
        await translationCache.set(text, targetLang, result1.text, result1.provider);

        // Aus Cache laden
        const cached = await translationCache.get(text, targetLang);
        
        assert.ok(cached);
        assert.strictEqual(cached, result1.text);
    });

    test('Cache-Stats sollten korrekt sein', async () => {
        const stats = translationCache.getStats();
        
        assert.ok(stats);
        assert.strictEqual(typeof stats.size, 'number');
        assert.strictEqual(stats.maxSize, 1000);
    });

    test('Fehlerhafte Übersetzung sollte Fallback liefern', async () => {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        await config.update('translationProvider', 'deepl', vscode.ConfigurationTarget.Global);
        await config.update('deepl.apiKey', '', vscode.ConfigurationTarget.Global);
        
        const result = await translationService.translate('Test', {
            targetLang: 'EN-US'
        });
        
        // Sollte Fallback sein (Original-Text)
        assert.strictEqual(result.provider, 'fallback');
    });
});

suite('TranslationCache Test Suite', () => {
    let context: vscode.ExtensionContext;
    let cache: TranslationCache;

    suiteSetup(async () => {
        const extension = vscode.extensions.getExtension('spec-kit.spec-kit-bridger-de');
        assert.ok(extension);
        context = await extension.activate();
    });

    setup(() => {
        cache = new TranslationCache(context);
    });

    teardown(async () => {
        await cache.clear();
    });

    test('Cache sollte leer starten', () => {
        const stats = cache.getStats();
        assert.strictEqual(stats.size, 0);
    });

    test('Set und Get sollten funktionieren', async () => {
        await cache.set('Test', 'DE', 'Test Translation', 'mock');
        const result = await cache.get('Test', 'DE');
        
        assert.strictEqual(result, 'Test Translation');
    });

    test('Cache sollte bei deaktiviertem Setting nicht speichern', async () => {
        const config = vscode.workspace.getConfiguration('spec-kit-bridger');
        await config.update('cacheEnabled', false, vscode.ConfigurationTarget.Global);
        
        await cache.set('Test', 'DE', 'Translation', 'mock');
        const result = await cache.get('Test', 'DE');
        
        assert.strictEqual(result, null);
        
        // Cleanup
        await config.update('cacheEnabled', true, vscode.ConfigurationTarget.Global);
    });

    test('Clear sollte Cache leeren', async () => {
        await cache.set('Test1', 'DE', 'Translation1', 'mock');
        await cache.set('Test2', 'DE', 'Translation2', 'mock');
        
        let stats = cache.getStats();
        assert.ok(stats.size > 0);
        
        await cache.clear();
        
        stats = cache.getStats();
        assert.strictEqual(stats.size, 0);
    });
});
