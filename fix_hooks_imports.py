import os

filepath = 'shared/hooks/__tests__/hooks.test.ts'
with open(filepath, 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.strip() == '':
        # Look ahead for import
        if i + 1 < len(lines) and lines[i+1].strip().startswith('import '):
             continue # Skip this empty line
    new_lines.append(line)

with open(filepath, 'w') as f:
    f.writelines(new_lines)

print(f"Fixed {filepath}")
