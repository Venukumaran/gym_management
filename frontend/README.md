# IRONLOG — Gym Owner Console

IRONLOG is a gym management dashboard that I built to help gym owners manage and monitor their members from a single, simple interface.

The frontend is built using **HTML, Bootstrap 5, and Vanilla JavaScript** and communicates with my Spring Boot backend through REST APIs.

## Overview

I designed IRONLOG as an owner-focused console where I can:

- Log in securely as a gym owner
- View overall membership statistics
- View active and expired memberships
- Track members whose memberships are expiring soon
- Search members by name
- Filter members based on status, plan, gender, and age
- View recently joined members
- Review member information from one dashboard

The application uses JWT-based authentication, so authenticated requests are sent to my backend with the required authorization token.

## Project Structure

```text
frontend/
├── index.html
├── dashboard.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── login.js
│       └── dashboard.js
└── README.md

## 1. Point it at your backend

Open `assets/js/config.js` and set your backend URL:

```js
const API_BASE_URL = "http://localhost:8080";
```

## 2. Log in

Use an existing `Owner` row's email/password (the ones stored in your `owners`
table, hashed with BCrypt via `PasswordConfig`). There's no public "sign up" —
owners are expected to be seeded directly in the database, matching your backend design.

## How it maps to your API

| Frontend feature        | Backend endpoint                                   |
|--------------------------|-----------------------------------------------------|
| Login                    | `POST /auth/login`                                  |
| Total members stat       | `GET /api/members?page=0&size=1` (`totalElements`)  |
| Active / Expired stats   | `GET /api/members/status?status=Active/Expired`     |
| Expiring-in-7-days stat  | `GET /api/members/expiring?startDate=&endDate=`      |
| "All" tab                | `GET /api/members?page=0&size=1000`                  |
| Search by name           | `GET /api/members/search?name=`                      |
| Status filter            | `GET /api/members/status?status=`                    |
| Plan filter              | `GET /api/members/plan?plan=`                        |
| Gender filter            | `GET /api/members/gender?gender=`                    |
| Exact age filter         | `GET /api/members/age?age=`                          |
| Age range filter         | `GET /api/members/age-range?minAge=&maxAge=`         |
| Recent joinees           | `GET /api/members/recent?date=`                      |
| Expiring soon            | `GET /api/members/expiring?startDate=&endDate=`      |

Every request after login sends `Authorization: Bearer <token>` — matching your
`JwtFilter`. On a 401/403 (expired/invalid token) the app automatically clears the
session and returns you to the login page.

## Notes & things you may want to extend

Current Scope

The current version focuses on the gym owner's dashboard and member management experience.

The frontend currently provides:

Owner authentication
Membership statistics
Member search
Member filtering
Membership status tracking
Recently joined member information
Expiring membership information
Dashboard-based member monitoring

Some profile-related display information, such as the gym name and about information, is currently stored locally in the browser.

- **Gym name / about / photo** are stored only in the browser (`localStorage`) and
  are editable inline on the dashboard — your backend's `Owner` entity currently
  only has `email` + `password`, so there's no server-side profile data to pull yet.
  The photo is a deterministic auto-generated avatar seeded by the owner's email.
- Client-side pagination is used for filtered views (the backend returns a plain
  list for those endpoints, not a `Page`). The "All" tab pulls up to 1000 members
  in one call and paginates locally — fine for typical gym sizes; if you expect
  thousands of members, consider adding `page`/`size` params to the other repository
  queries too.
- The `Status` and `Gender` filters use dropdowns matching common values
  (Active/Expired, Male/Female/Other) — adjust the `<option>` lists in
  `dashboard.html` if your data uses different values.
