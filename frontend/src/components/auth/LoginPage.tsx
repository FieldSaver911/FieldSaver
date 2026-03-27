import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { V } from '../../constants/design';
import { useAuth, ApiError } from '../../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/builder', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (err.status === 422) {
          setError('Please enter a valid email address and password.');
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
            Sign in to your account
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
              placeholder="••••••••"
              autoComplete="current-password"
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
            {isLoading ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        {/* Register link */}
        <p style={{
          marginTop: V.s5,
          textAlign: 'center',
          fontSize: V.md,
          color: V.textSecondary,
        }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            style={{
              color: V.primary,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
