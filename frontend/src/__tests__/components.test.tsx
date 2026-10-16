import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/common/Badge.js';

describe('Frontend UI Components', () => {
  describe('Badge Component', () => {
    it('renders confirmed status with emerald styles', () => {
      const { container } = render(<Badge status="confirmed" />);
      expect(screen.getByText('confirmed')).toBeDefined();
      expect(container.firstChild).toBeDefined();
    });

    it('renders pending status with amber styles', () => {
      render(<Badge status="pending" />);
      expect(screen.getByText('pending')).toBeDefined();
    });

    it('renders completed status', () => {
      render(<Badge status="completed" />);
      expect(screen.getByText('completed')).toBeDefined();
    });

    it('renders cancelled status', () => {
      render(<Badge status="cancelled" />);
      expect(screen.getByText('cancelled')).toBeDefined();
    });
  });
});
