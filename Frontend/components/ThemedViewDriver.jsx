import { View, useColorScheme } from 'react-native'
import { ColorsDriver } from '../constants/ColorsDriver'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import React from 'react'

const ThemedViewDriver = ({style, safe = false, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = ColorsDriver[colorScheme] ?? ColorsDriver.light

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

export default ThemedViewDriver