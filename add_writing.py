#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add_writing.py — মাহবুব সরদার সবুজের ওয়েবসাইটে নতুন লেখা যুক্ত করার স্ক্রিপ্ট
=================================================================================
ব্যবহার:
  python3 add_writing.py

এই স্ক্রিপ্টটি নিম্নলিখিত ফাইলগুলো স্বয়ংক্রিয়ভাবে আপডেট করে:
  1. client/src/data/writingsArchive.ts   — ওয়েবসাইটের মূল লেখার ডেটা
  2. api/_knowledge/writingsArchive.json  — AI chatbot এর JSON ডেটা
  3. api/_knowledge/chatbotIndex.json     — AI chatbot এর search index
  4. api/_knowledge/siteKnowledge.js      — মোট লেখার সংখ্যা আপডেট
"""

import json
import re
import os
import sys
from datetime import datetime
from pathlib import Path

# ── প্রজেক্ট রুট ──────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent

WRITINGS_TS   = ROOT / "client/src/data/writingsArchive.ts"
WRITINGS_JSON = ROOT / "api/_knowledge/writingsArchive.json"
CHATBOT_INDEX = ROOT / "api/_knowledge/chatbotIndex.json"
SITE_KNOWLEDGE = ROOT / "api/_knowledge/siteKnowledge.js"

# ── বাংলা থেকে slug তৈরির ম্যাপ ─────────────────────────────────────────────
BENGALI_TRANS = {
    'অ':'o','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
    'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng','চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
    'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n','ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
    'প':'p','ফ':'ph','ব':'b','ভ':'bh','ম':'m','য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
    'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t','া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
    'ং':'ng','ঃ':'h','ঁ':'n','্':'',' ':'-','?':'','!':'',',':'','.':'','"':'','\'':'','—':'-','–':'-',
}

def make_slug(title: str, writing_id: int) -> str:
    """বাংলা শিরোনাম থেকে URL-friendly slug তৈরি করা"""
    slug = ""
    for ch in title:
        slug += BENGALI_TRANS.get(ch, "")
    slug = re.sub(r'-+', '-', slug).strip('-').lower()
    if len(slug) < 3:
        slug = "writing-unknown"
    return f"{slug}-{writing_id}"

def normalize_text(value: str) -> str:
    """Search text normalize করা"""
    return re.sub(r'\s+', ' ', str(value or "")
        .lower()
        .replace('\u201c', "'").replace('\u201d', "'")
        .replace('\u2018', "'").replace('\u2019', "'")
        .replace('\u200b', '').replace('\u200c', '').replace('\u200d', '').replace('\ufeff', '')
    ).strip()

def get_current_max_id() -> int:
    """writingsArchive.json থেকে বর্তমান সর্বোচ্চ ID বের করা"""
    with open(WRITINGS_JSON, encoding='utf-8') as f:
        data = json.load(f)
    return max(d['id'] for d in data)

def get_total_count() -> int:
    """writingsArchive.json থেকে মোট লেখার সংখ্যা বের করা"""
    with open(WRITINGS_JSON, encoding='utf-8') as f:
        data = json.load(f)
    return len(data)

def escape_ts_content(content: str) -> str:
    """TypeScript template literal এর জন্য content escape করা"""
    return content.replace('`', '\\`').replace('${', '\\${')

def add_to_writings_ts(new_writings: list) -> None:
    """writingsArchive.ts ফাইলে নতুন লেখা যুক্ত করা"""
    print("📝 writingsArchive.ts আপডেট করা হচ্ছে...")
    
    with open(WRITINGS_TS, encoding='utf-8') as f:
        content = f.read()
    
    # writings array এর শেষ ]; এর আগে নতুন লেখা যুক্ত করা
    # Pattern: শেষ };\n]; এর আগে
    insert_marker = "];\n\n// ── E-Books Data"
    
    new_entries = ""
    for w in new_writings:
        escaped_content = escape_ts_content(w['content'])
        entry = f"""  {{
    id: {w['id']},
    title: `{escape_ts_content(w['title'])}`,
    category: "{w['category']}",
    date: "{w['date']}",
    content: `{escaped_content}`,
  }},
"""
        new_entries += entry
    
    new_content = content.replace(
        insert_marker,
        new_entries + insert_marker
    )
    
    with open(WRITINGS_TS, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✅ {len(new_writings)}টি লেখা writingsArchive.ts-এ যুক্ত হয়েছে")

def add_to_writings_json(new_writings: list) -> None:
    """writingsArchive.json ফাইলে নতুন লেখা যুক্ত করা"""
    print("📄 writingsArchive.json (chatbot) আপডেট করা হচ্ছে...")
    
    with open(WRITINGS_JSON, encoding='utf-8') as f:
        data = json.load(f)
    
    for w in new_writings:
        data.append({
            "id": w['id'],
            "title": w['title'],
            "category": w['category'],
            "date": w['date'],
            "content": w['content']
        })
    
    with open(WRITINGS_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ {len(new_writings)}টি লেখা writingsArchive.json-এ যুক্ত হয়েছে (মোট: {len(data)})")
    return len(data)

def rebuild_chatbot_index(total_count: int) -> None:
    """chatbotIndex.json পুনর্নির্মাণ করা"""
    print("🤖 chatbotIndex.json rebuild করা হচ্ছে...")
    
    # Existing index পড়া
    with open(CHATBOT_INDEX, encoding='utf-8') as f:
        index = json.load(f)
    
    # writingsArchive.json থেকে নতুন writings পড়া
    with open(WRITINGS_JSON, encoding='utf-8') as f:
        writings = json.load(f)
    
    # Existing non-writing items রাখা
    non_writing_items = [item for item in index['items'] if item['type'] != 'writing']
    
    # নতুন writing items তৈরি করা
    writing_items = []
    for writing in writings:
        content = str(writing.get('content', ''))
        excerpt = (content[:220].strip() + '…') if len(content) > 220 else content
        slug = make_slug(writing['title'], writing['id'])
        path = f"/writings/{slug}"
        keywords = [writing['title'], writing.get('category', ''), writing.get('date', '')]
        search_text = normalize_text(' '.join([
            'writing', writing['title'], excerpt, path,
            *keywords, writing.get('category', ''), writing.get('date', '')
        ]))
        writing_items.append({
            "type": "writing",
            "id": str(writing['id']),
            "title": writing['title'],
            "path": path,
            "description": excerpt,
            "keywords": [k for k in keywords if k],
            "searchText": search_text,
            "priority": 55,
            "category": writing.get('category', ''),
            "date": writing.get('date', ''),
            "contentLength": len(content)
        })
    
    all_items = non_writing_items + writing_items
    
    # byType count
    by_type = {}
    for item in all_items:
        by_type[item['type']] = by_type.get(item['type'], 0) + 1
    
    # Index আপডেট করা
    index['generatedAt'] = datetime.utcnow().isoformat() + 'Z'
    index['totals'] = {
        "items": len(all_items),
        "writings": len(writings),
        "byType": by_type
    }
    index['items'] = all_items
    
    with open(CHATBOT_INDEX, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ chatbotIndex.json rebuild সম্পন্ন (মোট items: {len(all_items)}, writings: {len(writings)})")

def update_site_knowledge(total_count: int) -> None:
    """siteKnowledge.js এ মোট লেখার সংখ্যা আপডেট করা"""
    print("🌐 siteKnowledge.js আপডেট করা হচ্ছে...")
    
    with open(SITE_KNOWLEDGE, encoding='utf-8') as f:
        content = f.read()
    
    # বাংলায় সংখ্যা ফরম্যাট করা
    def format_bengali_number(n: int) -> str:
        bengali_digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'}
        s = str(n)
        # Add comma for thousands
        if n >= 1000:
            s = f"{n//1000},{n%1000:03d}"
        return ''.join(bengali_digits.get(c, c) for c in s)
    
    bn_count = format_bengali_number(total_count)
    
    # সব জায়গায় সংখ্যা আপডেট করা
    # Pattern: ২,৩৩০ বা ২,৩৩১ ইত্যাদি
    old_patterns = re.findall(r'[২-৯][,।][০-৯]{3}', content)
    
    # Specific replacements
    replacements = [
        (r'totalWritings: "[^"]*"', f'totalWritings: "{bn_count}টিরও বেশি"'),
        (r'"[২-৯][,।][০-৯]{{3}}টিরও বেশি লেখা', f'"{bn_count}টিরও বেশি লেখা'),
        (r'"[২-৯][,।][০-৯]{{3}}টিরও বেশি লেখার', f'"{bn_count}টিরও বেশি লেখার'),
        (r'লেখালেখি আর্কাইভ \([২-৯][,।][০-৯]{{3}}', f'লেখালেখি আর্কাইভ ({bn_count}'),
        (r'এখানে রয়েছে [২-৯][,।][০-৯]{{3}}টিরও বেশি লেখা', f'এখানে রয়েছে {bn_count}টিরও বেশি লেখা'),
        (r'সকল লেখার আর্কাইভ — [২-৯][,।][০-৯]{{3}}টিরও বেশি লেখা', f'সকল লেখার আর্কাইভ — {bn_count}টিরও বেশি লেখা'),
    ]
    
    updated = content
    for pattern, replacement in replacements:
        updated = re.sub(pattern, replacement, updated)
    
    with open(SITE_KNOWLEDGE, 'w', encoding='utf-8') as f:
        f.write(updated)
    
    print(f"  ✅ siteKnowledge.js আপডেট হয়েছে (মোট লেখা: {bn_count})")

def get_valid_categories() -> list:
    """বৈধ category গুলো দেখানো"""
    return ["ছোট লেখা", "জীবনদর্শন", "বিচ্ছেদ", "ভালোবাসা", "কবিতা"]

def input_writings_interactively() -> list:
    """ইন্টারেক্টিভভাবে লেখার তথ্য নেওয়া"""
    categories = get_valid_categories()
    current_max_id = get_current_max_id()
    
    print("\n" + "="*60)
    print("  মাহবুব সরদার সবুজ — নতুন লেখা যুক্ত করুন")
    print("="*60)
    print(f"\n  বর্তমান সর্বোচ্চ ID: {current_max_id}")
    print(f"  বর্তমান মোট লেখা: {get_total_count()}")
    print("\n  বিভাগসমূহ:")
    for i, cat in enumerate(categories, 1):
        print(f"    {i}. {cat}")
    print()
    
    new_writings = []
    next_id = current_max_id + 1
    
    while True:
        print(f"\n{'─'*50}")
        print(f"  নতুন লেখা #{len(new_writings)+1} (ID: {next_id})")
        print(f"{'─'*50}")
        
        # শিরোনাম
        title = input("  শিরোনাম (খালি রাখলে শেষ হবে): ").strip()
        if not title:
            if not new_writings:
                print("  ⚠️  কোনো লেখা যুক্ত করা হয়নি।")
            break
        
        # বিভাগ
        print("\n  বিভাগ বেছে নিন:")
        for i, cat in enumerate(categories, 1):
            print(f"    {i}. {cat}")
        cat_input = input("  বিভাগ নম্বর (1-5): ").strip()
        try:
            cat_idx = int(cat_input) - 1
            if 0 <= cat_idx < len(categories):
                category = categories[cat_idx]
            else:
                category = "ছোট লেখা"
                print(f"  ⚠️  অবৈধ নম্বর, 'ছোট লেখা' ব্যবহার করা হচ্ছে")
        except ValueError:
            category = "ছোট লেখা"
        
        # তারিখ
        current_year = str(datetime.now().year)
        bengali_years = {'2024':'২০২৪','2025':'২০২৫','2026':'২০২৬','2027':'২০২৭'}
        date = bengali_years.get(current_year, '২০২৬')
        date_input = input(f"  তারিখ/বছর (Enter চাপলে '{date}' হবে): ").strip()
        if date_input:
            date = date_input
        
        # কন্টেন্ট
        print("\n  লেখার কন্টেন্ট লিখুন (শেষ করতে একটি খালি লাইনে 'END' লিখুন):")
        lines = []
        while True:
            line = input()
            if line.strip().upper() == 'END':
                break
            lines.append(line)
        content = '\n'.join(lines).strip()
        
        if not content:
            print("  ⚠️  কন্টেন্ট খালি, এই লেখাটি বাদ দেওয়া হচ্ছে।")
            continue
        
        new_writings.append({
            'id': next_id,
            'title': title,
            'category': category,
            'date': date,
            'content': content
        })
        
        print(f"\n  ✅ লেখা যুক্ত হয়েছে: '{title}' (ID: {next_id}, বিভাগ: {category})")
        next_id += 1
        
        more = input("\n  আরও লেখা যুক্ত করবেন? (y/n): ").strip().lower()
        if more != 'y':
            break
    
    return new_writings

def add_writings_from_args(writings_data: list) -> None:
    """প্রোগ্রামেটিক্যালি লেখা যুক্ত করা (non-interactive)"""
    if not writings_data:
        print("⚠️  কোনো লেখার ডেটা দেওয়া হয়নি।")
        return
    
    current_max_id = get_current_max_id()
    
    # ID assign করা যদি না থাকে
    next_id = current_max_id + 1
    for w in writings_data:
        if 'id' not in w:
            w['id'] = next_id
            next_id += 1
        if 'date' not in w:
            w['date'] = '২০২৬'
    
    print(f"\n{'='*60}")
    print(f"  {len(writings_data)}টি নতুন লেখা যুক্ত করা হচ্ছে...")
    print(f"{'='*60}\n")
    
    for w in writings_data:
        print(f"  • ID {w['id']}: {w['title']} [{w['category']}]")
    
    print()
    
    # সব ফাইল আপডেট করা
    add_to_writings_ts(writings_data)
    total = add_to_writings_json(writings_data)
    rebuild_chatbot_index(total)
    update_site_knowledge(total)
    
    print(f"\n{'='*60}")
    print(f"  🎉 সফলভাবে {len(writings_data)}টি লেখা যুক্ত হয়েছে!")
    print(f"  📊 মোট লেখা এখন: {total}")
    print(f"{'='*60}")
    print("\n  পরবর্তী পদক্ষেপ:")
    print("  1. cd /home/ubuntu/mahbub-sardar-sabuj-live")
    print("  2. git add -A && git commit -m 'নতুন লেখা যুক্ত'")
    print("  3. git push origin main")
    print()

def main():
    """মূল ফাংশন"""
    print("\n🚀 মাহবুব সরদার সবুজ — লেখা যুক্ত করার স্ক্রিপ্ট")
    
    # ইন্টারেক্টিভ মোড
    new_writings = input_writings_interactively()
    
    if not new_writings:
        print("\n  কোনো পরিবর্তন করা হয়নি।")
        return
    
    print(f"\n{'='*60}")
    print(f"  {len(new_writings)}টি লেখা যুক্ত করা হচ্ছে...")
    print(f"{'='*60}\n")
    
    add_to_writings_ts(new_writings)
    total = add_to_writings_json(new_writings)
    rebuild_chatbot_index(total)
    update_site_knowledge(total)
    
    print(f"\n{'='*60}")
    print(f"  🎉 সফলভাবে {len(new_writings)}টি লেখা যুক্ত হয়েছে!")
    print(f"  📊 মোট লেখা এখন: {total}")
    print(f"{'='*60}")
    print("\n  পরবর্তী পদক্ষেপ:")
    print("  1. cd /home/ubuntu/mahbub-sardar-sabuj-live")
    print("  2. git add -A && git commit -m 'নতুন লেখা যুক্ত'")
    print("  3. git push origin main")
    print()

if __name__ == "__main__":
    main()
