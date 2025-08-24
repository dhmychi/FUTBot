import express from 'express';
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('FUTBot API running');
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
