import {StyleSheet} from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedViewDriver from "../../components/ThemedViewDriver"

const Profile2 = () => {
    return (
        <ThemedViewDriver style={styles.container} ssafe={true}>

            <ThemedText title={true} style={styles.heading}>
                Driver Dashboard
            </ThemedText>
            <Spacer/>

            <ThemedText>Profile Page</ThemedText>
            <Spacer/>

        </ThemedViewDriver>
    )
}

export default Profile2
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