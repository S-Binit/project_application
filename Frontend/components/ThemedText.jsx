import {Text, useColorScheme} from 'react-native'
import { Colors } from '../constants/Colors'
import { RFValue } from '../utils/responsive'

const ThemedText = ({ style, title = false, size = 'base', ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    const textColor = title ? theme.title: theme.text
    
    // Font size map
    const fontSizeMap = {
        'xs': RFValue(10),
        'sm': RFValue(12),
        'base': RFValue(14),
        'lg': RFValue(16),
        'xl': RFValue(18),
        '2xl': RFValue(20),
        '3xl': RFValue(24),
        '4xl': RFValue(28),
        '5xl': RFValue(32),
    }

    return(
        <Text
            style={[{ 
                color: textColor,
                fontSize: fontSizeMap[size] || RFValue(14)
            }, style]}
            {...props}
        />
    )
}

export default ThemedText