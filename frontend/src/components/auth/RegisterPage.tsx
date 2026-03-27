import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { V } from '../../constants/design';
import { useAuth, ApiError } from '../../hooks/useAuth';

// Simple email format check — matches the Zod schema behaviour in shared
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const validate = (): string => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!isValidEmail(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/builder', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError('An account with that email already exists. Try logging in instead.');
        } else if (err.status === 422) {
          setError('Please check your details and try again.');
        } else {
          setError(err.message || 'Something went wrong. Please try again.');
        }
      } else {
        setError('Unable to connect. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: V.bgApp,
      fontFamily: V.font,
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: V.s6,
        backgroundColor: V.bgSurface,
        borderRadius: V.r5,
        boxShadow: V.shadow2,
      }}>
        {/* Logo / Heading */}
        <div style={{ marginBottom: V.s6, textAlign: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: V.xl,
            fontWeight: 700,
            color: V.textPrimary,
          }}>
            FieldSaver
          </h1>
          <p style={{
            margin: `${V.s2} 0 0`,
            fontSize: V.md,
            color: V.textSecondary,
          }}>
            Create your account
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            marginBottom: V.s4,
            padding: `${V.s2} ${V.s3}`,
            backgroundColor: V.negativeBg,
            border: `1px solid ${V.negative}`,
            borderRadius: V.r3,
            fontSize: V.md,
            color: V.negative,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div style={{ marginBottom: V.s4 }}>
            <label style={{
              display: 'block',
              marginBottom: V.s1,
              fontSize: V.md,
              fontWeight: 600,
              color: V.textPrimary,
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
              disabled={isLoading}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: `${V.s2} ${V.s3}`,
                fontSize: V.md,
                color: V.textPrimary,
                backgroundColor: V.bgSurface,
                border: `1px solid ${V.border}`,
                borderRadius: V.r3,
                outline: 'none',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: V.s4 }}>
            <label style={{
              display: 'block',
              marginBottom: V.s1,
              fontSize: V.md,
              fontWeight: 600,
              color: V.textPrimary,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: `${V.s2} ${V.s3}`,
                fontSize: V.md,
                color: V.textPrimary,
                backgroundColor: V.bgSurface,
                border: `1px solid ${V.border}`,
                borderRadius: V.r3,
                outline: 'none',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: V.s5 }}>
            <label style={{
              display: 'block',
              marginBottom: V.s1,
              fontSize: V.md,
              fontWeight: 600,
              color: V.textPrimary,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              autoComplete="new-password"
              disabled={isLoading}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: `${V.s2} ${V.s3}`,
                fontSize: V.md,
                color: V.textPrimary,
                backgroundColor: V.bgSurface,
                border: `1px solid ${V.border}`,
                borderRadius: V.r3,
                outline: 'none',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text',
              }}
            />
            <p style={{
              margin: `${V.s1} 0 0`,
              fontSize: V.sm,
              color: V.textSecondary,
            }}>
              Must be at least 8 characters.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'block',
              width: '100%',
              padding: `${V.s3} ${V.s4}`,
              fontSize: V.md,
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: isLoading ? V.primaryHover : V.primary,
              border: 'none',
              borderRadius: V.r3,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            {isLoading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        {/* Login link */}
        <p style={{
          marginTop: V.s5,
          textAlign: 'center',
          fontSize: V.md,
          color: V.textSecondary,
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: V.primary,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
