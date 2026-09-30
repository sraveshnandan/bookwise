import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Box, Text } from './Box';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const sizeStyles: Record<ButtonProps['size'], { px: number; py: number; gap: number; fontSize: number }> = {
  sm: { px: 12, py: 6, gap: 6, fontSize: 13 },
  md: { px: 16, py: 10, gap: 8, fontSize: 15 },
  lg: { px: 20, py: 12, gap: 10, fontSize: 16 },
  xl: { px: 24, py: 14, gap: 12, fontSize: 18 },
};

const variantStyles: Record<ButtonProps['variant'], { bg: string; color: string; borderColor?: string; borderWidth?: number }> = {
  primary: { bg: '#0ea5e9', color: '#fff' },
  secondary: { bg: '#d946ef', color: '#fff' },
  outline: { bg: 'transparent', color: '#0ea5e9', borderColor: '#0ea5e9', borderWidth: 2 },
  ghost: { bg: 'transparent', color: '#0ea5e9' },
  destructive: { bg: '#ef4444', color: '#fff' },
};

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      style,
      disabled,
      onPress,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const { px, py, gap, fontSize } = sizeStyles[size];
    const { bg, color, borderColor, borderWidth } = variantStyles[variant];

    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: px,
      paddingVertical: py,
      gap,
      borderRadius: 12,
      backgroundColor: isDisabled ? '#9ca3af' : bg,
      borderColor: isDisabled ? '#9ca3af' : borderColor,
      borderWidth,
      width: fullWidth ? '100%' : undefined,
      opacity: isDisabled ? 0.6 : 1,
    };

    const textStyle: TextStyle = {
      color: isDisabled ? '#fff' : color,
      fontSize,
      fontWeight: '600',
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[containerStyle, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <>
            {leftIcon}
            <Text style={textStyle}>{children}</Text>
            {rightIcon}
          </>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

export interface IconButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const IconButton = React.forwardRef<TouchableOpacity, IconButtonProps>(
  (
    {
      children,
      variant = 'ghost',
      size = 'md',
      style,
      disabled,
      onPress,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled;
    const sizes = { sm: 36, md: 44, lg: 52 };
    const size = sizes[size];
    const { bg, color, borderColor, borderWidth } = variantStyles[variant];

    const containerStyle: ViewStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: isDisabled ? '#9ca3af' : bg,
      borderColor: isDisabled ? '#9ca3af' : borderColor,
      borderWidth,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.6 : 1,
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={[containerStyle, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

IconButton.displayName = 'IconButton';