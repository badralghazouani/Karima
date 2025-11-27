# Payment Management System - Administrator Guide

## Overview

The Karima platform now includes a comprehensive payment management system that allows administrators to:

- **View and manage all payments** across the platform
- **Create test payments** for courses (without going through Stripe)
- **Filter and search** payment history
- **Track payment statistics** (total revenue, completed payments, failed payments, etc.)
- **Distinguish between real and test payments**

## Key Features

### 1. Payment Management Dashboard

Access the payment management system at `/admin/payments` (Admin-only route).

**Components:**
- **Payment Statistics Cards**: Display metrics including:
  - Total number of payments
  - Total real revenue
  - Number of completed payments
- **Advanced Filters**: Filter payments by:
  - Search term (user name, email, or course ID)
  - Payment status (Pending, Completed, Failed, Refunded)
  - Payment type (All, Real, or Test only)
- **Payment History Table**: View all payments with details including:
  - User information (name and email)
  - Course ID
  - Amount and currency
  - Payment status with color coding
  - Payment method
  - Payment type indicator (Test/Real)
  - Date created

### 2. Test Payment Creation

Create fake payments for testing purposes without going through Stripe.

**Access:**
- Click the "➕ Create Test Payment" button on the Payment Management dashboard
- Opens a modal form for payment creation

**Form Fields:**
- **User ID** (required): The ID of the user making the purchase
- **Course ID** (required): The ID of the course being purchased
- **Amount** (required): The payment amount (must be positive)
- **Currency** (optional): USD, EUR, GBP, or CAD (defaults to USD)
- **Status** (optional): COMPLETED, PENDING, FAILED, or REFUNDED (defaults to COMPLETED)

**Behavior:**
- If status is `COMPLETED`, the user is automatically enrolled in the course
- Test payments are marked with `isFake: true` for tracking
- Cannot create multiple completed payments for the same user/course combination
- Validation ensures course and user exist before creating payment

### 3. Database Schema

#### PaymentMethod Table
```prisma
model PaymentMethod {
  id                  String  @id @default(cuid())
  name                String
  type                PaymentMethodType
  isActive            Boolean @default(true)
  description         String?
  testModeSupported   Boolean @default(false)
  requiresWebhook     Boolean @default(false)
  payments            Payment[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  @@index([type])
}

enum PaymentMethodType {
  STRIPE
  PAYPAL
  BANK_TRANSFER
  TEST
}
```

#### Payment Model (Enhanced)
- `paymentMethodId`: Link to the payment method used
- `isFake`: Boolean flag to identify test payments

## API Endpoints

### 1. Get Payment History

**Endpoint:** `GET /api/admin/payments`

**Authentication:** Admin only

**Query Parameters:**
- `stats=true`: Return statistics instead of payment list
- `courseId`: Filter by course ID
- `userId`: Filter by user ID
- `status`: Filter by payment status (PENDING, COMPLETED, FAILED, REFUNDED)
- `isFake`: Filter by test payments (true/false)
- `limit`: Number of results per page (default: 50)
- `offset`: Pagination offset (default: 0)

**Example Requests:**
```bash
# Get all payments
curl -X GET http://localhost:3000/api/admin/payments

# Get statistics
curl -X GET http://localhost:3000/api/admin/payments?stats=true

# Get real payments only
curl -X GET http://localhost:3000/api/admin/payments?isFake=false

# Get completed test payments
curl -X GET http://localhost:3000/api/admin/payments?isFake=true&status=COMPLETED

# Get payments with pagination
curl -X GET http://localhost:3000/api/admin/payments?limit=25&offset=0
```

**Response Format:**
```json
{
  "payments": [
    {
      "id": "payment-123",
      "userId": "user-456",
      "courseId": "course-789",
      "amount": "49.99",
      "currency": "USD",
      "status": "COMPLETED",
      "isFake": false,
      "createdAt": "2024-11-27T22:30:00Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "paymentMethod": {
        "name": "Stripe",
        "type": "STRIPE"
      }
    }
  ],
  "total": 150
}
```

### 2. Get Payment Statistics

**Endpoint:** `GET /api/admin/payments?stats=true`

**Response Format:**
```json
{
  "totalPayments": 100,
  "completedPayments": 85,
  "failedPayments": 10,
  "fakePayments": 5,
  "totalRevenue": "4249.50",
  "fakeTestRevenue": "150.00"
}
```

### 3. Create Test Payment

**Endpoint:** `POST /api/admin/payments/test-payment`

**Authentication:** Admin only

**Request Body:**
```json
{
  "userId": "user-123",
  "courseId": "course-456",
  "amount": 99.99,
  "currency": "USD",
  "status": "COMPLETED"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Fake payment created successfully for user john@example.com",
  "payment": {
    "id": "payment-789",
    "userId": "user-123",
    "courseId": "course-456",
    "amount": "99.99",
    "currency": "USD",
    "status": "COMPLETED",
    "isFake": true,
    "createdAt": "2024-11-27T22:35:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "User already has a completed payment for this course"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/admin/payments/test-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "courseId": "course-456",
    "amount": 99.99,
    "currency": "USD",
    "status": "COMPLETED"
  }'
```

### 4. Get Payment Methods

**Endpoint:** `GET /api/admin/payments/methods`

**Authentication:** Admin only

**Query Parameters:**
- `active=false`: Include inactive payment methods (default: true)

**Response Format:**
```json
[
  {
    "id": "method-1",
    "name": "Stripe",
    "type": "STRIPE",
    "isActive": true,
    "description": "Credit/Debit card payments via Stripe",
    "testModeSupported": true,
    "requiresWebhook": true,
    "createdAt": "2024-11-27T22:30:00Z",
    "updatedAt": "2024-11-27T22:30:00Z"
  }
]
```

### 5. Initialize Payment Methods

**Endpoint:** `POST /api/admin/payments/methods?action=init`

**Authentication:** Admin only

**Description:** Creates default payment methods if they don't already exist. Safe to call multiple times.

**Response:**
```json
{
  "message": "Payment methods initialized",
  "methods": [...]
}
```

## Utility Functions

### Payment Utilities (`lib/payment-utils.ts`)

```typescript
// Initialize default payment methods
await initializePaymentMethods();

// Create a fake payment
const payment = await createFakePayment({
  userId: "user-123",
  courseId: "course-456",
  amount: 99.99,
  currency: "USD",
  status: "COMPLETED"
});

// Get payment methods
const methods = await getPaymentMethods(onlyActive = true);

// Get payment method by type
const stripeMethod = await getPaymentMethodByType("STRIPE");

// Update payment method
await updatePaymentMethod(methodId, {
  isActive: false,
  name: "Updated Name"
});

// Get admin payment history
const { payments, total } = await getPaymentHistoryAdmin({
  courseId: "course-456",
  userId: "user-123",
  status: "COMPLETED",
  isFake: false,
  limit: 50,
  offset: 0
});

// Get payment statistics
const stats = await getPaymentStatistics();
```

## Usage Examples

### Admin Creating a Test Payment via UI

1. Navigate to `/admin/payments`
2. Click "➕ Create Test Payment" button
3. Fill in the form:
   - User ID: Copy the user ID from the Users management page
   - Course ID: Copy the course ID from the Courses management page
   - Amount: Enter the course price (e.g., 49.99)
   - Currency: Select USD (or other currency)
   - Status: Choose "Completed" for immediate enrollment
4. Click "Create Payment"
5. If successful, the modal will close and the payment will appear in the list
6. The user will be automatically enrolled in the course (if status was COMPLETED)

### Admin Creating a Test Payment via API

```bash
curl -X POST http://localhost:3000/api/admin/payments/test-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "userId": "clyxxxxxxx",
    "courseId": "clyyyyyyyy",
    "amount": 49.99,
    "currency": "USD",
    "status": "COMPLETED"
  }'
```

### Admin Viewing Payment Statistics

```bash
curl -X GET "http://localhost:3000/api/admin/payments?stats=true" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

Response shows:
- Total payments across the platform
- Number of completed payments (real money)
- Number of failed payments
- Number of test payments (marked as isFake)
- Total revenue from real payments
- Total test payment revenue

## Security Features

1. **Role-based Access Control**
   - All payment endpoints require `ADMIN` role
   - Automatic 403 Forbidden responses for non-admins
   - Protected by NextAuth.js authentication

2. **Data Validation**
   - User existence verification before creating payments
   - Course existence verification
   - Amount validation (must be positive number)
   - Status enum validation

3. **Payment Integrity**
   - Prevents duplicate completed payments for same user/course
   - Tracks payment method for audit purposes
   - Marked test payments with `isFake` flag for separation

4. **Enrollment Protection**
   - Test payment with COMPLETED status automatically enrolls user
   - Checks for existing enrollment to prevent duplicates
   - Respects unique enrollment constraint

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth session secret

### Database Initialization

Payment methods are automatically initialized on first `/api/admin/payments/methods` call with `action=init` parameter:

```bash
curl -X POST http://localhost:3000/api/admin/payments/methods?action=init
```

## Testing

### Test Scenarios

1. **Create Complete Test Payment**
   - Create payment with status COMPLETED
   - Verify user is automatically enrolled
   - Check payment appears in history with isFake=true

2. **Create Pending Test Payment**
   - Create payment with status PENDING
   - Verify user is NOT enrolled
   - Check payment appears as PENDING in history

3. **Duplicate Payment Prevention**
   - Create completed payment for user/course
   - Try to create another completed payment for same user/course
   - Verify error returned

4. **Filter Tests**
   - Create multiple payments (real and test)
   - Filter by isFake=true, verify only test payments shown
   - Filter by status, verify correct results
   - Search by user email, verify results match

5. **Statistics Accuracy**
   - Create several payments with different statuses
   - Check statistics endpoint
   - Verify counts and totals are accurate

## Troubleshooting

### Test Payment Creation Fails

**Error: "User not found"**
- Verify the userId exists in the database
- Check the user ID format (should be CUID format)

**Error: "Course not found"**
- Verify the courseId exists
- Check the course is published (or was valid when created)

**Error: "User already has a completed payment for this course"**
- This is expected if trying to create duplicate completed payment
- Create payment with different status (PENDING) or different user/course

### Payment Statistics Not Accurate

- Ensure payment status values are correct (enum values)
- Check that isFake flag is properly set
- Verify Stripe webhook has successfully processed real payments

### Admin Can't Access Payment Page

- Verify user has ADMIN role in database
- Check NextAuth session is valid
- Ensure `/admin/payments` route is not blocked by middleware

## Future Enhancements

Potential future improvements:
- Refund management UI
- Payment reconciliation reports
- Payment method configuration (enable/disable payment types)
- Payment receipt generation
- Payment export functionality (CSV, PDF)
- Scheduled payment reports via email
- Payment gateway health status dashboard
- Payment retry mechanism for failed payments

## Related Documentation

- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin panel overview
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- Database: `prisma/schema.prisma` - PaymentMethod and Payment models
- Utilities: `lib/payment-utils.ts` - Payment helper functions
- Page: `app/(admin)/admin/payments/page.tsx` - Admin UI component
