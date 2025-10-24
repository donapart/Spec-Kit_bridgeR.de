// Minimal Speech Markdown helpers without external deps
// Converts Speech Markdown-ish text to plain and Azure SSML

export type TtsInputFormat = 'plain' | 'speechmarkdown' | 'ssml';

function stripSpeechMarkdown(text: string): string {
    try {
        return text
            .replace(/:[a-zA-Z-]+\([^)]*\)/g, '') // marker like :mark(x)
            .replace(/\[[^\]]+\]/g, '')          // literal [word]
            .replace(/\{[^}]+\}/g, '')            // options block
            .replace(/\s+/g, ' ')                  // compress whitespace
            .trim();
    } catch {
        return text;
    }
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function toPlainFromSpeechMarkdown(input: string, format: TtsInputFormat): string {
    if (format === 'speechmarkdown') {
        return stripSpeechMarkdown(input);
    }
    return input;
}

export function toAzureSsml(input: string, format: TtsInputFormat, voice = 'de-DE-KatjaNeural'): string {
    const plain = toPlainFromSpeechMarkdown(input, format);
    const xml = escapeXml(plain);
    return `<speak version="1.0" xml:lang="de-DE"><voice name="${voice}">${xml}</voice></speak>`;
}
