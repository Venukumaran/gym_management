# IRONLOG — Gym Owner Console (Frontend)

A static HTML + Bootstrap 5 + vanilla JS frontend for your Spring Boot gym backend.
No build step — just open it in a browser or serve the folder statically.

## What's included

```
gym-frontend/
├── index.html              # Owner login page
├── dashboard.html           # Owner dashboard (stats, search, filters)
├── assets/
│   ├── css/style.css        # All styling (dark "IronLog" theme)
│   └── js/
│       ├── config.js        # API base URL + auth/session helpers
│       ├── login.js         # Login page logic
│       └── dashboard.js      # Dashboard logic
└── README.md
```

## 1. Point it at your backend

Open `assets/js/config.js` and set your backend URL:

```js
const API_BASE_URL = "http://localhost:8080";
```

## 2. ⚠️ Enable CORS on the backend

Your `OwnerController` already has `@CrossOrigin(origins = "*")`, but **`gymController`
(the `/api/members/**` endpoints) does not**. Since the frontend runs on a different
origin (a file:// page or a different port), the browser will block those requests
unless the backend allows it.

Easiest fix — add a global CORS config in your Spring Boot project:

```java
package gym.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

Also make sure your `SecurityConfig` doesn't block the CORS pre-flight `OPTIONS`
request — with the filter above and `httpBasic`/JWT in place this normally isn't
an issue, but if you see 401s specifically on `OPTIONS`, add:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/auth/login").permitAll()
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
    .anyRequest().authenticated()
)
```

## 3. Run it

Any static file server works. Two easy options:

- **VS Code**: install the "Live Server" extension, right-click `index.html` → "Open with Live Server".
- **Python**: `cd gym-frontend && python3 -m http.server 5500`, then open `http://localhost:5500`.

Opening `index.html` directly by double-clicking (`file://...`) usually also works,
but a local server is more reliable for `fetch()` calls.

## 4. Log in

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
