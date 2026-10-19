# Smart Thesis CPE - Security Specification & Threat Model

## 1. System Invariants

1. **Role Immutability & Privileged Access**:
   - A standard user CANNOT alter their own `role` field.
   - Only admins or system initialization can grant or change the `role` attribute.
   - Non-admin users cannot promote themselves or create admin records.
   - Admins can be bootstrapped or recognized via admin collection / verified admin identity (`sirivipa2001@gmail.com`).

2. **Thesis Ownership & Multi-Party Access**:
   - A thesis can only be authored (`createdBy`) by an authenticated student/creator matching `request.auth.uid`.
   - `studentIds` and `advisorIds` contain the UIDs of authorized students and advisors.
   - A student can edit thesis details (draft/submission) only if `request.auth.uid in resource.data.studentIds`.
   - Advisors can evaluate, review, and change project statuses if `request.auth.uid in resource.data.advisorIds` or if `isAdmin()`.
   - Terminal or approved theses can only be archived or modified by admins or designated committee heads.

3. **Temporal Integrity**:
   - `createdAt` and `updatedAt` fields must always use `request.time`.
   - `createdAt` is immutable upon updates.

4. **Public Archive vs In-Progress Privacy**:
   - Theses with status `approved` or `archived` are readable by the public or all authenticated university members for academic search.
   - Theses in `draft`, `submitted`, `under_review`, `revision_required` can only be viewed by their author students, assigned advisors, committee, or admins.

5. **Reviews & Evaluations**:
   - Only assigned advisors, committee members, or admins can submit reviews for a thesis.
   - A student cannot write reviews for their own thesis or manipulate scores.

---

## 2. The "Dirty Dozen" Threat Payloads (Must be Blocked / PERMISSION_DENIED)

1. **Payload 1 - Self-Elevation to Admin**:
   Unprivileged student attempts to write `{ "role": "admin" }` to `/users/{uid}`.
   *Result:* DENIED.

2. **Payload 2 - Impersonate Author**:
   User `attacker_uid` attempts to create a thesis with `createdBy: "victim_student_uid"`.
   *Result:* DENIED (Identity spoofing).

3. **Payload 3 - Unauthorized Thesis Modification**:
   Student A tries to update title or files of Student B's thesis.
   *Result:* DENIED.

4. **Payload 4 - Student Self-Approval**:
   Student tries to update thesis status directly from `under_review` to `approved`.
   *Result:* DENIED (State shortcutting).

5. **Payload 5 - Fake Advisor Review**:
   Student attempts to create a review document with `decision: "approved"` and high scores.
   *Result:* DENIED (Only designated advisor/admin can create reviews).

6. **Payload 6 - Timestamp Tampering**:
   Client sends `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
   *Result:* DENIED.

7. **Payload 7 - Denial of Wallet (Payload Oversize)**:
   Client attempts to insert 2MB string in `abstractTh`.
   *Result:* DENIED (Size limits enforced).

8. **Payload 8 - Path ID Injection**:
   Client attempts to write to `/theses/../../system_hack`.
   *Result:* DENIED (`isValidId()` regex guard).

9. **Payload 9 - Deletion of Submitted Thesis by Student**:
   Student tries to delete a thesis after submission (`status != draft`).
   *Result:* DENIED.

10. **Payload 10 - Shadow Fields Injection**:
    Client inserts unauthorized fields `{ "isAdmin": true, "bypassReview": true }` into thesis document.
    *Result:* DENIED (`hasOnly()` guard).

11. **Payload 11 - Unauthorized File Record Insertion**:
    Non-member uploads a file record pointing to another team's project.
    *Result:* DENIED.

12. **Payload 12 - Tampering with Activity Logs**:
    Client attempts to delete or overwrite past activity logs.
    *Result:* DENIED (Activity logs are append-only).
