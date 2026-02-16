import re

filepath = 'k-sebe-yoga-studio-APPp/components/Dashboard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# I removed `.finally` but also seems to have lost the `setSubscriptionLoading(false)` inside `.then` if my regex failed.
# `sed` output shows `.then(({ data }) => {\n          if (data) setSubscription(data);\n        })`
# It's missing `setSubscriptionLoading(false)`.

# Let's fix the whole useEffect block properly.
use_effect_block = """  useEffect(() => {
    if (user?.id) {
      setSubscriptionLoading(true);
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setSubscription(data);
          setSubscriptionLoading(false);
        })
        .catch(() => {
          setSubscriptionLoading(false);
        });
    }
  }, [user?.id]);"""

# Replace the existing broken block.
# I'll identify it by `useEffect(() => {` and `if (user?.id) {` inside.
# Since it's multi-line and potentially messy, I'll use a broader match or just replace the specific part if possible.
# The current block seems to be:
#   useEffect(() => {
#     if (user?.id) {
#       setSubscriptionLoading(true);
#       supabase
# ...
#         .then(({ data }) => {
#           if (data) setSubscription(data);
#         })
#
#     }
#   }, [user?.id]);

# I'll try to match specific lines.
content = content.replace("if (data) setSubscription(data);", "if (data) setSubscription(data);\n          setSubscriptionLoading(false);")
# Add error handling or ensure it stops loading on error?
# Supabase .single() throws error if no row found (returns error object in data or error).
# Actually v2 client returns `{ data, error }`.
# My code uses `.then(({ data }) => ...`. It ignores error.
# If error occurs, it resolves with `data: null` and `error: ...`.
# So `.then` is always called (unless network failure throws).
# So putting `setSubscriptionLoading(false)` in `.then` is sufficient for basic cases.

with open(filepath, 'w') as f:
    f.write(content)
