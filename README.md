# KiddoQiddo

Ebeveynlerin çocuklarına günlük görevler tanımladığı, çocukların görevleri tamamlayıp puan kazandığı ve puanlarını ödüllere dönüştürdüğü, web öncelikli bir motivasyon uygulaması. Web arayüzü Capacitor ile ileride mobil uygulamaya taşınacak şekilde kurgulandı.

## Nasıl çalışır

- **Ebeveyn** kayıt olur, çocuk profilleri oluşturur, görev ve ödül tanımlar.
- **Çocuk** kendi PIN'i ile girdiği çocuk modunda görevlerini tamamlar.
- **Onay akışı:** Tamamlanan görev ebeveyn onayına düşer; onaylanınca puan, puan defterine (ledger) yazılır.
- **Ödüller:** Biriken puanlar ödüllerle takas edilir.
- **Raporlar ve bildirimler:** Haftalık rapor ve uygulama içi bildirimler bulunur.
- **Gamifikasyon:** Pet/avatar sistemi çocuğu motive etmek için kullanılır.

> MVP geliştirme aşamasında; özelliklerin durumu aşağıdaki yol haritasındadır.

## Teknoloji

| Katman | Teknolojiler |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod, Zustand, TanStack Query, Recharts |
| Mobil (hazırlık) | Capacitor 8 (Android) |
| Backend | .NET 10 Web API, Clean Architecture, Entity Framework Core, JWT + Refresh Token |
| Altyapı | PostgreSQL, Redis, Docker Compose |
| Test | Playwright |

## Proje yapısı

```
.
├── frontend/web/     # Next.js uygulaması (+ Capacitor Android projesi)
├── backend/          # .NET çözümü
│   ├── ParentTracker.Api             # Controller'lar, Program.cs
│   ├── ParentTracker.Application     # Use case'ler, DTO'lar
│   ├── ParentTracker.Domain          # Entity'ler, domain kuralları
│   ├── ParentTracker.Infrastructure  # Dış servis entegrasyonları
│   └── ParentTracker.Persistence     # EF Core, migration'lar
├── docker-compose.yml  # PostgreSQL + Redis
└── .env.example        # Ortam değişkenleri şablonu
```

## Kurulum

### Gereksinimler

- Node.js 18+ ve npm
- .NET SDK 10
- Docker ve Docker Compose
- `dotnet-ef` aracı (`dotnet tool install --global dotnet-ef`)

### 1. Ortam değişkenleri

```bash
cp .env.example .env                                   # docker-compose (PostgreSQL / Redis)
cp frontend/web/.env.example frontend/web/.env.local   # frontend (API adresi)
```

Varsayılan değerler yerel geliştirme için hazırdır. Backend ayarları `backend/ParentTracker.Api/appsettings.json` içindedir; `Jwt:Secret` ve bağlantı dizesini geçersiz kılmak için `backend/ParentTracker.Api/.env.local.example` dosyasındaki ortam değişkenlerine ya da `dotnet user-secrets`'a bak. Production'da `Jwt:Secret` ve veritabanı şifresini mutlaka değiştir.

### 2. PostgreSQL ve Redis

```bash
docker-compose up -d
docker-compose ps
```

PostgreSQL `localhost:5438`, Redis `localhost:6379` portlarında çalışır.

### 3. Backend

```bash
cd backend
dotnet restore
dotnet ef database update -p ParentTracker.Persistence -s ParentTracker.Api
dotnet run --project ParentTracker.Api/ParentTracker.Api.csproj
```

API: http://localhost:5125 (Swagger: http://localhost:5125/swagger)

### 4. Frontend

```bash
cd frontend/web
npm install
npm run dev
```

Uygulama: http://localhost:3000

## Faydalı komutlar

```bash
# Frontend
npm run dev      # geliştirme sunucusu
npm run build    # production build
npm run lint     # ESLint

# Backend
dotnet build
dotnet test
```

## Yol haritası

- [x] Proje iskeleti ve altyapı (Docker, Clean Architecture, Next.js)
- [ ] Ebeveyn kayıt/giriş
- [ ] Çocuk profil yönetimi
- [ ] Görev oluşturma ve atama
- [ ] Çocuk modu (PIN girişi)
- [ ] Görev tamamlama ve ebeveyn onayı
- [ ] Puan sistemi (ledger)
- [ ] Ödül yönetimi
- [ ] Haftalık rapor
- [ ] Uygulama içi bildirimler
- [ ] Pet/avatar gamifikasyonu
- [ ] Capacitor ile Android uygulaması

## Katkı

Her özellik için ayrı bir branch açıp pull request gönder.

## Lisans

Belirlenmedi.
