import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function InnerDashboardLayout() {
    return(
        <>
            <StatusBar style="auto" />
            <Stack
                screenOptions={{
                headerShown: false,
                }}>
                
            </Stack>
        </>
    );
}