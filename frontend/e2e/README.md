# ZürImpact E2E tests

Playwright tests that exercise the React frontend against the in-process
Express mock server (no Docker / no Tomcat / no Postgres). The mock server
contracts are aligned with the real Spring backend — see
`frontend/mock-server/index.js` for the source of truth.

## Running

```bash
yarn e2e               # all specs, headless
yarn e2e --ui          # interactive runner
yarn e2e --headed      # see the browser
yarn e2e auth/login    # one folder
```

The Playwright config (`playwright.config.ts`) spins up two `webServer`s
automatically: the mock backend on `:4000` (with `MOCK_TEST_MODE=1` so that
`/api/_test/reset` is available) and Vite on `:5173`.

## Layout

```
e2e/
├── fixtures/test.ts        # `authedPage`, `adminPage`, `resetState` fixtures
├── helpers/
│   ├── auth.ts             # loginViaApi, loginViaUi, clearSession
│   ├── geo.ts              # grantGeo, walkTo (drives watchPosition)
│   ├── map.ts              # blockTileRequests (suppress OSM imagery)
│   └── mockState.ts        # resetMockState, getLatestVerifyToken / ResetToken
├── auth/                   # login, register, password-reset, session-expiry
├── actions/                # dashboard, gps-action-*, action-not-found
├── rewards/                # redeem
├── profile/                # update, change-password, delete-account
├── admin/                  # admin-only flows
├── i18n/                   # language-switch
└── regression/             # zi-269-map-overlay (and future regression locks)
```

## Selector strategy

In order of preference:

1. **Roles / accessible names** — `page.getByRole('button', {name: /sign in/i})`.
2. **Labels** — `page.getByLabel(/username/i)`.
3. **`data-testid`** — added to components only when role/label is unstable
   (i18n strings, map elements, hidden text).
4. **CSS as last resort** — avoid; flaky and brittle.

Existing testids:

| Test id                                                                                                                                  | Lives in                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `app-nav`                                                                                                                                | `RootLayout/Navigation.tsx`                           |
| `user-points`                                                                                                                            | `RootLayout/Navigation.tsx`                           |
| `action-card` (+ `data-action-id`)                                                                                                       | `ActionDashboard/ActionCard/ActionCard.tsx`           |
| `reward-card` (+ `data-reward-id`), `reward-redeem-btn`, `reward-confirm-redeem-btn`                                                     | `Rewardspage/Rewardspage.tsx`                         |
| `map-container`                                                                                                                          | `ActionDetailPage/GpsActionDetailPage.tsx`            |
| `checkpoint-teleport-{subTaskId}`                                                                                                        | `ActionDetailPage/GpsActionDetailPage.tsx` (dev mode) |
| `start-action-btn`, `confirm-start-action-btn`                                                                                           | `ActionDetailPage/GpsActionDetailPage.tsx`            |
| `mobile-tracking-fab`                                                                                                                    | `MapTrackingPage/MapTrackingPage.tsx`                 |
| `lang-switch-en`, `lang-switch-de`                                                                                                       | `App/LanguageSwitcher.tsx`                            |
| `profile-username-input`, `profile-username-submit`, `profile-email-input`, `profile-email-submit`, `profile-delete-btn`, `profile-page` | `Profile/ProfilePage.tsx`                             |
| `protected-route-spinner`                                                                                                                | `Auth/ProtectedRoute.tsx`                             |

## State isolation

Specs that mutate mock state (redemption, profile changes, registration)
should sit inside a `describe.configure({mode: 'serial'})` block and call
`resetState()` in `beforeEach`. The `authedPage` / `adminPage` fixtures
already reset on entry, so most specs do not need to call it manually.
