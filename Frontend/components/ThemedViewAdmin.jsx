import { View, useColorScheme } from 'react-native'
import { ColorsAdmin } from '../constants/ColorsAdmin'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import React from 'react'

const ThemedViewAdmin = ({style, safe = false, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = ColorsAdmin[colorScheme] ?? ColorsAdmin.light

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

export default ThemedViewAdmin