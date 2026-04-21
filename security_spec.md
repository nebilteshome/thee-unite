# Security Spec for Thee Unite

## Data Invariants
- A product must have a name, price, and category.
- Orders must be immutable after creation, except for status updates by admins.
- Only admins can write to `products` and `gallery`.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Anonymous user trying to create a product.
2. Logged-in non-admin trying to update product price.
3. User trying to create an order with a `status` of 'delivered' immediately.
4. User trying to read another user's order.
5. User trying to delete a product.
6. User trying to inject a 2MB string into product name.
7. User trying to set `createdAt` to a future date instead of `request.time`.
8. User trying to update a terminal order status (e.g., from 'delivered' to 'pending').
9. User trying to write to a collection not defined in the blueprint.
10. User trying to spoof `authorId` in a metadata field (if added).
11. Admin trying to create a product without a required field.
12. User trying to list all orders without a filter for their own email.

## Test Runner (Draft)
```typescript
// firestore.rules.test.ts (logic summary)
// - expect(createProduct(nonAdmin)).toFail()
// - expect(updateOrder(owner, {status: 'delivered'})).toFail()
// - expect(viewOrder(otherUser)).toFail()
```
