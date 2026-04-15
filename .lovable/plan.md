

## Plan: Allow Guest Browsing Without Forcing Login

**Goal**: Let unauthenticated users browse the app freely, only requiring login for actions that need it (submitting, bookmarking, commenting, rating).

### Changes

1. **Remove `ProtectedRoute` wrapper** from `/database` and `/database/:id` routes in `App.tsx` — these become public pages anyone can view.

2. **Keep `ProtectedRoute`** on `/submit`, `/my-collections`, and `/profile` — these require authentication.

3. **Update `Index.tsx`** — show the landing page to everyone (remove the redirect to ChatInterface for logged-in users). Instead, add a visible "Chat with AI" button/link for logged-in users, or integrate the chatbot as a separate route.

4. **Add a `/chat` route** — move the `ChatInterface` to its own protected route so logged-in users can access it from the navbar, rather than hijacking the landing page.

5. **Update `Navbar.tsx`** — show Database link to all users (not just authenticated ones). Keep Submit, Collections, Profile, and Chat as auth-only links.

6. **Guard interactive features** in `ThesisDetail.tsx` — show bookmark, comment, and rating widgets only when logged in, with a "Sign in to interact" prompt for guests.

### Summary of Access

| Page | Guest | Logged In |
|------|-------|-----------|
| Landing `/` | ✓ | ✓ |
| Database `/database` | ✓ | ✓ |
| Thesis Detail `/database/:id` | ✓ (read-only) | ✓ (full) |
| Chat `/chat` | ✗ | ✓ |
| Submit `/submit` | ✗ | ✓ |
| Collections `/my-collections` | ✗ | ✓ |
| Profile `/profile` | ✗ | ✓ |

