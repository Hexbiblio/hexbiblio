

# Thesis Community Database — Implementation Plan

## Summary
Add a full community-driven thesis repository with authentication, PDF uploads, search/browse, comments, ratings, and bookmarks/collections — all on top of the existing chatbot plan.

## Database Schema (Supabase / Lovable Cloud)

**Tables:**
- `profiles` — id, username, avatar_url, created_at (auto-created on signup via trigger)
- `theses` — id, user_id, title, author_name, abstract, field/discipline, file_url (PDF in storage), created_at, updated_at, avg_rating (computed)
- `comments` — id, thesis_id, user_id, content, created_at
- `ratings` — id, thesis_id, user_id, score (1-5), unique per user+thesis
- `bookmarks` — id, user_id, thesis_id, collection_name (nullable for "unsorted"), created_at

All tables have RLS: users own their data; theses/comments/ratings are publicly readable by authenticated users.

**Storage:** A `theses` bucket for PDF uploads with RLS (authenticated upload, public read).

## Pages & Components

| Route | Description |
|-------|-------------|
| `/auth` | Sign up / Sign in page (email + password) |
| `/` | Landing + chatbot (existing plan) with nav to database |
| `/database` | Browse/search theses — grid/list with filters (field, date, rating) |
| `/database/:id` | Thesis detail — metadata, PDF viewer/download, comments, rating widget |
| `/submit` | Upload thesis form (title, author, abstract, discipline, PDF) |
| `/my-collections` | User's bookmarked theses grouped by collection |
| `/profile` | User's profile, their uploaded theses |

## Key Components
- `ThesisCard` — thumbnail card with title, author, field, avg rating
- `ThesisDetail` — full view with abstract, PDF link, comments section, rating stars
- `CommentSection` — list + add comment form
- `RatingWidget` — 1-5 star interactive rating
- `BookmarkButton` — toggle bookmark, pick/create collection
- `SearchBar` + `FilterPanel` — search by title/author/abstract, filter by discipline
- `AuthPage` — login/signup with email & password
- `Navbar` — links to Chatbot, Database, Submit, Collections, Profile

## Authentication
- Supabase Auth with email/password
- Profile auto-created on signup via DB trigger
- Protected routes: Submit, Collections, Profile
- Public routes: Browse database, view thesis detail (authenticated users only)

## Technical Details
- **PDF upload**: Supabase Storage bucket `theses`, max 20MB
- **Search**: Client-side filtering initially; can upgrade to Supabase full-text search
- **Average rating**: Computed via a Postgres function or view joining ratings
- **Packages to add**: `react-markdown` (chatbot), no extra packages needed for database features (shadcn components cover forms, cards, dialogs)

## Implementation Order
1. Enable Lovable Cloud backend (auth + database + storage)
2. Create migrations: profiles, theses, comments, ratings, bookmarks tables + RLS + storage bucket
3. Build auth page and protected routing
4. Build thesis submission form with PDF upload
5. Build database browse/search page with ThesisCard grid
6. Build thesis detail page with comments and ratings
7. Build bookmarks/collections feature
8. Add navbar connecting chatbot and database sections

