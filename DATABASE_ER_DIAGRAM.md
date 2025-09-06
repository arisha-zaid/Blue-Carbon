# 🗄️ Blue Carbon Registry - Entity Relationship Diagram

## **Database Schema Overview**

The Blue Carbon Registry uses MongoDB as its primary database with Mongoose ODM for schema validation and relationship management. Below are the detailed entity relationships and schema definitions.

---

## **📊 Complete ER Diagram**

```mermaid
erDiagram
    %% Core User Entities
    USER ||--o{ PROJECT : "owns"
    USER ||--o{ TRANSACTION : "makes"
    USER ||--o{ COMPLAINT : "files"
    USER ||--o{ REFRESH_TOKEN : "has"
    USER ||--o{ USER_SESSION : "creates"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "performs"
    USER ||--|| WALLET : "has"
    USER ||--o| COMMUNITY_PROFILE : "extends"
    USER ||--o{ KYC_RECORD : "has"
    USER ||--o{ API_KEY : "generates"
    USER ||--o{ USER_CONSENT : "gives"
    USER ||--o{ WATCHLIST : "creates"
    
    %% Project Related Entities  
    PROJECT ||--o{ PROJECT_COMMENT : "has"
    PROJECT ||--o{ MILESTONE : "contains"
    PROJECT ||--o{ FUNDING_RECORD : "receives"
    PROJECT ||--o{ CARBON_IMPACT : "measures"
    PROJECT ||--o{ VERIFICATION_WORKFLOW : "undergoes"
    PROJECT ||--o{ FILE_ASSET : "contains"
    PROJECT ||--o{ MARKETPLACE_LISTING : "generates"
    PROJECT ||--o{ WATCHLIST : "watched_in"
    
    %% Financial Entities
    TRANSACTION ||--o{ LEDGER_ENTRY : "creates"
    TRANSACTION ||--|| ORDER : "fulfills"
    ORDER ||--|| INVOICE : "generates"
    MARKETPLACE_LISTING ||--o{ ORDER : "generates"
    WALLET ||--o{ TRANSACTION : "records"
    
    %% Governance Entities
    COMPLAINT ||--o{ AUDIT_LOG : "tracked_in"
    POLICY ||--o{ PROJECT : "governs"
    DISPUTE ||--o{ AUDIT_LOG : "tracked_in"
    
    %% System Entities
    WEBHOOK_ENDPOINT ||--o{ WEBHOOK_EVENT : "receives"
    SYSTEM_SETTING ||--o{ USER : "applies_to"
    
    USER {
        ObjectId _id PK
        string email UK "user@example.com"
        string password "hashed_password"
        string googleId UK "optional oauth id"
        string firstName "John"
        string lastName "Doe"
        string fullName "Auto-generated"
        string profilePicture "url or null"
        string phone "+1234567890"
        enum role "community|industry|government|admin"
        boolean isVerified "false"
        boolean isActive "true"
        object organization "name, type, website, address"
        object preferences "theme, language, notifications"
        boolean twoFactorEnabled "false"
        string twoFactorSecret "encrypted"
        string passwordResetToken "temporary"
        datetime passwordResetExpires "expiry"
        string emailVerificationToken "temporary"
        datetime emailVerificationExpires "expiry"
        datetime lastLogin "last login time"
        number loginAttempts "0"
        datetime lockUntil "account lock time"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    PROJECT {
        ObjectId _id PK
        string name "Project Title"
        string description "Detailed description"
        string shortDescription "Brief summary"
        enum type "reforestation|renewable_energy|waste_management|carbon_capture|biodiversity_conservation|sustainable_agriculture|clean_water|green_technology|other"
        enum category "mitigation|adaptation|conservation|restoration"
        array tags "['blue-carbon', 'mangrove']"
        object location "address, coordinates, city, state, country, region, area, elevation"
        ObjectId owner FK "ref User"
        array team "user, role, permissions, joinedAt"
        object organization "name, type, website, contact"
        enum status "draft|proposed|under_review|approved|active|paused|completed|verified|rejected|cancelled"
        enum phase "planning|implementation|monitoring|verification|maintenance"
        datetime startDate "project start"
        datetime endDate "project end"
        datetime actualStartDate "actual start"
        datetime actualEndDate "actual end"
        number duration "months"
        object funding "goal, raised, currency, breakdown, records"
        object carbonImpact "baseline, projections, actualImpact, certifications"
        object biodiversityImpact "speciesProtected, habitatRestored, ecosystemServices"
        object socialImpact "beneficiaries, communities, jobs, capacity"
        array documents "name, type, ipfsHash, url, uploadedBy, uploadedAt, isPublic"
        array images "IPFS hashes or URLs"
        array videos "IPFS hashes or URLs"
        array milestones "title, description, targetDate, completedDate, isCompleted, progress, evidence, budget"
        object progress "overall, lastUpdated, updates"
        object blockchain "projectId, contractAddress, txHash, blockNumber, ipfsHash, isOnChain, certificateTokenId, lastSyncedAt"
        object verification "isVerified, verifiedBy, standards"
        object monitoring "frequency, parameters, reports"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    TRANSACTION {
        ObjectId _id PK
        ObjectId user FK "ref User"
        enum type "buy|sell|transfer|refund|fee"
        number amount "transaction amount"
        number credits "carbon credits involved"
        string currency "USD|ETH|MATIC"
        string counterparty "buyer/seller info"
        string description "transaction description"
        enum status "pending|completed|failed|cancelled"
        string paymentMethod "credit_card|crypto|bank_transfer"
        string transactionHash "blockchain tx hash"
        number blockNumber "blockchain block"
        object metadata "additional data"
        datetime date "transaction date"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    WALLET {
        ObjectId _id PK
        ObjectId user FK "ref User" UK
        number carbonCredits "available credits"
        number lockedCredits "pending transactions"
        string blockchainAddress "ethereum address"
        string privateKeyHash "encrypted private key"
        array transactions "transaction history"
        object balanceHistory "historical balances"
        datetime lastSyncedAt "blockchain sync"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    MARKETPLACE_LISTING {
        ObjectId _id PK
        ObjectId project FK "ref Project"
        ObjectId seller FK "ref User"
        string title "listing title"
        string description "listing description"
        number creditsAvailable "credits for sale"
        number pricePerCredit "price per credit"
        string currency "USD|ETH"
        array tags "listing tags"
        enum status "active|sold|cancelled|expired"
        object certifications "standards, verifications"
        datetime listingDate "when listed"
        datetime expiryDate "listing expiry"
        number minimumPurchase "min credits to buy"
        boolean isVerified "admin verified"
        object analytics "views, inquiries"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    COMPLAINT {
        ObjectId _id PK
        string complaintNumber UK "auto-generated"
        ObjectId reportedBy FK "ref User"
        string title "complaint title"
        string description "detailed description"
        enum category "technical|financial|environmental|fraud|other"
        enum priority "low|medium|high|critical"
        enum urgency "low|medium|high"
        enum status "open|in_progress|resolved|closed|rejected"
        ObjectId assignedTo FK "ref User"
        object location "coordinates, address"
        array attachments "evidence files"
        array tags "complaint tags"
        object resolution "steps, outcome, resolvedBy, resolvedAt"
        object blockchainData "complaintId, txHash, isOnChain"
        datetime dueDate "resolution deadline"
        datetime resolvedAt "resolution time"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    ORDER {
        ObjectId _id PK
        string orderNumber UK "auto-generated"
        ObjectId buyer FK "ref User"
        ObjectId listing FK "ref MarketplaceListing"
        number credits "credits purchased"
        number totalAmount "total cost"
        string currency "USD|ETH"
        enum status "pending|confirmed|completed|cancelled|failed"
        object paymentDetails "method, reference, gateway"
        object deliveryDetails "certificates, blockchain"
        datetime orderDate "when ordered"
        datetime completedDate "when completed"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    INVOICE {
        ObjectId _id PK
        string number UK "INV-2024-001"
        ObjectId orderId FK "ref Order" UK
        ObjectId buyer FK "ref User"
        ObjectId seller FK "ref User"
        number amount "invoice amount"
        string currency "USD"
        array items "line items"
        number taxAmount "tax amount"
        number totalAmount "total with tax"
        enum status "draft|sent|paid|overdue|cancelled"
        datetime issueDate "invoice date"
        datetime dueDate "payment due date"
        datetime paidDate "payment date"
        object paymentDetails "method, reference"
        string notes "additional notes"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    COMMUNITY_PROFILE {
        ObjectId _id PK
        ObjectId userId FK "ref User" UK
        enum communityType "indigenous|coastal|rural|urban|other"
        object location "state, district, village, coordinates, ecosystemTypes"
        object blueCarbonActivities "interests, experience, resources, goals"
        object demographics "population, households, primaryOccupations, incomeLevel"
        object infrastructure "connectivity, transportation, facilities"
        object challenges "environmental, economic, social, technical"
        object resources "human, financial, natural, technical"
        object partnerships "ngos, government, private, international"
        enum profileStatus "incomplete|under_review|approved|rejected"
        datetime lastUpdated "profile update"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    VERIFICATION_WORKFLOW {
        ObjectId _id PK
        string workflowId UK "auto-generated"
        ObjectId targetId FK "target entity id"
        enum targetType "project|user|complaint|transaction"
        enum workflowType "manual|automated|hybrid"
        enum status "initiated|in_progress|completed|failed|cancelled"
        array steps "step definitions and status"
        ObjectId assignedTo FK "ref User"
        object metadata "workflow specific data"
        datetime startedAt "workflow start"
        datetime completedAt "workflow completion"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        string action "user action performed"
        string resourceType "project|user|transaction"
        ObjectId resourceId FK "affected resource"
        object oldValues "previous data"
        object newValues "updated data"
        string ipAddress "user IP"
        string userAgent "browser info"
        object metadata "additional context"
        datetime createdAt "auto"
    }
    
    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK "ref User"
        string title "notification title"
        string message "notification content"
        enum type "info|warning|success|error"
        enum category "project|transaction|system|security"
        boolean isRead "false"
        object data "notification payload"
        array channels "email|push|sms"
        datetime scheduledFor "delivery time"
        datetime readAt "when read"
        datetime createdAt "auto"
    }
    
    FILE_ASSET {
        ObjectId _id PK
        string filename "original filename"
        string mimeType "file mime type"
        number size "file size in bytes"
        string path "storage path"
        string ipfsHash "IPFS hash if stored"
        ObjectId owner FK "ref User"
        enum visibility "public|private|restricted"
        object metadata "file specific data"
        array tags "file tags"
        boolean isEncrypted "false"
        datetime uploadedAt "upload time"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    KYC_RECORD {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        enum documentType "passport|license|utility_bill|bank_statement"
        string documentNumber "document identifier"
        object verificationData "extracted data"
        enum status "pending|verified|rejected|expired"
        ObjectId verifiedBy FK "ref User"
        string rejectionReason "if rejected"
        datetime verifiedAt "verification time"
        datetime expiresAt "document expiry"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    POLICY {
        ObjectId _id PK
        string title "policy title"
        string description "policy description"
        enum category "environmental|financial|governance|technical"
        object content "policy content"
        enum status "draft|active|suspended|archived"
        array applicableRegions "regions where applicable"
        ObjectId createdBy FK "ref User"
        datetime effectiveDate "when policy takes effect"
        datetime expiryDate "policy expiration"
        object compliance "requirements and checks"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    SYSTEM_SETTING {
        ObjectId _id PK
        string key UK "setting identifier"
        string value "setting value"
        string description "setting description"
        enum type "string|number|boolean|json"
        boolean isPublic "false"
        boolean isEditable "true"
        datetime lastModified "last update"
        ObjectId modifiedBy FK "ref User"
        datetime createdAt "auto"
    }
    
    REFRESH_TOKEN {
        ObjectId _id PK
        string token UK "refresh token"
        ObjectId user FK "ref User"
        datetime expiresAt "token expiry"
        boolean isActive "true"
        string ipAddress "issued from IP"
        string userAgent "issued from browser"
        datetime createdAt "auto"
    }
    
    USER_SESSION {
        ObjectId _id PK
        ObjectId user FK "ref User"
        string sessionId UK "session identifier"
        object metadata "session data"
        string ipAddress "session IP"
        string userAgent "session browser"
        datetime lastActivity "last activity time"
        datetime expiresAt "session expiry"
        boolean isActive "true"
        datetime createdAt "auto"
    }
    
    USER_CONSENT {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        enum type "privacy|marketing|analytics|cookies"
        string version "consent version"
        boolean granted "consent status"
        object details "consent specifics"
        datetime grantedAt "when granted"
        datetime revokedAt "when revoked"
        datetime createdAt "auto"
    }
    
    API_KEY {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        string name "key identifier"
        string keyHash UK "hashed key"
        array scopes "permissions"
        boolean isActive "true"
        datetime lastUsed "last usage"
        datetime expiresAt "key expiry"
        datetime createdAt "auto"
    }
    
    WEBHOOK_ENDPOINT {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        string url "webhook URL"
        array events "subscribed events"
        string secret "webhook secret"
        boolean isActive "true"
        object metadata "endpoint config"
        datetime lastTriggered "last webhook call"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    WEBHOOK_EVENT {
        ObjectId _id PK
        ObjectId endpoint FK "ref WebhookEndpoint"
        string eventType "event name"
        object payload "event data"
        enum status "pending|sent|failed|retrying"
        number attempts "delivery attempts"
        string response "endpoint response"
        datetime scheduledFor "delivery time"
        datetime deliveredAt "successful delivery"
        datetime createdAt "auto"
    }
    
    WATCHLIST {
        ObjectId _id PK
        ObjectId userId FK "ref User"
        ObjectId projectId FK "ref Project"
        boolean notifications "receive updates"
        datetime addedAt "when added"
        datetime createdAt "auto"
    }
    
    LEDGER_ENTRY {
        ObjectId _id PK
        string account "account name"
        enum type "debit|credit"
        number amount "entry amount"
        string currency "USD|ETH"
        string description "entry description"
        ObjectId transactionId FK "ref Transaction"
        string reference "external reference"
        object metadata "additional data"
        datetime entryDate "accounting date"
        datetime createdAt "auto"
    }
    
    DISPUTE {
        ObjectId _id PK
        ObjectId initiatedBy FK "ref User"
        ObjectId respondent FK "ref User"
        string subject "dispute subject"
        string description "dispute details"
        ObjectId relatedTransaction FK "ref Transaction"
        enum status "open|mediation|arbitration|resolved|closed"
        object resolution "resolution details"
        ObjectId mediator FK "ref User"
        datetime dueDate "resolution deadline"
        datetime resolvedAt "resolution time"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
    
    PROJECT_COMMENT {
        ObjectId _id PK
        ObjectId projectId FK "ref Project"
        ObjectId author FK "ref User"
        string content "comment text"
        ObjectId parentComment FK "ref ProjectComment"
        array likes "user IDs who liked"
        boolean isEdited "false"
        datetime editedAt "last edit time"
        datetime createdAt "auto"
        datetime updatedAt "auto"
    }
```

---

## **🔗 Relationship Types & Cardinalities**

### **One-to-One Relationships (||--||)**
1. **USER → WALLET**: Each user has exactly one wallet
2. **ORDER → INVOICE**: Each order generates exactly one invoice
3. **USER → COMMUNITY_PROFILE**: Community users have one extended profile

### **One-to-Many Relationships (||--o{)**
1. **USER → PROJECT**: Users can own multiple projects
2. **PROJECT → MARKETPLACE_LISTING**: Projects can have multiple listings
3. **USER → TRANSACTION**: Users can have multiple transactions
4. **PROJECT → MILESTONE**: Projects contain multiple milestones
5. **USER → NOTIFICATION**: Users receive multiple notifications

### **Many-to-Many Relationships (}o--o{)**
1. **USER ↔ PROJECT** (via WATCHLIST): Users can watch multiple projects
2. **PROJECT ↔ USER** (via team field): Projects can have multiple team members

---

## **📋 Index Strategy**

### **Primary Indexes**
All collections have `_id` as primary key (ObjectId)

### **Unique Indexes**
```javascript
// Unique constraints
users: { email: 1, googleId: 1 }
complaints: { complaintNumber: 1 }
orders: { orderNumber: 1 }
invoices: { number: 1, orderId: 1 }
refreshTokens: { token: 1 }
systemSettings: { key: 1 }
wallets: { user: 1 }
apiKeys: { keyHash: 1 }
```

### **Compound Indexes**
```javascript
// Performance optimization indexes
projects: { status: 1, type: 1, createdAt: -1 }
transactions: { user: 1, status: 1, date: -1 }
complaints: { assignedTo: 1, status: 1 }
auditLogs: { resourceType: 1, resourceId: 1, createdAt: -1 }
marketplaceListings: { status: 1, pricePerCredit: 1 }
notifications: { user: 1, isRead: 1, createdAt: -1 }
```

### **Geospatial Indexes**
```javascript
// Location-based queries
projects: { 'location.coordinates': '2dsphere' }
complaints: { 'location.coordinates': '2dsphere' }
communityProfiles: { 'location.coordinates': '2dsphere' }
```

### **Text Indexes**
```javascript
// Full-text search
projects: { name: 'text', description: 'text', tags: 'text' }
users: { firstName: 'text', lastName: 'text', 'organization.name': 'text' }
```

---

## **🔄 Data Flow Patterns**

### **Project Creation Flow**
```
USER creates PROJECT →
PROJECT gets MILESTONE →
PROJECT undergoes VERIFICATION_WORKFLOW →
ADMIN approves via AUDIT_LOG →
MARKETPLACE_LISTING created →
INDUSTRY USER creates ORDER →
TRANSACTION processed →
INVOICE generated →
WALLET updated
```

### **Carbon Credit Lifecycle**
```
PROJECT approved →
CARBON_CREDIT issued →
MARKETPLACE_LISTING created →
ORDER placed →
TRANSACTION executed →
WALLET balance updated →
LEDGER_ENTRY recorded →
CERTIFICATE generated
```

---

## **⚠️ Data Integrity Constraints**

### **Business Rules**
1. **User Role Constraints**: Only community users can create projects
2. **Project Status Flow**: Projects must follow status progression
3. **Credit Conservation**: Total credits issued = total credits in wallets + transactions
4. **Financial Integrity**: All transactions must have corresponding ledger entries

### **Validation Rules**
```javascript
// Mongoose schema validations
userSchema.pre('save', function() {
  // Ensure role-specific validations
});

projectSchema.pre('save', function() {
  // Validate status transitions
  // Check funding goal constraints
});

transactionSchema.pre('save', function() {
  // Validate credit availability
  // Check wallet balance
});
```

---

## **📈 Scalability Considerations**

### **Horizontal Scaling**
- **Sharding Strategy**: Shard by user region or project type
- **Read Replicas**: Separate read/write operations
- **Connection Pooling**: Optimize database connections

### **Data Archiving**
- **Completed Projects**: Archive old project data
- **Transaction History**: Move old transactions to archive collection
- **Audit Logs**: Rotate logs based on retention policy

### **Performance Optimization**
- **Query Optimization**: Use explain() for slow queries
- **Aggregation Pipelines**: Optimize complex analytics queries
- **Caching Strategy**: Cache frequently accessed project data

---

## **🔐 Security Considerations**

### **Data Protection**
- **PII Encryption**: Encrypt sensitive user data
- **Password Hashing**: Use bcrypt for password storage
- **Token Security**: Secure JWT and refresh token storage

### **Access Control**
- **Field-level Security**: Restrict sensitive field access
- **Role-based Queries**: Filter data based on user role
- **Audit Trail**: Log all data modifications

---

## **📊 Analytics & Reporting Queries**

### **Common Aggregation Queries**
```javascript
// Project statistics by region
db.projects.aggregate([
  { $match: { status: 'active' } },
  { $group: { 
    _id: '$location.country',
    count: { $sum: 1 },
    totalFunding: { $sum: '$funding.raised' }
  }}
]);

// User registration trends
db.users.aggregate([
  { $group: {
    _id: { 
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      role: '$role'
    },
    count: { $sum: 1 }
  }}
]);

// Carbon credit transaction volume
db.transactions.aggregate([
  { $match: { type: 'buy', status: 'completed' } },
  { $group: {
    _id: null,
    totalCredits: { $sum: '$credits' },
    totalValue: { $sum: '$amount' },
    avgPrice: { $avg: { $divide: ['$amount', '$credits'] } }
  }}
]);
```

---

This ER diagram serves as the foundation for understanding the Blue Carbon Registry's data architecture and relationships. All entity relationships support the platform's core functionality while maintaining data integrity and scalability.