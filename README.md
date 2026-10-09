#  LexiDeck: IELTS Academic Vocabulary

LexiDeck is a spaced-repetition flashcard application tailored for IELTS Academic Vocabulary. This repository contains the React frontend application.

## Design Direction
**Dark Developer** - The app utilizes near-black surfaces (`#0f172a`, `#1e293b`), a single bright accent color (`#3b82f6` blue), monospace numbers, and compact modern grid layouts. The aesthetic aims to be clean, fast, and distraction-free for optimal study focus.

## Tech Stack
- React 18
- Vite
- React Router v6
- Axios
- Lucide React (Icons)
- Vanilla CSS with CSS Variables

## Setup Steps

1. Clone the repository and navigate into the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `VITE_API_URL` points to your Django backend, e.g., `http://127.0.0.1:8000/api`)*
4. Run the development server:
   ```bash
   npm run dev
   ```

## Demo Account
- **Username**: `demo_admin`
- **Password**: `demo1234`
*(Requires the backend server to be seeded with `python manage.py seed_demo`)*

## Route Table

| Route | Access | Component / Screen |
| ----- | ------ | ------------------ |
| `/login` | Public | Login Form |
| `/register` | Public | Registration Form |
| `/` | Protected | Dashboard (Stats & Due Decks) |
| `/decks` | Protected | Deck List (Search, Filter, Pagination) |
| `/decks/new` | Protected | Create Deck Form |
| `/decks/:id` | Protected | Deck Details (Cards List) |
| `/decks/:id/edit` | Protected | Edit Deck Form |
| `/decks/:id/cards/new` | Protected | Create Card Form |
| `/cards/:id/edit` | Protected | Edit Card Form |
| `/decks/:id/study` | Protected | Interactive Study Flashcard Screen |

## Completed Optional (Part B) Features
- **O-7**: Swagger / ReDoc with `drf-spectacular`
- **O-8**: `python manage.py seed_demo` script for instant populated test data
- **O-10**: Keyboard-driven study support (Space to flip, 1 for Missed, 2 for Got It, Escape to exit) + 3D CSS Card Flips
- **O-13**: Filters in the URL with `useSearchParams` and 400ms debounce on search boxes

## What I would add with more time
- Mobile swipe gestures for the study screen.
- A heatmap (O-11) utilizing an external library like Recharts to visualize study streak consistency.
- A bulk CSV import feature (O-2) for quickly adding extensive IELTS wordlists.
