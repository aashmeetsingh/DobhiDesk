require('dotenv').config();
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`LaundryTrack API running on http://localhost:${PORT}`);
  });
});
