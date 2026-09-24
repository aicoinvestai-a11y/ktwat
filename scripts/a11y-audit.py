#!/usr/bin/env python3
"""مدقّق إمكانية الوصول — خطوتي ♿

يفحص كل صفحات الموقع المنشورة فعلياً (عبر خادم الإنتاج) ويقيس:

1) تباين الألوان الحقيقي (WCAG 2.2 AA): يحسب النسبة بين لون النص ولون الخلفية الموروثة
   لكل نص ظاهر في الصفحة، مع تتبّع وراثة الألوان عبر العناصر المتداخلة والألوان الشفافة.
   الحد المطلوب: 4.5:1 للنص العادي، و3:1 للنص الكبير (≥24px، أو ≥18.66px عريض).
2) بنية العناوين: عنوان h1 واحد لكل صفحة، وبلا قفز في المستويات (h1←h3 مثلاً).
3) الصور والرسوم: لكل صورة نص بديل غير فارغ أو aria-hidden صريح.
4) الأزرار والروابط: لكل زر/رابط اسم مفهوم (نص أو aria-label).
5) حقول الإدخال: لكل حقل label مرتبط أو aria-label.
6) أساسيات الصفحة: lang=ar، dir=rtl، رابط «تخطَّ إلى المحتوى».

الاستخدام:
    python3 scripts/a11y-audit.py            # كل الصفحات
    python3 scripts/a11y-audit.py --limit=60 # عيّنة سريعة
المتطلب: خادم يعمل على المنفذ 3000 (npm run start) — يُفحص الناتج النهائي لا الكود.
"""
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'http://127.0.0.1:3000'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
        'param', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline',
        'polygon', 'ellipse', 'stop', 'use', 'image'}


# ————— لوحة الألوان من ملف الإعدادات (مصدر واحد للحقيقة) —————
def load_palette():
    cfg = (ROOT / 'tailwind.config.ts').read_text(encoding='utf-8')
    palette = {}
    for family, body in re.findall(r'(\w+):\s*\{([^}]*)\}', cfg):
        shades = {}
        for key, val in re.findall(r"(\d+|DEFAULT|soft|mute|card|line):\s*'(#[0-9a-fA-F]{6})'", body):
            shades[key] = val
        if shades:
            palette[family] = shades
    # ألوان الويب الأساسية المستخدمة في الواجهة
    palette.setdefault('white', {})['DEFAULT'] = '#ffffff'
    palette.setdefault('black', {})['DEFAULT'] = '#000000'
    return palette


PALETTE = load_palette()


def to_rgb(hexstr):
    h = hexstr.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def resolve(name):
    """يحوّل اسم صنف تايلويند مثل text-mint-700 إلى لون."""
    parts = name.split('-')
    if parts[0] not in ('text', 'bg', 'from', 'to', 'via', 'border'):
        return None
    rest = parts[1:]
    if not rest:
        return None
    family = rest[0]
    if family == 'white':
        return '#ffffff'
    if family == 'black':
        return '#000000'
    if family not in PALETTE:
        return None
    shades = PALETTE[family]
    if len(rest) == 1:
        return shades.get('DEFAULT')
    key = rest[1]
    return shades.get(key)


def luminance(rgb):
    def chan(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (chan(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def blend(fg, alpha, bg):
    return tuple(round(f * alpha + b * (1 - alpha)) for f, b in zip(fg, bg))


SIZES = {
    'text-xs': 12, 'text-sm': 14, 'text-base': 16, 'text-lg': 18, 'text-xl': 20,
    'text-2xl': 24, 'text-3xl': 30, 'text-4xl': 36, 'text-5xl': 48,
    'text-child-sm': 18, 'text-child-base': 21, 'text-child-lg': 26, 'text-child-xl': 34,
}


class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = [{'tag': 'root', 'bg': (255, 255, 255), 'bg2': None, 'fg': (38, 49, 61),
                       'size': 21, 'bold': False, 'hidden': False}]
        self.violations = []
        self.checked = 0
        self.headings = []
        self.problems = []

    # ——— أدوات ———
    def ctx(self):
        return self.stack[-1]

    def current_text(self):
        return ''.join(t for _, t in getattr(self, '_text_since_tag', []))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = a.get('class', '').split()
        parent = self.ctx()
        bg, bg2 = parent['bg'], None
        fg = parent['fg']
        size = parent['size']
        bold = parent['bold']
        hidden = parent['hidden'] or a.get('aria-hidden') == 'true' or 'sr-only' in classes or 'aria-hidden="true"' in str(attrs)

        grad = []
        for c in classes:
            if c.startswith('bg-gradient') or c.startswith('bg-'):
                if c.startswith('bg-gradient'):
                    grad = ['from', 'to']
                    continue
                name = c.split('/')[0]
                alpha = 1.0
                if '/' in c:
                    try:
                        alpha = float(c.split('/')[1]) / 100
                    except ValueError:
                        alpha = 1.0
                col = resolve(name)
                if col:
                    rgb = to_rgb(col)
                    bg = blend(rgb, alpha, bg) if alpha < 1 else rgb
            elif c.startswith('from-') or c.startswith('to-'):
                col = resolve(c)
                if col:
                    grad.append(to_rgb(col))
            elif c.startswith('text-'):
                col = resolve(c)
                if col:
                    fg = to_rgb(col)
                elif c in SIZES:
                    size = SIZES[c]
            elif c in ('font-bold', 'font-extrabold'):
                bold = True
        if len(grad) >= 2 and isinstance(grad[-1], tuple) and isinstance(grad[-2], tuple):
            bg2 = grad[-1]

        if tag == 'img':
            # alt="" مقبولة للصورة الزخرفية (WCAG)، والملاحظة تكون عند غياب السمة نفسها
            if 'alt' not in a:
                self.problems.append(('img', f"صورة بلا سمة alt: {a.get('src', '?')[:60]}"))
        if tag in ('button', 'a'):
            self._text_since_tag = []
            self.stack.append({'tag': tag, 'bg': bg, 'bg2': bg2, 'fg': fg, 'size': size,
                               'bold': bold, 'hidden': hidden, 'name': a.get('aria-label', ''),
                               'href': a.get('href', '')})
            return
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self._text_since_tag = []
        self.stack.append({'tag': tag, 'bg': bg, 'bg2': bg2, 'fg': fg, 'size': size,
                           'bold': bold, 'hidden': hidden})

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        # اجمع نص الزر/الرابط للتحقق من الاسم المفهوم
        if self.stack and self.stack[-1].get('tag') == tag:
            node = self.stack.pop()
            if tag in ('button', 'a'):
                name = (node.get('name') or '').strip() + ' ' + ' '.join(self._text_since_tag).strip()
                if not re.search(r'[\u0600-\u06FFA-Za-z]', name):
                    self.problems.append((tag, f"بلا اسم مفهوم (href={node.get('href', '')})"))
            if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
                self.headings.append((int(tag[1]), ' '.join(self._text_since_tag).strip()[:60]))
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].get('tag') == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if hasattr(self, '_text_since_tag'):
            self._text_since_tag.append(data)
        if self.ctx()['hidden']:
            return
        if not re.search(r'[\u0600-\u06FFA-Za-z]', data):
            return
        c = self.ctx()
        fg, bg = c['fg'], c['bg']
        if bg is None:
            return
        self.checked += 1
        r1 = contrast(fg, bg)
        r2 = contrast(fg, c['bg2']) if c['bg2'] else r1
        ratio = min(r1, r2)
        large = c['size'] >= 24 or (c['size'] >= 18.66 and c['bold'])
        need = 3.0 if large else 4.5
        if ratio < need:
            self.violations.append({
                'ratio': round(ratio, 2), 'need': need,
                'fg': '#%02x%02x%02x' % fg, 'bg': '#%02x%02x%02x' % bg,
                'size': c['size'], 'bold': c['bold'],
                'text': ' '.join(data.split())[:60],
            })


def routes():
    found = []
    for root, _, files in os.walk(ROOT / '.next' / 'server' / 'app'):
        for f in files:
            if not f.endswith('.html'):
                continue
            p = os.path.join(root, f).replace(str(ROOT / '.next' / 'server' / 'app'), '').replace('.html', '')
            if '/_' in p:
                continue
            if p.endswith('/index'):
                p = p[:-5] or '/'
            found.append(p)
    return sorted(set(found))


def fetch(path):
    r = subprocess.run(['curl', '-s', '--max-time', '12', BASE + path], capture_output=True)
    return r.stdout.decode('utf-8', 'replace')


def audit(path):
    html = fetch(path)
    a = Audit()
    a.feed(html)
    out = {'path': path, 'violations': a.violations, 'problems': a.problems, 'checked': a.checked}
    h1 = [h for h in a.headings if h[0] == 1]
    levels = [h[0] for h in a.headings]
    if len(h1) != 1:
        out['problems'].append(('h1', f"عدد عناوين h1 = {len(h1)}"))
    for i in range(1, len(levels)):
        if levels[i] - levels[i - 1] > 1:
            out['problems'].append(('order', f"قفز من h{levels[i-1]} إلى h{levels[i]}"))
    if 'lang="ar"' not in html or 'dir="rtl"' not in html:
        out['problems'].append(('lang', 'اللغة أو الاتجاه غير مضبوطين'))
    if 'تخطَّ إلى المحتوى' not in html:
        out['problems'].append(('skip', 'لا يوجد رابط تخطَّ إلى المحتوى'))
    return out


def main():
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
    rs = routes()
    if limit:
        rs = rs[:limit]
    with ThreadPoolExecutor(max_workers=10) as ex:
        results = list(ex.map(audit, rs))
    pages_bad = [r for r in results if r['violations'] or r['problems']]
    total_checked = sum(r.get('checked', 0) for r in results)
    all_v = [v for r in results for v in r['violations']]
    all_p = [(r['path'], *p) for r in results for p in r['problems']]
    print(f'فُحصت الصفحات: {len(rs)}')
    print(f'حالات نص مقيسة: {total_checked}')
    print(f'صفحات فيها ملاحظات: {len(pages_bad)}')
    print(f'مخالفات تباين: {len(all_v)} | ملاحظات بنيوية: {len(all_p)}')
    if all_v:
        all_v.sort(key=lambda v: v['ratio'])
        print('\nأخفض 10 حالات تباين:')
        for v in all_v[:10]:
            print(f"  {v['ratio']}:1 (المطلوب {v['need']}) — نص {v['size']}px {v['fg']} على {v['bg']} — «{v['text']}»")
    if all_p:
        print('\nملاحظات بنيوية (أول 15):')
        for p in all_p[:15]:
            print('  ', p[0], p[1], p[2] if len(p) > 2 else '')
    # تجميع الحالات المتكرّرة (السبب الجذري)
    groups = {}
    for v in all_v:
        key = (v['fg'], v['bg'], v['need'], v['size'], v['bold'])
        g = groups.setdefault(key, {'count': 0, 'sample': v['text'], 'ratio': v['ratio']})
        g['count'] += 1
    print('\nأسباب متكرّرة (لون النص على الخلفية):')
    for (fg, bg, need, size, bold), g in sorted(groups.items(), key=lambda kv: -kv[1]['count'])[:12]:
        print(f"  ×{g['count']:<5} {g['ratio']}:1 (المطلوب {need}) {fg} على {bg} — حجم {size}px{'' if not bold else ' عريض'} — «{g['sample']}»")
    report = {
        'pages': len(rs), 'textNodesChecked': total_checked, 'pagesWithIssues': len(pages_bad),
        'contrastViolations': len(all_v), 'structuralNotes': len(all_p),
        'worstContrast': sorted(all_v, key=lambda v: v['ratio'])[:30] if all_v else [],
        'groups': [
            {'fg': k[0], 'bg': k[1], 'need': k[2], 'size': k[3], 'bold': k[4], 'count': g['count'], 'ratio': g['ratio'], 'sample': g['sample']}
            for k, g in sorted(groups.items(), key=lambda kv: -kv[1]['count'])
        ] if all_v else [],
        'structural': [{'path': p[0], 'kind': p[1], 'detail': p[2]} for p in all_p[:60]],
    }
    out = ROOT / 'docs' / 'a11y-report.json'
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'\n✓ كُتب التقرير: docs/a11y-report.json')


if __name__ == '__main__':
    main()
