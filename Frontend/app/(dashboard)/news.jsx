import {StyleSheet} from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const Profile = () => {
    return (
        <ThemedView style={styles.container} safe={true}>

            <ThemedText title={true} style={styles.heading}>
                User Dashboard
            </ThemedText>
            <Spacer/>

            <ThemedText>News Page</ThemedText>
            <Spacer/>

        </ThemedView>
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