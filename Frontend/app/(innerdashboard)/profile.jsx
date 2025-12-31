import {StyleSheet} from 'react-native'

import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"

const Profile1 = () => {
    return (
        <ThemedView style={styles.container} safe={true}>

            <ThemedView style={styles.HeadLogo}>
                <View style={styles.imgcontainer}>
                    <ThemedLoginLogo style={styles.image} />
                </View>
            </ThemedView>

            <ThemedText title={true} style={styles.heading}>
                User Dashboard
            </ThemedText>
            <Spacer/>

            <ThemedText>Profile Page</ThemedText>
            <Spacer/>

        </ThemedView>
    )
}

export default Profile1
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