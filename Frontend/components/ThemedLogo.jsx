import {Image, useColorScheme} from 'react-native'

//images
import DarkMainLogo from '../assets/img/Logo_dark_text.png'
import LightMainLogo from '../assets/img/Logo_light_text.png'

const ThemedLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DarkMainLogo : LightMainLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedLogo
