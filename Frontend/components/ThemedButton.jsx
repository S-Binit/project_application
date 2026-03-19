import { Pressable, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"
import { responsiveDimensions, RFValue } from "../utils/responsive"

function ThemedButton({style, width, ...props}) {
    const buttonWidth = width || responsiveDimensions.buttonWidth(85)
    const buttonHeight = responsiveDimensions.buttonHeight()
    
    return(
        <Pressable
            style={({pressed}) => [{
                width: buttonWidth,
                height: buttonHeight,
                backgroundColor: Colors.whitebg,
                paddingHorizontal: RFValue(15),
                paddingVertical: RFValue(10),
                marginVertical: RFValue(10),
                borderRadius: buttonHeight / 2,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.4,
                elevation: 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#43A047'
            }, pressed && { opacity: 0.5 }, style]}
            {...props}
        />
    )
}

export default ThemedButton