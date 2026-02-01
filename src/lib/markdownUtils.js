import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';

// Configure Turndown service for HTML -> Markdown
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
});

// Use GFM plugin (tables, strikethrough, task lists, etc.)
turndownService.use(gfm);

// Custom rules if needed (e.g. ignoring specific classes)
turndownService.addRule('ignore-ui-elements', {
    filter: ['script', 'style', 'button'],
    replacement: () => ''
});

/**
 * Convert HTML to Markdown
 * @param {string} html 
 * @returns {string} Markdown
 */
export function htmlToMarkdown(html) {
    if (!html) return "";
    return turndownService.turndown(html);
}

/**
 * Convert Markdown to HTML
 * @param {string} markdown 
 * @returns {string} HTML
 */
export function markdownToHtml(markdown) {
    if (!markdown) return "";
    return marked.parse(markdown);
}
