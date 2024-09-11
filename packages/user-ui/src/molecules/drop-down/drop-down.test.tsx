import { render } from "@testing-library/react";
import { DropDown } from ".";

describe('DropDown', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = render(<DropDown position='left'/>).container;
  });

  test('should render correctly', () => {})
});
