const app = require('./app');
const createPool = require('./config/db'); // Zmieniona nazwa importu
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const pool = createPool(); // Tworzymy pulę połączeń
    app.locals.pool = pool; // Udostępniamy pulę w aplikacji
    
    // Test połączenia
    const conn = await pool.getConnection();
    console.log('MySQL Connected...');
    conn.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();