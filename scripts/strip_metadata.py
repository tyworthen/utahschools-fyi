"""Remove personal information from the metadata of downloaded source files.

Government files often carry the names of the staff who created or last saved them, and
Tableau workbooks record local file paths that include Windows user names. That metadata
is not part of the published data, so it is removed before files enter the repository.
Document content (tables, text, and revision notes) is left unchanged.

What is changed:
  .xlsx  docProps/core.xml   dc:creator and cp:lastModifiedBy emptied
         xl/workbook.xml     x15ac:absPath (the author's saved-file folder) removed
  .twb / .twbx (inner .twb)  user folder in C:/Users/<name>/ paths replaced with [redacted];
                             "Edited by <name>" style bylines in embedded query comments redacted

Each change is logged to site/assets/data/reference/metadata_redactions.csv with the file's
SHA-256 before and after, so the published file can be traced to the original download.
The script is idempotent: files with nothing to remove are left byte-for-byte unchanged.

Run: python3 scripts/strip_metadata.py [paths...]   (default: everything under site/assets/data)
"""
import csv, datetime, hashlib, io, os, re, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "assets", "data")
LOG = os.path.join(DATA, "reference", "metadata_redactions.csv")

USER_PATH = re.compile(r"(?i)([A-Z]:[\\/]Users[\\/])(?!\[redacted\])[^\\/'\"<>]+")
# Authorship notes in embedded query comments, e.g. "Edited by J. Smith Oct 2025".
BYLINE = re.compile(r"\b(Edited|Created|Modified|Updated|Written|Authored) by (?!\[redacted\])[A-Z][A-Za-z]*\.? ?[A-Z][A-Za-z'-]+")
CORE_FIELDS = re.compile(r"<(dc:creator|cp:lastModifiedBy)>([^<]+)</\1>")
ABS_PATH = re.compile(r"<mc:AlternateContent[^>]*>(?:(?!</mc:AlternateContent>).)*?x15ac:absPath.*?</mc:AlternateContent>|<x15ac:absPath[^>]*/>", re.S)


def sha(b):
    return hashlib.sha256(b).hexdigest()


def clean_twb(text):
    notes = [("Windows user path", "user folder redacted")] * len(set(USER_PATH.findall(text)))
    notes += [("query comment byline", "name removed")] * len(set(BYLINE.findall(text)))
    text = USER_PATH.sub(r"\1[redacted]", text)
    return BYLINE.sub(r"\1 by [redacted]", text), notes


def clean_xlsx_part(name, text):
    notes = []
    if name == "docProps/core.xml":
        for m in CORE_FIELDS.finditer(text):
            notes.append((m.group(1), "name removed"))
        text = CORE_FIELDS.sub(r"<\1></\1>", text)
    elif name == "xl/workbook.xml" and "absPath" in text:
        notes.append(("x15ac:absPath", "saved-file folder removed"))
        text = ABS_PATH.sub("", text)
    return text, notes


def rewrite_zip(data, part_fn):
    """Return (new_bytes, notes); unchanged parts are copied as-is."""
    src = zipfile.ZipFile(io.BytesIO(data))
    out, notes = io.BytesIO(), []
    with zipfile.ZipFile(out, "w") as dst:
        for info in src.infolist():
            raw = src.read(info.filename)
            new = raw
            fixed = part_fn(info.filename, raw)
            if fixed is not None:
                new, part_notes = fixed
                notes += [(info.filename,) + n for n in part_notes]
            dst.writestr(info, new, compress_type=info.compress_type)
    return (out.getvalue(), notes) if notes else (data, [])


def xlsx_part(name, raw):
    if name not in ("docProps/core.xml", "xl/workbook.xml"):
        return None
    text, notes = clean_xlsx_part(name, raw.decode("utf-8"))
    return (text.encode("utf-8"), notes) if notes else None


def twbx_part(name, raw):
    if not name.endswith(".twb"):
        return None
    text, notes = clean_twb(raw.decode("utf-8"))
    return (text.encode("utf-8"), notes) if notes else None


def process(path):
    data = open(path, "rb").read()
    ext = os.path.splitext(path)[1].lower()
    if ext == ".xlsx":
        new, notes = rewrite_zip(data, xlsx_part)
    elif ext == ".twbx":
        new, notes = rewrite_zip(data, twbx_part)
    elif ext == ".twb":
        text, n = clean_twb(data.decode("utf-8"))
        new, notes = text.encode("utf-8"), [("(file)",) + x for x in n]
    else:
        return []
    if not notes:
        return []
    open(path, "wb").write(new)
    rel = os.path.relpath(path, DATA)
    return [(rel, part, field, detail, sha(data), sha(new)) for part, field, detail in notes]


def main(paths):
    targets = []
    for p in paths or [DATA]:
        if os.path.isdir(p):
            for d, _, fs in os.walk(p):
                targets += [os.path.join(d, f) for f in fs if f.lower().endswith((".xlsx", ".twbx", ".twb"))]
        else:
            targets.append(p)
    rows = []
    for t in sorted(targets):
        rows += process(t)
    if rows:
        new_file = not os.path.exists(LOG)
        with open(LOG, "a", newline="") as fh:
            w = csv.writer(fh)
            if new_file:
                w.writerow(["file", "part", "field", "action", "original_sha256", "published_sha256", "date"])
            today = datetime.date.today().isoformat()
            # The detail column never records the removed value itself.
            w.writerows((r[0], r[1], r[2], r[3], r[4], r[5], today) for r in rows)
    changed = sorted(set(r[0] for r in rows))
    print(f"{len(changed)} files changed, {len(rows)} metadata entries removed")
    return changed


if __name__ == "__main__":
    main(sys.argv[1:])
