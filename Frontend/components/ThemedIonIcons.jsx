import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedIonicons = ({ color, focused = false, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    // Determine color priority: custom color > focused state > default text color
    const iconColor = color || (focused ? theme.ioniconColorFocused : theme.ioniconColor);

    return (
        <Ionicons
            color={iconColor}
            {...props}
        />
    );
};

export default ThemedIonicons;