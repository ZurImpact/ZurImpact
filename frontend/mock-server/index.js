import express from 'express';
import cors from 'cors';
import {loadJSON} from './fileManager.ts';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const BASE_URL = '/backend_war_exploded/api';
const mockActions = loadJSON('get_actions.json');
const mockUserActions = loadJSON('get_useractions.json');
const mockRewards = loadJSON('get_rewards.json');
const mockCurrentUser = loadJSON('get_current_user.json');

let isMockAuthenticated = false;

let mockUserPoints = {
  userId: mockCurrentUser.id,
  points: mockCurrentUser.points,
};

// GET all actions (with optional filters)
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

// GET action by ID (for /api/actions/getAction?id=...) - MUST come before /actions/:id
app.get(BASE_URL + '/actions/getAction', (req, res) => {
  const action = mockActions.find((a) => a.id === parseInt(req.query.id));
  if (action) {
    res.json(action);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

// GET action by ID (for /api/actions/:id)
app.get(BASE_URL + '/actions/:id', (req, res) => {
  const action = mockActions.find((a) => a.id === parseInt(req.params.id));
  if (action) {
    res.json(action);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

// POST create new action
app.post(BASE_URL + '/actions', (req, res) => {
  const newAction = {
    id: mockActions.length + 1,
    ...req.body,
  };
  mockActions.push(newAction);
  res.status(201).json(newAction);
});

// PUT update action by ID
app.put(BASE_URL + '/actions/:id', (req, res) => {
  const idx = mockActions.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx !== -1) {
    mockActions[idx] = {...mockActions[idx], ...req.body};
    res.json(mockActions[idx]);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

// DELETE action by ID
app.delete(BASE_URL + '/actions/:id', (req, res) => {
  const idx = mockActions.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx !== -1) {
    const deleted = mockActions.splice(idx, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({error: 'Action not found'});
  }
});

// GET user actions (aligned with UserActionHistoryDto)
app.get(BASE_URL + '/userActionHistory/getUserActions', (req, res) => {
  const {active} = req.query;
  if (active === 'true') {
    return res.json(mockUserActions.filter((a) => a.completionState === 'IN_PROGRESS'));
  }
  res.json(mockUserActions);
});

// POST startAction
app.post(BASE_URL + '/actions/startAction', (req, res) => {
  res.status(200).json({message: 'Action started (mock)'});
});

// POST completeAction
app.post(BASE_URL + '/actions/completeAction', (req, res) => {
  res.status(200).json({message: 'Action completed (mock)'});
});

// POST cancelAction
app.post(BASE_URL + '/actions/cancelAction', (req, res) => {
  res.status(200).json({message: 'Action cancelled (mock)'});
});

// POST completeSubTask
app.post(BASE_URL + '/subTasks/completeSubTask', (req, res) => {
  console.log('completeSubTask called with:', req.body);
  res.status(200).json({message: 'SubTask completed (mock)'});
});

// GET all rewards
app.get(BASE_URL + '/rewards', (req, res) => {
  res.json(mockRewards);
});

// GET current authenticated user
app.get(BASE_URL + '/users/current', (req, res) => {
  const currentUserWithPoints = {
    ...mockCurrentUser,
    points: mockUserPoints.points,
  };
  res.json(currentUserWithPoints);
});

// GET user by ID
app.get(BASE_URL + '/users/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  if (mockCurrentUser.id === userId) {
    const currentUserWithPoints = {
      ...mockCurrentUser,
      points: mockUserPoints.points,
    };
    res.json(currentUserWithPoints);
  } else {
    res.status(404).json({error: 'User not found'});
  }
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

// POST redeem voucher
app.post(BASE_URL + '/users/redemptions', (req, res) => {
  const {userId, voucherId} = req.query;

  if (!userId || !voucherId) {
    return res.status(400).json({error: 'userId and voucherId are required'});
  }

  const rewardIndex = mockRewards.findIndex((r) => r.id === voucherId);

  if (rewardIndex === -1) {
    return res.status(404).json({error: 'Reward not found'});
  }

  const reward = mockRewards[rewardIndex];

  if (reward.available <= 0) {
    return res.status(400).json({error: 'No more rewards available'});
  }

  if (mockUserPoints.points < reward.points) {
    return res.status(400).json({error: 'Not enough points'});
  }

  mockUserPoints.points -= reward.points;
  mockRewards[rewardIndex].available -= 1;

  const voucherCode = `VCHR-${Date.now().toString(36).toUpperCase()}`;

  res.json({
    success: true,
    message: 'Voucher redeemed successfully',
    remainingPoints: mockUserPoints.points,
    voucherCode,
  });
});

app.get(BASE_URL + '/auth/whoami', (req, res) => {
  if (isMockAuthenticated) {
    // Return mock user data matching the real backend's response structure
    res.status(200).json({
      id: mockCurrentUser.id,
      username: mockCurrentUser.username,
      roles: ['ROLE_USER'],
    });
  } else {
    res.status(401).json({message: 'Not authenticated'});
  }
});

app.post(BASE_URL + '/auth/dev-login', (req, res) => {
  isMockAuthenticated = true; // Track successful login
  res.status(200).json({message: 'Login successful (mock)', userId: 123});
});

app.post(BASE_URL + '/auth/logout', (req, res) => {
  isMockAuthenticated = false;
  res.status(200).json({message: 'Logged out successfully'});
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
