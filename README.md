# 🚀 MultiCommSim – Distributed Multi-Protocol Communication Simulator

> TÜBİTAK UZAY destekli bir proje olarak geliştirilen **MultiCommSim**, TCP/IP protokolü üzerinden birçok bağımsız peer (client-server çifti) arasında haberleşmeyi aynı IP ve port üzerinden yöneten **modüler ve ölçeklenebilir** bir simülasyon ortamı sağlar.

---

## 📸 Arayüz Görselleri

<p align="center">
  <img src="images/image1.png" alt="Dashboard" width="700"/>
  <img src="images/image3.png" alt="Dashboard" width="700"/>
  <img src="images/image4.png" alt="Dashboard" width="700"/>
  <br/>
  <em>Gelişmiş arayüz ile eş zamanlı peer takibi ve log görüntüleme</em>
</p>

<p align="center">
  <img src="images/image2.png" alt="Peer Creation Modal" width="500"/>
  <br/>
  <em>Peer oluşturma ekranı – client & server mesajları dinamik girilir</em>
</p>

---

## 🧩 Proje Mimarisi

```mermaid
flowchart TB
  ReactUI[React UI (Frontend)]
  Flask[Flask API (Python)]
  DockerEngine[Docker Engine]
  Client[Client Container (Java)]
  Server[Server Container (Java)]
  Router[Router Container (Java TCP)]
  
  ReactUI -->|HTTP POST| Flask
  Flask -->|Docker SDK| DockerEngine
  DockerEngine --> Client
  DockerEngine --> Server
  DockerEngine --> Router
  Client -->|TCP| Router
  Router -->|TCP Forward| Server
  Server -->|TCP Response| Router
  Router -->|TCP Response| Client
```

---

## 📁 Proje Yapısı

```
MultiCommSim/
├── client/                → Java client uygulaması
├── server/                → Java server uygulaması
├── router/                → Java router service (TCP yönlendirme)
├── frontend/              → React UI (MultiCommSim Visualizer)
│   └── public/, src/
├── api/                   → Python Flask backend (Docker kontrolü)
├── docker/                → Dockerfile’lar & compose dosyaları
├── images/                → Arayüz görselleri
├── documentation/         → Proje dokümantasyonları
├── requirements.txt       → Python bağımlılıkları
├── README.md              → Bu dosya
```

---

## ⚙️ Kurulum & Çalıştırma

### 1️⃣ Bağımlılıkların Kurulumu

> Projeyi çalıştırmadan önce Docker yüklü olmalıdır. Ardından:

```bash
git clone https://github.com/kullanici/MultiCommSim.git
cd MultiCommSim
```

#### Python API
```bash
cd api/
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend/
npm install
npm run build
```

### 2️⃣ Docker Ortamını Başlat

```bash
docker compose up --build
```

### 3️⃣ Arayüzü Aç

Tarayıcıdan:

```
http://localhost:3000
```

---

## 🧪 Kullanım Senaryosu

1. **Add Peer** butonuyla yeni bir client-server çifti oluştur.
2. Her peer için özel mesajlar gir (Client Msg, Server Msg).
3. Sistem, bu peer için ayrı Docker container’larda client ve server başlatır.
4. **Run Test** tuşuna basıldığında, client-server iletişimi router üzerinden TCP ile gerçekleşir.
5. Tüm loglar React UI’da detaylı olarak gösterilir.

> ⚙️ Dilersen "Auto Refresh" özelliğiyle her 5 saniyede bir log’lar güncellenebilir.

---

## 🌐 Teknik Mimari Özeti

| Katman        | Teknoloji          | Açıklama |
|---------------|--------------------|----------|
| Arayüz        | React + Tailwind   | Görsel peer yönetimi ve log kontrolü |
| API Katmanı   | Flask (Python)     | Docker ile peer oluşturma ve log çekme |
| Routing       | Java TCP Router    | Tek port üzerinden mesaj yönlendirme |
| Worker Peer’ler| Java              | Gerçek TCP socket haberleşmesi |
| Konteynerleşme| Docker             | İzole peer çalıştırma ortamı |
| Ağ             | Docker Network    | Sanal router ağı (tek port – çok peer) |

---

## 🎯 Özellikler

- ✅ Tek IP ve Port (6003) üzerinden sınırsız client-server eşleşmesi
- ✅ Otomatik peer oluşturma & silme
- ✅ Gerçek zamanlı log takibi
- ✅ TCP mesajlaşma yönlendirme (router → server)
- ✅ Session & connection pool yönetimi
- ✅ Ölçeklenebilir ve gömülü sistemlere uygun yapı

---

## 📄 Teknik Dökümantasyon

Projeye ait 3 kapsamlı döküman repoda yer almaktadır:

| Döküman            | Açıklama |
|--------------------|----------|
| `TUBITAK-UZAY-MultiCommSim – Requirements Document.pdf` | Tüm sistem gereksinimleri detaylı listelenmiştir. |
| `TUBITAK-UZAY-MultiCommSim – Design Document.pdf`       | Yapısal tasarım, mimari bileşenler ve diagramlar yer alır. |
| `TUBITAK-UZAY-MultiCommSim – Final Delivery Report.pdf` | Projenin detaylı final. |

> 🧠 Özellikle “Port Management” ve “Single Port Multiplexing” bölümleri teknik olarak önemlidir.

---

## 📬 İletişim

> Geliştirici: **Ediz Arkın Kobak**  
> Mail: arkinediz@gmail.com  
> LinkedIn: [linkedin.com/in/ediz-arkin-kobak](https://www.linkedin.com/in/ediz-arkin-kobak)

---

> “MultiCommSim, sadece bir haberleşme simülatörü değil; tek porttan sınırsız peer yönetimiyle gömülü sistemler için geleceğe hazır bir altyapıdır.”
