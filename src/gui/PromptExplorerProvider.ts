import * as vscode from 'vscode';
import type { AgentTreeNode } from '../data/agentPromptLoader';
import { buildPromptCatalog, scanPromptCorpus } from '../data/agentPromptLoader';
import { toAzureSsml } from '../tts/speechMarkdown';
import { localizeAgents, type UiLang } from '../data/agentPromptLocalizer';
import { TranslationService } from '../translation/TranslationService';
import type { AgentPrompt } from '../data/AgentPrompt';

export class PromptExplorerProvider implements vscode.TreeDataProvider<AgentTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeNode | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private cache: AgentTreeNode[] = [];
  private filteredCache: AgentTreeNode[] | null = null;
  private filterText = '';
  private favorites = new Set<string>();
  private uiLang: UiLang = 'de';
  private localized = new Map<string, { name?: string; description?: string }>();
  private translationService: TranslationService;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.translationService = new TranslationService(context);
    this.loadSettings();
    this.favorites = this.getFavorites();
  }

  private loadSettings() {
    const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
    this.uiLang = cfg.get<'de' | 'en'>('agents.language', 'de');
  }

  private getFavorites(): Set<string> {
    const ids = this.context.globalState.get<string[]>('agentFavorites', []);
    return new Set(ids);
  }

  private async setFavorites(ids: Set<string>): Promise<void> {
    await this.context.globalState.update('agentFavorites', Array.from(ids));
  }

  async refresh(): Promise<void> {
    this.loadSettings();
    this.favorites = this.getFavorites();
    this.cache = await buildPromptCatalog(this.context);
    await this.maybeLocalizePrompts();
    this.applyFilter();
    this._onDidChangeTreeData.fire();
  }

  setFilter(text: string) {
    this.filterText = (text || '').trim().toLowerCase();
    this.applyFilter();
    this._onDidChangeTreeData.fire();
  }

  private applyFilter() {
    if (!this.filterText) {
      this.filteredCache = null;
      return;
    }
    const match = (node: AgentTreeNode): AgentTreeNode | null => {
      if (node.type === 'prompt' && node.prompt) {
        const loc = this.localized.get(node.prompt.id);
        const name = (this.uiLang === 'de' ? (loc?.name || node.prompt.name) : node.prompt.name) || '';
        const desc = (this.uiLang === 'de' ? (loc?.description || node.prompt.description || '') : (node.prompt.description || ''));
        const body = node.prompt.prompt || '';
        const hay = (name + ' ' + desc + ' ' + body).toLowerCase();
        return hay.includes(this.filterText) ? { ...node } : null;
      }
      const children = (node.children || [])
        .map(match)
        .filter((c): c is AgentTreeNode => !!c);
      if (children.length > 0) {
        return { ...node, children };
      }
      return null;
    };
    this.filteredCache = this.cache.map(match).filter((n): n is AgentTreeNode => !!n);
  }

  private async maybeLocalizePrompts() {
    if (this.uiLang !== 'de') {
      this.localized.clear();
      return;
    }
    // collect all prompts
    const prompts: { id: string; name: string; description?: string; prompt: string }[] = [];
    const walk = (nodes: AgentTreeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'prompt' && n.prompt) {
          prompts.push({ id: n.prompt.id, name: n.prompt.name, description: n.prompt.description, prompt: n.prompt.prompt });
        }
        if (n.children) walk(n.children);
      }
    };
    walk(this.cache);
    if (prompts.length === 0) { this.localized.clear(); return; }

    const translate = async (text: string) => {
      const res = await this.translationService.translate(text, { targetLang: 'DE', preserveCodeBlocks: true });
      return res.text;
    };
    try {
      const localizedList = await localizeAgents(
        prompts.map(p => ({ id: p.id, name: p.name, description: p.description || '', prompt: p.prompt, category: 'Misc' } as AgentPrompt)),
        'de',
        translate
      );
      this.localized = new Map(localizedList.map(l => [l.id, { name: l.displayName || l.name, description: l.displayDescription || l.description }]));
    } catch {
      this.localized.clear();
    }
  }

  getTreeItem(element: AgentTreeNode): vscode.TreeItem {
    switch (element.type) {
      case 'vendor':
      case 'folder': {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
        item.contextValue = element.type;
        item.iconPath = new vscode.ThemeIcon(element.type === 'vendor' ? 'organization' : 'folder');
        return item;
      }
      case 'file': {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.Collapsed);
        item.contextValue = 'file';
        item.resourceUri = element.fileUri;
        item.iconPath = new vscode.ThemeIcon('file-text');
        return item;
      }
      case 'prompt': {
        const p = element.prompt!;
        const loc = this.localized.get(p.id);
        const display = this.uiLang === 'de' ? (loc?.name || p.name) : p.name;
        const item = new vscode.TreeItem(display, vscode.TreeItemCollapsibleState.None);
        const isFav = this.favorites.has(p.id);
        item.contextValue = isFav ? 'prompt;favorite' : 'prompt';
        const desc = this.uiLang === 'de' ? (loc?.description || p.description || '') : (p.description || '');
        item.tooltip = new vscode.MarkdownString(`$(info) ${desc || (p.prompt?.slice(0, 200) || '')}`);
        item.iconPath = new vscode.ThemeIcon(isFav ? 'star-full' : 'symbol-parameter');
        item.command = {
          command: 'spec-kit-bridger.prompts.copy',
          title: 'Prompt kopieren',
          arguments: [element]
        };
        return item;
      }
      default:
        return new vscode.TreeItem(element.label);
    }
  }

  async getChildren(element?: AgentTreeNode): Promise<AgentTreeNode[]> {
    if (!element) {
      if (this.cache.length === 0) await this.refresh();
      return this.filteredCache ?? this.cache;
    }
    return element.children ?? [];
  }
}

export function registerPromptExplorer(context: vscode.ExtensionContext): PromptExplorerProvider {
  const provider = new PromptExplorerProvider(context);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('specKitPromptExplorer', provider),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.search', async () => {
      const value = await vscode.window.showInputBox({ prompt: 'Prompt Explorer filtern (Name, Beschreibung, Inhalt)', placeHolder: 'Suchbegriff…' });
      provider.setFilter(value || '');
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.copy', async (node: AgentTreeNode) => {
      if (node.prompt) {
        await vscode.env.clipboard.writeText(node.prompt.prompt);
        vscode.window.showInformationMessage('Prompt in die Zwischenablage kopiert.');
      }
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.insert', async (node: AgentTreeNode) => {
      if (!node.prompt) { return; }
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Kein aktiver Editor.'); return; }
      await editor.edit(edit => {
        edit.insert(editor.selection.active, node.prompt!.prompt);
      });
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.toggleFavorite', async (node: AgentTreeNode) => {
      if (!node.prompt) return;
      const favs = provider['favorites'];
      if (favs.has(node.prompt.id)) favs.delete(node.prompt.id); else favs.add(node.prompt.id);
      await provider['setFavorites'](favs);
      await provider.refresh();
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.exportSsml', async (node: AgentTreeNode) => {
      if (!node.prompt) return;
      const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
      const fmt = cfg.get<'plain' | 'speechmarkdown' | 'ssml'>('tts.inputFormat', 'plain');
      const ssml = toAzureSsml(node.prompt.prompt, fmt, 'de-DE-KatjaNeural');
      await vscode.env.clipboard.writeText(ssml);
      vscode.window.showInformationMessage('SSML (Azure) in die Zwischenablage kopiert.');
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.exportFileSsml', async (node: AgentTreeNode) => {
      if (node.type !== 'file') return;
      const prompts: string[] = [];
      for (const c of node.children || []) {
        if (c.type === 'prompt' && c.prompt?.prompt) prompts.push(c.prompt.prompt);
      }
      if (prompts.length === 0) { vscode.window.showWarningMessage('Keine Prompts in dieser Datei gefunden.'); return; }
      const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
      const fmt = cfg.get<'plain' | 'speechmarkdown' | 'ssml'>('tts.inputFormat', 'plain');
      const joined = prompts.join('\n\n');
      const ssml = toAzureSsml(joined, fmt, 'de-DE-KatjaNeural');
      const uri = await vscode.window.showSaveDialog({ /* eslint-disable-line @typescript-eslint/naming-convention */ filters: { SSML: ['ssml', 'xml'] }, saveLabel: 'SSML speichern', defaultUri: vscode.Uri.file('prompts.ssml') });
      if (!uri) return;
      await vscode.workspace.fs.writeFile(uri, Buffer.from(ssml, 'utf8'));
      vscode.window.showInformationMessage(`SSML gespeichert: ${uri.fsPath}`);
    }),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.openMap', () => openPromptMapWebview(context)),
    vscode.commands.registerCommand('spec-kit-bridger.prompts.scan', async () => {
      const res = await scanPromptCorpus(context);
      vscode.window.showInformationMessage(`Prompt-Korpus: ${res.files} Dateien, ${res.prompts} Prompts erkannt.`);
    })
  );
  return provider;
}

async function openPromptMapWebview(context: vscode.ExtensionContext): Promise<void> {
  const panel = vscode.window.createWebviewPanel('specKitPromptMap', 'Spec‑Kit: Prompt Map', vscode.ViewColumn.Active, { enableScripts: true });
  const catalog = await buildPromptCatalog(context);
  panel.webview.html = `<!doctype html>
  <meta charset="utf-8"/>
  <style>
    body{font-family: var(--vscode-font-family);padding:10px; color: var(--vscode-foreground); background: var(--vscode-editor-background);}
    details{margin:4px 0;}
    summary{cursor:pointer;}
    .prompt{padding:2px 8px; margin:2px 0; border-left:2px solid var(--vscode-editorWidget-border);} 
    small.muted{opacity:.6}
  </style>
  <h3>Prompt-Katalog</h3>
  ${renderNodes(catalog)}
  <script>
    const vscode = acquireVsCodeApi();
    document.body.addEventListener('click', async (e)=>{
      const el = e.target.closest('[data-prompt]');
      if(!el) return;
      const text = el.getAttribute('data-prompt');
      vscode.postMessage({ command:'copy', text });
    });
  </script>`;
  panel.webview.onDidReceiveMessage(async msg => {
    if (msg?.command === 'copy') {
      await vscode.env.clipboard.writeText(msg.text || '');
      vscode.window.showInformationMessage('Prompt kopiert.');
    }
  });

  function esc(s: string){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderNodes(nodes: AgentTreeNode[]): string {
    return nodes.map(n => {
      if (n.type === 'prompt' && n.prompt) {
        const t = esc(n.prompt.name || '');
        const sub = esc(n.prompt.description || '');
        const content = esc(n.prompt.prompt || '');
        return `<div class="prompt" title="Klicken zum Kopieren" data-prompt="${content}">${t} <small class="muted">– ${sub}</small></div>`;
      }
      const children = renderNodes(n.children || []);
      return `<details open><summary>${esc(n.label)}</summary>${children}</details>`;
    }).join('');
  }
}
