import React from 'react';
import { TextInput, TextInputProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Box, Text } from './Box';

export interface InputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      value,
      onChangeText,
      style,
      inputStyle,
      placeholder,
      secureTextEntry,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const containerStyle: ViewStyle = {
      width: '100%',
    };

    const inputContainerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: disabled ? '#f3f4f6' : '#fff',
      borderWidth: 1,
      borderColor: hasError ? '#ef4444' : disabled ? '#d1d5db' : '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 16,
      minHeight: 52,
    };

    const inputStyleFinal: TextStyle = {
      flex: 1,
      fontSize: 16,
      color: '#111827',
      paddingVertical: 12,
      ...inputStyle,
    };

    const labelStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
      marginBottom: 8,
    };

    const errorStyle: TextStyle = {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 6,
    };

    const helperStyle: TextStyle = {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 6,
    };

    return (
      <Box style={containerStyle}>
        {label && (
          <Text style={labelStyle} as="label">
            {label} {required && <Text color="#ef4444">*</Text>}
          </Text>
        )}
        <Box style={inputContainerStyle}>
          {leftIcon && <Box style={{ marginRight: 12 }}>{leftIcon}</Box>}
          <TextInput
            ref={ref}
            style={inputStyleFinal}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntry}
            disabled={disabled}
            {...props}
          />
          {rightIcon && <Box style={{ marginLeft: 12 }}>{rightIcon}</Box>}
        </Box>
        {hasError && <Text style={errorStyle}>{error}</Text>}
        {!hasError && helperText && <Text style={helperStyle}>{helperText}</Text>}
      </Box>
    );
  }
);

Input.displayName = 'Input';

export interface TextAreaProps extends Omit<TextInputProps, 'onChangeText' | 'value' | 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  minHeight?: number;
  maxHeight?: number;
}

export const TextArea = React.forwardRef<TextInput, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChangeText,
      style,
      inputStyle,
      placeholder,
      disabled,
      required,
      minHeight = 100,
      maxHeight,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const containerStyle: ViewStyle = {
      width: '100%',
    };

    const inputContainerStyle: ViewStyle = {
      backgroundColor: disabled ? '#f3f4f6' : '#fff',
      borderWidth: 1,
      borderColor: hasError ? '#ef4444' : disabled ? '#d1d5db' : '#e5e7eb',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight,
      maxHeight,
    };

    const inputStyleFinal: TextStyle = {
      flex: 1,
      fontSize: 16,
      color: '#111827',
      textAlignVertical: 'top',
      ...inputStyle,
    };

    const labelStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
      marginBottom: 8,
    };

    const errorStyle: TextStyle = {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 6,
    };

    const helperStyle: TextStyle = {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 6,
    };

    return (
      <Box style={containerStyle}>
        {label && (
          <Text style={labelStyle} as="label">
            {label} {required && <Text color="#ef4444">*</Text>}
          </Text>
        )}
        <Box style={inputContainerStyle}>
          <TextInput
            ref={ref}
            style={inputStyleFinal}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            multiline
            disabled={disabled}
            {...props}
          />
        </Box>
        {hasError && <Text style={errorStyle}>{error}</Text>}
        {!hasError && helperText && <Text style={helperStyle}>{helperText}</Text>}
      </Box>
    );
  }
);

TextArea.displayName = 'TextArea';