#!/usr/bin/env python3
"""توليد صور صفحات الاستمارة للمراجعة — خطوتي 📄

يستخرج صور صفحات المصدر (الاستمارة) التي تقع عليها بنود المراجعة البشرية،
فتُضمَّن في ورقة المراجعة القابلة للطباعة ليقارن المراجع النص حرفياً بلا بحث.

الاستخدام:
    python3 scripts/render-source-pages.py

المتطلبات: pymupdf  (pip install pymupdf)
المخرجات: docs/review-pages/page-NN.jpg
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path('/home/user/uploads/مديرية بدائل الايواء وشؤون الاشخاص ذوي الاعاقة.pdf')
OUT = ROOT / 'docs' / 'review-pages'

# الصفحات التي تقع عليها بنود المراجعة (تُحدَّث يدوياً عند تغيّر البنود)
PAGES = [5, 11, 12, 16, 17, 18, 19, 20, 22]
DPI = 110


def main() -> int:
    try:
        import pymupdf
    except ImportError:
        print('✗ pymupdf غير مثبَّت — شغّل: pip install pymupdf')
        return 1
    if not SRC.exists():
        print(f'✗ ملف الاستمارة غير موجود: {SRC}')
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(SRC)
    total = 0
    for n in PAGES:
        page = doc[n - 1]
        pix = page.get_pixmap(dpi=DPI)
        out = OUT / f'page-{n:02d}.jpg'
        pix.save(str(out), jpg_quality=72)
        size = os.path.getsize(out) // 1024
        total += size
        print(f'صفحة {n}: {size} ك.ب • {pix.width}×{pix.height}')
    print(f'✓ {len(PAGES)} صفحة • المجموع {total} ك.ب في {OUT}')
    print('الخطوة التالية: npm run review-sheet (لتضمينها في الورقة القابلة للطباعة)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
