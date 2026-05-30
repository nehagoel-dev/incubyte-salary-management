import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('app', () => {
  it('returns 404 for an unknown route (empty app, no routes yet)', async () => {
    const res = await request(createApp()).get('/');
    expect(res.status).toBe(404);
  });
});
