# SprintFastest Privacy Policy

**Last updated:** [INSERT DATE]

> ⚠️ **Not legal advice.** This draft was written to accurately describe what
> the SprintFastest app and backend actually do, based on the real codebase.
> Because SprintFastest knowingly collects data from children under 13 (our
> U11 age-group tier), this policy touches COPPA (US), UK GDPR/Data
> Protection Act 2018, and EU GDPR children's-data provisions. **Have a
> lawyer review this before publishing** — the placeholders below
> (`[INSERT ...]`) must be filled in with your actual company details, and a
> lawyer should confirm the children's-privacy sections meet your specific
> obligations in every region you operate in.

---

## 1. Who we are

SprintFastest ("**we**", "**us**", "**our**") provides the SprintFastest
mobile application and related services (the "**Service**"), which help
youth track & field athletes plan training, track performance, and receive
AI-generated coaching guidance.

- **Company name:** [INSERT LEGAL ENTITY NAME]
- **Registered address:** [INSERT ADDRESS]
- **Contact for privacy questions:** [INSERT EMAIL, e.g. privacy@sprintfastest.com]
- **Data Protection Officer (if applicable):** [INSERT NAME/CONTACT OR "N/A"]

This policy applies to the SprintFastest mobile app (iOS and Android) and
the sprintfastest.com website.

---

## 2. Information we collect

### 2.1 Account information
When you register, we collect:
- Email address
- Password (stored as a salted cryptographic hash — we never store or can
  see your actual password)
- Account role: athlete, parent, or coach
- Email verification status

### 2.2 Athlete profile information
If you register as an athlete, we collect:
- Age group (U11, U13, U15, U17, or U20)
- Primary event(s) you train for (e.g. 100m, 200m, 400m, relay)
- How many days per week you train
- Your next scheduled race date (optional, used to automatically adjust
  your training plan before a race)
- Onboarding responses you provide when setting up your account

### 2.3 Training and performance data
- AI-generated weekly training plans, including drills, sets, reps, and
  coaching cues
- Records of which training sessions you mark complete, and when
- Personal best times you log, by event distance, with the date recorded
- A history of your logged personal bests over time

### 2.4 Weakness diagnosis data
If you complete a diagnosis assessment, we collect:
- Your time-trial results (e.g. 20m, 60m, 200m times)
- Your answers to short qualitative questions about your training (e.g. how
  your start feels, whether you fade late in a race)
- The AI-generated weakness classification and drill prescription that
  results from this assessment

### 2.5 AI Coach conversations
When you use the AI Coach chat feature, we collect and store the full text
of your messages and the AI's responses, so the coach can refer back to
earlier parts of your conversation. **Your messages, along with a summary
of your age group, event, and training data, are sent to Google's Gemini AI
service to generate responses.** See Section 5 for more on this.

### 2.6 Achievements and gamification data
- Training streak counts (current and longest)
- Badges/achievements you've unlocked (e.g. session milestones, streak
  milestones, personal-best milestones)

### 2.7 Subscription and payment information
If you subscribe to SprintFastest Premium, your subscription is processed
by the Apple App Store or Google Play Store, and managed on our behalf by
RevenueCat. **We do not collect or store your payment card details** — Apple,
Google, and RevenueCat handle payment processing. We receive only your
subscription status (active, cancelled, expired) and plan type.

### 2.8 Coach and parent account data
- If you register as a coach, we collect your club name and a short
  biography you choose to provide.
- If you register as a parent, we store the link between your account and
  your linked athlete's account, established via a consent/link-code flow
  (see Section 8, Children's Privacy).
- Coaches may write notes about a linked athlete's training; some notes may
  be marked visible to the athlete, others private to the coach.

### 2.9 Technical and crash data
To keep the app reliable, we use Sentry to automatically collect, when the
app crashes or encounters an error:
- Device model, operating system version, and app version
- A stack trace describing where in the app the error occurred
- General usage context at the time of the error (e.g. which screen was
  open)

This data is used solely for diagnosing and fixing bugs — it is not used
for advertising or profiling.

### 2.10 Information we do NOT collect
We do not collect: precise GPS location, contacts, photos/camera access,
microphone audio (beyond an optional, clearly-labelled future audio-coaching
feature you would separately opt into), or biometric identifiers.

---

## 3. How we use your information

We use the information above to:
- Create and maintain your account
- Generate your personalised weekly training plans
- Diagnose your training weaknesses and prescribe relevant drills
- Power the AI Coach chat feature
- Track your personal bests, training streaks, and achievements
- Automatically taper your training plan ahead of a scheduled race
- Send you account-related emails (verification, password reset, weekly
  summaries)
- Process your Premium subscription, if you choose to purchase one
- Diagnose and fix bugs and crashes
- Enforce our free-tier usage limits (e.g. one free diagnosis, one training
  plan week on the free plan) and prevent misuse
- Comply with legal obligations

We do **not** sell your personal information. We do **not** use your data
to serve targeted third-party advertising.

---

## 4. Legal basis for processing (UK/EU users)

Where UK GDPR or EU GDPR applies, we rely on the following legal bases:
- **Contract**: processing necessary to provide the Service you've signed
  up for (account creation, training plans, chat, subscriptions)
- **Consent**: for children's accounts (parental consent — see Section 8),
  and for any optional features you explicitly opt into
- **Legitimate interests**: for crash reporting and abuse/fraud prevention,
  balanced against your rights and freedoms
- **Legal obligation**: where we must retain or disclose information to
  comply with the law

---

## 5. Third parties we share data with

We use the following service providers ("processors") to run SprintFastest.
Each only receives the data necessary to perform its function, under
contractual confidentiality and data-protection terms.

| Provider | Purpose | Data shared |
|---|---|---|
| **Google (Gemini API)** | Generates training plans, diagnosis results, and AI Coach chat responses | Your chat messages, age group, primary event, training days, current weakness, and personal bests (as context for coaching responses) |
| **RevenueCat** | Manages Premium subscriptions across app stores | Subscription status, purchase events (no payment card data) |
| **Apple App Store / Google Play Store** | Processes Premium subscription payments | Payment details are handled entirely by Apple/Google — we never receive or store them |
| **Resend** | Sends transactional emails (verification, password reset, weekly summaries) | Your email address and the content of the email sent |
| **Sentry** | Crash and error reporting | Device/OS info, app version, and error stack traces (see Section 2.9) |
| **Render** | Hosts our backend servers | All data described in this policy passes through our backend, hosted on Render's infrastructure (EU, Frankfurt) |
| **Neon** | Hosts our PostgreSQL database | All data described in this policy is stored in this database |

We do not permit any of these providers to use your data for their own
marketing or advertising purposes.

We may also disclose information if required by law, to protect the safety
of a user (particularly a child), or in connection with a merger,
acquisition, or sale of assets (with notice to you where required).

---

## 6. International data transfers

Some of our service providers (including Google, for the AI features) may
process data outside the UK/EEA, including in the United States. Where this
occurs, we rely on appropriate safeguards required by law, such as
Standard Contractual Clauses, to protect your information.

---

## 7. Data retention

We retain your account and training data for as long as your account
remains active, so that your training history, personal bests, and
achievements remain available to you.

If you delete your account, we will delete or anonymise your personal
data within [INSERT PERIOD, e.g. 30 days], except where we are required to
retain certain records for legal, tax, or fraud-prevention purposes, or
where data has been aggregated such that it no longer identifies you.

Chat messages with the AI Coach are retained as part of your account so
the coach can reference earlier context; you can request deletion of your
chat history at any time (Section 9).

---

## 8. Children's privacy

SprintFastest is used by young athletes across a range of ages, including
children under 13 (our "U11" age group).

- **Accounts for athletes under 13 require verifiable parental consent**
  before the child can sign in and use the Service. A U11 athlete account
  is created but locked until a parent or guardian links their own
  SprintFastest account to it.
- We collect only the information described in Section 2 that is
  reasonably necessary for the child to participate in the Service (age
  group, training data, performance data) — we do not knowingly collect
  more than necessary from a child.
- We do not knowingly show behavioural or targeted advertising to any user,
  and particularly not to children.
- A parent or guardian who has linked an athlete's account can review the
  data associated with that account and request its deletion at any time
  by contacting us at [INSERT PRIVACY CONTACT EMAIL].
- If we learn that we have collected personal information from a child
  under 13 without the verifiable parental consent described above, we will
  take steps to delete that information promptly.

Parents: if you believe your child has provided us with information
without your consent, please contact us immediately at
[INSERT PRIVACY CONTACT EMAIL].

---

## 9. Your rights

Depending on where you live, you may have the right to:
- **Access** the personal data we hold about you
- **Correct** inaccurate data (many fields can also be edited directly in
  the app's Profile screen)
- **Delete** your account and associated data
- **Export** your data in a portable format
- **Object to or restrict** certain processing
- **Withdraw consent** at any time, where processing is based on consent
  (this will not affect processing that occurred before withdrawal)

To exercise any of these rights, contact us at
[INSERT PRIVACY CONTACT EMAIL]. We will respond within the timeframe
required by applicable law (e.g. one month under UK/EU GDPR).

You also have the right to lodge a complaint with your local data
protection authority (in the UK, the **Information Commissioner's Office**,
ico.org.uk).

---

## 10. Data security

We use industry-standard measures to protect your data, including:
- Passwords stored as salted cryptographic hashes, never in plain text
- Encrypted connections (TLS/HTTPS) between the app, our servers, and our
  database
- Access controls limiting which of our systems and personnel can access
  personal data
- JWT-based session tokens with short expiry and refresh-token rotation

No method of transmission or storage is 100% secure, and we cannot
guarantee absolute security, but we work to protect your information using
practices appropriate to the sensitivity of the data involved.

---

## 11. Your choices

- **Notifications:** you can manage notification preferences in the app's
  Profile settings.
- **Marketing emails:** transactional emails (verification, password reset)
  cannot be opted out of while your account is active, as they're necessary
  for the Service to function. Any optional marketing communications will
  include an unsubscribe option.
- **Account deletion:** you can request account deletion at any time by
  contacting [INSERT PRIVACY CONTACT EMAIL].

---

## 12. Changes to this policy

We may update this Privacy Policy from time to time. If we make material
changes, we will notify you via the app or by email before the changes take
effect. The "Last updated" date at the top of this page reflects the most
recent revision.

---

## 13. Contact us

If you have any questions about this Privacy Policy or how we handle your
data, contact us at:

**[INSERT COMPANY NAME]**
[INSERT ADDRESS]
[INSERT PRIVACY CONTACT EMAIL]
