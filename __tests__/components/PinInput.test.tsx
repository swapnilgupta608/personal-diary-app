import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PinInput from '../../src/components/PinInput';

describe('PinInput Component', () => {
  it('renders correctly with default length', () => {
    const { getByTestId, getAllByTestId } = render(<PinInput value="" onTextChange={() => {}} />);
    expect(getByTestId('hidden-pin-input')).toBeTruthy();
    expect(getAllByTestId(/pin-cell-/).length).toBe(4);
  });

  it('calls onTextChange when hidden input changes', () => {
    const onTextChangeMock = jest.fn();
    const { getByTestId } = render(<PinInput value="" onTextChange={onTextChangeMock} />);
    
    fireEvent.changeText(getByTestId('hidden-pin-input'), '123');
    expect(onTextChangeMock).toHaveBeenCalledWith('123');
  });

  it('displays dots for filled cells', () => {
    const { getByTestId } = render(<PinInput value="12" onTextChange={() => {}} />);
    
    expect(getByTestId('pin-cell-0').props.children.props.children).toBe('•');
    expect(getByTestId('pin-cell-1').props.children.props.children).toBe('•');
    expect(getByTestId('pin-cell-2').props.children.props.children).toBe('');
  });
});
