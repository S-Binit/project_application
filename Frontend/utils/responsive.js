import { Dimensions, Platform } from 'react-native'

// Get device dimensions
const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window')
  return { width, height }
}

// Determine device type based on screen width
const getDeviceType = () => {
  const { width } = getScreenDimensions()
  if (width < 480) return 'small' // Small phones
  if (width < 768) return 'medium' // Regular phones
  return 'large' // Tablets
}

// Responsive font scaling
export const RFValue = (baseFontSize) => {
  const { width } = getScreenDimensions()
  const scale = width / 375 // Base width (iPhone 8)
  const newSize = baseFontSize * scale
  
  if (Platform.OS === 'web') {
    return Math.round(newSize)
  }
  
  // Clamp between 70% and 120% of base size for readability
  return Math.round(Math.min(baseFontSize * 1.2, Math.max(baseFontSize * 0.7, newSize)))
}

// Responsive spacing (padding, margin)
export const spacing = {
  xs: getScreenDimensions().width * 0.02, // 2% of width
  sm: getScreenDimensions().width * 0.04, // 4% of width
  md: getScreenDimensions().width * 0.06, // 6% of width
  lg: getScreenDimensions().width * 0.08, // 8% of width
  xl: getScreenDimensions().width * 0.1,  // 10% of width
}

// Responsive dimensions
export const responsiveDimensions = {
  // Get percentage of screen width
  screenWidth: (percentage) => (getScreenDimensions().width * percentage) / 100,
  
  // Get percentage of screen height
  screenHeight: (percentage) => (getScreenDimensions().height * percentage) / 100,
  
  // Button dimensions
  buttonHeight: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 48 : deviceType === 'medium' ? 56 : 60
  },
  
  buttonWidth: (percentage = 80) => {
    return responsiveDimensions.screenWidth(percentage)
  },
  
  // Image dimensions
  avatarSmall: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 50 : deviceType === 'medium' ? 60 : 80
  },
  
  avatarMedium: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 80 : deviceType === 'medium' ? 100 : 120
  },
  
  avatarLarge: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 120 : deviceType === 'medium' ? 150 : 180
  },
  
  // Card/container dimensions
  cardWidth: (percentage = 90) => {
    return responsiveDimensions.screenWidth(percentage)
  },
  
  cardHeight: (pixels) => {
    const { height } = getScreenDimensions()
    return (height * pixels) / 100
  },
  
  // Logo dimensions
  logoSmall: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 100 : deviceType === 'medium' ? 140 : 180
  },
  
  logoLarge: () => {
    const deviceType = getDeviceType()
    return deviceType === 'small' ? 140 : deviceType === 'medium' ? 200 : 250
  },
}

// Responsive padding/margin presets
export const responsiveStyle = {
  // Container padding
  container: {
    paddingHorizontal: getScreenDimensions().width * 0.05, // 5% of width
    paddingVertical: getScreenDimensions().height * 0.02,   // 2% of height
  },
  
  // Light padding
  light: {
    paddingHorizontal: getScreenDimensions().width * 0.03,
    paddingVertical: getScreenDimensions().height * 0.01,
  },
  
  // Medium padding
  medium: {
    paddingHorizontal: getScreenDimensions().width * 0.05,
    paddingVertical: getScreenDimensions().height * 0.02,
  },
  
  // Dense padding
  dense: {
    paddingHorizontal: getScreenDimensions().width * 0.04,
    paddingVertical: getScreenDimensions().height * 0.015,
  },
}

// Export screen dimensions for use in components
export const screenDimensions = getScreenDimensions()
export const deviceType = getDeviceType()

// Font size presets
export const fontSize = {
  xs: RFValue(10),
  sm: RFValue(12),
  base: RFValue(14),
  lg: RFValue(16),
  xl: RFValue(18),
  '2xl': RFValue(20),
  '3xl': RFValue(24),
  '4xl': RFValue(28),
  '5xl': RFValue(32),
}
