# Security Specification - Bottle Diary

## 1. Data Invariants
- A bottle cannot exist without a `name`.
- A bottle must have a `userId` that matches the creator's UID.
- Users can only read, update, or delete their own bottles.
- `createdAt` must be established at creation and be immutable.
- `updatedAt` must be updated on every write.
- `rating` must be between 1 and 5 if present.

## 2. The Dirty Dozen Payloads (Targeting `/bottles/{bottleId}`)

1. **Identity Spoofing (Create)**: Creating a bottle with a `userId` that is not mine.
2. **Identity Spoofing (Update)**: Changing the `userId` of an existing bottle to someone else's.
3. **Data Scraping**: Trying to list bottles without a filter on `userId` (should be blocked by rule requiring ownership).
4. **Malicious ID**: Injecting a 2KB string as a bottle ID.
5. **Type Poisoning**: Sending `rating: "five stars"` instead of a number.
6. **Boundary Violation**: Sending `rating: 10`.
7. **Shadow Field**: Adding `isPremium: true` to a bottle.
8. **Immutability Breach**: Changing `createdAt` after creation.
9. **Timestamp Spoofing**: Sending a future date for `updatedAt`.
10. **Unauthorized Read**: Reading a bottle ID that I don't own.
11. **Unauthorized Delete**: Deleting a bottle ID that I don't own.
12. **Null Owner**: Creating a bottle with `userId: null`.

## 3. Test Runner Concept
The rules will be verified against these scenarios.
