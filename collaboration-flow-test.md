# 🧪 Enhanced Collaboration Flow Test Guide

## Prerequisites
1. ✅ Database migration applied (`fix-user-lookup-function.sql`)
2. ✅ Two user accounts created in Supabase Auth
3. ✅ At least one idea created by User A

## Test Scenario: Complete Collaboration Flow

### Step 1: User A Invites User B
**As User A:**
1. Login to the app
2. Go to Dashboard → Ideas tab
3. Find an idea and click "Invite" button
4. Enter User B's email address
5. Add optional message: "Let's work on this together!"
6. Click "Send Request"

**Expected Results:**
- ✅ System validates User B exists in auth.users
- ✅ System checks User B is not already a collaborator
- ✅ System checks no pending request exists
- ✅ Success toast: "Invitation sent to [email] for '[idea title]'"
- ✅ Request includes idea title in message

### Step 2: User B Receives Notification
**As User B:**
1. Login to the app
2. Check notification bell in navbar

**Expected Results:**
- ✅ Bell shows badge with count (1)
- ✅ Bell has pulsing animation
- ✅ Clicking bell shows dropdown with request
- ✅ Request shows:
  - Idea title
  - User A's email
  - Custom message with idea title
  - Time ago
  - Accept/Decline buttons

### Step 3: User B Accepts Collaboration
**As User B:**
1. Click "Accept" button in notification dropdown
2. OR click request to open detail dialog and accept

**Expected Results:**
- ✅ Success toast: "You now have read access to '[idea title]'"
- ✅ Request disappears from notifications
- ✅ Bell badge count decreases
- ✅ Backend creates shared_ideas entry
- ✅ User B gains access to the idea

### Step 4: Verify Shared Access
**As User B:**
1. Go to Dashboard → "Shared with Me" tab

**Expected Results:**
- ✅ Shared idea appears in the grid
- ✅ Shows owner information (User A's email)
- ✅ Shows permission level (Read badge)
- ✅ Shows "Shared X time ago"
- ✅ Can click "Open Idea" to view
- ✅ Can click "View Collaborators" to see management

### Step 5: User A Manages Collaborators
**As User A:**
1. Go to the idea (Dashboard or detailed view)
2. Click "Manage" button

**Expected Results:**
- ✅ Modal shows "Owner" section with User A
- ✅ Modal shows "Collaborators" section with User B
- ✅ Shows User B's email and join date
- ✅ Shows permission dropdown (Read/Write)
- ✅ Shows remove button
- ✅ Can change User B's permission to Write
- ✅ Can remove User B if needed

### Step 6: Test Permission Changes
**As User A:**
1. In collaborators management, change User B to "Write"
2. User B refreshes their "Shared with Me" tab

**Expected Results:**
- ✅ Permission badge changes to "Write" with edit icon
- ✅ User B can now edit the idea content
- ✅ Changes reflect in real-time

## Error Scenarios to Test

### Invalid Email
**Test:** User A tries to invite "invalid-email@nonexistent.com"
**Expected:** Error toast: "User with email not found. Please ensure they have an account."

### Self-Invitation
**Test:** User A tries to invite their own email
**Expected:** Error: "You cannot send a collaboration request to yourself"

### Already Collaborating
**Test:** User A tries to invite User B again after acceptance
**Expected:** Error: "[email] is already a collaborator on this idea."

### Pending Request
**Test:** User A sends request, then tries to send another before acceptance
**Expected:** Error: "A collaboration request is already pending for [email]."

## Success Criteria ✅

- [ ] Email validation works correctly
- [ ] User existence check prevents invalid invitations
- [ ] Duplicate collaboration prevention works
- [ ] Idea title appears in invitation message
- [ ] Real-time notifications work
- [ ] Shared ideas appear in "Shared with Me" tab
- [ ] Permission management works (Read/Write)
- [ ] Collaborator removal works
- [ ] Backend access is properly granted
- [ ] All error scenarios handled gracefully

## Database Verification

Check these tables after testing:
```sql
-- Check collaboration requests
SELECT * FROM collaboration_requests WHERE status = 'accepted';

-- Check shared ideas
SELECT * FROM shared_ideas;

-- Verify RLS policies work
-- (User B should only see ideas they own or collaborate on)
```

## Performance Notes
- Real-time updates via Supabase Realtime
- Efficient queries with proper indexes
- Minimal API calls with batched operations
- Optimistic UI updates where possible
