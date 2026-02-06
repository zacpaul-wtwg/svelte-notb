import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
	html: true,
	linkify: true
});

export function renderMarkdown(source = '') {
	if (!source) return '';
	return md.render(source);
}
