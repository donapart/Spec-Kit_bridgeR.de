import * as vscode from 'vscode';
import { PromptExplorerProvider } from './PromptExplorerProvider';

export class PromptExplorerSearchView implements vscode.WebviewViewProvider {
  public static readonly viewId = 'specKitPromptExplorerSearch';
  private _view: vscode.WebviewView | undefined;

  constructor(private readonly context: vscode.ExtensionContext, private readonly explorer: PromptExplorerProvider) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg?.command === 'setFilter') {
        this.explorer.setFilter(String(msg.value || ''));
      } else if (msg?.command === 'clearFilter') {
        this.explorer.setFilter('');
        this._view?.webview.postMessage({ command: 'setValue', value: '' });
      }
    });
  }

  private getHtml(): string {
    return `<!doctype html>
    <meta charset="utf-8" />
    <style>
      :root{
        --fg: var(--vscode-foreground);
        --bg: var(--vscode-editor-background);
        --input-bg: var(--vscode-input-background);
        --input-fg: var(--vscode-input-foreground);
        --input-border: var(--vscode-input-border);
        --accent: var(--vscode-focusBorder);
      }
      body{ margin:0; padding:6px 6px 8px 6px; font-family: var(--vscode-font-family, Segoe UI, sans-serif); color: var(--fg); background: var(--bg); }
      .row{ display:flex; align-items:center; gap:6px; }
      input{ flex:1; padding:6px 8px; background: var(--input-bg); color: var(--input-fg); border: 1px solid var(--input-border); border-radius: 4px; outline: none; }
      input:focus{ border-color: var(--accent); }
      button{ border:1px solid var(--input-border); background: transparent; color: var(--fg); padding:6px 10px; border-radius:4px; cursor:pointer; }
      button:hover{ border-color: var(--accent); }
      .hint{ font-size: 11px; opacity:.7; margin-top:4px; }
    </style>
    <div class="row">
      <input id="q" type="text" placeholder="Live-Suche… (Name, Beschreibung, Inhalt)" />
      <button id="clear" title="Filter löschen">✕</button>
    </div>
    <div class="hint">Tippen zum Filtern • Enter: schließen • Esc: löschen</div>
    <script>
      const vscode = acquireVsCodeApi();
      const q = document.getElementById('q');
      const clearBtn = document.getElementById('clear');
      q.addEventListener('input', () => {
        vscode.postMessage({ command: 'setFilter', value: q.value });
      });
      q.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { q.value=''; vscode.postMessage({ command: 'clearFilter' }); }
        if (e.key === 'Enter') { window.blur(); }
      });
      clearBtn.addEventListener('click', ()=>{ q.value=''; vscode.postMessage({ command: 'clearFilter' }); });
      window.addEventListener('message', ev => {
        const m = ev.data;
        if (m?.command === 'setValue') { q.value = m.value || ''; }
      });
      setTimeout(()=>{ try{ q.focus(); }catch(e){} }, 0);
    </script>`;
  }
}

export function registerPromptExplorerSearchView(context: vscode.ExtensionContext, explorer: PromptExplorerProvider): void {
  const provider = new PromptExplorerSearchView(context, explorer);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PromptExplorerSearchView.viewId, provider)
  );
}
