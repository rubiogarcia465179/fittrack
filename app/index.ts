import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';
import WebPlanner from './src/web/WebPlanner';

// Web pública (R-136): con EXPO_PUBLIC_WEB_MODE=planner la web es UNA pantalla
// que crea un entreno (sin perfil ni datos guardados). Sin la variable (iOS,
// Android y el build de capturas) es la app completa.
const Root = Platform.OS === 'web' && process.env.EXPO_PUBLIC_WEB_MODE === 'planner' ? WebPlanner : App;

registerRootComponent(Root);
