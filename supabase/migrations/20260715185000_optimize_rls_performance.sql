-- 1. payment_orders
DROP POLICY IF EXISTS "payment_orders_admin_all" ON payment_orders;
DROP POLICY IF EXISTS "payment_orders_select_own" ON payment_orders;
CREATE POLICY "payment_orders_select" ON payment_orders FOR SELECT USING (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "payment_orders_insert" ON payment_orders FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payment_orders_update" ON payment_orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "payment_orders_delete" ON payment_orders FOR DELETE USING (is_admin());

-- 2. user_passes
DROP POLICY IF EXISTS "user_passes_admin_all" ON user_passes;
DROP POLICY IF EXISTS "user_passes_select_own" ON user_passes;
CREATE POLICY "user_passes_select" ON user_passes FOR SELECT USING (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "user_passes_insert" ON user_passes FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "user_passes_update" ON user_passes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "user_passes_delete" ON user_passes FOR DELETE USING (is_admin());

-- 3. graph_nodes
DROP POLICY IF EXISTS "graph_nodes_user_isolation" ON graph_nodes;
CREATE POLICY "graph_nodes_user_isolation" ON graph_nodes FOR ALL USING (user_id = (select auth.uid()) OR user_id IS NULL) WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- 4. graph_edges
DROP POLICY IF EXISTS "graph_edges_user_isolation" ON graph_edges;
CREATE POLICY "graph_edges_user_isolation" ON graph_edges FOR ALL USING (user_id = (select auth.uid()) OR user_id IS NULL) WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- 5. app_settings
DROP POLICY IF EXISTS "Allow admin write access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Enable write access for admins" ON app_settings;
DROP POLICY IF EXISTS "Public can read studio contacts setting" ON app_settings;
CREATE POLICY "app_settings_select" ON app_settings FOR SELECT USING (key = 'studio_contacts' OR is_admin());
CREATE POLICY "app_settings_insert" ON app_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "app_settings_update" ON app_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "app_settings_delete" ON app_settings FOR DELETE USING (is_admin());

-- 6. bookings
DROP POLICY IF EXISTS "admin manage bookings" ON bookings;
DROP POLICY IF EXISTS "admin view all bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_own" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_update_own" ON bookings;
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "bookings_update" ON bookings FOR UPDATE USING (user_id = (select auth.uid()) OR is_admin()) WITH CHECK (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "bookings_delete" ON bookings FOR DELETE USING (user_id = (select auth.uid()) OR is_admin());

-- 7. articles
DROP POLICY IF EXISTS "Enable write access for admins" ON articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
CREATE POLICY "articles_select" ON articles FOR SELECT USING (true);
CREATE POLICY "articles_insert" ON articles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "articles_update" ON articles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "articles_delete" ON articles FOR DELETE USING (is_admin());

-- 8. classes
DROP POLICY IF EXISTS "admin manage classes" ON classes;
DROP POLICY IF EXISTS "service role manage classes" ON classes;
DROP POLICY IF EXISTS "Enable read access for all users" ON classes;
CREATE POLICY "classes_select" ON classes FOR SELECT USING (true);
CREATE POLICY "classes_insert" ON classes FOR INSERT WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "classes_update" ON classes FOR UPDATE USING (is_admin() OR (select auth.role()) = 'service_role') WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "classes_delete" ON classes FOR DELETE USING (is_admin() OR (select auth.role()) = 'service_role');

-- 9. faq_items
DROP POLICY IF EXISTS "Enable write access for admins" ON faq_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON faq_items;
CREATE POLICY "faq_items_select" ON faq_items FOR SELECT USING (true);
CREATE POLICY "faq_items_insert" ON faq_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "faq_items_update" ON faq_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "faq_items_delete" ON faq_items FOR DELETE USING (is_admin());

-- 10. site_images
DROP POLICY IF EXISTS "Enable write access for admins" ON site_images;
DROP POLICY IF EXISTS "Enable read access for all users" ON site_images;
CREATE POLICY "site_images_select" ON site_images FOR SELECT USING (true);
CREATE POLICY "site_images_insert" ON site_images FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "site_images_update" ON site_images FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "site_images_delete" ON site_images FOR DELETE USING (is_admin());

-- 11. pricing_plans
DROP POLICY IF EXISTS "Enable write access for admins" ON pricing_plans;
DROP POLICY IF EXISTS "Public can read active pricing plans" ON pricing_plans;
CREATE POLICY "pricing_plans_select" ON pricing_plans FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "pricing_plans_insert" ON pricing_plans FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "pricing_plans_update" ON pricing_plans FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "pricing_plans_delete" ON pricing_plans FOR DELETE USING (is_admin());

-- 12. retreats
DROP POLICY IF EXISTS "admin manage retreats" ON retreats;
DROP POLICY IF EXISTS "service role manage retreats" ON retreats;
DROP POLICY IF EXISTS "public read active retreats" ON retreats;
CREATE POLICY "retreats_select" ON retreats FOR SELECT USING (is_active = true OR is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "retreats_insert" ON retreats FOR INSERT WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "retreats_update" ON retreats FOR UPDATE USING (is_admin() OR (select auth.role()) = 'service_role') WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "retreats_delete" ON retreats FOR DELETE USING (is_admin() OR (select auth.role()) = 'service_role');

-- 13. reviews
DROP POLICY IF EXISTS "Enable admin write access for reviews" ON reviews;
DROP POLICY IF EXISTS "Enable public read access for active reviews" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "reviews_delete" ON reviews FOR DELETE USING (is_admin());

-- 14. trainers
DROP POLICY IF EXISTS "trainers_service_role_manage" ON trainers;
DROP POLICY IF EXISTS "trainers_admin_delete" ON trainers;
DROP POLICY IF EXISTS "trainers_admin_insert" ON trainers;
DROP POLICY IF EXISTS "trainers_public_select_active" ON trainers;
DROP POLICY IF EXISTS "trainers_admin_select" ON trainers;
DROP POLICY IF EXISTS "trainers_admin_update" ON trainers;
CREATE POLICY "trainers_select" ON trainers FOR SELECT USING (is_active = true OR is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "trainers_insert" ON trainers FOR INSERT WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "trainers_update" ON trainers FOR UPDATE USING (is_admin() OR (select auth.role()) = 'service_role') WITH CHECK (is_admin() OR (select auth.role()) = 'service_role');
CREATE POLICY "trainers_delete" ON trainers FOR DELETE USING (is_admin() OR (select auth.role()) = 'service_role');

-- 15. videos
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
DROP POLICY IF EXISTS "Public can read unlocked videos" ON videos;
CREATE POLICY "videos_select" ON videos FOR SELECT USING (is_locked = false OR is_admin());
CREATE POLICY "videos_insert" ON videos FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "videos_update" ON videos FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "videos_delete" ON videos FOR DELETE USING (is_admin());

-- 16. profiles
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (user_id = (select auth.uid()) OR is_admin()) WITH CHECK (user_id = (select auth.uid()) OR is_admin());

-- 17. subscriptions
DROP POLICY IF EXISTS "admin delete subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "admin insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "admin read all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "admin update subscriptions" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (user_id = (select auth.uid()) OR is_admin());
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "subscriptions_delete" ON subscriptions FOR DELETE USING (is_admin());

-- 18. user_push_tokens
DROP POLICY IF EXISTS "Users manage own push tokens" ON user_push_tokens;
DROP POLICY IF EXISTS "Service role reads all tokens" ON user_push_tokens;
CREATE POLICY "user_push_tokens_select" ON user_push_tokens FOR SELECT USING (user_id = (select auth.uid()) OR (select auth.role()) = 'service_role');
CREATE POLICY "user_push_tokens_insert" ON user_push_tokens FOR INSERT WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "user_push_tokens_update" ON user_push_tokens FOR UPDATE USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "user_push_tokens_delete" ON user_push_tokens FOR DELETE USING (user_id = (select auth.uid()));
