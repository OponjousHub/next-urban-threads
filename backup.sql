--
-- PostgreSQL database dump
--

\restrict GEdgryrD5CfCCeF9gHMvCIHz3N9lhAHCYZ9wzC78PwGmo5d0swNIvbnM55Urhbd

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AccountStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccountStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'DEACTIVATED'
);


ALTER TYPE public."AccountStatus" OWNER TO postgres;

--
-- Name: ContactTag; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContactTag" AS ENUM (
    'BUG',
    'ORDER',
    'REFUND',
    'GENERAL'
);


ALTER TYPE public."ContactTag" OWNER TO postgres;

--
-- Name: Currency; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Currency" AS ENUM (
    'NGN',
    'USD'
);


ALTER TYPE public."Currency" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'FAILED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentProvider" AS ENUM (
    'PAYSTACK',
    'FLUTTERWAVE'
);


ALTER TYPE public."PaymentProvider" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'NORMAL',
    'HIGH'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: ReviewPolicy; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewPolicy" AS ENUM (
    'AFTER_PAYMENT',
    'AFTER_DELIVERY',
    'MANUAL_APPROVAL'
);


ALTER TYPE public."ReviewPolicy" OWNER TO postgres;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ReviewStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'OWNER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: StoreType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StoreType" AS ENUM (
    'SINGLE_VENDOR',
    'MULTI_VENDOR'
);


ALTER TYPE public."StoreType" OWNER TO postgres;

--
-- Name: TrackingEventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TrackingEventType" AS ENUM (
    'STATUS_CHANGE',
    'COURIER_UPDATE',
    'NOTE',
    'SYSTEM'
);


ALTER TYPE public."TrackingEventType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Address" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text,
    phone text,
    street text NOT NULL,
    city text NOT NULL,
    state text,
    "postalCode" text,
    country text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isTemporary" boolean DEFAULT false NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."Address" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    image text,
    "tenantId" text NOT NULL,
    "isFeatured" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contact" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    priority public."Priority" DEFAULT 'NORMAL'::public."Priority" NOT NULL,
    tag public."ContactTag",
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contact" OWNER TO postgres;

--
-- Name: FAQ; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FAQ" (
    id text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category text DEFAULT 'General'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "tenantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FAQ" OWNER TO postgres;

--
-- Name: Newsletter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Newsletter" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."Newsletter" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "customerEmail" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentMethod" text NOT NULL,
    "totalAmount" numeric(65,30) NOT NULL,
    currency text NOT NULL,
    "paymentProvider" public."PaymentProvider" NOT NULL,
    "paymentReference" text NOT NULL,
    "shippingAddressId" text NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "tenantId" text NOT NULL,
    "vendorId" text
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderStatusHistory" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status text NOT NULL,
    message text,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderStatusHistory" OWNER TO postgres;

--
-- Name: OrderTrackingEvent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderTrackingEvent" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "tenantId" text NOT NULL,
    type public."TrackingEventType" NOT NULL,
    status public."OrderStatus",
    title text NOT NULL,
    description text,
    location text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderTrackingEvent" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    price numeric(10,2) NOT NULL,
    "discountedPrice" numeric(10,2),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    thumbnail text NOT NULL,
    sizes text[],
    colours text[],
    stock integer DEFAULT 0 NOT NULL,
    instock boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "subCategory" text NOT NULL,
    "seoTitle" text,
    "seoDescription" text,
    "deletedAt" timestamp(3) without time zone,
    images text[],
    "createdByName" text,
    featured boolean DEFAULT false NOT NULL,
    "createdById" text,
    "tenantId" text NOT NULL,
    "averageRating" double precision DEFAULT 0 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "rating1Count" integer DEFAULT 0 NOT NULL,
    "rating2Count" integer DEFAULT 0 NOT NULL,
    "rating3Count" integer DEFAULT 0 NOT NULL,
    "rating4Count" integer DEFAULT 0 NOT NULL,
    "rating5Count" integer DEFAULT 0 NOT NULL,
    "vendorId" text,
    "categoryId" text NOT NULL,
    "isFlashDeal" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productId" text NOT NULL,
    "tenantId" text NOT NULL,
    "orderId" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "repliedAt" timestamp(3) without time zone,
    reply text,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    images text[],
    title text,
    "verifiedPurchase" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tenantId" text NOT NULL,
    "userAgent" text,
    "ipAddress" text,
    "deviceName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastActiveAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    domain text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "autoApproveReviews" boolean DEFAULT false NOT NULL,
    "reviewPolicy" public."ReviewPolicy" DEFAULT 'AFTER_PAYMENT'::public."ReviewPolicy" NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    email text,
    logo text,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    "primaryColor" text,
    "storeType" public."StoreType" DEFAULT 'SINGLE_VENDOR'::public."StoreType" NOT NULL,
    "returnPolicy" text,
    "shippingPolicy" text,
    "aboutTitle" text,
    "aboutText" text,
    "aboutStory" text,
    "aboutImage" text,
    "aboutDescription" text
);


ALTER TABLE public."Tenant" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    address text,
    city text,
    country text,
    password text NOT NULL,
    phone text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "avatarUrl" text,
    name text,
    status public."AccountStatus" DEFAULT 'ACTIVE'::public."AccountStatus" NOT NULL,
    "emailTokenExpiry" timestamp(3) without time zone,
    "emailVerifyToken" text,
    "pendingEmail" text,
    "tenantId" text NOT NULL,
    "passwordUpdatedAt" timestamp(3) without time zone,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "twoFactorSecret" text,
    "twoFactorTempSecret" text,
    "twoFactorTempSecretExpiresAt" timestamp(3) without time zone,
    "recoveryCodes" text[],
    "deactivatedAt" timestamp(3) without time zone,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vendor" (
    id text NOT NULL,
    name text NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."Vendor" OWNER TO postgres;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "tenantId" text NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Address" (id, "userId", "fullName", phone, street, city, state, "postalCode", country, "isDefault", "createdAt", "updatedAt", "isTemporary", "isDeleted", "tenantId") FROM stdin;
cmobgvlni00012jx8urofw2u4	cmobgvlnh00002jx84nl36gxl	Kenenna Joseph 	08063702221	2, Mabinuori Street, Sangisa	Mainland	Lagos	100248	Nigeria	t	2026-04-23 12:37:42.365	2026-04-23 12:37:42.365	f	f	cmobgk8vo00002j20ecdfhezf
cmoblw67v000n2jvoo1downdf	cmoblw67v000m2jvo487nwywv	Gikead Igbudu	090176534879	26, Nkailiki Road	Abakaliki	Ebonyi	100248	Nigeria	t	2026-04-23 14:58:07.1	2026-04-23 14:58:07.1	f	f	cmobgk8vo00002j20ecdfhezf
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "userId", "productId", quantity, "tenantId") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, image, "tenantId", "isFeatured") FROM stdin;
cmobh08mo00032jx8c121f51t	Men	men	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948072/urban-threads/products/scgnwpru1soqopj85hc8.jpg	cmobgk8vo00002j20ecdfhezf	t
cmobh13am00052jx8h28s0mh6	Women	women	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948115/urban-threads/products/mwbvfdxnd6t5koidhy8a.jpg	cmobgk8vo00002j20ecdfhezf	t
cmobh1s1r00072jx8oi3b1l4l	Electronics	electronics	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948146/urban-threads/products/sk84hv4svl05fsy84nfs.jpg	cmobgk8vo00002j20ecdfhezf	t
cmobh3hc100092jx8mkbwf1ss	Sales	sales	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948226/urban-threads/products/aaxkzvyesqj1oaryxlkg.jpg	cmobgk8vo00002j20ecdfhezf	t
cmobh5fn3000f2jx8k31jh68v	Acessories	acessories	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948272/urban-threads/products/no15wz1viohju8axsqrr.jpg	cmobgk8vo00002j20ecdfhezf	t
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Contact" (id, name, email, message, "tenantId", "createdAt", priority, tag, "updatedAt") FROM stdin;
\.


--
-- Data for Name: FAQ; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FAQ" (id, question, answer, category, "order", "tenantId", "createdAt", "updatedAt") FROM stdin;
cmoble3zs00052jvo9clf7awy	What is this platform?	<p>We are a modern multi-vendor ecommerce platform that connects trusted brands, independent sellers, and customers in one seamless shopping experience. Each store operates independently but is powered by a shared commerce engine.</p>	General	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:44:04.408	2026-04-23 14:44:04.408
cmoblf6y400072jvo1qcuq2ni	Who manages the products?	<p>Products are managed either by the platform owner (single-vendor mode) or by individual sellers in a multi-vendor marketplace setup.</p>	General	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:44:54.893	2026-04-23 14:44:54.893
cmoblg53q00092jvo7rzqnkcq	How do I place an order?	<p>Simply browse products, add items to your cart, and proceed to checkout. Once payment is confirmed, your order will be processed immediately.</p>	Orders	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:45:39.158	2026-04-23 14:45:39.158
cmoblh3ck000b2jvoy7x26h2s	What payment methods are accepted?	<p>We support multiple secure payment options including card payments, bank transfers, and mobile payment gateways depending on your region.</p>	Payments	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:46:23.54	2026-04-23 14:46:23.54
cmoblhwkt000d2jvos0mqypju	Can I track my order?	<p>Yes. After placing an order, you will receive a tracking link or can use the “Track Order” page to monitor delivery status in real time.</p>	Orders	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:47:01.421	2026-04-23 14:47:01.421
cmoblish1000f2jvo5q6explb	How long does delivery take?	<p>Delivery times vary depending on the vendor and your location. Most orders are delivered within 2–7 business days.</p>	Shipping	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:47:42.758	2026-04-23 14:47:42.758
cmobljo60000h2jvodvufvxvi	Can I return a product?	<p>Yes. Most items are eligible for return within the return window specified by each vendor’s policy.</p>	Returns	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:48:23.832	2026-04-23 14:48:23.832
cmoblklb2000j2jvoheikyxyx	Are all items refundable?	<p>Some items like personalized or clearance products may not be eligible for refunds depending on vendor policy.</p>	Returns	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:49:06.782	2026-04-23 14:49:06.782
cmobllard000l2jvou92wtsdo	How do returns work?	<p>You can request a return from your order page. Once approved, the vendor will process the return or replacement based on their policy.</p>	Returns	0	cmobgk8vo00002j20ecdfhezf	2026-04-23 14:49:39.769	2026-04-23 14:49:39.769
\.


--
-- Data for Name: Newsletter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Newsletter" (id, email, "createdAt", "tenantId") FROM stdin;
cmobhlsoq000l2jx8dnnv32hy	joe.ikdura@gmail.com	2026-04-23 12:58:04.538	cmobgk8vo00002j20ecdfhezf
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "customerEmail", "createdAt", status, "paymentMethod", "totalAmount", currency, "paymentProvider", "paymentReference", "shippingAddressId", "paymentStatus", "tenantId", "vendorId") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "productId", quantity, price, "tenantId") FROM stdin;
\.


--
-- Data for Name: OrderStatusHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderStatusHistory" (id, "orderId", status, message, location, "createdAt") FROM stdin;
\.


--
-- Data for Name: OrderTrackingEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderTrackingEvent" (id, "orderId", "tenantId", type, status, title, description, location, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, price, "discountedPrice", name, slug, description, thumbnail, sizes, colours, stock, instock, "createdAt", "updatedAt", "subCategory", "seoTitle", "seoDescription", "deletedAt", images, "createdByName", featured, "createdById", "tenantId", "averageRating", "reviewCount", "rating1Count", "rating2Count", "rating3Count", "rating4Count", "rating5Count", "vendorId", "categoryId", "isFlashDeal") FROM stdin;
cmobhbnv3000g2jx8w8drqhzw	34.00	\N	Clasto men bag	clasto-men-bag	Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948604/urban-threads/products/nwhwuyqgljbtcmzcwdua.jpg	{M,L,XL}	{Blue,Brown,Black}	65	t	2026-04-23 12:50:11.726	2026-04-23 12:50:11.726	bag	\N	\N	\N	{https://res.cloudinary.com/dhdtanihv/image/upload/v1776948604/urban-threads/products/nwhwuyqgljbtcmzcwdua.jpg}	Kenenna Joseph 	f	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	0	0	0	0	0	0	0	\N	cmobh08mo00032jx8c121f51t	t
cmobheu83000h2jx80ockyxh4	98.00	\N	Adidas xeur top	adidas-xeur-top	 Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948757/urban-threads/products/ib7jgdcvzyz3pg1itrwm.jpg	{S,L,M}	{Blue,Black,White}	87	t	2026-04-23 12:52:39.939	2026-04-23 12:52:39.939	clothe	\N	\N	\N	{https://res.cloudinary.com/dhdtanihv/image/upload/v1776948757/urban-threads/products/ib7jgdcvzyz3pg1itrwm.jpg}	Kenenna Joseph 	t	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	0	0	0	0	0	0	0	\N	cmobh13am00052jx8h28s0mh6	f
cmobhhfmm000i2jx8dleambey	123.00	\N	Clerks bella shoe	clerks-bella-shoe	 Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.	https://res.cloudinary.com/dhdtanihv/image/upload/v1776948872/urban-threads/products/ezoizmbijirq5otc78iz.jpg	{L,M}	{}	65	t	2026-04-23 12:54:40.991	2026-04-23 12:54:40.991	shoe	\N	\N	\N	{https://res.cloudinary.com/dhdtanihv/image/upload/v1776948872/urban-threads/products/ezoizmbijirq5otc78iz.jpg}	Kenenna Joseph 	f	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	0	0	0	0	0	0	0	\N	cmobh13am00052jx8h28s0mh6	t
cmobhkfoe000j2jx8t54iirbr	24.00	\N	Sony stereo	sony-stereo	 Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.	https://res.cloudinary.com/dhdtanihv/image/upload/v1776949016/urban-threads/products/nezimuuz5bdkeevu79mo.jpg	{M,L}	{Black,Purple}	34	t	2026-04-23 12:57:01.022	2026-04-23 12:57:01.022	eaar phone	\N	\N	\N	{https://res.cloudinary.com/dhdtanihv/image/upload/v1776949016/urban-threads/products/nezimuuz5bdkeevu79mo.jpg}	Kenenna Joseph 	t	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	0	0	0	0	0	0	0	\N	cmobh1s1r00072jx8oi3b1l4l	f
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "userId", rating, comment, "createdAt", "productId", "tenantId", "orderId", "updatedAt", status, "repliedAt", reply, "helpfulCount", images, title, "verifiedPurchase") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "userId", "tenantId", "userAgent", "ipAddress", "deviceName", "createdAt", "lastActiveAt") FROM stdin;
cmobkdc9f00012jvohzirjgpx	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	127.0.0.1	Edge on Windows	2026-04-23 14:15:28.851	2026-04-23 14:15:41.691
cmobkdm2g00032jvomfw6rmbk	cmobgvlnh00002jx84nl36gxl	cmobgk8vo00002j20ecdfhezf	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	127.0.0.1	Edge on Windows	2026-04-23 14:15:41.56	2026-04-23 14:53:05.193
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tenant" (id, name, slug, domain, "isDefault", "createdAt", "updatedAt", "autoApproveReviews", "reviewPolicy", currency, email, logo, timezone, "primaryColor", "storeType", "returnPolicy", "shippingPolicy", "aboutTitle", "aboutText", "aboutStory", "aboutImage", "aboutDescription") FROM stdin;
cmobgk8vo00002j20ecdfhezf	Urban Threads	urban-threads	\N	t	2026-04-23 12:28:52.596	2026-04-23 14:40:45.279	f	AFTER_PAYMENT	USD	joe.ikdura@gmail.com		Africa/Lagos	#e81159	SINGLE_VENDOR	<p><strong>Return &amp; Refund Policy</strong></p><p>Your satisfaction is important to us. If you're not completely happy with your purchase, we’re here to help.</p><p></p><p><strong>Return Eligibility</strong></p><p>You may request a return within 14 days of receiving your order.</p><p></p><p><strong>To qualify for a return:</strong></p><p>• Items must be unused, unworn, and in original condition  </p><p>• Items must be returned in original packaging  </p><p>• Proof of purchase (receipt or order confirmation) is required  </p><p></p><p><strong>Non-Returnable Items</strong></p><p>The following items cannot be returned:</p><p>• Gift cards  </p><p>• Sale or clearance items  </p><p>• Customized or personalized products  </p><p></p><p><strong>Refund Process</strong></p><p>Once your return is received and inspected, we will notify you of the outcome.</p><p></p><p><strong>If approved:</strong></p><p>• Refunds are processed within 5–10 business days  </p><p>• Funds are returned to your original payment method  </p><p></p><p>Please note that processing times may vary depending on your bank or payment provider.</p><p></p><p><strong>Shipping Costs</strong></p><p>Return shipping costs are the responsibility of the customer unless the item received is defective, damaged, or incorrect.</p><p></p><p><strong>Exchanges</strong></p><p>We only replace items if they are defective or damaged. If you need an exchange, please contact us with your order details.</p><p></p><p><strong>Damaged or Incorrect Items</strong></p><p>If you receive a defective or incorrect item, please notify us within 48 hours of delivery. Supporting evidence (such as photos) may be required.</p><p></p><p><strong>Late or Missing Refunds</strong></p><p>If you haven’t received your refund after the stated processing time, please check with your bank or payment provider before contacting us.</p><p></p><p><strong>Contact Us</strong></p><p>For returns, refunds, or any concerns, please contact our support team. We are committed to resolving your issue promptly.</p>	<p></p><p>We’re committed to delivering your order quickly, safely, and reliably.</p><p></p><p><strong>Order Processing</strong></p><p>All orders are processed within 1–2 business days (excluding weekends and public holidays). Once your order is processed, you will receive a confirmation email with your shipping details.</p><p></p><p><strong>Shipping Rates &amp; Delivery Times</strong></p><p>Shipping costs are calculated at checkout based on your location and selected shipping method.</p><p></p><p><strong>Estimated delivery times:</strong></p><p>• Local: 2–5 business days  </p><p>• Regional: 3–7 business days  </p><p>• International: 7–14 business days  </p><p></p><p>Please note that delivery times are estimates and may vary due to external factors such as courier delays, customs </p><p>processing, or high demand periods.</p><p></p><p><strong>Order Tracking</strong></p><p>Once your order is shipped, you will receive a tracking number via email. This allows you to monitor your package in real time.</p><p></p><p><strong>Customs, Duties &amp; Taxes</strong></p><p>For international orders, customs duties and taxes may apply depending on your country’s regulations. These charges are the responsibility of the customer.</p><p></p><p><strong>Shipping Issues</strong></p><p>If your order is delayed, lost, or arrives damaged, please contact us within 7 days of the expected delivery date. We will work quickly to resolve the issue.</p><p></p><p><strong>Incorrect Shipping Information</strong></p><p>Customers are responsible for providing accurate shipping details. We are not liable for delays or losses caused by incorrect or incomplete addresses.</p><p></p><p><strong>Contact</strong></p><p>For any shipping-related questions, please reach out to our support team. We’re here to help.</p>	Empowering Brands. Connecting Shoppers.	\N	Our journey began with a simple idea — to create a platform where great products meet the people who truly value them.\n\nIn today’s fast-paced world, discovering authentic brands and quality products can be overwhelming. We set out to solve this by building a marketplace that connects customers directly with trusted vendors, independent businesses, and emerging creators.\n\nOur platform is designed to support both shoppers and sellers. Customers enjoy a wide range of carefully curated products across multiple categories, while vendors gain access to powerful tools that help them grow, manage, and scale their businesses.\n\nWe believe in more than just transactions — we believe in building relationships. Every store on our platform has its own story, its own identity, and its own commitment to quality.\n\nAs we continue to grow, our mission remains the same: to create a reliable, scalable, and enjoyable ecommerce experience that empowers businesses and delights customers.\n\nWhether you're here to shop, explore, or sell — you're part of a growing community built for the future of commerce.	https://res.cloudinary.com/dhdtanihv/image/upload/v1776953876/urban-threads/products/ahpxt2tlhnix9dr7inh0.jpg	We are a modern multi-vendor marketplace that brings together trusted brands, independent sellers, and passionate creators into one seamless shopping experience.
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, "createdAt", address, city, country, password, phone, role, "updatedAt", "deletedAt", "isDeleted", "avatarUrl", name, status, "emailTokenExpiry", "emailVerifyToken", "pendingEmail", "tenantId", "passwordUpdatedAt", "twoFactorEnabled", "twoFactorSecret", "twoFactorTempSecret", "twoFactorTempSecretExpiresAt", "recoveryCodes", "deactivatedAt", "resetToken", "resetTokenExpiry") FROM stdin;
cmobgvlnh00002jx84nl36gxl	joe.ikdura@gmail.com	2026-04-23 12:37:42.365	\N	Mainland	Nigeria	$2b$10$ckg7ZS.vGlAySy9zejIpe.FBWbvmVtq8l6OtuYggP7PUDVX7y2Cbm	08063702221	ADMIN	2026-04-23 12:39:22.204	\N	f	\N	Kenenna Joseph 	ACTIVE	\N	\N	\N	cmobgk8vo00002j20ecdfhezf	\N	f	\N	\N	\N	\N	\N	\N	\N
cmoblw67v000m2jvo487nwywv	gilead@yahoo.com	2026-04-23 14:58:07.1	\N	Abakaliki	Nigeria	$2b$10$RK1sp2gDyr3cNmFVBIsnLOqZNPzWTM5n3g530lOK02MwFkshgggL6	090176534879	USER	2026-04-23 14:58:07.1	\N	f	\N	Gikead Igbudu	ACTIVE	\N	\N	\N	cmobgk8vo00002j20ecdfhezf	\N	f	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Vendor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vendor" (id, name, "tenantId") FROM stdin;
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WishlistItem" (id, "userId", "productId", "tenantId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Name: Address Address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: FAQ FAQ_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FAQ"
    ADD CONSTRAINT "FAQ_pkey" PRIMARY KEY (id);


--
-- Name: Newsletter Newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Newsletter"
    ADD CONSTRAINT "Newsletter_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: OrderStatusHistory OrderStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: OrderTrackingEvent OrderTrackingEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderTrackingEvent"
    ADD CONSTRAINT "OrderTrackingEvent_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vendor Vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vendor"
    ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CartItem_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_tenantId_idx" ON public."CartItem" USING btree ("tenantId");


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Newsletter_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Newsletter_email_key" ON public."Newsletter" USING btree (email);


--
-- Name: Newsletter_email_tenantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Newsletter_email_tenantId_key" ON public."Newsletter" USING btree (email, "tenantId");


--
-- Name: Order_paymentReference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_paymentReference_key" ON public."Order" USING btree ("paymentReference");


--
-- Name: Order_tenantId_createdAt_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_tenantId_createdAt_status_idx" ON public."Order" USING btree ("tenantId", "createdAt", status);


--
-- Name: Product_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_tenantId_idx" ON public."Product" USING btree ("tenantId");


--
-- Name: Product_tenantId_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_tenantId_slug_key" ON public."Product" USING btree ("tenantId", slug);


--
-- Name: Review_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_tenantId_idx" ON public."Review" USING btree ("tenantId");


--
-- Name: Review_userId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_userId_productId_key" ON public."Review" USING btree ("userId", "productId");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: Tenant_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tenant_slug_key" ON public."Tenant" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_resetToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_resetToken_key" ON public."User" USING btree ("resetToken");


--
-- Name: WishlistItem_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WishlistItem_tenantId_idx" ON public."WishlistItem" USING btree ("tenantId");


--
-- Name: Address Address_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Address Address_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Address"
    ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Category Category_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Contact Contact_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FAQ FAQ_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FAQ"
    ADD CONSTRAINT "FAQ_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Newsletter Newsletter_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Newsletter"
    ADD CONSTRAINT "Newsletter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderStatusHistory OrderStatusHistory_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderTrackingEvent OrderTrackingEvent_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderTrackingEvent"
    ADD CONSTRAINT "OrderTrackingEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_shippingAddressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES public."Address"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Product Product_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WishlistItem WishlistItem_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict GEdgryrD5CfCCeF9gHMvCIHz3N9lhAHCYZ9wzC78PwGmo5d0swNIvbnM55Urhbd

