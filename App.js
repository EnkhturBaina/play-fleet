import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { MainStore } from "./src/contexts/MainContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainStackNavigator } from "./src/navigations/MainStackNavigation";
import "./reanimatedConfig";
import { useEffect } from "react";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import { SQLiteProvider } from "expo-sqlite";

export default function App() {
	useEffect(() => {}, []);

	return (
		<SafeAreaProvider>
			<NetworkProvider>
				{/* <SQLiteProvider databaseName="offline_data"> */}
				<NavigationContainer>
					<MainStore>
						<MainStackNavigator />
					</MainStore>
				</NavigationContainer>
				{/* </SQLiteProvider> */}
			</NetworkProvider>
		</SafeAreaProvider>
	);
}
//4158421d-2088-43c6-81e6-b0a85beafc07
