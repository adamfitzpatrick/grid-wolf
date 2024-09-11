import { render, screen } from "@testing-library/react";
import { Landing } from "."

describe('Landing', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = render(<Landing />).container;
  });

  test('should show generated Landing page', () => {
    expect(screen.getByTitle('Log in')).toBeInTheDocument();
  });
})
