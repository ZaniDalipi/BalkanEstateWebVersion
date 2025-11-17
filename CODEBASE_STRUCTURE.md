# Balkan Estate Web Application - Codebase Structure Analysis

## Overview
- **Frontend**: React + TypeScript (60+ components)
- **Backend**: Express.js + Node.js + TypeScript (69 TypeScript files)
- **Database**: MongoDB
- **Real-time**: Socket.io for chat
- **AI Services**: Google Gemini 2.5 Pro/Flash
- **Payment/Subscriptions**: Google Play, Apple App Store, Stripe, Web

---

## 1. USER AUTHENTICATION & USER MODELS

### Location: `/backend/src/models/User.ts`

**User Schema (IUser interface):**
```
- _id: string (MongoDB ID)
- email: string (unique)
- password: string (hashed with bcrypt)
- name: string
- phone: string
- avatarUrl: string
- role: 'buyer' | 'private_seller' | 'agent'
- provider: 'local' | 'google' | 'facebook' | 'apple'
- providerId: string (for OAuth)
- isEmailVerified: boolean
- city, country: location info
- agencyName, agentId: agent-specific
- licenseNumber, licenseVerified: for agent verification

SUBSCRIPTION FIELDS:
- isSubscribed: boolean (indexed)
- subscriptionPlan: string (e.g., 'buyer_pro_monthly', 'seller_premium_yearly')
- subscriptionProductName: string (human-readable)
- subscriptionSource: 'google' | 'apple' | 'stripe' | 'web'
- subscriptionExpiresAt: Date (indexed)
- subscriptionStartedAt: Date
- activeSubscriptionId: ObjectId (ref to Subscription document)
- subscriptionStatus: 'active' | 'expired' | 'trial' | 'grace' | 'canceled'
- lastPaymentDate, lastPaymentAmount, totalPaid: payment tracking

FEATURE LIMITS:
- listingsCount: number (current active listings)
- totalListingsCreated: number (lifetime count)
- promotedAdsCount: number (tier-specific)
- isEnterpriseTier: boolean

ENCRYPTION:
- publicKey: string (JWK format, for E2E encryption)
```

**Key Methods:**
- `comparePassword(candidatePassword)`: Verify password with bcrypt
- `hasActiveSubscription()`: Checks if subscription is active
- `canAccessPremiumFeatures()`: Includes 7-day grace period

**Auth Routes**: `/backend/src/routes/authRoutes.ts`
**Auth Controller**: `/backend/src/controllers/authController.ts`

---

## 2. SUBSCRIPTION & PAYMENT PLANS

### Subscription Model: `/backend/src/models/Subscription.ts`

**ISubscription Interface:**
```
- userId: ObjectId (ref to User)
- store: 'google' | 'apple' | 'stripe' | 'web'
- productId: string (e.g., 'buyer_pro_monthly')

STORE-SPECIFIC IDs:
- googlePlayProductId, appStoreProductId, stripeProductId
- purchaseToken (Google Play)
- transactionId (Apple)
- stripeSubscriptionId
- receiptData (Apple receipt)

DATES:
- startDate: Date
- renewalDate, expirationDate, trialEndDate, canceledDate, pausedDate, refundedAt
- graceExpirationDate, gracePeriodEndDate
- willCancelAt: Date

STATUS:
- status: 'active' | 'expired' | 'canceled' | 'refunded' | 'paused' | 'grace' | 'trial' | 'pending_cancellation'
- autoRenewing: boolean

PRICING:
- price: number
- currency: string (default 'EUR')
- country: string

AUDIT:
- lastUpdated, lastValidated, validationAttempts
```

**Subscription Methods:**
- `isActive()`: Status is 'active' and not expired
- `isPremium()`: Status in ['active', 'grace', 'trial'] and not expired
- `isInGracePeriod()`: Status is 'grace' and not past grace expiration

### Product Model: `/backend/src/models/Product.ts`

**IProduct Interface (defines subscription tiers):**
```
- productId: string (unique, e.g., 'buyer_pro_monthly')
- name: string
- type: 'subscription' | 'consumable' | 'non_consumable'
- price: number
- billingPeriod: 'monthly' | 'yearly' | 'weekly' | 'quarterly' | 'one_time'
- trialPeriodDays, gracePeriodDays (default 3)
- features: string[] (list of feature names)
- targetRole: 'buyer' | 'seller' | 'agent' | 'all'
- badge, badgeColor: for marketing display
- highlighted: boolean
- isActive, isVisible: status flags
```

### Subscription Routes & Controllers
- **Routes**: `/backend/src/routes/subscriptionRoutes.ts`
- **Controller**: `/backend/src/controllers/subscriptionController.ts`
- **Payment Routes**: `/backend/src/routes/paymentRoutes.ts`
- **Payment Controller**: `/backend/src/controllers/paymentController.ts`

### Subscription Middleware: `/backend/src/middleware/checkSubscription.ts`

```
MIDDLEWARE FUNCTIONS:
1. requireActiveSubscription: Blocks access if no active subscription
2. requirePremiumAccess: Allows access with grace period
3. addSubscriptionInfo: Attaches subscription data to request (non-blocking)
```

### Feature Limits by Tier
**Location**: `/backend/src/controllers/propertyController.ts` (lines 171-183)

```
- FREE TIER: 3 listings, no promotions, no premium features
- PRO_MONTHLY/PRO_YEARLY: 15 listings, 2 promoted ads (15 days each)
- ENTERPRISE: 100 listings (unlimited), unlimited promotions
```

**Promotion Limits**:
- **Location**: `/backend/src/controllers/promotionController.ts`
- Pro tier: 2 active promotions max
- Duration: 15 days each

### Webhook Controllers
- **Google Play**: `/backend/src/controllers/googlePlayWebhookController.ts`
- **App Store**: `/backend/src/controllers/appStoreWebhookController.ts`

### Subscription Services
- **Google Play Service**: `/backend/src/services/googlePlayService.ts`
- **App Store Service**: `/backend/src/services/appStoreService.ts`
- **Subscription Payment Service**: `/backend/src/services/subscriptionPaymentService.ts`

### Subscription Workers (Background Jobs)
- **Expiration Worker**: `/backend/src/workers/subscriptionExpirationWorker.ts` (always enabled, checks for expiration)
- **Reconciliation Worker**: `/backend/src/workers/reconciliationWorker.ts` (optional, syncs with store systems)

---

## 3. AI SEARCH FEATURE

### Service: `/services/geminiService.ts`

**Function: `getAiChatResponse(history, properties)`**
- Uses Google Gemini 2.5 Pro model
- Takes conversation history and available properties
- Returns: `{ responseMessage, searchQuery, isFinalQuery }`
- Language matching: responds in user's language
- Parses natural language into structured `AiSearchQuery`

**Features:**
- Multi-turn conversation support
- Extracts criteria: location, price range, beds/baths, size (m²), features
- Asks clarifying questions when info is missing
- Returns `isFinalQuery: true` when ready to search

### Related Components

**Frontend Component**: `/components/BuyerFlow/AiSearch.tsx`
```
- Chat interface with message history
- Shows AI responses
- Displays extracted filter pills once query is ready
- "Apply Filters" button to execute search
- Mobile responsive
```

**State Management** (in AppContext):
```
- searchPageState.aiChatHistory: ChatMessage[]
- searchPageState.isAiChatModalOpen: boolean
- searchMode: 'manual' | 'ai'
```

### Message Types
**Location**: `/types.ts`
```
ChatMessage: { sender: 'user' | 'ai', text: string }
AiSearchQuery: {
  location?, minPrice?, maxPrice?,
  beds?, baths?, livingRooms?,
  minSqft?, maxSqft?, features?[]
}
```

---

## 4. AI PROPERTY INSIGHTS & PICTURE LABELING

### Service: `/services/geminiService.ts`

**Function: `generateDescriptionFromImages(images, language, propertyType)`**
- Uses Google Gemini 2.5 Pro with vision
- Analyzes multiple property photos
- Returns: `PropertyAnalysisResult`

**Generates:**
```
- Property description (markdown with bullet points)
- Room counts: bedrooms, bathrooms, living_rooms
- Size estimation: sq_meters
- Construction: year_built, materials[]
- Amenities: parking_spots, amenities[], key_features[]
- Image tags: assigns each image to ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other']
- Property type confirmation
- Floor info (for apartments)
```

**Frontend Component**: `/components/SellerFlow/GeminiDescriptionGenerator.tsx`
```
- Manages property listing creation flow
- Integrates AI image analysis
- Shows "Analyzing..." animation
- FREE_LISTING_LIMIT = 3 (for unsubscribed users)
- Enforces subscription paywall at line 228 and 616
- Handles property image upload and tagging
```

**Additional AI Functions**:

1. **generateSearchName(filters)** - Gemini 2.5 Flash
   - Converts filter object to human-readable search name
   - Example: "Bitola, under €100k, by agent, 3+ beds, 2+ baths"

2. **generateSearchNameFromCoords(lat, lng)** - Gemini 2.5 Flash
   - Identifies geographic area from coordinates
   - Returns location name for map-based search

3. **getNeighborhoodInsights(lat, lng, city, country)** - Gemini 2.5 Flash
   - Generates neighborhood summary with specific landmarks
   - Identifies schools, parks, transport, markets
   - Uses proximity descriptions

---

## 5. NOTIFICATIONS

### Service: `/services/notificationService.ts`

**NotificationService Class:**
```
Methods:
- requestPermission(): Request browser notification permission
- showNotification(title, options): Show generic notification
- showNewMessageNotification(senderName, preview, address): Message-specific notification
- initialize(): Request permission on app startup

Features:
- Browser notification API
- Auto-closes after 5 seconds
- Click handling (focuses window)
- Prevents duplicate notifications with tag system
```

**Usage**: Sends notifications for new messages in conversations

**Related**: 
- Socket.io events: `/backend/src/sockets/chatSocket.ts` (real-time message delivery)
- Conversation Controller: `/backend/src/controllers/conversationController.ts` (message creation)

---

## 6. BACKEND STRUCTURE

### Architecture Overview
```
/backend/src/
├── server.ts (entry point, Express app setup)
├── config/
│   ├── database.ts (MongoDB connection)
│   ├── passport.ts (OAuth strategies)
│   └── cloudinary.ts (image hosting)
├── models/ (MongoDB schemas)
│   ├── User.ts
│   ├── Property.ts
│   ├── Subscription.ts
│   ├── Product.ts
│   ├── Conversation.ts
│   ├── Message.ts
│   ├── Favorite.ts
│   ├── SavedSearch.ts
│   ├── Promotion.ts
│   ├── PaymentRecord.ts
│   ├── SubscriptionEvent.ts
│   ├── Agent.ts
│   ├── Agency.ts
│   ├── AgencyJoinRequest.ts
│   └── BankExport.ts
├── controllers/ (14 controller files)
│   ├── authController.ts
│   ├── propertyController.ts
│   ├── subscriptionController.ts
│   ├── conversationController.ts
│   ├── promotionController.ts
│   └── ... (others)
├── routes/ (14 route files)
│   ├── authRoutes.ts
│   ├── propertyRoutes.ts
│   ├── conversationRoutes.ts
│   ├── subscriptionRoutes.ts
│   └── ... (others)
├── middleware/
│   ├── auth.ts (JWT authentication)
│   ├── checkSubscription.ts (subscription enforcement)
├── services/ (external service integrations)
│   ├── googlePlayService.ts
│   ├── appStoreService.ts
│   ├── subscriptionPaymentService.ts
│   ├── emailService.ts
│   ├── geocodingService.ts
│   └── ... (others)
├── sockets/
│   └── chatSocket.ts (real-time chat with Socket.io)
├── workers/ (background jobs)
│   ├── subscriptionExpirationWorker.ts
│   └── reconciliationWorker.ts
└── utils/
    ├── jwt.ts
    ├── encryption.ts
    ├── messageFilter.ts
    └── upload.ts
```

### Key Routes
```
/api/auth              - Login, signup, OAuth
/api/properties        - CRUD operations (with listing limits)
/api/conversations     - Chat conversations
/api/subscriptions     - Subscription management
/api/payments          - Payment processing
/api/products          - Product/plan definitions
/api/promotions        - Property promotion (with limits)
/api/favorites         - Saved properties
/api/saved-searches    - Saved search filters
/api/agencies          - Agency management
/api/agents            - Agent profiles
/api/bank-exports      - Bank transaction exports
/api/webhooks          - Payment provider webhooks
```

### Database Collections (Models)
- **Users**: Auth, profiles, subscription status
- **Properties**: Listings with geocoding
- **Subscriptions**: Active subscriptions from all sources
- **Products**: Available subscription tiers
- **Conversations**: Chat threads between buyers/sellers
- **Messages**: Individual messages with E2E encryption
- **Favorites**: Saved properties
- **SavedSearches**: User search filters
- **Promotions**: Active property promotions
- **PaymentRecords**: Transaction history
- **SubscriptionEvents**: Subscription state changes
- **Agents**: Agent profiles with stats
- **Agencies**: Agency profiles
- **AgencyJoinRequests**: Agency join applications

### Authentication
**Location**: `/backend/src/config/passport.ts` & `/backend/src/middleware/auth.ts`
- Local strategy (email/password)
- Google OAuth
- Facebook OAuth
- Apple OAuth
- JWT tokens stored in localStorage

### File Upload
**Service**: `/backend/src/config/cloudinary.ts`
- Image upload to Cloudinary
- Used for property photos and avatars

---

## 7. FRONTEND STRUCTURE

### Tech Stack
- React + TypeScript
- Context API for state management (AppContext)
- Socket.io client for real-time features
- Vite for bundling
- TailwindCSS for styling

### Directory Structure
```
/
├── App.tsx (main app component)
├── index.tsx (entry point)
├── types.ts (TypeScript interfaces)
├── constants.ts (icons and UI constants)
├── context/
│   └── AppContext.tsx (global state, reducer pattern)
├── components/
│   ├── BuyerFlow/
│   │   ├── SearchPage.tsx (main search interface)
│   │   ├── PropertyList.tsx (property listings)
│   │   ├── MapComponent.tsx (map view)
│   │   ├── AiSearch.tsx (AI chat search)
│   │   ├── PropertyDetailsPage.tsx (detail view with insights)
│   │   ├── ConversationView.tsx (chat with sellers)
│   │   ├── InboxPage.tsx (message list)
│   │   ├── SavedSearchesPage.tsx
│   │   ├── SavedHomesPage.tsx
│   │   ├── SubscriptionModal.tsx (pricing)
│   │   └── ... (others)
│   ├── SellerFlow/
│   │   ├── GeminiDescriptionGenerator.tsx (AI property analysis)
│   │   ├── PricingPlans.tsx (subscription tier display)
│   │   ├── PropertyCalculator.tsx
│   │   ├── SellerDashboard.tsx
│   │   └── ... (animations)
│   ├── shared/
│   │   ├── Modal components
│   │   ├── Navigation
│   │   └── ... (reusable components)
│   └── auth/
│       └── Authentication UI
├── services/
│   ├── apiService.ts (HTTP client)
│   ├── socketService.ts (Socket.io client)
│   ├── notificationService.ts (browser notifications)
│   ├── geminiService.ts (AI integration)
│   ├── propertyService.ts (property data)
│   └── ... (others)
├── utils/
│   ├── api.ts
│   ├── e2eEncryption.ts (message encryption)
│   ├── location.ts
│   ├── currency.ts
│   └── ... (helpers)
└── config/
    └── paymentConfig.ts (Stripe/payment config)
```

### Component Organization

**BuyerFlow Components** (23 files):
- SearchPage.tsx (main hub)
- PropertyList.tsx (filterable listings)
- MapComponent.tsx (map-based search)
- AiSearch.tsx (AI chat interface)
- PropertyDetailsPage.tsx (detail view with:
  - Neighborhood insights (AI-generated)
  - Mortgage calculator
  - Property images with AI tags
  - Message to seller
  - Unread message count)
- ConversationView.tsx (real-time chat)
- InboxPage.tsx (message threads)
- SavedSearchesPage.tsx (saved filters)
- SavedHomesPage.tsx (saved properties)
- SubscriptionModal.tsx (pricing tiers)
- MortgageCalculator.tsx
- ComparisonBar.tsx & ComparisonModal.tsx (compare properties)
- FloorPlanViewerModal.tsx
- ImageViewerModal.tsx

**SellerFlow Components** (6 files):
- GeminiDescriptionGenerator.tsx (main seller listing creation with AI)
- PricingPlans.tsx (displays subscription options)
- PropertyCalculator.tsx
- SellerDashboard.tsx
- AiAnalyzingAnimation.tsx
- WhackAnIconAnimation.tsx

### Global State (AppContext)

**AppState** includes:
```
AUTHENTICATION:
- isAuthenticated, isAuthenticating
- currentUser: User | null
- isAuthModalOpen, authModalView

PROPERTIES:
- properties: Property[]
- selectedProperty: Property | null
- propertyToEdit: Property | null
- isLoadingProperties, propertiesError

USER DATA:
- savedHomes: Property[]
- savedSearches: SavedSearch[]
- conversations: Conversation[]
- comparisonList: string[] (property IDs)

SUBSCRIPTIONS:
- isPricingModalOpen, isSubscriptionModalOpen
- isFirstLoginOffer, pendingSubscription
- activeDiscount: { proYearly, proMonthly, enterprise }
- isEnterpriseModalOpen

NAVIGATION:
- activeView: AppView ('search' | 'saved-searches' | 'inbox' | ...)
- selectedAgentId, selectedAgencyId

SEARCH STATE:
- searchPageState: { filters, activeFilters, mapBounds, mobileView, searchMode, aiChatHistory }
- isListingLimitWarningOpen, isDiscountGameOpen
```

### API Service (`services/apiService.ts`)

**Key Functions:**
```
Authentication:
- checkAuth(): Verify logged-in user
- login(), signup(), logout()
- resetPassword(), updateProfile()

Properties:
- getProperties(): Fetch with filters
- getProperty(id): Single property detail
- createProperty(): Create listing (with limit check)
- updateProperty(): Edit listing
- renewProperty(): Extend listing duration
- markPropertySold(): Mark as sold

Subscriptions:
- getSubscriptionStatus()
- getAvailableProducts(): Get tiers

Conversations:
- getConversations()
- getMessages(conversationId)
- sendMessage()
- markConversationAsRead()

And more...
```

### Real-time Features (`socketService.ts`)

**Socket Events:**
```
'new-message': Receive messages in real-time
'message-read': Receive read receipts
'typing': Show when someone is typing
'user-online': Track online status
```

---

## FEATURE LIMITING SYSTEM (CURRENT IMPLEMENTATION)

### 1. Listing Creation Limits

**Location**: `/backend/src/controllers/propertyController.ts` (lines 170-216)

**Limits by Tier:**
- **Free**: 3 listings
- **Pro**: 15 listings
- **Enterprise**: 100 listings

**Enforcement**:
```typescript
const getTierLimit = (plan: string): number => {
  switch (plan) {
    case 'free': return 3;
    case 'pro_monthly': case 'pro_yearly': return 15;
    case 'enterprise': return 100;
    default: return 3;
  }
};

// Checks user.listingsCount >= tierLimit
// Returns 403 with: { code: 'LISTING_LIMIT_REACHED', limit, current, tier }
```

**Expiration Handling**:
- If subscription expires, user reverts to free tier
- If user has >3 listings when subscription expires, creation is blocked

### 2. Promotion Limits

**Location**: `/backend/src/controllers/promotionController.ts` (lines 48-64)

**Limits:**
- **Free/Pro**: Cannot promote (requires paid tier)
- **Pro**: 2 active promotions max
- **Enterprise**: Unlimited promotions (not explicitly stated but implied)

**Duration**: 15 days per promotion

### 3. AI Feature Limits

**Image Analysis (Gemini)**:
- **Location**: `/components/SellerFlow/GeminiDescriptionGenerator.tsx` (line 63)
- **Free tier**: FREE_LISTING_LIMIT = 3 listings max
- Used during property creation with AI analysis

**Neighborhood Insights (getNeighborhoodInsights)**:
- AI generates insights for each property
- Currently appears free (no explicit limit)
- Uses Gemini 2.5 Flash

**AI Search (getAiChatResponse)**:
- Converts natural language to search queries
- Currently appears unlimited

### 4. Subscription Middleware

**Location**: `/backend/src/middleware/checkSubscription.ts`

Three protection levels:
1. `requireActiveSubscription`: Strict (active status only)
2. `requirePremiumAccess`: With grace period (active, grace, trial)
3. `addSubscriptionInfo`: Non-blocking (attaches data)

### 5. Frontend Limiting

**Location**: `/components/SellerFlow/GeminiDescriptionGenerator.tsx` (lines 228, 616)

```typescript
if (userListings.length >= FREE_LISTING_LIMIT) {
  setError(`You've reached your free listing limit of ${FREE_LISTING_LIMIT}. 
           Please subscribe to publish more properties.`);
  // Shows SubscriptionModal
}
```

---

## KEY FILES FOR IMPLEMENTING FEATURE LIMITING

1. **Backend Feature Access**:
   - `/backend/src/middleware/checkSubscription.ts` - Add new middleware functions
   - `/backend/src/controllers/*` - Add feature checks in controllers
   - `/backend/src/models/User.ts` - Add feature usage fields

2. **Database Tracking**:
   - Create new models for feature usage (e.g., `FeatureUsage.ts`)
   - Add counters to User model for daily/monthly limits
   - Add timestamps for usage reset

3. **Frontend Enforcement**:
   - `/context/AppContext.tsx` - Track available features
   - `/components/*` - Add UI blockers
   - `/services/apiService.ts` - Handle 403 responses

4. **Configuration**:
   - Consider creating `/backend/src/config/featureLimits.ts` for centralized limits
   - Store limits by subscription plan and feature type

---

## TYPES & INTERFACES

**User Role**: `'buyer' | 'private_seller' | 'agent'`
**Subscription Plan**: `'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise' | null`
**Subscription Status**: `'active' | 'expired' | 'trial' | 'grace' | 'canceled'`

