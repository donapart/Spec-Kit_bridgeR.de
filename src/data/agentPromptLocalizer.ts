import type { AgentPrompt } from './AgentPrompt';

export type UiLang = 'de' | 'en';
export type TranslateFn = (text: string) => Promise<string>;

function categoryDe(cat: string): string {
    switch (cat) {
        case 'Product': return 'Produkt';
        case 'Growth': return 'Wachstum';
        case 'Research': return 'Forschung';
        case 'Revenue': return 'Umsatz';
        case 'Analytics': return 'Analytik';
        case 'Architecture': return 'Architektur';
        case 'Code': return 'Code';
        case 'Backend': return 'Backend';
        case 'Database': return 'Datenbank';
        default: return 'Sonstiges';
    }
}

function quickSummary(s?: string): string | undefined {
    if (!s) return undefined;
    const first = (s.split(/\r?\n|[.!?]/).find(Boolean) || s).trim();
    return first.length > 160 ? first.slice(0, 157) + '…' : first;
}

export interface LocalizedAgent extends AgentPrompt {
    displayName?: string;
    displayDescription?: string;
    displayPrompt?: string;
    categoryDe?: string;
}

export async function localizeAgents(
    agents: AgentPrompt[],
    lang: UiLang,
    translate?: TranslateFn
): Promise<LocalizedAgent[]> {
    // EN passthrough (nur categoryDe für Anzeige ergänzen)
    if (lang === 'en') {
        return agents.map(a => ({ ...a, categoryDe: categoryDe(a.category) }));
    }

    const out: LocalizedAgent[] = [];
    const canTranslate = typeof translate === 'function';

    for (const a of agents) {
        if (!canTranslate) {
            out.push({ ...a, categoryDe: categoryDe(a.category) });
            continue;
        }
        try {
            const [nameDe, descDe, promptDe] = await Promise.all([
                translate(a.name),
                a.description ? translate(a.description) : Promise.resolve<string>(''),
                translate(a.prompt)
            ]);
            out.push({
                ...a,
                displayName: nameDe || a.name,
                displayDescription: quickSummary(descDe || promptDe) || descDe || a.description,
                displayPrompt: promptDe || a.prompt,
                categoryDe: categoryDe(a.category)
            });
        } catch {
            out.push({ ...a, categoryDe: categoryDe(a.category) });
        }
    }

    return out;
}
