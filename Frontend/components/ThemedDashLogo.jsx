import {Image, useColorScheme} from 'react-native'

//images
import DashboardDarkMainLogo from '../assets/img/DashboardLogo_dark.png'
import DashboardLightMainLogo from '../assets/img/DashboardLogo_light.png'

const ThemedLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DashboardDarkMainLogo : DashboardLightMainLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedLogo
