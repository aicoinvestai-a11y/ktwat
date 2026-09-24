#!/usr/bin/env python3
"""فحص عربي الواجهة — خطوتي

يزور كل صفحات الموقع، يحذف الوسوم غير المرئية (script/style/كود المكوّنات)، ويستخرج كل نص
لاتيني (3 أحرف لاتينية متتالية أو أكثر) يظهر للمستخدم. أي نتيجة = صفحة تحتاج تعريباً.
"""
import json
import random
import re
import subprocess
import sys
from pathlib import Path

BASE = "http://127.0.0.1:3000"
ROOT = Path(__file__).resolve().parent

LATIN = re.compile(r"[A-Za-z]{3,}")


def routes():
    urls = [
        "/", "/start", "/map", "/skills", "/my-skills", "/search", "/about", "/guide",
        "/faith", "/quran", "/board", "/offline", "/nope-404",
    ]
    dump = subprocess.run(
        ["npx", "tsx", "-e",
         "import { allSkills } from './data/skills';"
         "console.log(JSON.stringify({ids: allSkills.map((s:any)=>s.id),"
         "cats:[...new Set(allSkills.map((s:any)=>s.category))],"
         "doms:[...new Set(allSkills.map((s:any)=>s.domain))]}));"],
        capture_output=True, text=True, cwd=ROOT.parent).stdout
    data = json.loads(dump.strip().splitlines()[-1])
    for d in data["doms"]:
        urls.append(f"/world/{d}")
    for c in data["cats"]:
        urls.append(f"/category/{c}")
    ids = data["ids"]
    random.seed(7)
    for i in random.sample(ids, min(30, len(ids))):
        urls += [f"/skill/{i}", f"/card/{i}"]
    return urls


def visible_latin(html):
    s = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    s = re.sub(r"<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    # ما داخل «تفاصيل المصدر والاعتماد (للكبار)» اعتمادٌ قانوني بأسماء أعلام لاتينية — مسموح
    s = re.sub(r"<details.*?</details>", " ", s, flags=re.S)
    # فك كيانات HTML: المتصفح يعرضها كحروف عادية، والفحص يجب أن يقيس ما يراه المستخدم
    for a, b in (("&quot;", '"'), ("&#39;", "'"), ("&amp;", "&"), ("&gt;", ">"), ("&lt;", "<"), ("&nbsp;", " ")):
        s = s.replace(a, b)
    hits = []
    for m in re.finditer(r">([^<>]*)<", s):
        chunk = m.group(1)
        if LATIN.search(chunk):
            hits.append(" ".join(chunk.split())[:90])
    # النصوص المخفية داخل عناصر «تفاصيل (للكبار)» مسموحة
    return hits


def main():
    bad = {}
    urls = routes()
    for u in urls:
        r = subprocess.run(["curl", "-s", BASE + u], capture_output=True, text=True).stdout
        hits = visible_latin(r)
        # استثنِ أسطر الاعتماد الكاملة (أسماء أعلام مطلوبة بالرخصة) — مسموحة داخل تفاصيل
        hits = [h for h in hits if not re.search(r"CC BY|CC0|Public domain|Wikimedia|Freesound|CC BY-SA", h)]
        if hits:
            bad[u] = hits[:3]
    print(f"فُحصت {len(urls)} صفحة")
    if not bad:
        print("✓ لا نص إنجليزي ظاهر في أي صفحة")
        return 0
    print(f"✗ {len(bad)} صفحة فيها نص لاتيني ظاهر:")
    for u, h in list(bad.items())[:25]:
        print(f"  - {u}: {h}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
