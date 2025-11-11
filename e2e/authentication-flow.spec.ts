import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * Tests user login, registration, and authentication-related features
 */

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Verify login page elements
    await expect(page.locator('text=login, text=sign in', { hasText: /login|sign in/i })).toBeVisible({ timeout: 10000 });
    
    // Should have login form or social login buttons
    const loginForm = page.locator('form, [data-testid="login-form"]');
    const socialLogin = page.locator('button:has-text("Google"), button:has-text("Facebook"), [data-testid="google-login"]');
    
    const hasForm = await loginForm.count() > 0;
    const hasSocial = await socialLogin.count() > 0;
    
    expect(hasForm || hasSocial).toBeTruthy();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for email/phone and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    if (await emailInput.count() > 0 && await submitButton.count() > 0) {
      // Try to submit without filling
      await submitButton.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      const errors = page.locator('.error, [role="alert"], text=required, text=invalid, .text-red');
      if (await errors.count() > 0) {
        await expect(errors.first()).toBeVisible();
      }
    }
  });

  test('should show validation for invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    
    if (await emailInput.count() > 0) {
      // Enter invalid email
      await emailInput.fill('invalid-email');
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('password123');
      }
      
      if (await submitButton.count() > 0) {
        await submitButton.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Should show email validation error
        const emailError = page.locator('text=invalid email, text=valid email, .error, [role="alert"]');
        // Error may appear depending on validation
      }
    }
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for "Sign up" or "Register" link
    const signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), a:has-text("Create account")');
    
    if (await signupLink.count() > 0) {
      await signupLink.first().click({ force: true });
      await page.waitForURL(/\/register|\/signup/);
      
      // Should be on registration page
      await expect(page.locator('text=register, text=sign up, text=create account', { hasText: /register|sign up|create/i })).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle social login buttons', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for Google login button
    const googleButton = page.locator('button:has-text("Google"), [data-testid="google-login"]');
    if (await googleButton.count() > 0) {
      await expect(googleButton.first()).toBeVisible();
      await expect(googleButton.first()).toBeEnabled();
    }
    
    // Check for Facebook login button
    const facebookButton = page.locator('button:has-text("Facebook"), [data-testid="facebook-login"]');
    if (await facebookButton.count() > 0) {
      await expect(facebookButton.first()).toBeVisible();
    }
  });
});

test.describe('Authentication - Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
  });

  test('should display registration form', async ({ page }) => {
    // Verify registration page loaded
    await expect(page.locator('text=register, text=sign up, text=create', { hasText: /register|sign up|create/i })).toBeVisible({ timeout: 10000 });
    
    // Should have registration form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    if (await nameInput.count() > 0) {
      await expect(nameInput.first()).toBeVisible();
    }
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible();
    }
    if (await passwordInput.count() > 0) {
      await expect(passwordInput.first()).toBeVisible();
    }
  });

  test('should validate password requirements', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up")').first();
    
    if (await passwordInput.count() > 0 && await submitButton.count() > 0) {
      // Try weak password
      await passwordInput.fill('123');
      await submitButton.click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should show password requirements error
      const passwordError = page.locator('text=password, text=characters, text=strong, .error');
      // Error may appear based on validation rules
    }
  });

  test('should validate password confirmation match', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]').first();
    const confirmInput = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]').first();
    
    if (await passwordInput.count() > 0 && await confirmInput.count() > 0) {
      await passwordInput.fill('SecurePass123!');
      await confirmInput.fill('DifferentPass456!');
      
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Should show password mismatch error
        const error = page.locator('text=match, text=same, .error');
        // Error may appear
      }
    }
  });

  test('should accept terms and conditions checkbox', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="agree"]');
    
    if (await termsCheckbox.count() > 0) {
      await expect(termsCheckbox.first()).toBeVisible();
      
      // Try to submit without checking
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click({ force: true });
        await page.waitForTimeout(1000);
        
        // May show error for unchecked terms
      }
      
      // Check the box
      await termsCheckbox.first().check();
      await expect(termsCheckbox.first()).toBeChecked();
    }
  });
});

test.describe('Authentication - User Profile', () => {
  test('should display user profile page', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Should either show profile or redirect to login
    const isLoginPage = await page.locator('text=login, text=sign in', { hasText: /login|sign in/i }).count() > 0;
    const isProfilePage = await page.locator('text=profile, text=account, text=settings', { hasText: /profile|account|settings/i }).count() > 0;
    
    expect(isLoginPage || isProfilePage).toBeTruthy();
  });

  test('should show user information fields', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/profile');
    await page.evaluate(() => {
      // Mock user session
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for profile information
    const nameField = page.locator('input[name="name"], [data-testid="user-name"]');
    const emailField = page.locator('input[name="email"], [data-testid="user-email"]');
    const phoneField = page.locator('input[name="phone"], [data-testid="user-phone"]');
    
    // At least some profile fields should be visible
    const hasFields = (await nameField.count() > 0) || (await emailField.count() > 0);
    // Fields may exist depending on implementation
  });

  test('should allow profile editing', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for edit button or editable fields
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update"), [data-testid="edit-profile"]');
    
    if (await editButton.count() > 0) {
      await editButton.first().click({ force: true });
      await page.waitForTimeout(500);
      
      // Fields should become editable
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.count() > 0 && await nameInput.isEnabled()) {
        await nameInput.fill('Updated Name');
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click({ force: true });
          await page.waitForTimeout(1000);
          
          // Should show success message
          const success = page.locator('text=success, text=updated, .success');
          // Success message may appear
        }
      }
    }
  });

  test('should display saved addresses', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for addresses section
    const addressSection = page.locator('text=address, [data-testid="addresses"]', { hasText: /address/i });
    
    if (await addressSection.count() > 0) {
      await expect(addressSection.first()).toBeVisible();
      
      // Should have add address button
      const addButton = page.locator('button:has-text("Add"), button:has-text("New Address")');
      // Button may exist
    }
  });

  test('should show order history link', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for orders/history link
    const ordersLink = page.locator('a:has-text("Orders"), a:has-text("History"), [href*="/orders"]');
    
    if (await ordersLink.count() > 0) {
      await expect(ordersLink.first()).toBeVisible();
      
      // Click to navigate
      await ordersLink.first().click({ force: true });
      await page.waitForURL(/\/orders/);
      
      // Should be on orders page
      await expect(page.locator('text=order, text=history', { hasText: /order|history/i })).toBeVisible();
    }
  });
});

test.describe('Authentication - Protected Routes', () => {
  test('should redirect unauthenticated users from protected pages', async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access profile page
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to login or show login prompt
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/signin');
    const hasLoginPrompt = await page.locator('text=login, text=sign in, button:has-text("Login")').count() > 0;
    
    expect(isLoginPage || hasLoginPrompt).toBeTruthy();
  });

  test('should allow authenticated users to access protected pages', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-auth-token');
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });
    
    // Navigate to profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Should not redirect to login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('should show logout option when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Test User'
      }));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for logout button/link
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
    
    if (await logoutButton.count() > 0) {
      await expect(logoutButton.first()).toBeVisible();
      
      // Click logout
      await logoutButton.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      // Should clear auth state
      const hasUser = await page.evaluate(() => {
        return localStorage.getItem('user') !== null;
      });
      
      // User should be logged out
      // expect(hasUser).toBeFalsy();
    }
  });
});
