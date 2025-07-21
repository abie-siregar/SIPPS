--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-13 21:32:58

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16420)
-- Name: guru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guru (
    id integer NOT NULL,
    nip integer,
    nama_depan character varying(255) NOT NULL,
    nama_belakang character varying(255) NOT NULL,
    gelar character varying(10) NOT NULL,
    jenis_kelamin character varying(10),
    no_hp character varying(20),
    email character varying(100),
    alamat text
);


ALTER TABLE public.guru OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16419)
-- Name: guru_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guru_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guru_id_seq OWNER TO postgres;

--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 219
-- Name: guru_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guru_id_seq OWNED BY public.guru.id;


--
-- TOC entry 218 (class 1259 OID 16411)
-- Name: siswa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.siswa (
    id integer NOT NULL,
    nisn integer,
    nama_depan character varying(255),
    nama_belakang character varying(255),
    jenis_kelamin character varying(10),
    tempat_lahir character varying(255),
    tgl_lahir date,
    alamat text
);


ALTER TABLE public.siswa OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16410)
-- Name: siswa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.siswa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.siswa_id_seq OWNER TO postgres;

--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 217
-- Name: siswa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.siswa_id_seq OWNED BY public.siswa.id;


--
-- TOC entry 222 (class 1259 OID 16429)
-- Name: tingkat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tingkat (
    id integer NOT NULL,
    nama character varying(10) NOT NULL,
    jenjang integer
);


ALTER TABLE public.tingkat OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16428)
-- Name: tingkat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tingkat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tingkat_id_seq OWNER TO postgres;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 221
-- Name: tingkat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tingkat_id_seq OWNED BY public.tingkat.id;


--
-- TOC entry 4753 (class 2604 OID 16423)
-- Name: guru id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru ALTER COLUMN id SET DEFAULT nextval('public.guru_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 16414)
-- Name: siswa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa ALTER COLUMN id SET DEFAULT nextval('public.siswa_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 16432)
-- Name: tingkat id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tingkat ALTER COLUMN id SET DEFAULT nextval('public.tingkat_id_seq'::regclass);


--
-- TOC entry 4913 (class 0 OID 16420)
-- Dependencies: 220
-- Data for Name: guru; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4911 (class 0 OID 16411)
-- Dependencies: 218
-- Data for Name: siswa; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.siswa (id, nisn, nama_depan, nama_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, alamat) VALUES (1, 123456789, 'Abdul', 'Hadi', 'Laki-laki', 'Medan', '2000-01-16', 'Medan, Sumatera Utara');


--
-- TOC entry 4915 (class 0 OID 16429)
-- Dependencies: 222
-- Data for Name: tingkat; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 219
-- Name: guru_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guru_id_seq', 1, false);


--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 217
-- Name: siswa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.siswa_id_seq', 1, true);


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 221
-- Name: tingkat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tingkat_id_seq', 1, false);


--
-- TOC entry 4758 (class 2606 OID 16427)
-- Name: guru guru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru
    ADD CONSTRAINT guru_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 2606 OID 16418)
-- Name: siswa siswa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.siswa
    ADD CONSTRAINT siswa_pkey PRIMARY KEY (id);


--
-- TOC entry 4760 (class 2606 OID 16438)
-- Name: tingkat tingkat_jenjang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tingkat
    ADD CONSTRAINT tingkat_jenjang_key UNIQUE (jenjang);


--
-- TOC entry 4762 (class 2606 OID 16436)
-- Name: tingkat tingkat_nama_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tingkat
    ADD CONSTRAINT tingkat_nama_key UNIQUE (nama);


--
-- TOC entry 4764 (class 2606 OID 16434)
-- Name: tingkat tingkat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tingkat
    ADD CONSTRAINT tingkat_pkey PRIMARY KEY (id);


-- Completed on 2025-07-13 21:32:58

--
-- PostgreSQL database dump complete
--

