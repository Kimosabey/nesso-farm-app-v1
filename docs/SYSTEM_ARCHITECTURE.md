<div align="center">

# Nesso System Architecture

**Modern Data Flow & Technology Stack**

</div>

---

## 🏗️ Architecture Infographic

Here is the high-definition, light-themed system design infographic illustrating our stack and data flow:

<div align="center">
  <img src="./system_architecture_infographic.png" alt="System Architecture Infographic" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
</div>

---

## ⚙️ Technologies Used

- **Frontend / Mobile**: Expo, React Native, TypeScript, NativeWind
- **Backend / API**: Node.js, Express (or similar), TypeScript
- **Database**: MongoDB (Primary Database)
- **Caching & Queues**: Redis
- **Object Storage**: Minio (S3-compatible storage for KYC docs, images, etc.)
- **Local Dev Tools**: Mailhog (Email Testing), Docker (Containerization)

---

## 🔄 Technical Data Flow (End-to-End)

While the infographic above provides a high-level conceptual vision, the exact technical end-to-end flow for Nesso is mapped out below:

```mermaid
graph TD
    %% Styling
    classDef mobile fill:#f0fdf4,stroke:#22c55e,stroke-width:2px;
    classDef backend fill:#e0f2fe,stroke:#0ea5e9,stroke-width:2px;
    classDef db fill:#fff7ed,stroke:#f97316,stroke-width:2px;
    classDef storage fill:#faf5ff,stroke:#a855f7,stroke-width:2px;

    %% Mobile App Components
    subgraph Client ["📱 Expo Mobile App (Nesso)"]
        UI["React Native UI\n(NativeWind)"]
        State["Local State\n(Zustand / React Query)"]
        UI --> State
    end
    class Client mobile

    %% Backend Layer
    subgraph API ["⚡ Node.js Backend API"]
        Gateway["Express Server Routing"]
        Auth["Auth / JWT Middlewares"]
        Services["Business Logic\n(Farmers, Crops, Approvals)"]
        Gateway --> Auth --> Services
    end
    class API backend

    %% Databases & Services
    subgraph Infrastructure ["🗄️ Infrastructure & Storage"]
        Mongo[("MongoDB\n(Core Data)")]
        Redis[("Redis\n(Cache/Queues)")]
        Minio["Minio\n(S3 Object Storage)"]
        Mailhog["Mailhog\n(Local Emails)"]
    end
    class Infrastructure db

    %% Connections
    State -- "REST / API Calls" --> Gateway
    Services -- "Read/Write" --> Mongo
    Services -- "Cache/Jobs" --> Redis
    Services -- "Photos/KYC Uploads" --> Minio
    Services -- "Send SMTP" --> Mailhog
```

### Core Business Flows:
1. **Onboarding & KYC**: Farmers register via the app. ID proofs and Farm photos are uploaded directly to **Minio**. The profile data sits in **MongoDB** with an `approvalStatus: pending`.
2. **Offline-First Capabilities**: Mobile state is managed via **Zustand** and **React Query**, meaning critical actions can be queued locally and synced when online.
3. **Data Aggregation**: The Node.js API processes complex aggregates (e.g., total crop yields, input usage) fetching from MongoDB collections (`farms`, `crops`, `activities`).

<br />

<div align="center">
  <i>Maintained by Nesso Engineering Team</i>
</div>
