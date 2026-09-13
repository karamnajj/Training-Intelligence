# Security Specification & Threat Model

## 1. Data Invariants
- **User Document Invariant**: A user document `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`.
- **Relational Sync Invariant (Master Gate)**: Every sub-collection item (`/users/{userId}/workouts/{workoutId}`, `/users/{userId}/templates/{templateId}`, `/users/{userId}/personalRecords/{recordId}`) must belong to the parent `{userId}`, and writes can only be made if `request.auth.uid == userId`.
- **Immortal Fields**: Fields such as `id` and `userId` cannot be modified once set.
- **Identity Integrity**: No user may spoof another user's ID or write into another user's subcollections.
- **Strict Bounding**: String lengths and list sizes must be strictly bounded to prevent Denial-of-Wallet attacks.
- **Default Deny**: Any unmatched paths are completely inaccessible.

## 2. The Dirty Dozen Payloads (Rejection Matrix)
1. **Ghost Field Injection**: Adding an unmodeled `isAdmin: true` to a user document -> Rejected by validation rules.
2. **User Impersonation**: Attacker with UID `user_b` attempting to write to `/users/user_a` -> Rejected by `request.auth.uid == userId`.
3. **Orphan Workout Write**: Attacker attempting to create a workout in `/users/user_a/workouts/w1` with `userId: "user_b"` -> Rejected by identity validation.
4. **Oversized String Bomb**: Attempting to write a 1MB payload string into `name` or `notes` -> Rejected by `.size() <= 2000` validation.
5. **Array Bombing**: Submitting an array with 10,000 items -> Rejected by array size constraints.
6. **Path Traversal / Malformed ID**: Using `../../` or special characters in `{workoutId}` -> Rejected by `isValidId()`.
7. **Negative Metric Poisoning**: Submitting negative volume, negative weight, or negative sets -> Rejected by numeric validation.
8. **Immutability Breach**: Updating a workout document to change its original `userId` or `id` -> Rejected by immutable field checks.
9. **Unauthenticated Write**: Unauthenticated client attempting to write to `/users/{userId}/workouts/{workoutId}` -> Rejected by `request.auth != null`.
10. **Query Scraping**: Attempting a collection group query on workouts without user qualification -> Rejected by list query boundaries.
11. **Spoofed Email / Provider**: Attempting to write profile data with an unverified email token when verification is required -> Rejected by auth verification checks.
12. **Foreign Record Hijack**: Updating another user's Personal Record to claim a 500kg bench press -> Rejected by Master Gate ownership check.
