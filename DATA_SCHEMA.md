# LaborGuard MongoDB Schema Registry

This document serves as a reference for all MongoDB databases and collections across the LaborGuard microservices ecosystem.

## 🔑 Auth Service
**Database**: `laborguard-auth`
| Collection | Purpose |
| :--- | :--- |
| `users` | Core identity data, roles, and authorization status. |
| `refreshtokens` | Session management and automated token rotation. |
| `verificationcodes` | Email and SMS OTP codes for identity verification. |

## 📢 Community Service
**Database**: `laborguard-community`
| Collection | Purpose |
| :--- | :--- |
| `posts` | Stories, experiences, and community pulse polls. |
| `comments` | Threaded discussions on community posts. |
| `reports` | Flagged content for administrative review. |
| `statuses` | (Internal) Content moderation states. |
| `userprofiles` | Public-facing persona and advocacy reputation. |

## ⚖️ Complaint Service
**Database**: `laborguard-complaint`
| Collection | Purpose |
| :--- | :--- |
| `complaints` | Legal case files, evidence metadata, and status history. |
| `appointments` | Booked consultations between workers and lawyers. |
| `legalofficerregistries` | Verified database of participating legal professionals. |

## 💼 Job Service
**Database**: `laborguard-jobs`
| Collection | Purpose |
| :--- | :--- |
| `jobs` | Verified job listings and employer requirements. |
| `applications` | Worker job applications and recruitment status. |

## 💬 Messaging Service
**Database**: `laborguard-messaging`
| Collection | Purpose |
| :--- | :--- |
| `conversations` | Metadata for secure chat rooms (E2E encrypted handles). |
| `messages` | Individual chat logs for case and job discussions. |

## 🔔 Notification Service
**Database**: `laborguard-notification`
| Collection | Purpose |
| :--- | :--- |
| `notifications` | System alerts, status updates, and messaging pings. |

---

> [!NOTE]
> All collections automatically implement standard indexing on `_id`, `createdAt`, and role-specific fields (e.g., `userId`, `caseId`) for high-performance querying.
