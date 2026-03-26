const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Example mock endpoint
app.get('/api/example', (req, res) => {
  res.json({message: 'This is a mock response from the BE.'});
});

// Add more mock endpoints as needed

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});
