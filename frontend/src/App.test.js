import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main VibeTrack.AI header', () => {
  render(<App />);
  const heading = screen.getByText((content, element) => {
    return element?.tagName === 'H1' && /VibeTrack/i.test(content);
  });
  expect(heading).toBeInTheDocument();
});
