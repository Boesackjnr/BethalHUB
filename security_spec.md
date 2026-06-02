# Security Specification for BethalHub

## 1. Data Invariants
- A user profile must match the authentication UID.
- Only the owner of a business can update its profile.
- Only admins can create/update/delete notices and opportunities.
- Every document must have a valid ID.

## 2. The Dirty Dozen (Potential Attacks)
1. **Identity Spoofing**: Attempting to create a user profile with someone else's UID.
2. **Privilege Escalation**: A normal user attempting to update their own `role` to 'admin'.
3. **Ghost Fields**: Adding `isVerified: true` to a business profile update when not authorized.
4. **Orphaned Writes**: Creating an opportunity without a corresponding admin check.
5. **PII Leak**: A user attempting to read another user's private profile data.
6. **ID Poisoning**: Using a 1MB string as a document ID.
7. **Resource Exhaustion**: Sending a massive string in the `description` field.
8. **Query Scraping**: Reading all user profiles without a UID filter.
9. **State Shortcutting**: Updating an opportunity status to 'closed' when not an admin.
10. **Immortality Bypass**: Attempting to change `createdAt` on update.
11. **Relational Sync Failure**: Creating a business that references a non-existent user.
12. **Unauthorized Deletion**: A user deleting a notice they didn't create.

## 3. Test Runner (Draft Rules)
The rules will enforce strict key checks and role-based access.
