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
  const userActions = mockUserActions;
  res.json(userActions);
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

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
