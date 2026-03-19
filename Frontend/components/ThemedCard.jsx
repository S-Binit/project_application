import { StyleSheet, useColorScheme, View } from "react-native"
import { Colors } from "../constants/Colors"
import { responsiveStyle } from "../utils/responsive"

const ThemedCard = ({style, padded = true, ...props}) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return(
        <View
            style={[{
                backgroundColor: theme.uiBackground,
                borderRadius: 5,
                ...( padded ? responsiveStyle.medium : {} )
            }, style]}
            {...props}
        />
    )
}

export default ThemedCard