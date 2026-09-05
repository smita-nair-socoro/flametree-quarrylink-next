import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MultipleInput } from '../multiple-input';

describe('MultipleInput', () => {
  test('renders every email as a removable chip', () => {
    render(
      <MultipleInput value="armin@gmail.com, smita.nair@socoro.com.au" />,
    );

    expect(
      screen.getByRole('button', { name: 'Remove armin@gmail.com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Remove smita.nair@socoro.com.au',
      }),
    ).toBeInTheDocument();
  });

  test('removes a prefilled default email when X is clicked', () => {
    const onChange = vi.fn();

    render(
      <MultipleInput
        value="armin@gmail.com, smita.nair@socoro.com.au"
        onChange={onChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove armin@gmail.com' }),
    );

    expect(onChange).toHaveBeenCalledWith('smita.nair@socoro.com.au');
  });

  test('allows removing the last email without restoring a default', () => {
    const onChange = vi.fn();

    render(
      <MultipleInput value="armin@gmail.com" onChange={onChange} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove armin@gmail.com' }),
    );

    expect(onChange).toHaveBeenCalledWith('');
  });
});
