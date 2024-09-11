import { fireEvent, render, screen } from "@testing-library/react";
import { AccountMenu } from ".";

describe('AccountMenu', () => {
  let text: string;

  beforeEach(() => {
    text = 'Logout';
    render(<AccountMenu />).container;
  });

  test('should show only the button when closed', () => {
    expect(screen.getByTitle('account menu')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('should display menu items properly when mouse enters button', () => {
    fireEvent.mouseEnter(screen.getByTitle('account menu'));
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('should eventually do something meaningful', () => {
    fireEvent.click(screen.getByTitle('account menu'));
    fireEvent.click(screen.getByText('Profile'));
    fireEvent.click(screen.getByText('Logout'));
  });

  test('should close when mouse exits button or menu area', () => {
    fireEvent.mouseLeave(screen.getByTitle('account menu'));
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByTitle('account menu'));
    fireEvent.mouseLeave(screen.getByTitle('account menu'))
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('should lock open when account button is clicked', () => {
    fireEvent.click(screen.getByTitle('account menu'));
    expect(screen.getByText(text)).toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByTitle('account menu'));
    expect(screen.getByText(text)).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByText(text));
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test('should close when locked open and the account button is clicked', () => {
    fireEvent.click(screen.getByTitle('account menu'));
    expect(screen.getByText(text)).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('account menu'));
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });

  test('should close when clicked while open', () => {
    fireEvent.click(screen.getByTitle('account menu'));
    fireEvent.click(screen.getByTitle('account menu'));
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });
});
