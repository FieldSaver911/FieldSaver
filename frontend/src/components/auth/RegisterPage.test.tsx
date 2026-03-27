import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterPage } from './RegisterPage';
import * as useAuthModule from '../../hooks/useAuth';
import { ApiError } from '../../hooks/useAuth';

// ─── Router wrapper ───────────────────────────────────────────────────────────

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter initialEntries={['/register']}>{children}</MemoryRouter>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockRegister = vi.fn();

function renderPage() {
  return render(<RegisterPage />, { wrapper: Wrapper });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      register: mockRegister,
      logout: vi.fn(),
    });
  });

  it('should render name, email and password inputs', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('8+ characters')).toBeInTheDocument();
  });

  it('should render Register button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should render a link back to the login page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  it('should show error when name is empty', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when email is invalid', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show error when password is shorter than 8 characters', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should call register with correct inputs on valid submit', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
      });
    });
  });

  it('should show 409 duplicate-email error gracefully', async () => {
    mockRegister.mockRejectedValue(new ApiError('Conflict', 409));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(
        screen.getByText('An account with that email already exists. Try logging in instead.')
      ).toBeInTheDocument();
    });
  });

  it('should show loading text while submitting', async () => {
    mockRegister.mockReturnValue(new Promise(() => undefined));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
    });
  });

  it('should disable the button while loading', async () => {
    mockRegister.mockReturnValue(new Promise(() => undefined));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Jane Smith'), {
      target: { value: 'Jane Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('8+ characters'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });
});
