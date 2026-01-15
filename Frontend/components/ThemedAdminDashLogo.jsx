import {Image, useColorScheme} from 'react-native'

//images
import AdminDashboardDarkMainLogo from '../assets/img/AdminDashboardLogo_dark.png'
import AdminDashboardLightMainLogo from '../assets/img/AdminDashboardLogo_light.png'

const ThemedAdminDashLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? AdminDashboardDarkMainLogo : AdminDashboardLightMainLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedAdminDashLogo