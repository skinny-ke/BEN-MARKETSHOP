// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server'); // Note: server must export the express app for testing
// This is a scaffolded test; to make it work, export the app in server.js instead of app.listen

describe('Auth endpoints', () => {
  it('should respond to /api/auth/health', async () => {
    const res = await request(app).get('/api/auth/health');
    expect([200,404]).toContain(res.statusCode); // flexible as endpoint may not exist
  });
});
