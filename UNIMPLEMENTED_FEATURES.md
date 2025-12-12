# Balkan Estate - Unimplemented Features & Ideas

## CRITICAL: Features You're SELLING But Haven't Built (Fix ASAP)

### Premium Premiere Tier Promises (€55.99 tier)
- [ ] **Social media auto-posting** - Promised but no Facebook/Instagram API integration found
- [ ] **Newsletter to 50k+ subscribers** - No email service integration (SendGrid/Mailchimp)
- [ ] **Professional marketing materials** - No PDF/image generation service
- [ ] **Premium rotation display** - Logic for rotating premium listings not implemented

### Subscription Features
- [ ] **Advanced market insights** - Promised in Buyer Pro (€1.50/month) but not implemented
- [ ] **API access** - Promised in Enterprise (€1000/year) but no API key system found
- [ ] **Priority ads rotation** - Enterprise promises 3 priority ads/month, rotation logic unclear

### Incomplete Payment Flows
- [ ] **Apple/Google Play validation** - Has retry logic but incomplete error handling
- [ ] **Bank export service** - PaymentRecord has export flags but export service implementation missing
- [ ] **Stripe integration in payment window** - Frontend component uses placeholder

---

## NEW REVENUE FEATURES (From Strategy Analysis)

### TIER 1: High Priority - Quick Wins (Weeks 1-4)

#### 1. Smart Lead Marketplace
- [ ] Create `LeadInquiry` model with quality scoring fields
- [ ] Build rule-based lead scoring algorithm (`leadScoringService.ts`)
- [ ] Add API endpoint: `POST /api/leads/qualified-inquiry`
- [ ] Create payment flow for agents to buy lead credits
- [ ] Add `leadCredits` field to Agent/User model
- [ ] Build admin dashboard to monitor lead quality metrics
- [ ] Add seller filter: "Show only verified leads"
- [ ] Implement refund logic for disputed leads (24h window)

**Files to Create:**
```
/backend/src/models/LeadInquiry.ts
/backend/src/services/leadScoringService.ts
/backend/src/routes/leadRoutes.ts
/backend/src/controllers/leadController.ts
/mobile/src/screens/QualifiedInquiryForm.tsx
```

#### 2. Buyer Pro Repricing & Enhanced Alerts
- [ ] Create new pricing tiers: Buyer Pro (€9.99), Buyer Premium (€24.99)
- [ ] Integrate Twilio for SMS alerts
- [ ] Set up WhatsApp Business API for alerts
- [ ] Implement "early access" window (5 min before public for Premium users)
- [ ] Build notification preference UI in mobile app
- [ ] Add "priority inquiry badge" for premium buyers
- [ ] Migrate existing €1.50 users to free tier (grandfather 90 days)
- [ ] Update product catalog with new tiers

**Files to Create:**
```
/backend/src/services/twilioService.ts
/backend/src/services/whatsappService.ts
/backend/src/services/earlyAccessService.ts
/mobile/src/screens/NotificationPreferences.tsx
```

**API Integrations Needed:**
- Twilio account + phone number
- WhatsApp Business API access

#### 3. AI Listing Quality Score
- [ ] Build listing quality scoring algorithm (`listingQualityService.ts`)
- [ ] Score breakdown: photos (30%), description (25%), pricing (25%), completeness (20%)
- [ ] Add API endpoint: `POST /api/listings/analyze-quality`
- [ ] Create UI component to show quality score + recommendations
- [ ] Add `qualityScore` and `qualityLastAnalyzed` fields to Property model
- [ ] Build seller onboarding flow: "Improve your listing quality"
- [ ] Track improvement metrics (before/after optimization)
- [ ] Generate actionable recommendations with industry benchmarks

**Files to Create:**
```
/backend/src/services/listingQualityService.ts
/backend/src/routes/listingQualityRoutes.ts
/backend/src/controllers/listingQualityController.ts
/mobile/src/components/ListingQualityCard.tsx
/mobile/src/screens/ListingOptimizationTips.tsx
```

---

### TIER 2: AI Monetization Features (Weeks 5-8)

#### 4. AI Listing Optimizer (Auto-Fix)
- [ ] Integrate Gemini 2.5 Flash for description rewriting
- [ ] Build keyword analysis worker (analyze successful listings weekly)
- [ ] Create before/after preview UI
- [ ] Add payment flow for €9.99 one-time purchase
- [ ] Generate optimized descriptions with SEO keywords
- [ ] Auto-fill missing property fields using AI inference
- [ ] Suggest photo improvements (reordering, missing angles)
- [ ] Track optimization → performance correlation

**Files to Create:**
```
/backend/src/services/listingOptimizerService.ts
/backend/src/routes/optimizerRoutes.ts
/backend/src/controllers/optimizerController.ts
/backend/src/workers/keywordAnalysisWorker.ts
/mobile/src/screens/ListingOptimizerPreview.tsx
```

**Data Analysis Needed:**
- Extract top-performing keywords from successful listings
- Analyze description length → inquiry rate correlation
- Photo count → view duration analysis

#### 5. AI Pricing Oracle
- [ ] Build regression model using historical Property data
- [ ] Implement k-NN algorithm for comparable property finder
- [ ] Calculate confidence intervals for price recommendations
- [ ] Generate PDF reports with Puppeteer + Chart.js
- [ ] Add API endpoint: `POST /api/pricing/analyze`
- [ ] Create payment flow (€19.99 one-time OR included in Pro)
- [ ] Track accuracy: AI predictions vs actual sale prices
- [ ] Add neighborhood price trend analysis
- [ ] Estimate days-to-sell based on pricing

**Files to Create:**
```
/backend/src/services/pricingOracleService.ts
/backend/src/services/pdfReportService.ts
/backend/src/workers/pricingModelTrainer.ts
/backend/src/models/PricingReport.ts
/mobile/src/screens/PricingAnalysis.tsx
```

**New Database Fields:**
- Add `soldAt` field to Property model (track time-to-sale)
- Add `salePrice` field to Property model (vs listing price)

**npm Packages Needed:**
```bash
npm install puppeteer chart.js canvas
```

#### 6. Fraud Detection System
- [ ] Integrate Google Vision API for reverse image search
- [ ] Build fraud scoring algorithm (0-100 scale)
- [ ] Add `fraudScore` and `fraudStatus` fields to Property model
- [ ] Create `FraudReport` model
- [ ] Implement auto-block for scores >95
- [ ] Build moderation queue for scores 50-95
- [ ] Create admin dashboard for reviewing flagged listings
- [ ] Add appeals process (user can submit verification)
- [ ] Track precision/recall metrics
- [ ] Scan for scam phrases in descriptions using Gemini AI

**Files to Create:**
```
/backend/src/services/fraudDetectionService.ts
/backend/src/models/FraudReport.ts
/backend/src/routes/moderationRoutes.ts
/backend/src/controllers/moderationController.ts
/admin-dashboard/src/pages/ModerationQueue.tsx
/backend/src/workers/fraudScannerWorker.ts
```

**API Integrations:**
- Google Cloud Vision API
- Gemini AI (text classification)

---

### TIER 3: Trust & Verification (Weeks 9-12)

#### 7. Verified Buyer Badge
- [ ] Integrate Stripe Identity for KYC verification
- [ ] Create `BuyerVerification` model
- [ ] Build verification initiation flow
- [ ] Add webhook handler for Stripe Identity completion
- [ ] Add `isVerified` and `verificationExpiresAt` to User model
- [ ] Display verified badge in inquiry UI
- [ ] Implement "verified only" filter for sellers (Pro tier)
- [ ] Set up auto-expiration worker + renewal reminders
- [ ] Add financial proof upload (bank statement/pre-approval)
- [ ] Calculate trust score (0-100)
- [ ] Implement refund policy for failed verifications

**Files to Create:**
```
/backend/src/models/BuyerVerification.ts
/backend/src/services/verificationService.ts
/backend/src/routes/verificationRoutes.ts
/backend/src/controllers/verificationController.ts
/backend/src/workers/verificationExpiryWorker.ts
/mobile/src/screens/VerificationFlow.tsx
/mobile/src/screens/VerificationDocumentUpload.tsx
```

**API Integration:**
- Stripe Identity setup
- Alternative: Onfido KYC

#### 8. Virtual Tour Hosting + AI Enhancement
- [ ] Set up Cloudflare Images OR AWS S3 + CloudFront
- [ ] Integrate Cloudinary AI for image enhancement
- [ ] Build panorama stitching with Pannellum library
- [ ] Create `VirtualTour` model
- [ ] Build upload flow (max 20 photos, 5MB each)
- [ ] Add payment flow (€14.99 one-time)
- [ ] Implement hosting expiration (6 months) + renewal system
- [ ] Create interactive tour viewer component
- [ ] Track engagement metrics (view duration, completion rate)
- [ ] Add AI virtual staging option (€4.99 add-on)
- [ ] Generate 3D floor plans from photos (future)

**Files to Create:**
```
/backend/src/models/VirtualTour.ts
/backend/src/services/virtualTourService.ts
/backend/src/services/cloudinaryService.ts
/backend/src/routes/virtualTourRoutes.ts
/backend/src/controllers/virtualTourController.ts
/backend/src/workers/tourExpirationWorker.ts
/mobile/src/screens/VirtualTourUpload.tsx
/frontend/src/components/VirtualTourViewer.tsx
```

**npm Packages:**
```bash
npm install pannellum cloudinary aws-sdk
```

**CDN Setup:**
- Cloudflare Images account
- OR AWS S3 bucket + CloudFront distribution

#### 9. Personalized Property Recommendations
- [ ] Create `Interaction` model to track user behavior
- [ ] Build user preference analysis algorithm
- [ ] Implement collaborative filtering (similar users)
- [ ] Calculate recommendation scores
- [ ] Add "Recommended for You" section to homepage
- [ ] Implement ML-ranked search results (not just chronological)
- [ ] Train initial model on historical view/save data
- [ ] Set up weekly retraining worker
- [ ] A/B test: ML-ranked vs chronological feed
- [ ] Track engagement metrics (click-through rate, time on page)

**Files to Create:**
```
/backend/src/models/Interaction.ts
/backend/src/services/recommendationService.ts
/backend/src/workers/recommendationTrainer.ts
/backend/src/routes/recommendationRoutes.ts
/mobile/src/components/RecommendedProperties.tsx
/mobile/src/screens/PersonalizedFeed.tsx
```

**Algorithm Components:**
- User preference extraction (avg price, preferred locations, property types)
- Similar user finder (cosine similarity)
- Collaborative filtering implementation
- Score calculation combining content + collaborative signals

---

## MISSING INFRASTRUCTURE & TECHNICAL DEBT

### Background Workers (Exist But Not Scheduled)
- [ ] Set up cron jobs for `subscriptionExpirationWorker.ts`
- [ ] Set up cron jobs for `promotionRefreshWorker.ts`
- [ ] Set up cron jobs for `reconciliationWorker.ts`
- [ ] Add worker for monthly AI usage reset (neighborhoodInsights counter)
- [ ] Add worker for weekly search limit reset
- [ ] Add worker to check and expire featured subscriptions

**Implementation:**
```
/backend/src/workers/scheduledJobs.ts (new)
- Use node-cron or bull queue
- Configure intervals for each worker
```

### Payment System Improvements
- [ ] Fix Stripe API version (currently uses `2025-10-29.clover` - looks like placeholder)
- [ ] Complete Apple/Google Play subscription validation error handling
- [ ] Implement automatic subscription renewal reminders (3 days before expiry)
- [ ] Add payment method update flow (update credit card)
- [ ] Build revenue analytics dashboard (MRR, churn rate, ARPU)
- [ ] Implement proration logic for mid-cycle upgrades/downgrades
- [ ] Add invoice generation and email delivery

### Gamification System (Database Ready, Not Implemented)
- [ ] Design point/reward system
- [ ] DiscountCode model has `source: 'gamification'` but no implementation
- [ ] Create achievements (e.g., "First listing", "10 inquiries received")
- [ ] Build leaderboard for top agents
- [ ] Reward active users with discount codes
- [ ] Track engagement metrics for gamification

**Files to Create:**
```
/backend/src/models/Achievement.ts
/backend/src/models/UserPoints.ts
/backend/src/services/gamificationService.ts
/backend/src/routes/gamificationRoutes.ts
```

### Referral System (Database Ready, Not Implemented)
- [ ] DiscountCode model has `source: 'referral'` but no implementation
- [ ] Create referral code generation system
- [ ] Track referrals (who referred whom)
- [ ] Implement reward system (€10 credit for referrer, €10 for referee)
- [ ] Build referral dashboard (track conversions)
- [ ] Add social sharing for referral links
- [ ] Email notifications for successful referrals

**Files to Create:**
```
/backend/src/models/Referral.ts
/backend/src/services/referralService.ts
/backend/src/routes/referralRoutes.ts
/mobile/src/screens/ReferralDashboard.tsx
```

### Email Marketing (Not Implemented)
- [ ] Integrate SendGrid or Mailchimp
- [ ] Build email template system
- [ ] Implement newsletter subscription management
- [ ] Create automated email campaigns:
  - Welcome series for new users
  - Listing performance updates for sellers
  - Weekly property digest for buyers
  - Re-engagement campaigns for inactive users
- [ ] Build email preference center (GDPR compliance)
- [ ] Track email open rates and click-through rates

**Files to Create:**
```
/backend/src/services/emailService.ts
/backend/src/templates/emails/* (HTML email templates)
/backend/src/routes/emailPreferencesRoutes.ts
```

### Social Media Integration (Promised But Missing)
- [ ] Integrate Facebook Graph API
- [ ] Integrate Instagram Basic Display API
- [ ] Auto-post Premium listings to Facebook/Instagram
- [ ] Schedule posts (optimal timing based on engagement data)
- [ ] Track social media performance (likes, shares, clicks)
- [ ] Add social sharing buttons to property listings
- [ ] Implement Open Graph meta tags for rich previews

**Files to Create:**
```
/backend/src/services/facebookService.ts
/backend/src/services/instagramService.ts
/backend/src/workers/socialMediaPoster.ts
```

### Analytics & Reporting
- [ ] Build comprehensive seller dashboard:
  - Listing performance (views, saves, inquiries over time)
  - Comparison to similar listings
  - Best time to boost listing
  - Engagement heatmap (which photos get most clicks)
- [ ] Build agent performance dashboard:
  - Lead conversion rate
  - Response time metrics
  - Client satisfaction scores
  - Revenue per listing
- [ ] Build admin revenue dashboard:
  - MRR (Monthly Recurring Revenue)
  - Churn rate
  - ARPU (Average Revenue Per User)
  - Cohort analysis
  - Promotion tier performance
- [ ] Export capabilities (CSV, PDF reports)

**Files to Create:**
```
/backend/src/services/analyticsService.ts
/backend/src/routes/analyticsRoutes.ts
/backend/src/controllers/analyticsController.ts
/admin-dashboard/src/pages/RevenueAnalytics.tsx
/mobile/src/screens/SellerDashboard.tsx
/mobile/src/screens/AgentDashboard.tsx
```

---

## PRICING & PACKAGING UPDATES

### Product Catalog Restructuring
- [ ] Create new Buyer Pro product (€9.99/month)
- [ ] Create new Buyer Premium product (€24.99/month)
- [ ] Create new Seller Pro product (€49/month or €399/year)
- [ ] Create new Seller Premium product (€99/month or €899/year)
- [ ] Create Agent Starter plan (€79/month)
- [ ] Create Agency Pro plan (€199/month)
- [ ] Create Agency Enterprise plan (€499/month)
- [ ] Simplify promotion tiers (consolidate to 3: Featured, Highlight, Premium)
- [ ] Update all pricing in Product model
- [ ] Add bundle logic (e.g., Premium includes Verified Badge)

### Grandfathering & Migration
- [ ] Migrate existing €1.50 Buyer Pro users to free tier (90-day grace)
- [ ] Email campaign explaining new tiers + value additions
- [ ] Add migration scripts for database updates
- [ ] Track grandfathered users separately for analytics

---

## NEW DATABASE MODELS NEEDED

```
LeadInquiry - Smart lead marketplace
BuyerVerification - Verified buyer badge system
VirtualTour - Virtual tour hosting
Interaction - User behavior tracking for recommendations
FraudReport - Fraud detection system
PricingReport - AI pricing oracle reports
Achievement - Gamification system
UserPoints - Gamification points tracking
Referral - Referral program tracking
```

### Fields to Add to Existing Models

**User Model:**
```javascript
{
  isVerified: Boolean,
  verificationExpiresAt: Date,
  leadCredits: Number, // for agents
  referralCode: String,
  referredBy: ObjectId,
  pointsBalance: Number,
}
```

**Property Model:**
```javascript
{
  qualityScore: Number,
  qualityLastAnalyzed: Date,
  fraudScore: Number,
  fraudStatus: String, // 'clean' | 'flagged' | 'blocked'
  soldAt: Date,
  salePrice: Number,
  suggestedPrice: Number, // from AI pricing oracle
  hasVirtualTour: Boolean,
  virtualTourId: ObjectId,
}
```

**Agent Model:**
```javascript
{
  leadCredits: Number,
  leadConversionRate: Number,
  avgResponseTime: Number, // in minutes
  clientSatisfactionScore: Number, // 0-100
}
```

---

## API INTEGRATIONS NEEDED

### Payment & Verification
- [ ] **Twilio** - SMS notifications (€0.05/SMS)
- [ ] **WhatsApp Business API** - WhatsApp alerts (€0.005/message)
- [ ] **Stripe Identity** - KYC verification (€2/verification)
- [ ] Alternative: **Onfido** - KYC verification (€3/check)

### AI & Image Processing
- [ ] **Google Cloud Vision API** - Reverse image search for fraud (€1.50/1000 images)
- [ ] **Cloudinary AI** - Image enhancement (€0.10/image)
- [ ] **Gemini API** - Already integrated, expand usage for:
  - Description rewriting
  - Fraud text classification
  - Price narrative generation

### Communication
- [ ] **SendGrid** or **Mailchimp** - Email marketing
- [ ] **Facebook Graph API** - Social media posting
- [ ] **Instagram API** - Social media posting

### Infrastructure
- [ ] **Cloudflare Images** OR **AWS S3 + CloudFront** - CDN for virtual tours
- [ ] **Pannellum** - Open-source panorama viewer (free)
- [ ] **Puppeteer** - PDF report generation (free, self-hosted)

---

## UX/UI IMPROVEMENTS NEEDED

### Mobile App
- [ ] Notification preferences screen (granular control)
- [ ] Listing quality score card with visual progress bar
- [ ] Virtual tour upload flow with preview
- [ ] Verification document upload with live camera
- [ ] Lead quality breakdown visualization
- [ ] "Recommended for You" personalized feed
- [ ] Pricing analysis report viewer
- [ ] Seller/Agent performance dashboard

### Admin Dashboard
- [ ] Revenue analytics (MRR, churn, ARPU)
- [ ] Moderation queue for fraud detection
- [ ] Lead quality monitoring
- [ ] Email campaign manager
- [ ] Discount code generator with templates
- [ ] User segment builder (for targeted campaigns)

### Web Frontend
- [ ] Virtual tour viewer component (Pannellum integration)
- [ ] Interactive pricing report with charts
- [ ] Comparison tool (side-by-side property comparison)
- [ ] Market trends page (neighborhood insights)

---

## TESTING & QUALITY ASSURANCE

### Unit Tests Needed
- [ ] Lead scoring algorithm tests
- [ ] Fraud detection algorithm tests
- [ ] Pricing oracle accuracy tests
- [ ] Recommendation algorithm tests
- [ ] Payment flow edge cases (failed payments, refunds)

### Integration Tests
- [ ] Stripe Identity webhook handling
- [ ] Twilio SMS delivery
- [ ] WhatsApp message delivery
- [ ] Google Vision API error handling
- [ ] Gemini API rate limiting

### Load Testing
- [ ] Virtual tour upload/download performance
- [ ] Recommendation engine scalability
- [ ] Fraud detection worker throughput
- [ ] Email campaign sending limits

---

## LEGAL & COMPLIANCE

### GDPR Compliance
- [ ] Data retention policies (auto-delete verification docs after 90 days)
- [ ] Right to deletion implementation
- [ ] Data export functionality (user can download all their data)
- [ ] Cookie consent management
- [ ] Privacy policy updates (disclose AI usage, data processing)

### Terms of Service Updates
- [ ] AI disclaimer ("for informational purposes only")
- [ ] Verified buyer terms (what verification includes)
- [ ] Virtual tour licensing (who owns the enhanced images)
- [ ] Fraud detection appeal process
- [ ] Refund policies for all new services

### Financial Compliance
- [ ] Invoice generation for business users
- [ ] VAT handling for EU users
- [ ] Accounting export format (QuickBooks/Xero integration)
- [ ] Financial reporting for tax authorities

---

## MONITORING & ALERTS

### Business Metrics Dashboards
- [ ] Daily revenue tracking
- [ ] Conversion funnel visualization (free → paid)
- [ ] Churn rate monitoring
- [ ] AI service cost tracking (vs budget)
- [ ] Fraud detection precision/recall metrics

### Operational Alerts
- [ ] Alert if API costs >€20/day
- [ ] Alert if fraud detection false positive rate >10%
- [ ] Alert if payment failure rate >5%
- [ ] Alert if worker jobs fail (e.g., email sending)
- [ ] Alert if server response time >2 seconds

### User Health Metrics
- [ ] DAU/MAU (Daily/Monthly Active Users)
- [ ] Time on platform per user
- [ ] Properties viewed per session
- [ ] Inquiry rate (% of views that convert to inquiry)

---

## DOCUMENTATION NEEDED

### API Documentation
- [ ] OpenAPI/Swagger specification for all endpoints
- [ ] Webhook documentation for integrations
- [ ] Rate limiting policies
- [ ] Authentication guide (API keys for Enterprise users)

### User Guides
- [ ] How to optimize your listing (seller guide)
- [ ] How to use AI pricing oracle
- [ ] How to become a verified buyer
- [ ] How to create virtual tours
- [ ] Agent best practices guide

### Internal Documentation
- [ ] Fraud detection algorithm explanation
- [ ] Lead scoring methodology
- [ ] Recommendation engine architecture
- [ ] Pricing model training process
- [ ] Revenue calculation methodology

---

## SUMMARY: IMPLEMENTATION PRIORITY

### ⚡ CRITICAL (Do First - Weeks 1-2)
1. Fix Premium Premiere vaporware (social media, newsletter, marketing materials)
2. Buyer Pro repricing + SMS/WhatsApp alerts
3. Listing Quality Score (free, drives optimization sales)
4. Smart Lead Marketplace

### 🔥 HIGH PRIORITY (Weeks 3-6)
5. AI Listing Optimizer
6. AI Pricing Oracle
7. Fraud Detection System
8. Background worker scheduling

### 📈 MEDIUM PRIORITY (Weeks 7-10)
9. Verified Buyer Badge
10. Virtual Tour Hosting
11. Personalized Recommendations
12. Email marketing integration

### 🎯 LOW PRIORITY (Weeks 11-12+)
13. Gamification system
14. Referral program
15. Advanced analytics dashboards
16. Social media integration (if not fixing Premium Premiere)

---

## ESTIMATED TOTAL IMPLEMENTATION TIME

- **Phase 1 (Critical):** 4-5 weeks
- **Phase 2 (High Priority):** 6-7 weeks
- **Phase 3 (Medium Priority):** 6-8 weeks
- **Phase 4 (Low Priority):** 4-6 weeks

**Total:** ~22-26 weeks (5-6 months) for full implementation

**Quick Win Path (3 months to €80k/month revenue):**
Focus ONLY on items 1-8 above = 10-12 weeks

---

## NEXT STEPS

1. **Prioritize:** Review this list with your team, pick top 5 features
2. **Estimate:** Get engineering estimates for each feature
3. **Acquire APIs:** Set up accounts for Twilio, Stripe Identity, Google Vision, Cloudinary
4. **Design:** Create mockups for key user flows (verification, virtual tours, quality score)
5. **Ship:** Start with Buyer Pro repricing (can be done in 2 days, instant revenue)

**Remember:** You don't need to build everything. Ship 2-3 features per month, measure impact, iterate.
