# SAYBON FILE LEDGER

Date: 2026-03-07

----------------------------------------

LOCKED JOB CODE FORMAT

SB-XXXXXX

Example:

SB-4F91A2

----------------------------------------

TRANSLATION PLATFORM FLOW

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

----------------------------------------

REQUEST PAGE

public/translation/request.html

Status: LOCKED

Features

File Upload
Word Count Extraction
Quote Calculation
Delivery Calculation
Plan Selection

----------------------------------------

JOB PAGE

public/translation/job.html

Status: LOCKED ARCHITECTURE

Responsibilities

Display Job Summary
Confirm Uploaded File
Create Backend Job
Display Job Code
Initiate Payment

----------------------------------------

SECURITY RULE

Job page does not trust URL parameters.
Backend must validate price, words, and plan.

----------------------------------------