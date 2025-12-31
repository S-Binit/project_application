import {Image, useColorScheme} from 'react-native'

//images
import DriverDashboardDarkMainLogo from '../assets/img/DriverDashboardLogo_dark.png'
import DriverDashboardLightMainLogo from '../assets/img/DriverDashboardLogo_light.png'

const ThemedDriverDashLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DriverDashboardDarkMainLogo : DriverDashboardLightMainLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedDriverDashLogo