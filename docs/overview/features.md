
# NoWaitr – Queue Management System

## **Core Features**

### 1. Customer Check-In (QR / Link / Kiosk)
Customers can join the queue by:
- Scanning a **QR code**
- Visiting a **link**
- Using a **kiosk/tablet** at the entrance
- Staff adding them manually

Customer provides:
- Name
- Email Address
- Phone number *(optional)*
- Number of people *(if relevant)*
- Selected service *(optional)*

This starts the **FIFO queue**.

---

### 2. Real-Time Queue Updates (WebSockets)
- Customers and staff see **live updates** as the queue changes.
- Queue position updates automatically.
- **No page refresh required**.

---

### 3. Business Dashboard (Admin Panel)
Staff can:
- View the full queue list
- Call next customer
- Mark a customer as **served**
- Mark **no-show**
- Remove someone from the queue
- Reorder only if needed *(restricted)*

---

### 4. Customer Status Notifications
Send notifications via:
- SMS (Costs money)
- WhatsApp (Costs money)
- Email
- In-app push *(future PWA support)*

Triggered when:
- Customer joins the queue
- Their turn is approaching
- Their turn is ready

---

### 5. Live Queue Display Screen (Optional)
A TV screen mode showing:
- **Now Serving**
- Next 3 customers
- Estimated waiting time

Ideal for restaurants, salons, service centers.

---

### 6. Estimated Waiting Time Algorithm
- Calculates ETA using:
  - `average service duration × number of customers ahead`
- Adjusts dynamically as staff serve customers.

---

### 7. Multi-Branch Support (Optional)
Businesses can:
- Create multiple branches
- Each branch has its own FIFO queue

---

### 8. Customer No-Show Handling
If a customer does not respond after X minutes:
- Mark as **no-show**
- Move next customer automatically
- Record event for analytics

---

### 9. Queue Settings
Businesses can customize:
- Maximum queue size
- Operation hours
- Auto-remove no-shows
- Average service time
- Require phone numbers (yes/no)
- Staff override FIFO (yes/no)

---

### 10. Analytics Dashboard
Metrics include:
- Daily total customers
- Average wait time
- No-show rate
- Peak hours graph
- Staff service speed

---


### 11. Customer Progress View
Customers see:
- Queue position
- Estimated wait time
- “X people ahead of you”
- Progress bar

## **Advanced Features (Achievable Enhancements)**

### 12. Staff Performance
Track:
- Customers served per staff
- Average handling time
- Speed ranking

---

### 13. Walk-In vs Online Queue Classification
Support two categories:
- Online joiners
- Walk-in joiners

---

### 14. Multiple FIFO Queues per Business
Examples:
- General Queue
- VIP Queue
- Outdoor Queue
- Service Queue A
- Men’s haircut / Women’s haircut

---

### 15. Customer Quick Rejoin
If a customer returns:
- System remembers previous details
- Auto-fills form for faster check-in

## **WOW Features**

### 16. Smart ETA Learning
ETA improves over time using real service data.

---

### 17. Offline Mode for Kiosk
Kiosk works offline and syncs later.

---

### 18. Sound Alerts & Voice Announcements
When calling next customer:
- Play a sound
- Or announce:  
  *“Customer 14, please proceed to counter.”*
