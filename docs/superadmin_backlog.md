# Superadmin Feature Backlog

## Download Access Management

### Feature: Resend Download Link

**Status**: ✅ Backend Implemented | ⏳ UI Pending

**Purpose**: Allow superadmin to reset download access for users with expired or exhausted download links.

**Server Action**: `resendDownloadAccess(transactionItemId)`
- **Location**: `src/app/admin/actions.ts`
- **Functionality**:
  - Resets `is_downloaded` flag to `false`
  - Allows user to download again (for "once" policy)
  - Placeholder for extending expiry (requires schema update)

**Use Cases**:
1. User accidentally deleted downloaded file
2. Download failed due to network issues
3. User needs extended access for timed downloads
4. Customer support request for re-download

**Future UI Requirements**:
- Admin dashboard table showing all transactions
- "Resend Access" button per transaction item
- Confirmation modal before resetting
- Activity log showing who reset access and when

---

## Performance Optimizations Implemented

### 1. Single Fetch with Client-Side Caching ✅
- Server component fetches data once on page load
- Data passed to `PurchasesClient` wrapper
- `useMemo` caches grouped transactions
- No re-fetching on expand/collapse

### 2. Lazy Rendering ✅
- Items only rendered when section expanded for first time
- `openedSections` Set tracks which sections have been opened
- Keeps rendered sections in memory after first open
- Minimizes initial DOM nodes

### 3. Efficient Countdown Updates ✅
- Single `useEffect` interval in `PurchasesClient`
- Updates `currentTime` state every second
- All countdown components receive same `currentTime` prop
- Memoized calculations prevent unnecessary re-renders

### 4. Image Optimization ✅
- Store logos use `next/image` with `loading="lazy"`
- Automatic shimmer placeholder
- Optimized sizes: `24px` for logos
- Fallback to gradient avatar if no logo

### 5. Component Memoization ✅
- `PurchaseDateGroup` wrapped in `memo()`
- `PurchaseItemRow` wrapped in `memo()`
- `DownloadCountdown` wrapped in `memo()`
- Prevents re-renders when parent updates

---

## Technical Implementation Notes

### Architecture
```
Server Component (page.tsx)
  ↓ Fetch data once
  ↓ Group by date
  ↓ Pass to client
Client Component (PurchasesClient.tsx)
  ↓ useMemo cache
  ↓ Single interval for all countdowns
  ↓ Lazy rendering tracking
  ↓ Pass to children
PurchaseDateGroup (memoized)
  ↓ Only render if opened
  ↓ Pass currentTime to items
PurchaseItemRow (memoized)
  ↓ Receive currentTime prop
  ↓ next/image for logos
DownloadCountdown (memoized)
  ↓ Calculate from currentTime prop
  ↓ No internal interval
```

### Performance Metrics
- **Initial DOM Nodes**: ~50-100 (only first group rendered)
- **After Opening All**: ~200-500 (depending on purchase count)
- **Countdown Updates**: 1 interval for all timers (vs N intervals)
- **Re-renders**: Minimized via memo and useMemo
- **Network Requests**: 1 on page load, 0 on interactions

---

## Future Enhancements

### Phase 1: Admin Dashboard (Priority: High)
- [ ] Create `/admin` route with role-based access
- [ ] Transaction management table
- [ ] Resend access button integration
- [ ] Activity audit log

### Phase 2: Schema Updates (Priority: Medium)
- [ ] Add `expiry_extension_hours` column to `transaction_items`
- [ ] Add `role` column to `profiles` table
- [ ] Create `admin_actions` audit table

### Phase 3: Advanced Features (Priority: Low)
- [ ] Bulk resend access for multiple users
- [ ] Automatic expiry extension based on rules
- [ ] Email notifications for resent access
- [ ] Analytics dashboard for download patterns

---

## Security Considerations

1. **Role-Based Access Control**
   - Implement `role` column in `profiles` table
   - Check role before executing admin actions
   - Use RLS policies to restrict admin routes

2. **Audit Logging**
   - Log all admin actions with timestamp
   - Record which admin performed action
   - Store reason for resending access

3. **Rate Limiting**
   - Prevent abuse of resend feature
   - Limit resends per user per day
   - Alert on suspicious patterns

---

## Testing Checklist

### Performance Testing
- [ ] Measure initial page load time
- [ ] Count DOM nodes before/after expanding all
- [ ] Verify no network requests on expand/collapse
- [ ] Check countdown accuracy over 1 hour
- [ ] Test with 100+ purchases

### Functionality Testing
- [ ] Verify lazy rendering works correctly
- [ ] Test countdown for timed policy items
- [ ] Verify store logos load lazily
- [ ] Test expand/collapse all groups
- [ ] Verify data consistency after interactions

### Admin Feature Testing (Future)
- [ ] Test resend access via API
- [ ] Verify `is_downloaded` resets correctly
- [ ] Test with different download policies
- [ ] Verify audit log entries
