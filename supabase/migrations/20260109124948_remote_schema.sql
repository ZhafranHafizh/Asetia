


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    'buyer' -- role default saat daftar
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."download_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "downloaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "success" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."download_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."download_logs" IS 'Tracks all download attempts for policy enforcement and analytics';



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "price" numeric NOT NULL,
    "category" "text",
    "file_path" "text" NOT NULL,
    "preview_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "file_url" "text",
    "preview_images" "text"[],
    "sale_type" "text" DEFAULT 'unlimited'::"text",
    "sold_to" "uuid",
    "sold_at" timestamp with time zone,
    "download_policy" "text" DEFAULT 'unlimited'::"text" NOT NULL,
    "download_duration_hours" integer,
    CONSTRAINT "check_timed_duration" CHECK (((("download_policy" = 'timed'::"text") AND ("download_duration_hours" IS NOT NULL) AND ("download_duration_hours" > 0)) OR ("download_policy" <> 'timed'::"text"))),
    CONSTRAINT "products_download_policy_check" CHECK (("download_policy" = ANY (ARRAY['unlimited'::"text", 'once'::"text", 'timed'::"text"]))),
    CONSTRAINT "products_sale_type_check" CHECK (("sale_type" = ANY (ARRAY['unlimited'::"text", 'one_time'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."download_policy" IS 'Download access policy: unlimited (forever), once (single download), or timed (limited hours)';



COMMENT ON COLUMN "public"."products"."download_duration_hours" IS 'For timed policy: number of hours after purchase that download is available';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'buyer'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "store_name" "text",
    "store_bio" "text",
    "verification_status" "text" DEFAULT 'none'::"text",
    "selfie_path" "text",
    "verification_code" "text",
    "code_expires_at" timestamp with time zone,
    "phone_number" "text",
    "home_address" "text",
    "store_logo" "text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['buyer'::"text", 'seller'::"text"]))),
    CONSTRAINT "profiles_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['none'::"text", 'pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "buyer_id" "uuid",
    "product_id" "uuid",
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "midtrans_order_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_downloaded" boolean DEFAULT false NOT NULL,
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'settlement'::"text", 'expire'::"text", 'cancel'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transactions"."is_downloaded" IS 'Tracks if the item has been downloaded (relevant for "once" policy)';



CREATE OR REPLACE VIEW "public"."seller_stats" AS
 SELECT "p"."seller_id",
    "count"(DISTINCT "t"."id") FILTER (WHERE ("t"."status" = 'settlement'::"text")) AS "total_sales",
    COALESCE("sum"("t"."amount") FILTER (WHERE ("t"."status" = 'settlement'::"text")), (0)::numeric) AS "total_earnings",
    "count"(DISTINCT "p"."id") AS "active_products"
   FROM ("public"."products" "p"
     LEFT JOIN "public"."transactions" "t" ON (("t"."product_id" = "p"."id")))
  GROUP BY "p"."seller_id";


ALTER VIEW "public"."seller_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transaction_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transaction_id" "uuid",
    "product_id" "uuid",
    "price_at_purchase" numeric NOT NULL,
    "is_downloaded" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."transaction_items" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."download_logs"
    ADD CONSTRAINT "download_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_store_name_key" UNIQUE ("store_name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."transaction_items"
    ADD CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_midtrans_order_id_key" UNIQUE ("midtrans_order_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



CREATE INDEX "cart_items_product_id_idx" ON "public"."cart_items" USING "btree" ("product_id");



CREATE INDEX "cart_items_user_id_idx" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_download_logs_downloaded_at" ON "public"."download_logs" USING "btree" ("downloaded_at");



CREATE INDEX "idx_download_logs_product" ON "public"."download_logs" USING "btree" ("product_id");



CREATE INDEX "idx_download_logs_transaction" ON "public"."download_logs" USING "btree" ("transaction_id");



CREATE INDEX "idx_download_logs_user" ON "public"."download_logs" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_phone_number" ON "public"."profiles" USING "btree" ("phone_number") WHERE ("phone_number" IS NOT NULL);



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_selfie_path" ON "public"."profiles" USING "btree" ("selfie_path") WHERE ("selfie_path" IS NOT NULL);



CREATE INDEX "idx_profiles_store_logo" ON "public"."profiles" USING "btree" ("store_logo") WHERE ("store_logo" IS NOT NULL);



CREATE INDEX "idx_profiles_verification_code" ON "public"."profiles" USING "btree" ("verification_code") WHERE ("verification_code" IS NOT NULL);



CREATE INDEX "idx_profiles_verification_status" ON "public"."profiles" USING "btree" ("verification_status");



CREATE INDEX "idx_transactions_buyer_id" ON "public"."transactions" USING "btree" ("buyer_id");



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."download_logs"
    ADD CONSTRAINT "download_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."download_logs"
    ADD CONSTRAINT "download_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."download_logs"
    ADD CONSTRAINT "download_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sold_to_fkey" FOREIGN KEY ("sold_to") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transaction_items"
    ADD CONSTRAINT "transaction_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."transaction_items"
    ADD CONSTRAINT "transaction_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



CREATE POLICY "Public products are viewable by everyone" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Users can create transactions" ON "public"."transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "buyer_id"));



CREATE POLICY "Users can delete their own cart items" ON "public"."cart_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own download logs" ON "public"."download_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update products" ON "public"."products" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own seller info" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own transactions" ON "public"."transactions" FOR UPDATE USING (("auth"."uid"() = "buyer_id"));



CREATE POLICY "Users can view their own cart items" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own download logs" ON "public"."download_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own purchases" ON "public"."transactions" FOR SELECT TO "authenticated" USING (("buyer_id" = "auth"."uid"()));



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."download_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."download_logs" TO "anon";
GRANT ALL ON TABLE "public"."download_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."download_logs" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."seller_stats" TO "anon";
GRANT ALL ON TABLE "public"."seller_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_stats" TO "service_role";



GRANT ALL ON TABLE "public"."transaction_items" TO "anon";
GRANT ALL ON TABLE "public"."transaction_items" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_items" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow Authenticated Upload 1bqp9qb_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated, anon
using ((bucket_id = 'assets'::text));



  create policy "Allow Authenticated Upload 1bqp9qb_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'assets'::text));



  create policy "Allow Authenticated Upload 1bqp9qb_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'assets'::text));



  create policy "Allow Authenticated User Upload Selfie 177jkau_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((auth.role() = 'authenticated'::text) AND (bucket_id = 'id-verifications'::text)));



  create policy "Allow Authenticated User Upload Selfie 177jkau_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((auth.role() = 'authenticated'::text) AND (bucket_id = 'id-verifications'::text)));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'assets'::text));



  create policy "Public can view previews"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'assets'::text) AND ((storage.foldername(name))[1] = 'previews'::text)));



  create policy "Seller can read own product files"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'assets'::text) AND ((storage.foldername(name))[1] = 'files'::text) AND (auth.uid() = ((storage.foldername(name))[2])::uuid)));



  create policy "Seller can upload previews"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'assets'::text) AND ((storage.foldername(name))[1] = 'previews'::text) AND (auth.uid() = ((storage.foldername(name))[2])::uuid)));



  create policy "Seller can upload product files"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'assets'::text) AND ((storage.foldername(name))[1] = 'files'::text) AND (auth.uid() = ((storage.foldername(name))[2])::uuid)));



