# E-Commerce Microservices Architecture

Sistem e-commerce ini dibangun menggunakan arsitektur mikrolayanan (microservices) dengan beberapa layanan backend independen yang berkomunikasi menggunakan Apache Kafka sebagai *message broker* (pendorong event tertunda), dan PostgreSQL sebagai basis data utama. Sistem ini terdiri dari berbagai komponen yang diorkestrasi menggunakan Docker Compose.

## Arsitektur Utama

Berikut adalah komponen layanan yang terdapat di dalam sistem:

1. **Frontend (`frontend`)**
   - Berjalan pada port `15009` (diarahkan ke `5173` dalam container).
   - Antarmuka web utama yang dibangun kemungkinan dengan Vue.js/Vite (berdasarkan port bawaan 5173). Berfungsi untuk berinteraksi dengan API layanan backend secara langsung.

2. **Layanan Mikro (Microservices)**
   Ada empat buah layanan mikro terpisah yang semuanya terhubung ke database Postgres dan message broker Kafka:
   
   - **Order Service (`order-service`)** - Berjalan pada port `15005`. Mengelola logika pembuatan pesanan, pembatalan, dan data keranjang belanja. (Database: `order_db`)
   - **Inventory Service (`inventory-service`)** - Berjalan pada port `15006`. Mengelola stok barang/produk yang tersedia, memastikan tidak ada over-selling. (Database: `inventory_db`)
   - **Payment Service (`payment-service`)** - Berjalan pada port `15007`. Mengelola dan memproses transaksi pembayaran atas suatu pesanan. (Database: `payment_db`)
   - **Notification Service (`notification-service`)** - Berjalan pada port `15008`. Mengelola pengiriman notifikasi/log kepada pengguna. (Database: `notification_db`)

3. **Database (`postgres`)**
   - Menggunakan image `postgres:15` pada port `15004` (host) dan `5432` (container).
   - Menjalankan *single instance* yang berisi beberapa database logis terpisah (`order_db`, `inventory_db`, `payment_db`, `notification_db`) agar setiap layanan tetap memiliki isolasi data di tingkat logical database.

4. **Message Broker (`kafka` & `zookeeper`)**
   - Merupakan tulang punggung (backbone) untuk komunikasi asinkron (Event-Driven Architecture) antar microservices. 

---

## Setup & Konfigurasi Apache Kafka

### 1. Zookeeper
Zookeeper (`confluentinc/cp-zookeeper:7.4.4`) adalah layanan koordinasi pusat yang diwajibkan oleh Kafka (pada versi sebelum KRaft sepenuhnya diadopsi, seperti versi 7.4.4 ke bawah pada ekosistem Confluent). Zookeeper bertanggung jawab atas pemilihan *controller broker*, manajemen topik, dan metadata perihal klaster Kafka.

Zookeeper berjalan terekspos di host pada port `15001`.
- **Environment Zookeeper:**
  - `ZOOKEEPER_CLIENT_PORT: 2181`: Menentukan port internal di mana Zookeeper akan mendengarkan koneksi dari client (seperti Kafka).
  - `ZOOKEEPER_TICK_TIME: 2000`: Unit waktu dasar (dalam milidetik) yang digunakan oleh Zookeeper untuk menghitung timeout, detak sinkronisasi (*heartbeats*). Disetel ke 2 detik.

### 2. Kafka
Kafka (`confluentinc/cp-kafka:7.4.4`) adalah message broker yang memfasilitasi komunikasi pub/sub (publish-subscribe). Tergantung (`depends_on`) pada Zookeeper agar bisa berjalan dengan sukses.

Kafka mengekspos port `15002` (internal cluster 9092) dan `15003` (akses dari host/external 29092).
- **Environment Kafka:**
  - `KAFKA_BROKER_ID: 1`: ID unik bernilai integer untuk membedakan broker ini dengan broker lain (seandainya kita memiliki multi-node cluster, namun di sini kita hanya menggunakan 1 broker).
  - `KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181`: Alamat URL yang akan dihubungi Kafka untuk dapat meregistrasikan dirinya ke server Zookeeper yang sedang berjalan.
  - `KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092`: Ini adalah alamat yang Kafka beritahukan ke client bahwa mereka harus mengirim dan menerima request melaluinya. 
    - `PLAINTEXT://kafka:9092` ditujukan untuk traffic interaksi antar docker container. 
    - `PLAINTEXT_HOST://localhost:29092` ditujukan untuk proses dari luar docker (misalnya saat di-run dari host machine OS Anda).
  - `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT`: Ini memetakan nama "Listener" yang disebutkan di atas ke protokol enkripsi (security). Keduanya disetel sebagai PLAINTEXT (tanpa SSL/tanpa SASL autentikasi).
  - `KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT`: Menginstruksikan agar komunikasi *inter-broker* (antar sesama broker Kafka itu sendiri) menggunakan protokol dari listener PLAINTEXT internal.
  - `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1`: Secara default Kafka menuntut replikasi offset consumer lebih dari 1, nilainya diturunkan menjadi `1` supaya tidak ada error karena setup kita ini hanyalah mode Single Node/Broker klaster (tidak ada server instance replika lain).
