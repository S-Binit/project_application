import {Image, useColorScheme} from 'react-native'

//images
import DarkLoginLogo from '../assets/img/Login_Logo_dark.png'
import LightLoginLogo from '../assets/img/Login_Logo_light.png'

const ThemedDriverLoginLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DarkLoginLogo : LightLoginLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedDriverLoginLogo