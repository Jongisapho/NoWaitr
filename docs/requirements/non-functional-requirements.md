# NoWaitr – Queue Management System

## **Non-Functional Requirements**

### 1. Performance
- **NFR-1**: The system shall handle at least **500 concurrent users per branch** without degradation in response time.
- **NFR-2**: Real-time updates (via WebSockets) shall propagate within **≤1 second** under normal load.
- **NFR-3**: The system shall support **sub-second response time** for dashboard actions (e.g., call next, mark served).

### 2. Scalability
- **NFR-4**: The system shall scale horizontally to support **multiple branches and thousands of concurrent users**.
- **NFR-5**: The architecture shall allow adding new queues, branches, and notification channels without major redesign.

### 3. Availability
- **NFR-6**: The system shall maintain **99.9% uptime** excluding scheduled maintenance.
- **NFR-7**: The system shall provide **graceful degradation** (e.g., fallback to polling if WebSockets fail).

### 4. Reliability
- **NFR-8**: The system shall ensure **data consistency** for queue positions even under concurrent operations.
- **NFR-9**: The system shall retry failed notifications up to **3 times** before marking as undeliverable.

### 5. Security
- **NFR-10**: All API endpoints shall require **JWT-based authentication** for staff/admin roles.
- **NFR-11**: Sensitive data (e.g., phone numbers) shall be encrypted at rest and in transit (TLS 1.2+).
- **NFR-12**: Public display endpoints shall **mask PII** (e.g., show first name + initial only).

### 6. Maintainability
- **NFR-13**: The system shall follow **modular architecture** to allow independent updates to notification, analytics, and queue modules.
- **NFR-14**: Code shall adhere to **SOLID principles** and include **unit tests with ≥80% coverage**.

### 7. Usability
- **NFR-15**: The customer check-in interface shall be **mobile-friendly** and accessible (WCAG 2.1 AA compliance).
- **NFR-16**: The dashboard shall provide **intuitive controls** for staff with minimal training required.

### 8. Portability
- **NFR-17**: The system shall run on **major browsers** (Chrome, Firefox, Safari, Edge) and support **responsive design**.
- **NFR-18**: The kiosk mode shall operate on **Android tablets** and optionally on **iOS devices**.

### 9. Audit & Logging
- **NFR-19**: The system shall log all queue operations (join, call, serve, no-show, remove) with timestamp and actor ID.
- **NFR-20**: Logs shall be retained for **at least 90 days** and exportable in CSV format.

### 10. Compliance
- **NFR-21**: The system shall comply with **GDPR** for handling customer data.
- **NFR-22**: The system must comply with **POPIA** (Protection of Personal Information Act) for South African users, including data minimization, purpose limitation, user consent, breach notification, and secure destruction of personal data.
- **NFR-23**: The system shall provide **opt-in/out** for notifications and data retention policies.
