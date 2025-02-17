import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { MainStore } from "./src/contexts/MainContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainStackNavigator } from "./src/navigations/MainStackNavigation";
import "./reanimatedConfig";
import { useEffect } from "react";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import { SQLiteProvider } from "expo-sqlite";
import * as Updates from "expo-updates";

export default function App() {
	async function onFetchUpdateAsync() {
		try {
			if (!__DEV__) {
				const update = await Updates.checkForUpdateAsync();

				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
					await Updates.reloadAsync();
				}
			}
		} catch (error) {
			// You can also add an alert() to see the error message in case of an error when fetching updates.
			alert(`Error fetching latest Expo update: ${error}`);
		}
	}

	useEffect(() => {
		onFetchUpdateAsync();
	}, []);

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
