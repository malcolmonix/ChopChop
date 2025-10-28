import { render, screen } from '@testing-library/react'

// Basic smoke test to ensure Jest configuration works
describe('ChopChop App', () => {
  it('should run basic test', () => {
    expect(true).toBe(true)
  })

  it('should have proper environment', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })
})
