import { describe, it, expect } from 'vitest';
import { sidebarConfig } from '@/constants/sidebarConstants';
import { users } from '@/constants/userConstant';
import { Payment } from '@/constants/paymentConstant';

describe('Constants', () => {
  it('should export sidebarConfig with correct structure', () => {
    expect(sidebarConfig).toBeDefined();
    expect(sidebarConfig.teams).toBeInstanceOf(Array);
    expect(sidebarConfig.nav).toBeInstanceOf(Array);
    expect(sidebarConfig.teams.length).toBeGreaterThan(0);
    expect(sidebarConfig.nav.length).toBeGreaterThan(0);
  });

  it('should export users with correct structure', () => {
    expect(users).toBeDefined();
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('role');
    expect(users[0]).toHaveProperty('status');
  });

  it('should have Payment type defined (compile check)', () => {
    // This is mostly a compile-time check, but we can check if the file is importable
    const payment: Payment = {
      id: '1',
      amount: 100,
      status: 'success',
      email: 'test@example.com',
      name: 'Test',
      date: '2024-01-01'
    };
    expect(payment).toBeDefined();
  });
});
