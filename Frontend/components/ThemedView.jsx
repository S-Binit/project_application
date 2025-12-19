import { View, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import React from 'react'

const ThemedView = ({style, safe = false, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

  if (!safe) return (
    <View 
    style={[{backgroundColor: theme.background}, style]}
    {...props}
    />
  )

  const insets = useSafeAreaInsets()

  return(
    <View 
    style={[{
      backgroundColor: theme.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }, 
      style
    ]}
    {...props}
    />
  )
}

export default ThemedView