# Superadmin Features Documentation

## Overview
This document contains backend logic and API documentation for Superadmin features that will be implemented in the future Superadmin dashboard.

## Download Access Management

### `resendDownloadAccess(transactionItemId)`

**Purpose**: Reset download access for a user who has already downloaded a "once" policy item or needs extended access.

**Location**: `src/app/admin/actions.ts`

**Parameters**:
- `transactionItemId` (string): The UUID of the transaction_item record

**Returns**:
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

**Logic**:
1. Verify user is authenticated
2. Check user has admin/superadmin role (TODO: implement role system)
3. Fetch the transaction_item record
4. Reset `is_downloaded` flag to `false`
5. Return success message

**Usage Example** (for future Superadmin UI):
```typescript
import { resendDownloadAccess } from '@/app/admin/actions'

async function handleResendAccess(itemId: string) {
  const result = await resendDownloadAccess(itemId)
  if (result.success) {
    toast.success(result.message)
  } else {
    toast.error(result.error)
  }
}
```

---

### `extendDownloadExpiry(transactionItemId, extensionHours)`

**Purpose**: Extend the download expiry time for timed policy items.

**Location**: `src/app/admin/actions.ts`

**Parameters**:
- `transactionItemId` (string): The UUID of the transaction_item record
- `extensionHours` (number): Number of hours to extend (default: 24)

**Returns**:
```typescript
{
  success: boolean
  message?: string
  error?: string
}
```

**Status**: ⚠️ **Placeholder** - Requires schema update

**Required Schema Changes**:
```sql
ALTER TABLE transaction_items 
ADD COLUMN expiry_extension_hours integer DEFAULT 0;
```

**Future Logic**:
1. Verify admin access
2. Update `expiry_extension_hours` field
3. Frontend countdown should calculate: `created_at + download_duration_hours + expiry_extension_hours`

---

## Authorization Requirements

### Role System (To Be Implemented)

Add a `role` column to the `profiles` table:

```sql
ALTER TABLE profiles 
ADD COLUMN role text DEFAULT 'user' 
CHECK (role IN ('user', 'seller', 'admin', 'superadmin'));
```

**Role Hierarchy**:
- `user`: Regular buyer
- `seller`: Can upload and sell products
- `admin`: Can manage users and transactions
- `superadmin`: Full system access

### Implementing Role Checks

Update admin actions to check roles:

```typescript
const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return { error: 'Forbidden: Admin access required' }
}
```

---

## Future Superadmin Dashboard Features

### Transaction Management
- View all transactions across all users
- Filter by status, date, buyer, seller
- Resend download access for individual items
- Extend expiry for timed downloads
- Refund transactions (mark as 'refunded', restore seller balance)

### User Management
- View all users and their roles
- Promote users to seller/admin
- Ban/suspend users
- View user purchase history

### Product Moderation
- Review flagged products
- Approve/reject new product listings
- Remove products that violate policies

### Analytics
- Total revenue across platform
- Top sellers and products
- Download statistics
- User growth metrics

---

## Implementation Checklist

### Phase 1: Backend (Current)
- [x] Create `resendDownloadAccess` server action
- [x] Create `extendDownloadExpiry` placeholder
- [x] Document API usage

### Phase 2: Database Schema
- [ ] Add `role` column to `profiles` table
- [ ] Add `expiry_extension_hours` to `transaction_items`
- [ ] Create RLS policies for admin access

### Phase 3: Superadmin UI
- [ ] Create `/admin` route with authentication
- [ ] Build transaction management interface
- [ ] Build user management interface
- [ ] Implement role-based access control
- [ ] Add analytics dashboard

---

## Security Considerations

1. **Always verify admin role** before executing sensitive actions
2. **Log all admin actions** for audit trail
3. **Rate limit** admin endpoints to prevent abuse
4. **Use RLS policies** to restrict database access by role
5. **Implement 2FA** for admin accounts
