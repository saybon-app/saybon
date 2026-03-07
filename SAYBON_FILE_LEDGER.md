
# SAYBON FILE LEDGER

This ledger records the current locked state of all production files.

---

## LOCKED SYSTEM STATE
Date: 2026-03-07

### Translation Platform Architecture

Upload  
↓  
Quote  
↓  
Create Job  
↓  
Stripe Checkout  
↓  
Payment Success  
↓  
Invoice  
↓  
Translation Queue  
↓  
Translation Desk  

---

## LOCKED FILES

### Request Page

public/translation/request.html

Status: LOCKED

Features confirmed:

• File upload (TXT / DOCX / PDF)  
• Word count extraction  
• Quote calculation  
• Delivery timeline calculation  
• Standard / Express plan selection  
• Continue routing to job page  

Pricing Logic:

Standard = $0.025 per word  
Express = $0.05 per word  

Delivery tiers automatically calculated from pricing table.

---

## CURRENT FRONTEND ROUTES

/translation/request.html  
/translation/job.html  
/translation/payment.html  
/translation/success.html  
/translation/translation-desk.html  

---

## BUILD STATE

Request page UI and logic fully operational.

Next stage: Job Creation Page

