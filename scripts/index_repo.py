#!/usr/bin/env python3
import os
import json
import hashlib
import time
from pathlib import Path

def compute_sha256(path: Path):
    h = hashlib.sha256()
    try:
        with path.open('rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return None

def main():
    root = Path(__file__).resolve().parents[1]
    ignore_dirs = {'.git', '__pycache__', '.venv', 'venv', '.pytest_cache'}
    entries = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
        for fname in filenames:
            path = Path(dirpath) / fname
            try:
                rel = path.relative_to(root).as_posix()
                stat = path.stat()
                size = stat.st_size
                mtime = stat.st_mtime
                sha = compute_sha256(path)
            except Exception:
                rel = None
                size = None
                mtime = None
                sha = None
            if rel is not None:
                entries.append({
                    'path': rel,
                    'size': size,
                    'mtime': mtime,
                    'sha256': sha,
                })

    obj = {
        'generated_at': time.time(),
        'entries': sorted(entries, key=lambda x: x['path'])
    }

    out = root / 'repo_index.json'
    out.write_text(json.dumps(obj, indent=2, ensure_ascii=False))
    print(f'Wrote {out}')

if __name__ == '__main__':
    main()
