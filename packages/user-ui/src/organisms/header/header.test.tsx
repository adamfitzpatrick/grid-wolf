import React from 'react';
import { Header } from ".";
import { render, screen } from '@testing-library/react';

describe('Header', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = render(<Header />).container;
  });

  test('should contain the account menu button', () => {
    expect(screen.getByTitle('account menu')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
