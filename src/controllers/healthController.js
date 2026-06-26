const HealthService = require('../services/healthService');

class HealthController {
  static async getHealth(req, res, next) {
    try {
      const isDbConnected = await HealthService.checkDatabase();
      
      const statusCode = isDbConnected ? 200 : 500;
      return res.status(statusCode).json({
        status: isDbConnected ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED'
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = HealthController;
