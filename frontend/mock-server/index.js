import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {randomBytes} from 'node:crypto';
import {loadJSON} from './fileManager.js';

// =============================================================================
// DEV-ONLY MOCK SERVER — NOT FOR PRODUCTION USE.
//
// This server exists solely to let the frontend run end-to-end flows locally
// without the Spring backend. It deliberately:
//   - Skips CSRF protection (no front-end is shipped against it)
//   - Stores users/sessions in process memory (cleared on restart)
//   - Logs verify/reset tokens to stdout for easy copy-paste in dev
//
// CodeQL findings on this file (predictable randomness, missing CSRF) are
// suppressed because this code never ships to production — see Dockerfile and
// the production `vite build` pipeline, neither of which include this file.
// =============================================================================

const app = express();
const PORT = process.env.PORT || 4000;

// CORS must allow credentials so AUTH_SESSION cookie round-trips with withCredentials: true.
// origin: reflect request origin (cannot use "*" with credentials).
app.use(
  cors({
    origin: (origin, cb) => cb(null, origin ?? true),
    credentials: true,
  }),
);
// body-parser v2 is strict by default and rejects the literal "null". Axios
// sends `null` as the body for parameterless POSTs (e.g. /actions/startAction)
// alongside Content-Type: application/json, which would otherwise 400 here.
app.use(express.json({strict: false}));
app.use(cookieParser());

const BASE_URL = '/backend_war_exploded/api';
const mockActions = loadJSON('get_actions.json');
const mockUserActions = loadJSON('get_useractions.json');
const mockRewards = loadJSON('get_rewards.json');
const mockCurrentUser = loadJSON('get_current_user.json');

let mockUserPoints = {
  userId: mockCurrentUser.id,
  points: mockCurrentUser.points,
};

// ---------------------------------------------------------------------------
// In-memory mock auth state
// ---------------------------------------------------------------------------

const SESSION_COOKIE = 'AUTH_SESSION';

/** sessionId -> {userId} */
const sessions = new Map();

/** username -> {id, username, email, password, emailVerified, role, ...} */
const users = new Map();

/** token -> email */
const verifyTokens = new Map();

/** token -> email */
const resetTokens = new Map();

// Seed: the mock user from JSON is treated as already-registered & verified,
// with password "Password1!" (matches the password the FE tests/devs use).
users.set(mockCurrentUser.username, {
  ...mockCurrentUser,
  password: 'Password1!',
});

// Initial snapshot used by /api/_test/reset to restore state between e2e tests.
const initialUserPoints = mockUserPoints.points;
const initialRewardAvailability = mockRewards.map((r) => r.available);
const seedUserSnapshot = JSON.parse(JSON.stringify(mockCurrentUser));

// Seed an admin user so e2e admin-only flows are testable.
// Only enabled when MOCK_TEST_MODE=1 so the dev experience for non-test users is unchanged.
const TEST_MODE = process.env.MOCK_TEST_MODE === '1';
if (TEST_MODE) {
  const adminUser = {
    id: 9999,
    username: 'admin',
    email: 'admin@example.com',
    password: 'Password1!',
    role: 'ROLE_ADMIN',
    emailVerified: true,
    points: 9999,
    address: null,
    createdAt: '2024-01-01T00:00:00Z',
  };
  users.set(adminUser.username, adminUser);
}

// Use crypto.randomBytes for unpredictable IDs/tokens (CodeQL js/insecure-randomness).
// Even though this is a dev-only server, predictable IDs would make e2e flakes
// harder to debug if two tests happened to land on the same Date.now().
function newSessionId() {
  return `sess_${randomBytes(16).toString('hex')}`;
}

function newToken() {
  return `tok_${randomBytes(16).toString('hex')}`;
}

function logToken(kind, email, token) {
  // Map mock kind → actual FE route (see frontend/src/routes.ts).
  const fePath = kind === 'verify-email' ? '/verify-email' : '/reset-password';
  const banner = '='.repeat(72);
  console.log(`\n${banner}`);
  console.log(`[mock] ${kind} token for ${email}`);
  console.log(`       ${token}`);
  console.log(`       open: http://localhost:5173${fePath}?token=${token}`);
  console.log(`${banner}\n`);
}

function setSessionCookie(res, sessionId) {
  res.cookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, {path: '/'});
}

function currentUserFromReq(req) {
  const sid = req.cookies?.[SESSION_COOKIE];
  if (!sid) return null;
  const session = sessions.get(sid);
  if (!session) return null;
  // Lookup user by id
  for (const u of users.values()) {
    if (u.id === session.userId) return {user: u, sessionId: sid};
  }
  return null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

app.get(BASE_URL + '/actions', (req, res) => {
  let filtered = [...mockActions];
  if (req.query.text) {
    const text = req.query.text.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        (a.displayName && a.displayName.toLowerCase().includes(text)) ||
        (a.description && a.description.toLowerCase().includes(text)),
    );
  }
  if (req.query.points) {
    filtered = filtered.filter((a) => a.points === parseInt(req.query.points));
  }
  if (req.query.tags) {
    filtered = filtered.filter((a) => a.tags && a.tags.includes(req.query.tags));
  }
  if (req.query.validUntil) {
    filtered = filtered.filter((a) => a.validUntil && a.validUntil <= req.query.validUntil);
  }
  res.json(filtered);
});

app.get(BASE_URL + '/actions/getAction', (req, res) => {
  const action = mockActions.find((a) => a.id === parseInt(req.query.id));
  if (action) {
    res.json(action);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

app.get(BASE_URL + '/actions/:id', (req, res) => {
  const action = mockActions.find((a) => a.id === parseInt(req.params.id));
  if (action) {
    res.json(action);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

app.post(BASE_URL + '/actions', (req, res) => {
  const newAction = {id: mockActions.length + 1, ...req.body};
  mockActions.push(newAction);
  res.status(201).json(newAction);
});

app.put(BASE_URL + '/actions/:id', (req, res) => {
  const idx = mockActions.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx !== -1) {
    mockActions[idx] = {...mockActions[idx], ...req.body};
    // Backend returns 204 No Content on successful update.
    res.status(204).end();
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

app.delete(BASE_URL + '/actions/:id', (req, res) => {
  const idx = mockActions.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx !== -1) {
    mockActions.splice(idx, 1);
    // Backend returns 204 No Content on successful delete.
    res.status(204).end();
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

// GET /users/me/actions — authenticated user's history (preferred FE path)
app.get(BASE_URL + '/users/me/actions', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});
  const {active} = req.query;
  if (active === 'true') {
    return res.json(mockUserActions.filter((a) => a.completionState === 'IN_PROGRESS'));
  }
  res.json(mockUserActions);
});

app.get(BASE_URL + '/users/:userId/actions', (req, res) => {
  const {active} = req.query;
  if (active === 'true') {
    return res.json(mockUserActions.filter((a) => a.completionState === 'IN_PROGRESS'));
  }
  res.json(mockUserActions);
});

app.post(BASE_URL + '/actions/startAction', (req, res) => {
  res.status(200).json({message: 'Action started (mock)'});
});

app.post(BASE_URL + '/actions/completeAction', (req, res) => {
  res.status(200).json({message: 'Action completed (mock)'});
});

app.post(BASE_URL + '/actions/cancelAction', (req, res) => {
  res.status(200).json({message: 'Action cancelled (mock)'});
});

app.post(BASE_URL + '/subTasks/completeSubTask', (req, res) => {
  console.log('completeSubTask called with:', req.body);
  res.status(200).json({message: 'SubTask completed (mock)'});
});

// ---------------------------------------------------------------------------
// Vouchers (rewards)
//
// Path matches the real backend's VoucherController (@RequestMapping("/api/vouchers")).
// Frontend RewardSlice calls GET /vouchers and POST /vouchers/{id}/redeem.
// ---------------------------------------------------------------------------

app.get(BASE_URL + '/vouchers', (req, res) => {
  res.json(mockRewards);
});

app.post(BASE_URL + '/vouchers/:voucherId/redeem', (req, res) => {
  const ctx = currentUserFromReq(req);
  const ctx = currentUserFromReq(req);
  if (!ctx)
    return res.status(401).json({type: 'about:blank', title: 'Unauthorized', status: 401, detail: 'not_authenticated'});

  const voucherId = req.params.voucherId;
  const rewardIndex = mockRewards.findIndex((r) => String(r.id) === String(voucherId));
  if (rewardIndex === -1)
    return res.status(404).json({type: 'about:blank', title: 'Not Found', status: 404, detail: 'Voucher not found'});
  const reward = mockRewards[rewardIndex];
  if (reward.available <= 0)
    return res.status(400).json({type: 'about:blank', title: 'Bad Request', status: 400, detail: 'No codes available'});
  if (mockUserPoints.points < reward.points)
    return res.status(400).json({type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Insufficient points'});

  mockUserPoints.points -= reward.points;
  mockRewards[rewardIndex].available -= 1;

  // Shape matches RedemptionResult in frontend/src/store/slices/RewardSlice.ts
  // (which mirrors backend UserVoucherDto: code, voucherId, displayName, pointsDeducted, assignedAt).
  res.json({
    code: `VCHR-${randomBytes(4).toString('hex').toUpperCase()}`,
    voucherId: Number(voucherId),
    displayName: reward.title,
    pointsDeducted: reward.points,
    assignedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

app.get(BASE_URL + '/users/current', (req, res) => {
  const currentUserWithPoints = {
    ...mockCurrentUser,
    points: mockUserPoints.points,
  };
  res.json(currentUserWithPoints);
});

// GET user points
app.get(BASE_URL + '/users/:userId/points', (req, res) => {
  const userId = parseInt(req.params.userId);
  if (mockUserPoints.userId === userId) {
    res.json(mockUserPoints);
  } else {
    res.json({userId, points: 0});
  }
});

// GET /users/{id} — full profile (used by Profile page)
app.get(BASE_URL + '/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  for (const u of users.values()) {
    if (u.id === id) {
      // Don't leak password
      const {password: _pw, ...rest} = u;
      return res.json({...rest, points: mockUserPoints.points});
    }
  }
  res.status(404).json({error: 'User not found'});
});

// POST /users/me/name-change — updates the current user's username.
// Matches backend UserController.changeName which accepts ChangeUsernameRequest{newUsername}.
app.post(BASE_URL + '/users/me/name-change', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});

  const {newUsername} = req.body ?? {};
  if (!newUsername || typeof newUsername !== 'string') {
    return res.status(400).json({message: 'invalid_request'});
  }

  if (ctx.user.username === newUsername) {
    const {password: _pw, ...rest} = ctx.user;
    return res.json({...rest, points: mockUserPoints.points});
  }

  if (users.has(newUsername)) {
    return res.status(409).json({message: 'username_taken'});
  }

  const oldUsername = ctx.user.username;
  ctx.user.username = newUsername;
  users.delete(oldUsername);
  users.set(newUsername, ctx.user);

  const {password: _pw, ...rest} = ctx.user;
  res.json({...rest, points: mockUserPoints.points});
});

// POST /users/me/email-change — updates the current user's email.
// Matches backend UserController.changeEmail which accepts ChangeEmailRequest{newEmail}.
app.post(BASE_URL + '/users/me/email-change', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});

  const {newEmail} = req.body ?? {};
  if (!newEmail || typeof newEmail !== 'string') {
    return res.status(400).json({message: 'invalid_request'});
  }

  if (ctx.user.email === newEmail) {
    const {password: _pw, ...rest} = ctx.user;
    return res.json({...rest, points: mockUserPoints.points});
  }

  for (const u of users.values()) {
    if (u.email === newEmail && u.id !== ctx.user.id) {
      return res.status(409).json({message: 'email_in_use'});
    }
  }

  ctx.user.email = newEmail;
  ctx.user.emailVerified = false;

  const {password: _pw, ...rest} = ctx.user;
  res.json({...rest, points: mockUserPoints.points});
});

// POST /users/me/password-change — revokes ALL sessions (incl. caller's)
app.post(BASE_URL + '/users/me/password-change', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});

  const {currentPassword, newPassword} = req.body ?? {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({message: 'invalid_request'});
  }
  if (ctx.user.password !== currentPassword) {
    return res.status(400).json({message: 'wrong_current_password'});
  }

  ctx.user.password = newPassword;

  // Revoke all sessions belonging to this user
  for (const [sid, s] of sessions.entries()) {
    if (s.userId === ctx.user.id) sessions.delete(sid);
  }
  clearSessionCookie(res);
  res.status(204).end();
});

// POST /users/me/delete-account — deletes the current user's profile and revokes all sessions.
// Matches backend UserController.deleteAccount.
app.post(BASE_URL + '/users/me/delete-account', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});

  for (const [sid, s] of sessions.entries()) {
    if (s.userId === ctx.user.id) sessions.delete(sid);
  }

  users.delete(ctx.user.username);
  clearSessionCookie(res);
  res.status(200).json({message: 'Account deleted successfully'});
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

// POST /auth/register — creates an unverified account, emits a verify token
app.post(BASE_URL + '/auth/register', (req, res) => {
  const {username, email, password} = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({message: 'invalid_request'});
  }
  if (users.has(username)) {
    // Real backend may return 409 here; FE treats register errors generically.
    return res.status(409).json({message: 'username_taken'});
  }
  for (const u of users.values()) {
    if (u.email === email) {
      return res.status(409).json({message: 'email_taken'});
    }
  }

  const id = users.size + 1000;
  const user = {
    id,
    username,
    email,
    password,
    role: 'ROLE_USER',
    emailVerified: false,
    points: 0,
    address: null,
    createdAt: new Date().toISOString(),
  };
  users.set(username, user);

  const token = newToken();
  verifyTokens.set(token, email);
  logToken('verify-email', email, token);

  res.status(201).end();
});

// POST /auth/verify-email
app.post(BASE_URL + '/auth/verify-email', (req, res) => {
  const {token} = req.body ?? {};
  if (!token) return res.status(400).json({message: 'invalid_token'});
  const email = verifyTokens.get(token);
  if (!email) return res.status(400).json({message: 'invalid_token'});
  for (const u of users.values()) {
    if (u.email === email) {
      u.emailVerified = true;
      verifyTokens.delete(token);
      return res.status(204).end();
    }
  }
  res.status(400).json({message: 'invalid_token'});
});

// POST /auth/verify-email-change — finalises an email-change request.
//
// The current mock email-change flow updates the email immediately and does
// NOT mint a verify token, so this endpoint exists only to back the FE's
// rejection UI: any token submitted here is invalid. When the real backend's
// tokenised flow is wired up, replace this with proper token tracking.
app.post(BASE_URL + '/auth/verify-email-change', (req, res) => {
  const {token} = req.body ?? {};
  if (!token) return res.status(400).json({message: 'invalid_token'});
  res.status(400).json({message: 'invalid_token'});
});

// POST /auth/resend-verification — anti-enumeration: always 204
app.post(BASE_URL + '/auth/resend-verification', (req, res) => {
  const {email} = req.body ?? {};
  if (email) {
    for (const u of users.values()) {
      if (u.email === email && !u.emailVerified) {
        const token = newToken();
        verifyTokens.set(token, email);
        logToken('verify-email', email, token);
        break;
      }
    }
  }
  res.status(204).end();
});

// POST /auth/login
app.post(BASE_URL + '/auth/login', (req, res) => {
  const {username, password} = req.body ?? {};
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({message: 'invalid_credentials'});
  }
  if (!user.emailVerified) {
    // RFC 9457 problem-detail shape — the FE branches on `detail`, not `message`.
    return res.status(403).json({
      type: 'about:blank',
      title: 'Forbidden',
      status: 403,
      detail: 'email_not_verified',
    });
  }
  const sid = newSessionId();
  sessions.set(sid, {userId: user.id});
  setSessionCookie(res, sid);
  res.status(200).json({username: user.username, role: user.role});
});

// POST /auth/dev-login — convenience for local dev
app.post(BASE_URL + '/auth/dev-login', (req, res) => {
  const user = users.get(mockCurrentUser.username);
  if (!user) return res.status(500).json({message: 'mock user missing'});
  const sid = newSessionId();
  sessions.set(sid, {userId: user.id});
  setSessionCookie(res, sid);
  res.status(200).json({message: 'Login successful (mock)', userId: user.id});
});

// GET /auth/dev-tokens — dev-only helper: lists all outstanding verify/reset
// tokens so devs don't have to hunt for them in the terminal output. Returns
// the most recent token first for each email. NOT a real backend endpoint.
app.get(BASE_URL + '/auth/dev-tokens', (req, res) => {
  const verify = [...verifyTokens.entries()].map(([token, email]) => ({
    email,
    token,
    url: `http://localhost:5173/verify-email?token=${token}`,
  }));
  const reset = [...resetTokens.entries()].map(([token, email]) => ({
    email,
    token,
    url: `http://localhost:5173/reset-password?token=${token}`,
  }));
  res.json({verifyEmail: verify, passwordReset: reset});
});

// POST /auth/logout
app.post(BASE_URL + '/auth/logout', (req, res) => {
  const sid = req.cookies?.[SESSION_COOKIE];
  if (sid) sessions.delete(sid);
  clearSessionCookie(res);
  res.status(204).end();
});

// GET /auth/whoami
app.get(BASE_URL + '/auth/whoami', (req, res) => {
  const ctx = currentUserFromReq(req);
  if (!ctx) return res.status(401).json({message: 'Not authenticated'});
  res.status(200).json({
    id: ctx.user.id,
    username: ctx.user.username,
    roles: [ctx.user.role],
    emailVerified: ctx.user.emailVerified,
  });
});

// POST /auth/password-reset/request — anti-enumeration: always 204
app.post(BASE_URL + '/auth/password-reset/request', (req, res) => {
  const {email} = req.body ?? {};
  if (email) {
    for (const u of users.values()) {
      if (u.email === email) {
        const token = newToken();
        resetTokens.set(token, email);
        logToken('password-reset', email, token);
        break;
      }
    }
  }
  res.status(204).end();
});

// POST /auth/password-reset/confirm
app.post(BASE_URL + '/auth/password-reset/confirm', (req, res) => {
  const {token, newPassword} = req.body ?? {};
  if (!token || !newPassword) return res.status(400).json({message: 'invalid_token'});
  const email = resetTokens.get(token);
  if (!email) return res.status(400).json({message: 'invalid_token'});
  for (const u of users.values()) {
    if (u.email === email) {
      u.password = newPassword;
      resetTokens.delete(token);
      // Revoke any active sessions for that user
      for (const [sid, s] of sessions.entries()) {
        if (s.userId === u.id) sessions.delete(sid);
      }
      return res.status(204).end();
    }
  }
  res.status(400).json({message: 'invalid_token'});
});

// ---------------------------------------------------------------------------
// Test-only endpoints — gated behind MOCK_TEST_MODE=1.
//
// Used by the Playwright suite to restore deterministic state between specs:
//   - Restores the seeded user's points and the rewards' availability counters
//   - Wipes any registered/throwaway users and active sessions
// ---------------------------------------------------------------------------
if (TEST_MODE) {
  app.post(BASE_URL + '/_test/reset', (req, res) => {
    sessions.clear();
    verifyTokens.clear();
    resetTokens.clear();

    users.clear();
    users.set(seedUserSnapshot.username, {
      ...seedUserSnapshot,
      password: 'Password1!',
    });

    const adminUser = {
      id: 9999,
      username: 'admin',
      email: 'admin@example.com',
      password: 'Password1!',
      role: 'ROLE_ADMIN',
      emailVerified: true,
      points: 9999,
      address: null,
      createdAt: '2024-01-01T00:00:00Z',
    };
    users.set(adminUser.username, adminUser);

    mockUserPoints.points = initialUserPoints;
    mockRewards.forEach((r, i) => {
      r.available = initialRewardAvailability[i];
    });

    clearSessionCookie(res);
    res.status(204).end();
  });
}

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
