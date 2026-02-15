import os
import re

def fix_file_content(filepath, processor):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath}: not found")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = processor(content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
    else:
        print(f"No changes for {filepath}")

# 1. Schedule.tsx
def fix_schedule(content):
    return content.replace('const [_hasError, setHasError] = useState(false);', 'const [, setHasError] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars')

fix_file_content('k-sebe-yoga-studioWEB/components/Schedule.tsx', fix_schedule)

# 2. logger.test.ts
def fix_logger(content):
    return content.replace('const _originalEnv = import.meta.env;', '// const _originalEnv = import.meta.env;')

fix_file_content('shared/utils/__tests__/logger.test.ts', fix_logger)

# 3. payment-webhook
def fix_webhook(content):
    return content.replace("type PlanId = 'free' | 'premium' | 'vip';", "// type PlanId = 'free' | 'premium' | 'vip';")

fix_file_content('supabase/functions/payment-webhook/index.ts', fix_webhook)

# 4. SettingsTab.tsx
def fix_settings(content):
    return content.replace('После нажатия "Сохранить"', 'После нажатия &quot;Сохранить&quot;')

fix_file_content('k-sebe-yoga-studioWEB/components/admin/tabs/SettingsTab.tsx', fix_settings)

# 5. hooks.test.ts - Remove empty lines between imports
def fix_hooks(content):
    lines = content.splitlines()
    new_lines = []
    import_block = False
    for i, line in enumerate(lines):
        is_import = line.strip().startswith('import ')
        is_empty = line.strip() == ''

        if is_import:
            import_block = True

        # Naive logic: if currently empty, and next line is import, and previous was import or part of import block...
        # Let's try simpler: if empty line, look ahead.
        if is_empty:
            # Check next non-empty line
            next_line_idx = i + 1
            while next_line_idx < len(lines) and lines[next_line_idx].strip() == '':
                next_line_idx += 1

            if next_line_idx < len(lines) and lines[next_line_idx].strip().startswith('import '):
                 # Check previous non-empty line
                prev_line_idx = i - 1
                while prev_line_idx >= 0 and lines[prev_line_idx].strip() == '':
                    prev_line_idx -= 1

                if prev_line_idx >= 0 and (lines[prev_line_idx].strip().startswith('import ') or lines[prev_line_idx].strip().endswith(';')):
                    continue # Skip this empty line

        new_lines.append(line)
    return '\n'.join(new_lines) + '\n'

fix_file_content('shared/hooks/__tests__/hooks.test.ts', fix_hooks)
