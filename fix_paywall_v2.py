import re

filepath = 'k-sebe-yoga-studio-APPp/components/Paywall.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove duplicate imports
# I'll just rewrite the import block entirely to be safe and correct.
expected_imports = """import { Check, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../services/supabaseClient';
"""

# Regex to find the block of imports at the top
# It currently looks messy with duplicates.
# I'll search from start of file until `interface PaywallProps`
content = re.sub(
    r"^[\s\S]*?(?=interface PaywallProps)",
    expected_imports + "\n",
    content
)

with open(filepath, 'w') as f:
    f.write(content)
