import * as vscode from 'vscode';
import { ChatParticipantHandler } from './chat/ChatParticipantHandler';
import { DocumentationView } from './documentation/DocumentationView';
import { TranslationService } from './translation/TranslationService';
import { TranslationCache } from './translation/TranslationCache';
import { SettingsWebviewProvider } from './gui/SettingsWebviewProvider';
import { StatusBarProvider } from './gui/StatusBarProvider';
import { CommandCenterWebview } from './gui/CommandCenterWebview';
import { registerPromptExplorer } from './gui/PromptExplorerProvider';

let chatHandler: ChatParticipantHandler | undefined;
let documentationView: DocumentationView | undefined;
let translationService: TranslationService | undefined;
let settingsWebview: SettingsWebviewProvider | undefined;
let statusBar: StatusBarProvider | undefined;
let commandCenter: CommandCenterWebview | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Spec-Kit BridgeR.DE wird aktiviert...');

    // Translation Service initialisieren
    translationService = new TranslationService(context);
    const translationCache = new TranslationCache(context);

    // Chat Participant Handler registrieren
    chatHandler = new ChatParticipantHandler(translationService, translationCache);
    const participant = vscode.chat.createChatParticipant(
        'spec-kit-bridger.de',
        chatHandler.handleRequest.bind(chatHandler)
    );
    participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');
    context.subscriptions.push(participant);

    // Documentation View initialisieren
    documentationView = new DocumentationView(context, translationService, translationCache);

    // Settings Webview initialisieren
    settingsWebview = new SettingsWebviewProvider(context);

    // Status Bar initialisieren
    statusBar = new StatusBarProvider(context);

    // Command Center initialisieren
    commandCenter = new CommandCenterWebview(context);

    // Commands registrieren
    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.openCommandCenter', () => {
            commandCenter?.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.showDocs', () => {
            documentationView?.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.openSettings', () => {
            settingsWebview?.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.quickSwitchProvider', () => {
            statusBar?.showQuickPick();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.switchMode', async () => {
            const mode = await vscode.window.showQuickPick(
                ['english', 'german', 'parallel', 'tts'],
                {
                    placeHolder: 'Anzeigemodus für Dokumentation wählen'
                }
            );
            if (mode) {
                await vscode.workspace.getConfiguration('spec-kit-bridger')
                    .update('documentationMode', mode, vscode.ConfigurationTarget.Global);
                documentationView?.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('spec-kit-bridger.clearCache', async () => {
            await translationCache.clear();
            vscode.window.showInformationMessage('Übersetzungs-Cache wurde geleert');
        })
    );

    // Prompt Explorer registrieren
    registerPromptExplorer(context);

    console.log('Spec-Kit BridgeR.DE erfolgreich aktiviert!');
}

export function deactivate() {
    console.log('Spec-Kit BridgeR.DE wird deaktiviert...');
}
