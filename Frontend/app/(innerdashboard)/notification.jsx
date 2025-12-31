import {StyleSheet} from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const Notification1 = () => {
    return (
        <ThemedView style={styles.container} safe={true}>

            <ThemedText title={true} style={styles.heading}>
                Notifications
            </ThemedText>

        </ThemedView>
    )
}

export default Notification1
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    heading:{
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
})