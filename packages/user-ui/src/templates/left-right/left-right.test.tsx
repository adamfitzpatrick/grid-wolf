import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeftRightTemplate } from '.';

describe('LeftRightTemplate', () => {
  test('should render content as provided', () => {
    const props = {
      header: () => <div>header</div>,
      sidebar: () => <div>sidebar</div>,
      main: () => <div>main</div>
    }
    const { container } = render(<LeftRightTemplate { ...props }/>)
    expect(container).toMatchSnapshot();
  });
})
