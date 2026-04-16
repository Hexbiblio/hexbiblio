

## Plan: Guest Browsing Without Forcing Login

Allow users to explore the landing page freely. Database, Chat, Submit, Collections, and Profile remain login-required.

### Changes

1. **`Index.tsx`** — Show the landing page to all users. For logged-in users, add a prominent "Chat with AI" button/link instead of replacing the entire page with ChatInterface.

2. **`App.tsx`** — Add a `/chat` protected route for `ChatInterface`. All other protected routes stay as-is (including `/database`).

3. **`Navbar.tsx`** — Show the Database link to all users in the nav, but it still requires login (ProtectedRoute handles redirect). Alternatively, show Database link only to logged-in users to avoid confusion. Add a "Chat" nav link for logged-in users.

4. **Landing page CTA** — The "Browse Database" button on the landing page links to `/database`, which will redirect to `/auth` if not logged in (existing ProtectedRoute behavior). This is a natural flow.

### Route Access Summary

| Page | Guest | Logged In |
|------|-------|-----------|
| Landing `/` | ✓ (hero page) | ✓ (hero page + chat link) |
| Chat `/chat` | ✗ | ✓ |
| Database `/database` | ✗ | ✓ |
| Thesis Detail `/database/:id` | ✗ | ✓ |
| Submit `/submit` | ✗ | ✓ |
| Collections `/my-collections` | ✗ | ✓ |
| Profile `/profile` | ✗ | ✓ |

### Files to modify
- `src/App.tsx` — add `/chat` route
- `src/pages/Index.tsx` — always show landing, remove ChatInterface redirect for logged-in users
- `src/components/Navbar.tsx` — add Chat nav link for authenticated users

