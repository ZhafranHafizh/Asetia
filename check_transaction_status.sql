-- Check actual transaction statuses in DB
SELECT 
    t.id,
    t.status,
    t.created_at,
    COUNT(ti.id) as item_count
FROM transactions t
LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
GROUP BY t.id, t.status, t.created_at
ORDER BY t.created_at DESC
LIMIT 20;

-- Check if there are any pending transactions
SELECT status, COUNT(*) as count
FROM transactions
GROUP BY status;
