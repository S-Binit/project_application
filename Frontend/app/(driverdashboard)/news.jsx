import {StyleSheet} from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedViewDriver from "../../components/ThemedViewDriver"

const Profile = () => {
    return (
        <ThemedViewDriver style={styles.container} safe={true}>

            <ThemedText title={true} style={styles.heading}>
                Driver Dashboard
            </ThemedText>
            <Spacer/>

            <ThemedText>News Page</ThemedText>
            <Spacer/>

        </ThemedViewDriver>
    )
}

export default Profile
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