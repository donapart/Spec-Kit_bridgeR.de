/**
 * ResponseCleaner - Bereinigt Markdown-Artefakte nach Übersetzung
 * 
 * Probleme die gelöst werden:
 * 1. Fehlende Leerzeichen nach Listenmarkern (1.Text → 1. Text)
 * 2. Kaputte Code-Block-Marker (```typescript\n → ```typescript)
 * 3. Doppelte Leerzeilen entfernen
 * 4. Whitespace um Headings normalisieren
 * 5. Inline-Code Spacing (` code` → `code`)
 */
export class ResponseCleaner {
    /**
     * Bereinige kompletten Response-Text
     */
    static clean(text: string): string {
        let cleaned = text;

        // 1. Liste-Marker Spacing
        cleaned = this.fixListSpacing(cleaned);

        // 2. Code-Block Formatting
        cleaned = this.fixCodeBlocks(cleaned);

        // 3. Heading Spacing
        cleaned = this.fixHeadingSpacing(cleaned);

        // 4. Inline-Code Spacing
        cleaned = this.fixInlineCodeSpacing(cleaned);

        // 5. Whitespace Normalisierung
        cleaned = this.normalizeWhitespace(cleaned);

        // 6. Trailing Whitespace
        cleaned = this.removeTrailingWhitespace(cleaned);

        return cleaned;
    }

    /**
     * Fixe Listen-Spacing
     * 
     * Vor:  "1.Schritt eins\n2.Schritt zwei"
     * Nach: "1. Schritt eins\n2. Schritt zwei"
     */
    private static fixListSpacing(text: string): string {
        // Numerierte Listen: "1.Text" → "1. Text"
        text = text.replace(/^(\s*)(\d+)\.([^\s])/gm, '$1$2. $3');

        // Ungeordnete Listen: "-Text" → "- Text", "*Text" → "* Text"
        text = text.replace(/^(\s*)([-*])([^\s])/gm, '$1$2 $3');

        // Checkbox-Listen: "- [ ]Text" → "- [ ] Text"
        text = text.replace(/^(\s*)-\s*\[([ x])\]([^\s])/gm, '$1- [$2] $3');

        return text;
    }

    /**
     * Fixe Code-Block Formatierung
     * 
     * Probleme:
     * - Fehlende Newline nach Opening: "```typescript\ncode"
     * - Fehlende Newline vor Closing: "code\n```"
     * - Language-Tag Spacing: "``` typescript" → "```typescript"
     */
    private static fixCodeBlocks(text: string): string {
        // Entferne Leerzeichen zwischen ``` und Language-Tag
        text = text.replace(/```\s+(\w+)/g, '```$1');

        // Stelle sicher: Newline nach öffnendem ```
        text = text.replace(/```(\w+)?([^\n])/g, '```$1\n$2');

        // Stelle sicher: Newline vor schließendem ```
        text = text.replace(/([^\n])```/g, '$1\n```');

        return text;
    }

    /**
     * Fixe Heading Spacing
     * 
     * Vor:  "##Überschrift"
     * Nach: "## Überschrift"
     */
    private static fixHeadingSpacing(text: string): string {
        // "#Text" → "# Text" (alle Heading-Levels)
        text = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

        // Stelle sicher: Leerzeile vor Heading (außer am Anfang)
        text = text.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');

        // Stelle sicher: Leerzeile nach Heading
        text = text.replace(/(#{1,6}\s[^\n]+)\n([^\n#])/g, '$1\n\n$2');

        return text;
    }

    /**
     * Fixe Inline-Code Spacing
     * 
     * Problem: Übersetzungen fügen manchmal Leerzeichen in Code ein
     * Vor:  "Die Funktion ` console.log ` verwendet"
     * Nach: "Die Funktion `console.log` verwendet"
     */
    private static fixInlineCodeSpacing(text: string): string {
        // Entferne Leerzeichen direkt nach öffnendem `
        text = text.replace(/`\s+/g, '`');

        // Entferne Leerzeichen direkt vor schließendem `
        text = text.replace(/\s+`/g, '`');

        return text;
    }

    /**
     * Normalisiere Whitespace
     * 
     * - Entferne >2 aufeinanderfolgende Newlines
     * - Entferne Leerzeichen am Zeilenende
     * - Stelle sicher: Datei endet mit Newline
     */
    private static normalizeWhitespace(text: string): string {
        // Reduziere mehrfache Leerzeilen auf maximal 2
        text = text.replace(/\n{3,}/g, '\n\n');

        // Entferne Leerzeichen am Ende jeder Zeile
        text = text.replace(/[ \t]+$/gm, '');

        // Stelle sicher: Genau eine Newline am Ende
        text = text.replace(/\n*$/, '\n');

        return text;
    }

    /**
     * Entferne Trailing Whitespace
     */
    private static removeTrailingWhitespace(text: string): string {
        return text.replace(/[ \t]+$/gm, '');
    }

    /**
     * Fixe häufige Übersetzungs-Artefakte
     * 
     * Beispiele:
     * - "Hier ist ein Beispiel:" → "Hier ist ein Beispiel:\n"
     * - "1.Erstelle" → "1. Erstelle"
     */
    static fixTranslationArtifacts(text: string): string {
        let cleaned = text;

        // Doppelte Satzzeichen entfernen
        cleaned = cleaned.replace(/([.!?]){2,}/g, '$1');

        // Leerzeichen vor Satzzeichen entfernen
        cleaned = cleaned.replace(/\s+([.!?,;:])/g, '$1');

        // Leerzeichen nach öffnenden Klammern entfernen
        cleaned = cleaned.replace(/\(\s+/g, '(');

        // Leerzeichen vor schließenden Klammern entfernen
        cleaned = cleaned.replace(/\s+\)/g, ')');

        // Doppelte Leerzeichen entfernen (außer in Code-Blöcken)
        cleaned = cleaned.replace(/([^`])\s{2,}([^`])/g, '$1 $2');

        return cleaned;
    }

    /**
     * Validiere Markdown-Struktur
     * 
     * Prüft:
     * - Alle Code-Blöcke geschlossen?
     * - Korrekte Heading-Hierarchie?
     * - Keine kaputten Links?
     */
    static validate(text: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Prüfe: Gleich viele öffnende wie schließende Code-Blöcke
        const codeBlockMarkers = text.match(/```/g);
        if (codeBlockMarkers && codeBlockMarkers.length % 2 !== 0) {
            errors.push('Ungleiche Anzahl von Code-Block-Markern (```)');
        }

        // Prüfe: Heading-Hierarchie (optional, kann zu strikt sein)
        const headings = text.match(/^#{1,6}\s/gm);
        if (headings) {
            let lastLevel = 0;
            headings.forEach((heading, index) => {
                const level = heading.match(/^#+/)?.[0].length || 0;
                if (level > lastLevel + 1) {
                    errors.push(`Heading-Hierarchie springt von H${lastLevel} zu H${level} (Zeile ${index + 1})`);
                }
                lastLevel = level;
            });
        }

        // Prüfe: Kaputte Links [text]( url) mit Leerzeichen
        const brokenLinks = text.match(/\]\(\s+[^)]+\)/g);
        if (brokenLinks) {
            errors.push(`Kaputte Links mit Leerzeichen nach '(': ${brokenLinks.length} gefunden`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Bereinige und validiere in einem Schritt
     */
    static cleanAndValidate(text: string): {
        cleaned: string;
        validation: { valid: boolean; errors: string[] };
    } {
        const cleaned = this.clean(text);
        const validation = this.validate(cleaned);

        return { cleaned, validation };
    }

    /**
     * Statistiken über Bereinigung
     */
    static getCleaningStats(original: string, cleaned: string) {
        return {
            originalLength: original.length,
            cleanedLength: cleaned.length,
            removedChars: original.length - cleaned.length,
            originalLines: original.split('\n').length,
            cleanedLines: cleaned.split('\n').length,
            removedLines: original.split('\n').length - cleaned.split('\n').length
        };
    }
}
