import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegisterForm from './RegisterForm';
import '../../utils/jest.mock';

describe('Register Form Test', () => {
  it('should prevent blank input login', async () => {
    const { getByTestId, findByRole } = render(<RegisterForm />);

    fireEvent.click(getByTestId('register'));

    expect(await findByRole('alert')).not.toBeNull();
  });

  it('should prevent non-standard input', async () => {
    const { findByRole, getByPlaceholderText } = render(<RegisterForm />);
    const phoneNumberInput = getByPlaceholderText('Phone Number');
    const emailInput = getByPlaceholderText('Email');
    const organizationInput = getByPlaceholderText('Organization');

    fireEvent.change(phoneNumberInput, { target: { value: '12345' } });
    fireEvent.change(emailInput, { target: { value: '123' } });
    fireEvent.change(organizationInput, { target: { value: 'test' } });

    expect(await findByRole('alert')).not.toBeNull();
  });

  it('should register if receive valid input', async () => {
    const mockRegisterFn = jest.fn();

    const { getByTestId, getByPlaceholderText } = render(
      <RegisterForm register={mockRegisterFn} />
    );
    const phoneNumberInput = getByPlaceholderText('Phone Number');
    const emailInput = getByPlaceholderText('Email');
    const organizationInput = getByPlaceholderText('Organization');

    fireEvent.change(phoneNumberInput, { target: { value: '13823238323' } });
    fireEvent.change(emailInput, { target: { value: '123@q.com' } });
    fireEvent.change(organizationInput, { target: { value: 'test' } });

    userEvent.click(getByTestId('register'));

    await waitFor(() => expect(mockRegisterFn.mock.calls.length).toBe(1));
  });
});
