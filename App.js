import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { MainStore } from "./src/contexts/MainContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainStackNavigator } from "./src/navigations/MainStackNavigation";
import "./reanimatedConfig";
import { useEffect } from "react";
import { createTable, monitorNetworkStatus } from "./src/helper/db";

export default function App() {
	useEffect(() => {
		createTable();
		monitorNetworkStatus();
	}, []);

	return (
		<SafeAreaProvider>
			<NavigationContainer>
				<MainStore>
					<MainStackNavigator />
				</MainStore>
			</NavigationContainer>
		</SafeAreaProvider>
	);
}
//4158421d-2088-43c6-81e6-b0a85beafc07
