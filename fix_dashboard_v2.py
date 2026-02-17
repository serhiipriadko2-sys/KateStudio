import re

filepath = 'k-sebe-yoga-studio-APPp/components/Dashboard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Remove handleSubscribePlan if unused
# It is defined but unused. I'll remove it.
# const handleSubscribePlan = (plan: string) => { ... };
content = re.sub(
    r"  const handleSubscribePlan = \(plan: string\) => \{\s*console\.log\('Subscribe to', plan\);\s*\};\s*",
    "",
    content
)

# 2. Fix .finally()
# Replace .finally() with standard promise handling or move to useEffect async function
# The pattern is:
#       supabase
#         .from('subscriptions')
#         .select('*')
#         .eq('user_id', user.id)
#         .single()
#         .then(({ data }) => {
#           if (data) setSubscription(data);
#           setSubscriptionLoading(false);
#         })
#         .finally(() => setSubscriptionLoading(false));

# I previously added `setSubscriptionLoading(false)` inside `.then` in `fix_dashboard_manual.py`.
# So `.finally` is redundant and causing error if types don't match. I'll remove `.finally(...)`.

content = content.replace(".finally(() => setSubscriptionLoading(false));", "")
# Also remove any semicolon that might be left hanging if finally was at the end of a chain that ended with ;
# The chain was: ... .then(...) .finally(...);
# So replacing it leaves ... .then(...); which is correct.

# Clean up possible double semicolon if any
content = content.replace(";;", ";")

with open(filepath, 'w') as f:
    f.write(content)
