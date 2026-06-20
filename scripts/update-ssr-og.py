#!/usr/bin/env python3
"""
ssr-og.js এ missing writings (id 2261-2332) যোগ করার script
writingsArchive.ts থেকে ডেটা নিয়ে writingsData array এর শেষে যোগ করে
"""

import re

# writingsArchive.ts পড়া
with open('/home/ubuntu/website/client/src/data/writingsArchive.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# ssr-og.js পড়া
with open('/home/ubuntu/website/api/ssr-og.js', 'r', encoding='utf-8') as f:
    og_lines = f.readlines()

# ssr-og.js এ writingsData array এর শেষ লাইন খোঁজা (লাইন 2785 = index 2784)
# শেষ writing entry এর পরে "];" আছে
writings_end_line = 2784  # 0-indexed, লাইন 2785

# যাচাই করা
print(f"writingsData end line content: {og_lines[writings_end_line].rstrip()}")
print(f"Previous line: {og_lines[writings_end_line-1].rstrip()[:80]}")

# ssr-og.js এ বর্তমান max writing id খোঁজা
og_writings_section = ''.join(og_lines[525:writings_end_line])
og_ids = re.findall(r'id:\s*(\d+)', og_writings_section)
og_ids_int = [int(x) for x in og_ids]
max_og_id = max(og_ids_int) if og_ids_int else 0
print(f"ssr-og.js এ বর্তমান max writing id: {max_og_id}")

# writingsArchive.ts থেকে id > max_og_id এর writings extract করা
ts_lines = ts_content.split('\n')

# প্রতিটি writing block এর শুরু খোঁজা
id_pattern = re.compile(r'^\s*id:\s*(\d+),')
block_starts = []
for idx, line in enumerate(ts_lines):
    m = id_pattern.match(line)
    if m:
        id_val = int(m.group(1))
        if id_val > max_og_id:
            block_starts.append((idx, id_val))

print(f"Missing writings count: {len(block_starts)}")
if block_starts:
    print(f"Range: {block_starts[0][1]} to {block_starts[-1][1]}")

# প্রতিটি block extract করা
new_entries = []
for block_idx, (start_line, id_val) in enumerate(block_starts):
    # Block শেষ খোঁজা
    if block_idx + 1 < len(block_starts):
        end_line = block_starts[block_idx + 1][0]
    else:
        end_line = min(start_line + 80, len(ts_lines))
    
    block_text = '\n'.join(ts_lines[max(0, start_line-1):end_line])
    
    # Fields extract করা
    title_m = re.search(r'title:\s*[`"](.+?)[`"]', block_text, re.DOTALL)
    category_m = re.search(r'category:\s*"(.+?)"', block_text)
    date_m = re.search(r'date:\s*"(.+?)"', block_text)
    slug_m = re.search(r'slug:\s*"(.+?)"', block_text)
    content_m = re.search(r'content:\s*`(.*?)`', block_text, re.DOTALL)
    preview_m = re.search(r'preview:\s*`(.*?)`', block_text, re.DOTALL)
    
    title = title_m.group(1).strip() if title_m else f"লেখা {id_val}"
    category = category_m.group(1) if category_m else "কবিতা"
    date = date_m.group(1) if date_m else "২০২৬"
    slug = slug_m.group(1) if slug_m else f"writing-{id_val}"
    content_raw = content_m.group(1).strip() if content_m else ""
    preview_raw = preview_m.group(1).strip() if preview_m else ""
    
    # Legacy slug (id ছাড়া)
    legacy_slug = re.sub(r'-\d+$', '', slug)
    
    # Content ও preview clean করা
    content_clean = content_raw.replace('\n', '\\n').replace('"', '\\"').replace('`', "'")
    preview_clean = (preview_raw or content_raw[:200]).replace('\n', ' ').replace('"', '\\"').replace('`', "'")
    title_clean = title.replace('"', '\\"').replace('`', "'")
    
    entry = {
        'id': id_val,
        'slug': slug,
        'legacy_slug': legacy_slug,
        'title': title_clean,
        'category': category,
        'date': date,
        'preview': preview_clean[:250],
        'content': content_clean
    }
    new_entries.append(entry)

print(f"Extracted {len(new_entries)} entries")

# নতুন JS entries তৈরি করা
new_js_lines = []
for entry in new_entries:
    js_line = f'  {{ id: {entry["id"]}, slug: "{entry["slug"]}", legacySlug: "{entry["legacy_slug"]}", title: "{entry["title"]}", category: "{entry["category"]}", date: "{entry["date"]}", preview: "{entry["preview"]}", content: "{entry["content"]}" }},\n'
    new_js_lines.append(js_line)

# শেষ entry এর trailing comma ঠিক করা
if new_js_lines:
    # শেষ নতুন entry এর comma রাখা কিন্তু ]; এর আগে
    pass

# ssr-og.js আপডেট করা
# writings_end_line (index 2784) এর আগে নতুন entries insert করা
# কিন্তু আগে শেষ existing entry এ comma আছে কিনা দেখা
last_entry_line = og_lines[writings_end_line - 1]
if not last_entry_line.rstrip().endswith(','):
    og_lines[writings_end_line - 1] = last_entry_line.rstrip() + ',\n'

# নতুন lines insert করা
new_og_lines = og_lines[:writings_end_line] + new_js_lines + og_lines[writings_end_line:]

# শেষ নতুন entry এর trailing comma সরানো (]; এর আগের লাইন)
# writings_end_line + len(new_js_lines) = নতুন ]; এর index
new_end_idx = writings_end_line + len(new_js_lines)
if new_og_lines[new_end_idx - 1].rstrip().endswith(','):
    new_og_lines[new_end_idx - 1] = new_og_lines[new_end_idx - 1].rstrip()[:-1] + '\n'

# ফাইল লেখা
with open('/home/ubuntu/website/api/ssr-og.js', 'w', encoding='utf-8') as f:
    f.writelines(new_og_lines)

print(f"\n✅ ssr-og.js আপডেট হয়েছে!")
print(f"মোট নতুন entries: {len(new_entries)}")

# যাচাই করা
with open('/home/ubuntu/website/api/ssr-og.js', 'r', encoding='utf-8') as f:
    verify_content = f.read()

verify_ids = re.findall(r'id:\s*(\d+)', verify_content[verify_content.find('const writingsData'):verify_content.find('export default')])
verify_ids_int = [int(x) for x in verify_ids]
print(f"নতুন max writing id: {max(verify_ids_int) if verify_ids_int else 'N/A'}")
print(f"2331 আছে: {2331 in verify_ids_int}")
print(f"2332 আছে: {2332 in verify_ids_int}")
print(f"Total writings in ssr-og.js: {len(verify_ids_int)}")
