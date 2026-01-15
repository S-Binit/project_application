import {Image, useColorScheme} from 'react-native'

//images
import DarkAdminLoginLogo from '../assets/img/LoginAdmin_Logo_dark.png'
import LightAdminLoginLogo from '../assets/img/LoginAdmin_Logo_light.png'

const ThemedAdminLoginLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DarkAdminLoginLogo : LightAdminLoginLogo

    return(
        <Image source={logo} {...props} />
    )
}

export default ThemedAdminLoginLogo