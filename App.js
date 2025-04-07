import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
import { MainStore } from "./src/contexts/MainContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./reanimatedConfig";
import { useEffect, useState } from "react";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import * as Updates from "expo-updates";
import { OrientationProvider } from "./src/helper/OrientationContext";
import { DrawerNavigation } from "./src/navigations/DrawerNavigation";
import { StatusBar } from "expo-status-bar";
import { Platform, View, StyleSheet } from "react-native"; // Added View and StyleSheet

export default function App() {
	// Шинэ state нэмэгдэж байна
	const [isAppReady, setIsAppReady] = useState(false);

	async function onFetchUpdateAsync() {
		try {
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				await Updates.fetchUpdateAsync();
				await Updates.reloadAsync();
			}
		} catch (error) {
			// Error handling
		}
	}

	useEffect(() => {
		onFetchUpdateAsync();
		// App бүрэн бэлэн болмогц гарч ирнэ
		const timer = setTimeout(() => {
			setIsAppReady(true);
		}, 500); // 3 секундийн дараа

		return () => clearTimeout(timer); // Хэрвээ аль нэгэн цагт App нь хаагдсан бол таймерыг цэвэрлэх
	}, []);

	if (!isAppReady) {
		// Цулгуй цагаан фон
		return <View style={styles.splashContainer}></View>;
	}

	return (
		<>
			<StatusBar style={Platform.OS == "ios" ? "dark-content" : "default"} hidden={false} />
			<SafeAreaProvider>
				<NetworkProvider>
					<OrientationProvider>
						<NavigationContainer>
							<MainStore>
								<DrawerNavigation />
							</MainStore>
						</NavigationContainer>
					</OrientationProvider>
				</NetworkProvider>
			</SafeAreaProvider>
		</>
	);
}

// Стиль
const styles = StyleSheet.create({
	splashContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "white" // Цагаан фон
	}
});
