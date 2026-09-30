import React from 'react';
import { View, ViewStyle, Text, TextStyle, StyleProp } from 'react-native';

export interface BoxProps extends React.ComponentPropsWithoutRef<typeof View> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  p?: number;
  px?: number;
  py?: number;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  m?: number;
  mx?: number;
  my?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  w?: number | string;
  h?: number | string;
  minW?: number | string;
  maxW?: number | string;
  minH?: number | string;
  maxH?: number | string;
  bg?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  position?: 'absolute' | 'relative';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;
}

export const Box = React.forwardRef<View, BoxProps>(
  (
    {
      children,
      style,
      flex,
      flexDirection,
      alignItems,
      justifyContent,
      gap,
      p,
      px,
      py,
      pt,
      pb,
      pl,
      pr,
      m,
      mx,
      my,
      mt,
      mb,
      ml,
      mr,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH,
      bg,
      borderWidth,
      borderColor,
      borderRadius,
      overflow,
      shadow,
      opacity,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      ...props
    },
    ref
  ) => {
    const styles: ViewStyle = {
      flex,
      flexDirection,
      alignItems,
      justifyContent,
      gap,
      padding: p,
      paddingHorizontal: px,
      paddingVertical: py,
      paddingTop: pt,
      paddingBottom: pb,
      paddingLeft: pl,
      paddingRight: pr,
      margin: m,
      marginHorizontal: mx,
      marginVertical: my,
      marginTop: mt,
      marginBottom: mb,
      marginLeft: ml,
      marginRight: mr,
      width: w,
      height: h,
      minWidth: minW,
      maxWidth: maxW,
      minHeight: minH,
      maxHeight: maxH,
      backgroundColor: bg,
      borderWidth,
      borderColor,
      borderRadius,
      overflow,
      opacity,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
    };

    if (shadow && shadow !== 'none') {
      const shadows: Record<string, ViewStyle> = {
        xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
        xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 25, elevation: 12 },
      };
      Object.assign(styles, shadows[shadow]);
    }

    return (
      <View ref={ref} style={[styles, style]} {...props}>
        {children}
      </View>
    );
  }
);

Box.displayName = 'Box';

export interface TextProps extends React.ComponentPropsWithoutRef<typeof Text> {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'displayXL' | 'displayLG' | 'displayMD' | 'displaySM' | 'headingXL' | 'headingLG' | 'headingMD' | 'headingSM' | 'bodyLG' | 'bodyMD' | 'bodySM' | 'caption' | 'button' | 'overline';
  color?: string;
  fontWeight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display';
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const typographyStyles: Record<TextProps['variant'], TextStyle> = {
  displayXL: { fontSize: 72, lineHeight: 80, letterSpacing: -1.5, fontWeight: '800' },
  displayLG: { fontSize: 60, lineHeight: 66, letterSpacing: -1, fontWeight: '800' },
  displayMD: { fontSize: 48, lineHeight: 56, letterSpacing: -0.5, fontWeight: '700' },
  displaySM: { fontSize: 36, lineHeight: 44, letterSpacing: -0.25, fontWeight: '700' },
  headingXL: { fontSize: 30, lineHeight: 38, letterSpacing: -0.5, fontWeight: '700' },
  headingLG: { fontSize: 24, lineHeight: 32, letterSpacing: -0.25, fontWeight: '600' },
  headingMD: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  headingSM: { fontSize: 18, lineHeight: 26, fontWeight: '600' },
  bodyLG: { fontSize: 18, lineHeight: 28, fontWeight: '400' },
  bodyMD: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySM: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },
};

const fontFamilies: Record<TextProps['fontFamily'], string> = {
  sans: 'Inter',
  serif: 'Merriweather',
  mono: 'JetBrains Mono',
  display: 'Cal Sans',
};

export const Text = React.forwardRef<Text, TextProps>(
  (
    {
      children,
      style,
      variant = 'bodyMD',
      color,
      fontWeight,
      fontFamily,
      textAlign,
      numberOfLines,
      ellipsizeMode,
      ...props
    },
    ref
  ) => {
    const variantStyle = typographyStyles[variant] || {};
    const fontFamilyStyle = fontFamily ? { fontFamily: fontFamilies[fontFamily] } : {};
    const fontWeightStyle = fontWeight ? { fontWeight } : {};

    return (
      <Text
        ref={ref}
        style={[
          variantStyle,
          fontFamilyStyle,
          fontWeightStyle,
          { color, textAlign, numberOfLines, ellipsizeMode },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

Text.displayName = 'Text';