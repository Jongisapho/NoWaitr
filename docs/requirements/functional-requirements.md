
# NoWaitr – Queue Management System

## **Functional Requirements**

### EPIC A — Customer Check‑In (QR / Link / Kiosk / Staff-Add)
- **FR-A1**: The system shall allow customers to join a queue via QR code, public link, kiosk/tablet, or staff manual add.
- **FR-A2**: The system shall capture name (required), phone (optional/configurable), party size (optional), and selected service/queue (required when multiple exist).
- **FR-A3**: The system shall assign a ticket ID and FIFO position upon successful check‑in.
- **FR-A4**: The system shall prevent check‑in when the queue has reached the configured maximum size and shall present an appropriate message or waitlist option (if enabled).
- **FR-A5**: The system shall validate inputs (e.g., name non-empty; phone in E.164 when required).
- **FR-A6**: The system shall optionally prevent duplicate active tickets for the same phone as per configurable policy.

### EPIC B — Real-Time Queue Updates (WebSockets)
- **FR-B1**: The system shall broadcast queue state changes (join, call next, served, no-show, remove, reorder if allowed) in real time.
- **FR-B2**: The system shall update customer and staff UIs without manual refresh.
- **FR-B3**: The system shall fall back to periodic polling when WebSocket connectivity is unavailable.

### EPIC C — Business Dashboard (Admin Panel)
- **FR-C1**: The system shall display the current queue with ticket ID, (anonymized) name, status, ETA, and time joined.
- **FR-C2**: The system shall allow staff to call the next ticket (advancing FIFO).
- **FR-C3**: The system shall allow staff to mark a ticket as served.
- **FR-C4**: The system shall allow staff to mark a ticket as no‑show.
- **FR-C5**: The system shall allow staff to remove a ticket.
- **FR-C6**: The system shall allow manual reorder only when branch policy permits FIFO override.
- **FR-C7**: The system shall allow staff to add a customer manually to a queue.
- **FR-C8**: The system shall provide search and filtering by status, time, staff, service, and source.

### EPIC D — Customer Status Notifications
- **FR-D1**: The system shall send a confirmation message on join with ticket ID, position, and status link via configured channels (SMS/WhatsApp/Email).
- **FR-D2**: The system shall send a “prepare” notification when the customer is approaching service (threshold configurable).
- **FR-D3**: The system shall send a “ready/called” notification when it is the customer’s turn.
- **FR-D4**: The system shall respect per-branch and per-customer channel preferences and opt-in/out choices.
- **FR-D5**: The system shall record notification delivery attempts and outcomes.

### EPIC E — Live Queue Display Screen (Optional)
- **FR-E1**: The system shall provide a display mode showing “Now Serving”, next N customers, and estimated waiting time.
- **FR-E2**: The system shall update the display in real time.
- **FR-E3**: The system shall support business branding/themes on the display.

### EPIC F — Estimated Waiting Time (ETA)
- **FR-F1**: The system shall compute ETA as `average service duration × number of customers ahead` by default.
- **FR-F2**: The system shall allow configuring average service duration per queue.
- **FR-F3**: The system shall recalculate ETA upon queue events (join, call, served, no‑show, remove).
- **FR-F4**: The system may optionally auto-adjust average duration using recent historical data (rolling average).

### EPIC G — Multi-Branch Support
- **FR-G1**: The system shall allow a business to create and manage multiple branches.
- **FR-G2**: The system shall isolate queues, settings, staff, and analytics per branch.
- **FR-G3**: The system shall route customers to the correct branch via QR/link or branch selection.

### EPIC H — No-Show Handling
- **FR-H1**: The system shall mark a called ticket as no‑show after X minutes without response (configurable).
- **FR-H2**: The system shall automatically advance to the next ticket upon no‑show.
- **FR-H3**: The system shall log no‑show events and allow optional reinstatement with a configurable return policy.

### EPIC I — Queue & Branch Settings
- **FR-I1**: The system shall provide configurable settings per branch/queue:
  - Max queue size
  - Operating hours (block join outside hours)
  - No-show timeout and auto-remove behavior
  - Average service time
  - Phone number requirement (Y/N)
  - Allow FIFO override (Y/N)
  - Notification channels, templates, and thresholds
  - Display settings (theme, “Next N”)
  - Privacy options for public display (masking/anonymization)
- **FR-I2**: The system shall enforce configured settings at check‑in and during queue operations.

### EPIC J — Analytics
- **FR-J1**: The system shall present metrics by time range and dimension (branch/queue):
  - Total customers
  - Average wait time
  - No‑show rate
  - Peak hours
  - Staff service speed
- **FR-J2**: The system shall allow exporting analytics data (CSV/XLSX).
- **FR-J3**: The system shall allow drill‑down by staff member and service/queue.

### EPIC K — Customer Progress View
- **FR-K1**: The system shall provide a status page showing current position, ETA, number ahead, and a progress bar.
- **FR-K2**: The system shall update the status page in real time.

### EPIC L — Staff Performance
- **FR-L1**: The system shall track per-staff customers served, average handling time, median handling time, and speed ranking.
- **FR-L2**: The system shall attribute tickets to staff when marked served or completed.

### EPIC M — Walk‑In vs Online Classification
- **FR-M1**: The system shall record ticket source: online, kiosk, or staff-add (walk‑in).
- **FR-M2**: The system shall allow filtering by source while maintaining FIFO order within each queue.

### EPIC N — Multiple Queues per Branch
- **FR-N1**: The system shall allow creation of multiple FIFO queues within a branch (e.g., General, VIP, Service A/B).
- **FR-N2**: The system shall require customers to select a queue when multiple exist.
- **FR-N3**: The system shall let staff manage queues independently (e.g., tabbed view).

### EPIC O — Customer Quick Rejoin
- **FR-O1**: The system shall detect returning customers (via phone/cookie/token) and prefill prior details.
- **FR-O2**: The system shall support one‑tap rejoin with the option to edit details.

### EPIC P — Smart ETA Learning (Advanced)
- **FR-P1**: The system shall refine ETA using historical service durations per queue and per staff.
- **FR-P2**: The system shall optionally adjust ETA by time-of-day/day-of-week patterns.

### EPIC Q — Offline Mode for Kiosk (Advanced)
- **FR-Q1**: The kiosk shall store check‑ins locally when offline.
- **FR-Q2**: The kiosk shall sync queued check‑ins upon reconnection, preserving order via server timestamps.
- **FR-Q3**: The kiosk shall prevent duplicate ticket creation using client-generated UUIDs and server reconciliation.

### EPIC R — Sound Alerts & Voice Announcements (Advanced)
- **FR-R1**: The system shall play configurable audio alerts or voice announcements when the next ticket is called.
- **FR-R2**: The system shall provide language and volume settings per device/display.
