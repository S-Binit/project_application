import { View, StyleSheet, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'
import { responsiveStyle } from '../utils/responsive'

const ThemedViewResponsive = ({ style, padded = true, spacing = 'medium', ...props }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    
    const spacingMap = {
        'light': responsiveStyle.light,
        'medium': responsiveStyle.medium,
        'dense': responsiveStyle.dense,
        'container': responsiveStyle.container,
    }

    return (
        <View
            style={[{
                backgroundColor: theme.background,
                flex: 1,
                ...(padded ? spacingMap[spacing] : {})
            }, style]}
            {...props}
        />
    )
}

export default ThemedViewResponsive
