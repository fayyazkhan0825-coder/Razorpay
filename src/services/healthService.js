const db = require('../config/db');

class HealthService {
  static async checkDatabase() {
    try {
      await db.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection error in health check:', error.message);
      return false;
    }
  }
}

module.exports = HealthService;
