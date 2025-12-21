import { Pressable, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

function ThemedButton({style, ...props}) {
    
    return(
        <Pressable
            style={({pressed}) => [styles.btn, pressed && styles.pressed, style]}
            {...props}
        />
    )
}
const styles = StyleSheet.create({
    btn: {
        width: 275,
        height: 56,
        backgroundColor: Colors.whitebg,
        padding: 15,
        borderRadius: 6,
        marginVertical: 10,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 4,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#43A047'
    },
    pressed: {
        opacity: 0.5
    },
})

export default ThemedButton