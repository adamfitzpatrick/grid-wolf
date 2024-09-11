import { MouseEventHandler, MouseEvent } from 'react';
import { Button, ButtonProps, ButtonType } from '.';
import { fireEvent, render, screen } from '@testing-library/react';
import { WifiOutlined } from '@ant-design/icons';

describe('Button', () => {
  let clickSpy: jest.Mock<MouseEventHandler<HTMLButtonElement>>;
  let props: ButtonProps;

  beforeEach(() => {
    clickSpy = jest.fn();
    props = {
      type: 'default',
      onClick: clickSpy
    }
  });

  function doRender() {
    return render(<Button { ...props }>Button</Button>);
  }

  test('should show the included children for labelling', () => {
    doRender();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  test('should set class properly for default button type', () => {
    expect(doRender().container).toMatchSnapshot();
  });

  test('should include a title if one was provided', () => {
    props.title = 'Title';
    doRender();
    expect(screen.getByTitle('Title')).toBeInTheDocument();
  });

  test('should set class properly for primary button type', () => {
    props.type = 'primary';
    expect(doRender().container).toMatchSnapshot();
  });

  test('should set class properly for text button type', () => {
    props.type = 'text';
    expect(doRender().container).toMatchSnapshot();
  });

  test('should set class properly for link button type', () => {
    props.type = 'link';
    expect(doRender().container).toMatchSnapshot();
  });

  test('should set class properly for large button size', () => {
    props.size = 'large';
    expect(doRender().container).toMatchSnapshot();
  });

  test('should set class properly for small button size', () => {
    props.size = 'small';
    expect(doRender().container).toMatchSnapshot();
  });

  test('should add icon-only class when an icon is provided with no children', () => {
    props.icon = <WifiOutlined />
    expect(render(<Button { ...props } />).container).toMatchSnapshot();
  });

  test('should show a disabled button when disabled is true', () => {
    props.disabled = true;
    expect(doRender().container).toMatchSnapshot();
  });

  test('should invoke click handler when clicked', () => {
    doRender();
    fireEvent.click(screen.getByText('Button'));
    expect(clickSpy).toHaveBeenCalled();
  });
});
