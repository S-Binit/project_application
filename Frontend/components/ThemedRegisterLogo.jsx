import {Image, useColorScheme} from 'react-native'

//images
import DarkRegisterLogo from '../assets/img/Register_Logo_dark.png'
import LightRegisterLogo from '../assets/img/Register_Logo_light.png'

const ThemedRegisterLogo = ({...props }) => {
    const colorScheme = useColorScheme()

    const logo = colorScheme === 'dark' ? DarkRegisterLogo : LightRegisterLogo

    return(
        <Image source={logo}{...props} />
    )
}

export default ThemedRegisterLogo