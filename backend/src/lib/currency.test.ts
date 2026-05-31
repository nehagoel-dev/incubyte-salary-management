import { describe, expect, it } from 'vitest';
import { convertCents } from './currency.js';

describe('convertCents', () => {
  it('same-currency identity: USD', () => {
    expect(convertCents(1000, 'USD', 'USD')).toBe(1000);
  });

  it('same-currency identity: EUR zero', () => {
    expect(convertCents(0, 'EUR', 'EUR')).toBe(0);
  });

  it('zero amount cross-currency', () => {
    expect(convertCents(0, 'EUR', 'USD')).toBe(0);
  });

  it('EUR to USD', () => {
    expect(convertCents(10000, 'EUR', 'USD')).toBe(10900);
  });

  it('USD to EUR', () => {
    expect(convertCents(10000, 'USD', 'EUR')).toBe(9174);
  });

  it('INR to USD', () => {
    expect(convertCents(800000, 'INR', 'USD')).toBe(9600);
  });

  it('USD to GBP', () => {
    expect(convertCents(12700, 'USD', 'GBP')).toBe(10000);
  });

  it('unknown fromCurrency throws with currency code in message', () => {
    expect(() => convertCents(0, 'XYZ', 'USD')).toThrow('XYZ');
  });

  it('unknown toCurrency throws with currency code in message', () => {
    expect(() => convertCents(0, 'USD', 'ABC')).toThrow('ABC');
  });
});
