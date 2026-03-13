# Tutorial 2 
**Nama: Zaim Aydin Nazif**

**NPM: 2206082524**

**link repo: https://github.com/zaimnazif974/e-commerce**
# Disclaimer Penggunaan Gen AI
Dalam mengerjakan tutorial ini saya menggunakan chatGPT dan Antigravity sebagai alat bantu untuk bug fixing dan memahami beberapa konsep seperti konfigurasi Kafka dan zookeeper. Saya tidak menggunakan Gen AI untuk merancang arsitektur atau membuat ide dari proyek ini, Gen AI hanya digunakan sebagai tools untuk memperlancar dan mempercepat pengerjaan.

# E-Commerce Microservices Architecture

Sistem e-commerce ini dibangun menggunakan arsitektur mikrolayanan (microservices) dengan beberapa layanan backend independen yang berkomunikasi menggunakan Apache Kafka sebagai *message broker*, dan PostgreSQL sebagai centralized database utama. Sistem ini terdiri dari berbagai komponen yang diorkestrasi menggunakan Docker Compose.

## Arsitektur Utama

Berikut adalah komponen layanan yang terdapat di dalam sistem:

1. **Frontend (`frontend`)**
   - Berjalan pada port `15009` (diarahkan ke `5173` dalam container).
   - Antarmuka web utama yang dibangun kemungkinan dengan Vue.js/Vite (berdasarkan port bawaan 5173). Berfungsi untuk berinteraksi dengan API layanan backend secara langsung.

2. **Layanan Mikro (Microservices)**
   Ada empat buah microservices yang semuanya terhubung ke database Postgres dan message broker Kafka:
   
   - **Order Service (`order-service`)** - Berjalan pada port `15005`. Mengelola logika pembuatan pesanan, pembatalan (Database: `order_db`)
   - **Inventory Service (`inventory-service`)** - Berjalan pada port `15006`. Mengelola stok barang/produk yang tersedia, memastikan tidak ada over-selling. (Database: `inventory_db`)
   - **Payment Service (`payment-service`)** - Berjalan pada port `15007`. Mengelola dan memproses transaksi pembayaran atas suatu pesanan. (Database: `payment_db`)
   - **Notification Service (`notification-service`)** - Berjalan pada port `15008`. Mengelola pengiriman notifikasi/log kepada pengguna. (Database: `notification_db`)
   - **Dashboard Service (`dashboard-service`)** - Berjalan pada port `15010`. Menyediakan API analitik dan metrik ringkasan kinerja sistem untuk disajikan ke antarmuka Admin. Mengonsumsi berbagai event untuk mengagregasi data *real-time*. (Database: `dashboard_db`)

3. **Database (`postgres`)**
   - Menggunakan image `postgres:15` pada port `15004` (host) dan `5432` (container).
   - Menjalankan *single instance* yang berisi beberapa database logis terpisah (`order_db`, `inventory_db`, `payment_db`, `notification_db`) agar setiap layanan tetap memiliki isolasi data di tingkat logical database.

4. **Message Broker (`kafka` & `zookeeper`)**
   - Merupakan backbone untuk komunikasi asinkron (Event-Driven Architecture) antar microservices. 

## Cara Menjalankan Proyek (Docker Compose)

1. **Persiapan Environment**: Pastikan Anda telah menginstal [Docker Desktop](https://www.docker.com/) dan mesin Docker Compose berjalan di sistem (Pengguna Windows sangat disarankan menggunakan integrasi WSL2).
2. **Kloning Repositori**: Buka direktori proyek ini di dalam terminal instruksi atau Git Bash.
3. **Jalankan Aplikasi (Build)**: Eksekusi perintah berantai di bawah ini guna merakit rancangan *image* per kontainer dan mengeksekusinya (*boot*) di latar belakang jaringan secara serentak :
   ```bash
   docker-compose up -d --build
   ```
4. **Verifikasi Operasional**: Jika proses selesai (*Started*/*Healthy*), buka *browser* navigasi Anda di url `http://localhost:15009` untuk membuka **Web E-Commerce (Frontend)** .

5. **Menghentikan Aplikasi**: 
   ```bash
   docker-compose down -v
   ```

---

# Event-Driven Demo (Real-Time Message Broker)

Proyek ini merupakan demonstrasi sederhana bagaimana **Event-Driven Architecture** bekerja pada sistem e-commerce menggunakan **Apache Kafka** sebagai message broker.

Dengan pendekatan ini, setiap service tidak perlu saling menunggu response satu sama lain (**non-blocking**). Service cukup mengirim event, lalu service lain yang membutuhkan event tersebut bisa memprosesnya secara **asynchronous**.

---

# Arsitektur Singkat

Pada sistem ini terdapat beberapa service yang saling berinteraksi melalui Kafka.

Contoh service yang terlibat:

- Order Service (Producer)
- Inventory Service (Consumer)
- Notification Service (Consumer)
- Dashboard / Analytics Service (Consumer)

Semua komunikasi antar service dilakukan melalui **Kafka Topic**.

```
Order Service → Kafka Topic → Multiple Consumers
```

---

# Contoh Flow Event: Cancel Order

Berikut ilustrasi alur ketika user **membatalkan pesanan**.

## 1. Event Dipublish (Producer)

1. User menekan tombol **Cancel** pada halaman **My Orders** di frontend.
2. Frontend mengirim request:

```
PATCH /orders/:id/cancel
```

3. Request diterima oleh **Order Service**.
4. Order Service mengubah status order di database menjadi **cancelled**.

Setelah itu, Order Service bertindak sebagai **Producer** dan mengirim event ke Kafka.

Topic:

```
order-events
```

Event key:

```
order.cancelled
```

Contoh payload:

```json
{
  "event": "order.cancelled",
  "orderId": "ORD-123",
  "productId": "PRD-11",
  "quantity": 2,
  "timestamp": "2026-03-13T10:00:00Z"
}
```

Setelah event dipublish:

- API langsung mengembalikan response **200 OK**
- Frontend menampilkan status order sebagai **Cancelled**

---

## 2. Event Disimpan oleh Kafka

Kafka menerima event tersebut dan menyimpannya sebagai **log** di dalam topic:

```
order-events
```

Event disimpan secara:

- durable (tidak hilang)
- ordered
- dapat dibaca ulang oleh consumer

---

## 3. Event Diproses oleh Multiple Consumers

Beberapa microservice yang sudah subscribe ke topic `order-events` akan menerima event tersebut.

### Inventory Service

Inventory Service membaca event `order.cancelled` lalu:

- mengambil `productId`
- mengambil `quantity`
- menambahkan kembali stok produk (**restock inventory**)

---

### Notification Service

Notification Service membaca event yang sama lalu membuat notifikasi untuk user.

Contoh:

```
Order ORD-123 has been cancelled
```

Notifikasi akan muncul di tab **Notifications**.

---

### Dashboard Service

Dashboard Service juga bisa membaca event tersebut untuk kebutuhan analytics.

Contohnya:

- menambah statistik **cancel order**
- update data pada dashboard admin

---

# Asynchronous vs Synchronous Communication

## Synchronous (REST API)

Pada pendekatan tradisional, service saling berkomunikasi menggunakan HTTP request.

```
Service A → HTTP Request → Service B
```

Masalah yang sering terjadi:

- Service A harus menunggu response dari Service B
- Jika Service B lambat, Service A ikut lambat
- Jika Service B down, request bisa gagal

Contoh:

```
Cart Service → check stock → Inventory Service
```

Jika Inventory Service down, maka request user juga bisa gagal.

---

## Asynchronous (Kafka Event-Driven)

Dengan Kafka, service tidak perlu menunggu service lain.

Flow-nya menjadi seperti ini:

```
Order Service → publish event → Kafka
```

Lalu service lain bebas mengonsumsi event tersebut:

```
Kafka → Inventory Service
Kafka → Notification Service
Kafka → Analytics Service
```

---

# Keuntungan Menggunakan Kafka

### Loose Coupling

Order Service tidak perlu tahu service lain.

Ia hanya mengirim event:

```
Order Cancelled
Order Created
Order Paid
```

Service lain yang membutuhkan event tersebut bisa memprosesnya sendiri.

---

### Fault Tolerance

Jika suatu service sedang **down**, event tidak hilang.

Kafka tetap menyimpan event tersebut.

Ketika service hidup kembali, ia bisa membaca event yang belum diproses dari **offset sebelumnya**.

---

### Scalability

Jika ingin menambahkan service baru, misalnya:

- Promo Service
- Recommendation Service
- Fraud Detection Service

Service tersebut cukup **subscribe ke topic Kafka** tanpa perlu mengubah kode Order Service.

---

# Kesimpulan

Dengan menggunakan **Apache Kafka**, sistem menjadi:

- lebih cepat (non-blocking)
- lebih tahan terhadap kegagalan service
- loosely coupled antar microservice
- mudah di-scale dan dikembangkan