import {Image, useColorScheme} from 'react-native'

//images
import DarkDriverLoginLogo from '../assets/img/LoginDriver_Logo_dark.png'
import LightDriverLoginLogo from '../assets/img/LoginDriver_Logo_light.png'

const ThemedLoginLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DarkDriverLoginLogo : LightDriverLoginLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedLoginLogo