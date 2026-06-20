import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: {} })
      }),
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} })
    }
  }
});
import { MemoryRouter } from 'react-router-dom';
import InputForm from './InputForm';

test('InputForm renders correctly', async () => {
  render(
    <MemoryRouter>
      <InputForm onSubmit={() => {}} isLoading={false} scanStatus="" />
    </MemoryRouter>
  );
  
  // Check required fields by placeholder or name
  expect(await screen.findByPlaceholderText(/e.g. MegaWhey Pro/i)).toBeTruthy();
  expect(await screen.findByPlaceholderText(/A high protein bar for serious athletes/i)).toBeTruthy();
});

test('InputForm blocks submission when empty', async () => {
  const handleSubmit = vi.fn();
  render(
    <MemoryRouter>
      <InputForm onSubmit={handleSubmit} isLoading={false} scanStatus="" />
    </MemoryRouter>
  );
  
  const submitButton = await screen.findByRole('button', { name: /Run Analysis/i });
  fireEvent.click(submitButton);
  
  expect(handleSubmit).not.toHaveBeenCalled();
});
