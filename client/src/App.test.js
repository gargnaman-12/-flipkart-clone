import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('renders search input', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const input = screen.getByLabelText(/search/i);
  expect(input).toBeInTheDocument();
});
