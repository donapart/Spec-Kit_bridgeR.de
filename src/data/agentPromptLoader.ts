import * as vscode from 'vscode';
import { AgentPrompt } from './AgentPrompt';

const DOCS_ROOT = ['docs', 'system_prompts_leaks-main'];

export async function loadAgentPrompts(context: vscode.ExtensionContext): Promise<AgentPrompt[]> {
  try {
    const root = vscode.Uri.joinPath(context.extensionUri, ...DOCS_ROOT);
    const fileUris = await listFilesRecursive(root, new Set());
    const cfg = vscode.workspace.getConfiguration('spec-kit-bridger');
    const maxAgents = Math.max(0, cfg.get<number>('agents.maxAgents', 1000));

    const all: AgentPrompt[] = [];

    for (const fileUri of fileUris) {
      const buf = await vscode.workspace.fs.readFile(fileUri);
      const text = Buffer.from(buf).toString('utf8');
      const ext = fileUri.path.toLowerCase();
      let parsed: AgentPrompt[] = [];
      if (ext.endsWith('.md')) {
        parsed = parseMarkdownAgents(text);
      } else if (ext.endsWith('.txt')) {
        parsed = parsePlaintextAsSingle(fileUri, text);
      } else {
        continue;
      }
      all.push(...parsed);
    }

    // Deduplicate by id, keep first occurrence
    const unique = new Map<string, AgentPrompt>();
    for (const p of all) {
      if (!unique.has(p.id)) {
        unique.set(p.id, p);
      }
    }

    // Cap to configured max to keep UI snappy (default high)
    const result = Array.from(unique.values());
    return maxAgents > 0 ? result.slice(0, maxAgents) : result;
  } catch (err) {
    console.error('loadAgentPrompts error', err);
    return [];
  }
}

export interface AgentTreeNode {
  type: 'vendor' | 'folder' | 'file' | 'prompt';
  id: string;
  label: string;
  children?: AgentTreeNode[];
  fileUri?: vscode.Uri;
  prompt?: AgentPrompt;
}

/**
 * Baue einen vollständigen Prompt-Katalog als Baum (ohne 100er Limit).
 */
export async function buildPromptCatalog(context: vscode.ExtensionContext): Promise<AgentTreeNode[]> {
  const root = vscode.Uri.joinPath(context.extensionUri, ...DOCS_ROOT);
  const files = await listFilesRecursive(root, new Set());
  const byVendor = new Map<string, AgentTreeNode>();

  for (const file of files) {
    const rel = file.path.replace(root.path, '').replace(/^\/+/, '');
    const segs = rel.split('/').filter(Boolean);
    const vendor = segs[0] || 'Misc';
    const vendorId = `vendor:${vendor}`;
    if (!byVendor.has(vendorId)) {
      byVendor.set(vendorId, { type: 'vendor', id: vendorId, label: vendor, children: [] });
    }
    const vendorNode = byVendor.get(vendorId)!;

    // Ordnerkette
    let parent = vendorNode;
    for (let i = 1; i < Math.max(1, segs.length - 1); i++) {
      const folder = segs[i];
      const folderId = `${parent.id}/folder:${folder}`;
      let node = parent.children!.find(c => c.id === folderId);
      if (!node) {
        node = { type: 'folder', id: folderId, label: folder, children: [] };
        parent.children!.push(node);
      }
      parent = node;
    }

    const fileName = segs[segs.length - 1] || 'file';
    const fileId = `${parent.id}/file:${fileName}`;
    let fileNode = parent.children!.find(c => c.id === fileId);
    if (!fileNode) {
      fileNode = { type: 'file', id: fileId, label: fileName, children: [], fileUri: file };
      parent.children!.push(fileNode);
    }

    const buf = await vscode.workspace.fs.readFile(file);
    const text = Buffer.from(buf).toString('utf8');
    const ext = file.path.toLowerCase();
    const prompts = ext.endsWith('.md') ? parseMarkdownAgents(text) : ext.endsWith('.txt') ? parsePlaintextAsSingle(file, text) : [];
    for (const p of prompts) {
      fileNode.children!.push({ type: 'prompt', id: p.id, label: p.name, prompt: p, fileUri: file });
    }
  }

  return Array.from(byVendor.values());
}

/**
 * Scanne Korpus und liefere Anzahl Dateien/Prompts.
 */
export async function scanPromptCorpus(context: vscode.ExtensionContext): Promise<{ files: number; prompts: number }>{
  const root = vscode.Uri.joinPath(context.extensionUri, ...DOCS_ROOT);
  const files = await listFilesRecursive(root, new Set());
  let prompts = 0;
  for (const file of files) {
    const buf = await vscode.workspace.fs.readFile(file);
    const text = Buffer.from(buf).toString('utf8');
    const ext = file.path.toLowerCase();
    const list = ext.endsWith('.md') ? parseMarkdownAgents(text) : ext.endsWith('.txt') ? parsePlaintextAsSingle(file, text) : [];
    prompts += list.length;
  }
  return { files: files.length, prompts };
}

async function listFilesRecursive(dir: vscode.Uri, seen: Set<string>): Promise<vscode.Uri[]> {
  const out: vscode.Uri[] = [];
  try {
    const entries = await vscode.workspace.fs.readDirectory(dir);
    for (const [name, fileType] of entries) {
      const child = vscode.Uri.joinPath(dir, name);
      if (seen.has(child.toString())) {
        continue;
      }
      seen.add(child.toString());
      if (fileType === vscode.FileType.File) {
        const lower = name.toLowerCase();
        if (lower.endsWith('.md') || lower.endsWith('.txt')) {
          out.push(child);
        }
      } else if (fileType === vscode.FileType.Directory) {
        const nested = await listFilesRecursive(child, seen);
        out.push(...nested);
      }
    }
  } catch {
    // ignore
  }
  return out;
}

// kept for potential future use
async function _fileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

function parseMarkdownAgents(markdown: string): AgentPrompt[] {
  const lines = markdown.split(/\r?\n/);
  const prompts: AgentPrompt[] = [];

  let currentTitle: string | null = null;
  let currentContent: string[] = [];

  const flush = () => {
    if (!currentTitle) {
      return;
    }
    const content = currentContent.join('\n').trim();
    if (!content) {
      return;
    }
    const id = slug(currentTitle);
    const description = firstSentence(content).slice(0, 180);
    const category = inferCategory(currentTitle, content);
    prompts.push({ id, name: currentTitle, category, description, prompt: content });
    currentTitle = null;
    currentContent = [];
  };

  for (const line of lines) {
    const m = /^(#{2,4})\s+(.+)$/.exec(line);
    if (m) {
      // New section
      flush();
      currentTitle = m[2].trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }
  flush();

  // Heuristic: only keep prompts with some length
  return prompts.filter(p => p.prompt && p.prompt.length > 60);
}

function parsePlaintextAsSingle(uri: vscode.Uri, text: string): AgentPrompt[] {
  const nameFromFile = uri.path.split('/').pop() || 'Prompt';
  const base = nameFromFile.replace(/\.(txt)$/i, '').replace(/[-_]/g, ' ');
  const name = titleCase(base);
  const id = slug(name);
  const description = firstSentence(text).slice(0, 180);
  const category = inferCategory(name, text);
  return [
    {
      id,
      name,
      category,
      description,
      prompt: text.trim()
    }
  ];
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function firstSentence(s: string): string {
  const m = /([\s\S]{1,200}?\.)\s/.exec(s);
  if (m) {
    return m[1];
  }
  return s.split(/\n/)[0] ?? s.slice(0, 200);
}

function inferCategory(title: string, body: string): string {
  const t = (title + ' ' + body).toLowerCase();
  if (/product|roadmap|pm|strategy/.test(t)) {
    return 'Product';
  }
  if (/growth|acquisition|activation|retention|roi|experiment/.test(t)) {
    return 'Growth';
  }
  if (/research|interview|usability|insight/.test(t)) {
    return 'Research';
  }
  if (/revenue|pricing|moneti/.test(t)) {
    return 'Revenue';
  }
  if (/market|competitor|position/.test(t)) {
    return 'Analytics';
  }
  if (/architect|architecture|system|design/.test(t)) {
    return 'Architecture';
  }
  if (/api|endpoint|backend|server/.test(t)) {
    return 'Backend';
  }
  if (/db|database|schema|sql|index/.test(t)) {
    return 'Database';
  }
  if (/code|refactor|test/.test(t)) {
    return 'Code';
  }
  return 'Misc';
}

function titleCase(s: string): string {
  return s
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
