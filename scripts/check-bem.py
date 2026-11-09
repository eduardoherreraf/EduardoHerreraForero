"""Validate BEM class names and HTML/CSS references without extra dependencies.

Optionally pass --baseline path/to/snapshot.json to compare the HTML structure,
IDs, assets, form attributes, and class assignments before a migration.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'docs/bem-map.json').read_text(encoding='utf-8'))
BEM = re.compile(r'[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?\Z')
STYLE = re.compile(r'<style\b[^>]*>([\s\S]*?)</style\s*>', re.I)


def selector_heads(css):
    masked = re.sub(r'/\*[\s\S]*?\*/|//[^\n]*|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', lambda m: ' ' * len(m[0]), css)
    start = 0
    stack = []
    for i, char in enumerate(masked):
        if char == '{':
            head = masked[start:i].strip()
            frame = any(stack) or bool(re.match(r'@(?:-webkit-)?keyframes\b', head))
            if head and not head.startswith('@') and not frame:
                yield head
            stack.append(frame)
        elif char == '}' and stack:
            stack.pop()
        if char in '{};':
            start = i + 1


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    handle_startendtag = handle_starttag


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', type=Path)
    args = parser.parse_args()
    baseline = json.loads(args.baseline.read_text(encoding='utf-8')) if args.baseline else None
    shared = MANIFEST['shared']
    vendor = set(MANIFEST['vendorClasses'])
    errors = []
    total = 0
    sheets = 1

    for mapping in [shared, *MANIFEST['pages'].values(), MANIFEST['idClasses'], *MANIFEST['pageTagClasses'].values()]:
        for name in mapping.values():
            if not BEM.fullmatch(name):
                errors.append(f'Invalid BEM name: {name}')
    for label, mapping in [('shared', shared), *MANIFEST['pages'].items()]:
        duplicates = [name for name, count in Counter(mapping.values()).items() if count > 1]
        if duplicates:
            errors.append(f'{label}: ambiguous class mappings: {duplicates}')

    def check_css(label, css, mapping):
        for head in selector_heads(css):
            for name in re.findall(r'\.([a-zA-Z_-][\w-]*)', head):
                if name in mapping:
                    errors.append(f'{label}: legacy CSS selector .{name}')
            for old in MANIFEST['idClasses']:
                if re.search(r'#' + re.escape(old) + r'(?![\w-])', head):
                    errors.append(f'{label}: ID used for styling: #{old}')

    check_css('styles.scss', (ROOT / 'src/scss/styles.scss').read_text(encoding='utf-8'), shared)
    for path in sorted((ROOT / 'src').glob('*.html')):
        text = path.read_text(encoding='utf-8')
        mapping = shared | MANIFEST['pages'].get(path.name, {})
        document = Document(text)
        total += len(document.tags)
        for tag, attrs in document.tags:
            classes = set((attrs.get('class') or '').split())
            for name in classes:
                if name in mapping and name not in vendor:
                    errors.append(f'{path.name}: legacy HTML class {name}')
                if BEM.fullmatch(name) and '--' in name and name.split('--')[0] not in classes:
                    errors.append(f'{path.name}: missing base for modifier {name}')
            target = MANIFEST['idClasses'].get(attrs.get('id'))
            if target and target not in classes:
                errors.append(f'{path.name}: missing styling class {target}')
        for style in STYLE.finditer(text):
            sheets += 1
            check_css(path.name, style[1], mapping)
        if baseline is None:
            continue
        original = Document(baseline[path.relative_to(ROOT).as_posix()])
        if len(original.tags) != len(document.tags):
            errors.append(f'{path.name}: HTML element count changed')
            continue
        for i, ((old_tag, old), (new_tag, new)) in enumerate(zip(original.tags, document.tags)):
            if old_tag != new_tag:
                errors.append(f'{path.name}:{i}: element changed')
            for attr, value in old.items():
                if attr not in {'class', 'onclick'} and new.get(attr) != value:
                    errors.append(f'{path.name}:{i}: attribute {attr} changed')
            old_classes = set((old.get('class') or '').split())
            new_classes = set((new.get('class') or '').split())
            for name in old_classes:
                if mapping.get(name, name) not in new_classes:
                    errors.append(f'{path.name}:{i}: missing replacement for {name}')
                if name in vendor and name not in new_classes:
                    errors.append(f'{path.name}:{i}: lost vendor class {name}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'BEM OK: {total} HTML elements; {sheets} stylesheets; vendor classes and modifiers checked.')
    if baseline:
        print('Baseline OK: HTML structure, IDs, links, assets and form attributes preserved.')


if __name__ == '__main__':
    main()
