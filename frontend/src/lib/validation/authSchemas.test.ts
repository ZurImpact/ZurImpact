import {describe, it, expect} from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from './authSchemas';

describe('loginSchema', () => {
  it('passes with valid credentials', () => {
    const result = loginSchema.safeParse({username: 'alice', password: 'secret'});
    expect(result.success).toBe(true);
  });

  it('fails when username is empty', () => {
    const result = loginSchema.safeParse({username: '', password: 'secret'});
    expect(result.success).toBe(false);
  });

  it('fails when password is empty', () => {
    const result = loginSchema.safeParse({username: 'alice', password: ''});
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    username: 'alice123',
    email: 'alice@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  it('passes with valid data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when username is too short (< 3 chars)', () => {
    expect(registerSchema.safeParse({...valid, username: 'ab'}).success).toBe(false);
  });

  it('fails when username is too long (> 50 chars)', () => {
    expect(registerSchema.safeParse({...valid, username: 'a'.repeat(51)}).success).toBe(false);
  });

  it('fails when email is invalid', () => {
    expect(registerSchema.safeParse({...valid, email: 'not-an-email'}).success).toBe(false);
  });

  it('fails when password is too short (< 8 chars)', () => {
    expect(registerSchema.safeParse({...valid, password: 'short', confirmPassword: 'short'}).success).toBe(false);
  });

  it('fails when password is too long (> 100 chars)', () => {
    const long = 'a'.repeat(101);
    expect(registerSchema.safeParse({...valid, password: long, confirmPassword: long}).success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    expect(registerSchema.safeParse({...valid, confirmPassword: 'Different1!'}).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('passes with valid email', () => {
    expect(forgotPasswordSchema.safeParse({email: 'user@example.com'}).success).toBe(true);
  });

  it('fails with invalid email', () => {
    expect(forgotPasswordSchema.safeParse({email: 'bad'}).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const valid = {token: 'abc123', newPassword: 'NewPass1!', confirmPassword: 'NewPass1!'};

  it('passes with valid data', () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when token is empty', () => {
    expect(resetPasswordSchema.safeParse({...valid, token: ''}).success).toBe(false);
  });

  it('fails when newPassword is too short', () => {
    expect(resetPasswordSchema.safeParse({...valid, newPassword: 'short', confirmPassword: 'short'}).success).toBe(
      false,
    );
  });

  it('fails when newPassword is too long (> 100 chars)', () => {
    const long = 'a'.repeat(101);
    expect(resetPasswordSchema.safeParse({...valid, newPassword: long, confirmPassword: long}).success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    expect(resetPasswordSchema.safeParse({...valid, confirmPassword: 'WrongPass!'}).success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  const valid = {currentPassword: 'OldPass1!', newPassword: 'NewPass1!', confirmPassword: 'NewPass1!'};

  it('passes with valid data', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when currentPassword is empty', () => {
    expect(changePasswordSchema.safeParse({...valid, currentPassword: ''}).success).toBe(false);
  });

  it('fails when newPassword is too short', () => {
    expect(changePasswordSchema.safeParse({...valid, newPassword: 'short', confirmPassword: 'short'}).success).toBe(
      false,
    );
  });

  it('fails when newPassword is too long (> 100 chars)', () => {
    const long = 'a'.repeat(101);
    expect(changePasswordSchema.safeParse({...valid, newPassword: long, confirmPassword: long}).success).toBe(false);
  });

  it('fails when passwords do not match', () => {
    expect(changePasswordSchema.safeParse({...valid, confirmPassword: 'WrongPass!'}).success).toBe(false);
  });

  it('fails when newPassword equals currentPassword', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'SamePass1!',
        newPassword: 'SamePass1!',
        confirmPassword: 'SamePass1!',
      }).success,
    ).toBe(false);
  });
});

describe('resendVerificationSchema', () => {
  it('passes with valid email', () => {
    expect(resendVerificationSchema.safeParse({email: 'user@example.com'}).success).toBe(true);
  });

  it('fails with invalid email', () => {
    expect(resendVerificationSchema.safeParse({email: 'bad-email'}).success).toBe(false);
  });
});
