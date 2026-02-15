import os

def fix_file(filepath, processor):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = processor(content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

def fix_dev_settings(content):
    # Fix the messed up line
    # "Бэкап"quot;Бэкап"Бэкап"quot; -> &quot;Бэкап&quot;
    bad_string = '"Бэкап"quot;Бэкап"Бэкап"quot;'
    if bad_string in content:
        return content.replace(bad_string, '&quot;Бэкап&quot;')
    # Also check if I messed it up differently
    if '"Бэкап"' in content:
        return content.replace('"Бэкап"', '&quot;Бэкап&quot;')
    return content

fix_file('k-sebe-yoga-studio-APPp/components/DeveloperSettings.tsx', fix_dev_settings)

def fix_unused_suppression_header(content):
    # Remove click-events-have-key-events from the specific header I added
    target = '/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */'
    replacement = '/* eslint-disable jsx-a11y/no-static-element-interactions */'
    return content.replace(target, replacement)

for f in ['k-sebe-yoga-studio-APPp/components/Dashboard.tsx', 'k-sebe-yoga-studioWEB/components/Blog.tsx']:
    fix_file(f, fix_unused_suppression_header)

def remove_unused_any_suppression(content):
    # Remove ' /* eslint-disable-line @typescript-eslint/no-explicit-any */'
    return content.replace(' /* eslint-disable-line @typescript-eslint/no-explicit-any */', '')

for f in ['k-sebe-yoga-studioWEB/components/admin/tabs/DashboardTab.tsx',
          'k-sebe-yoga-studioWEB/components/admin/tabs/ImagesTab.tsx',
          'k-sebe-yoga-studioWEB/components/admin/tabs/ScheduleTab.tsx']:
    fix_file(f, remove_unused_any_suppression)
