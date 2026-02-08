# LaborGuard

**SDG 8: Decent Work and Economic Growth**

A microservices-based web application for protecting the rights of informal workers.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   MongoDB   │  │  Zookeeper  │  │    Kafka    │             │
│  │   :27017    │  │    :2181    │  │    :9092    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Microservices                          │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌─────────────────┐              │  │
│  │  │  Auth Service   │    │ Community Svc   │              │  │
│  │  │     :3001       │    │     :3002       │              │  │
│  │  └─────────────────┘    └─────────────────┘              │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌─────────────────┐              │  │
│  │  │ Complaint Svc   │    │ Notification Svc│              │  │
│  │  │     :3003       │    │     :3004       │              │  │
│  │  └─────────────────┘    └─────────────────┘              │  │
│  │                                                           │  │
│  │  ┌─────────────────┐                                      │  │
│  │  │ Messaging Svc   │                                      │  │
│  │  │     :3005       │                                      │  │
│  │  └─────────────────┘                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run All Services
```bash
cd backend
docker compose up --build
```

### Stop All Services
```bash
docker compose down
```

### Stop & Remove Volumes
```bash
docker compose down -v
```

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| **auth-service** | 3001 | Authentication & User Management |
| **community-service** | 3002 | Community Management |
| **complaint-service** | 3003 | Complaint Management |
| **notification-service** | 3004 | Notifications |
| **messaging-service** | 3005 | Actor-to-Actor Messaging |

## 🔗 Infrastructure

| Service | Port | Description |
|---------|------|-------------|
| **MongoDB** | 27017 | Database |
| **Zookeeper** | 2181 | Kafka coordination |
| **Kafka** | 9092 | Message broker |

## ✅ Health Check

After starting, verify each service is running:

```bash
curl http://localhost:3001/health  # auth-service
curl http://localhost:3002/health  # community-service
curl http://localhost:3003/health  # complaint-service
curl http://localhost:3004/health  # notification-service
curl http://localhost:3005/health  # messaging-service
```

## 📁 Project Structure

```
backend/
├── docker-compose.yml
└── services/
    ├── auth-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    ├── community-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    ├── complaint-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    ├── notification-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/index.js
    └── messaging-service/
        ├── Dockerfile
        ├── package.json
        └── src/index.js
```

## 🛠️ Development

Each service includes:
- Express.js server
- MongoDB connection with Mongoose
- Kafka producer/consumer setup
- Health check endpoint (`GET /health`)
- CORS enabled

### Adding New Features

1. Add routes in relevant `src/index.js`
2. Create models in `src/models/`
3. Create controllers in `src/controllers/`
4. Publish/subscribe to Kafka topics for inter-service communication
