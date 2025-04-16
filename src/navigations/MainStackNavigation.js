import React, { useContext, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Text, Dimensions, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "@rneui/base";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MainContext from "../contexts/MainContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import StatusListScreen from "../screens/StatusListScreen";
import WorkRegistrationScreen from "../screens/WorkRegistration/WorkRegistrationScreen";
import CreateReisScreen from "../screens/WorkRegistration/Reis/CreateReisScreen";
import { useNavigation } from "@react-navigation/native";
import MotoHoursAndFuelScreen from "../screens/MotoHourAndFuel/MotoHoursAndFuelScreen";
import CreateMotoHourAndFuelScreen from "../screens/MotoHourAndFuel/CreateMotoHourAndFuelScreen";
// import * as SplashScreen from "expo-splash-screen";
import SplashScreen from "../screens/SplashScreen";
import SelectEquipmentScreen from "../screens/SelectEquipmentScreen";
import InspectionScreen from "../screens/InspectionScreen";
import InspectionReportScreen from "../screens/Sidebar/InspectionReportScreen";
import CreateMotoHourAndFuelScreenHOME from "../screens/MotoHourAndFuel/CreateMotoHourAndFuelScreenHOME";
import NotificationScreen from "../screens/Notification/NotificationScreen";
import NotificationDTLScreen from "../screens/Notification/NotificationDTLScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TempLocations from "../screens/TempLocations";
import LocationPermissionScreen from "../screens/LocationPermissionScreen";
import { useNetworkStatus } from "../contexts/NetworkContext";
import {
	fetchMotoHourData,
	fetchSendLocationData,
	fetchSendLocationDataTemp,
	fetchSendStateDataALL,
	fetchSendStateDataTemp
} from "../helper/db";
import "dayjs/locale/es";
import dayjs from "dayjs";

const Stack = createStackNavigator();
const width = Dimensions.get("screen").width;

const MainStackNavigator = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const { isConnected } = useNetworkStatus();

	useEffect(() => {
		state.setSendLocationStatus((prevStatus) => [
			...prevStatus,
			`1 => isLoggedIn: ${state.isLoggedIn}, inspectionDone: ${state.inspectionDone}`
		]);
		state.isLoggedIn && state.inspectionDone && state.checkLocationWithSpeed(); // Нэвтэрсэн үед эхний хүсэлт шууд явуулна

		const interval = setInterval(
			() => {
				if (state.isLoggedIn && state.inspectionDone) {
					state.checkLocationWithSpeed();
				}
			},
			// 120000
			state.projectData?.SyncTime != null ? state.projectData?.SyncTime * 1000 : 5 * 60 * 1000
		); // Login response -н Project дотор SyncTime -д тохируулсан хугацаагааны давтамжаар Location илгээх

		// Component unmount үед interval-ийг устгах
		return () => clearInterval(interval);
	}, [state.isLoggedIn, state.inspectionDone]);

	useEffect(() => {
		let locationSubscription = null;

		const startTracking = async () => {
			try {
				// Байршил авах эрхийг шалгах
				const { status } = await Location.requestForegroundPermissionsAsync();
				state.setLocationStatus(status);
				if (status !== "granted") {
					console.warn("📍 Байршил авах эрх олгогдоогүй байна!");
					return;
				}

				// Машины бодит цагийн tracking (25м өөрчлөгдвөл update хийнэ)
				locationSubscription = await Location.watchPositionAsync(
					{
						accuracy: Location.Accuracy.High,
						distanceInterval: 25, // 25 метрээс дээш хөдөлгөөнд update хийнэ
						timeInterval: 5000 // 5 секунд тутамд шинэ мэдээлэл авах
					},
					async (newLocation) => {
						console.log("📍 Шинэ байршил:", newLocation);

						// Шинэ байршлыг state-д хадгалах
						state.setLocation(newLocation);

						// Хурдыг км/ц болгон хувиргаж хадгалах
						const speedKmh = (newLocation?.coords?.speed ?? 0) * 3.6;
						if (speedKmh > 0) {
							try {
								await AsyncStorage.setItem("L_current_speed", speedKmh.toFixed(2));
							} catch (error) {
								console.error("⚠️ Хурд хадгалах үед алдаа гарлаа:", error);
							}
						}
					}
				);
			} catch (error) {
				console.error("❌ startTracking алдаа:", error);
			}
		};

		startTracking();

		// Unmount хийх үед байршлын tracking-ийг зогсооно
		return () => {
			if (locationSubscription) locationSubscription.remove();
		};
	}, []);

	useEffect(() => {
		const sendDataToServer = async () => {
			if (isConnected) {
				console.log("📶 Интернет холбогдлоо! Өгөгдөл сервер рүү зэрэг илгээж байна...");
				var tempLocations = await fetchSendLocationDataTemp();
				// console.log("tempLocations", tempLocations);

				state.setTempLocations(tempLocations);
				var tempSendState = await fetchSendStateDataTemp();
				console.log("tempSendState", tempSendState);

				state.setTempSendState(tempSendState);
				try {
					const resp = await Promise.all([
						fetchSendStateDataALL(),
						// fetchSendStateDataOneByOne(),
						fetchMotoHourData(),
						fetchSendLocationData(
							state.selectedEquipment?.id,
							state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
							state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
							0,
							dayjs().format("YYYY-MM-DD"),
							dayjs().format("YYYY-MM-DD HH:mm:ss")
						)
					]);

					console.log("📡 Бүх өгөгдлийг зэрэг илгээлээ!");
					// console.log("📡 Бүх өгөгдлийг зэрэг илгээлээ!", JSON.stringify(resp));
				} catch (error) {
					console.error("⚠️ Өгөгдөл зэрэг илгээх явцад алдаа гарлаа:", error);
				}
			}
		};

		sendDataToServer();
	}, [isConnected]);
	// SplashScreen.preventAutoHideAsync();

	if (state.locationStatus !== "granted") {
		return <LocationPermissionScreen />;
	}
	if (state.isLoading) {
		// Апп ачааллах бүрт SplashScreen харуулах
		return <SplashScreen />;
	}
	if (!state.isLoading && !state.isLoggedIn) {
		// Login хийгээгүй үед
		return <LoginScreen />;
	}
	if (!state.isLoading && state.isLoggedIn && state.selectedEquipment == null) {
		// Login хийсэн ч EQUIPMENT сонгоогүй үед
		return <SelectEquipmentScreen />;
	}
	if (!state.isLoading && state.isLoggedIn && state.selectedEquipment && !state.inspectionDone) {
		// Login хийгээд EQUIPMENT сонгоод Inspection
		return <InspectionScreen />;
	}

	return (
		<View
			style={{ flex: 1 }}
			// onLayout={onLayoutRootView}
		>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						shadowColor: "transparent",
						elevation: 0
					}
				}}
			>
				<Stack.Screen
					name="HomeScreen"
					component={HomeScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="StatusListScreen"
					component={StatusListScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="WorkRegistrationScreen"
					component={WorkRegistrationScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="CreateReisScreen"
					component={CreateReisScreen}
					options={{
						title: "",
						headerTitleStyle: {
							fontWeight: "bold"
						},
						headerLeft: () => (
							<TouchableOpacity
								style={styles.headerLeftContainer}
								onPress={() => {
									navigation.goBack();
								}}
							>
								<Icon name="keyboard-arrow-left" type="material-icons" size={30} />
								<Text style={styles.headerLeftText}>Рейс бүртгэл</Text>
							</TouchableOpacity>
						)
					}}
				/>
				<Stack.Screen
					name="MotoHoursAndFuelScreen"
					component={MotoHoursAndFuelScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="CreateMotoHourAndFuelScreen"
					component={CreateMotoHourAndFuelScreen}
					options={{
						title: "",
						headerTitleStyle: {
							fontWeight: "bold"
						},
						headerLeft: () => (
							<TouchableOpacity
								style={styles.headerLeftContainer}
								onPress={() => {
									navigation.goBack();
								}}
							>
								<Icon name="keyboard-arrow-left" type="material-icons" size={30} />
								<Text style={styles.headerLeftText}>Мото цагийн болон түлшний бүртгэл</Text>
							</TouchableOpacity>
						)
					}}
				/>
				<Stack.Screen
					name="InspectionReportScreen"
					component={InspectionReportScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="CreateMotoHourAndFuelScreenHOME"
					component={CreateMotoHourAndFuelScreenHOME}
					options={{
						title: "",
						headerTitleStyle: {
							fontWeight: "bold"
						},
						gestureEnabled: false,
						headerLeft: () => (
							<TouchableOpacity
								style={styles.headerLeftContainer}
								onPress={() => {
									state.logout();
								}}
							>
								{/* <Icon name="keyboard-arrow-left" type="material-icons" size={30} /> */}
								<Text style={styles.headerLeftText}>Мото цагийн болон түлшний бүртгэл</Text>
							</TouchableOpacity>
						)
					}}
				/>
				<Stack.Screen
					name="NotificationScreen"
					component={NotificationScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="NotificationDTLScreen"
					component={NotificationDTLScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="ProfileScreen"
					component={ProfileScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="TempLocations"
					component={TempLocations}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
			</Stack.Navigator>
		</View>
	);
};

export { MainStackNavigator };

const styles = StyleSheet.create({
	headerLeftContainer: {
		marginLeft: 10,
		flexDirection: "row",
		alignItems: "center",
		width: width - 20
	},
	headerLeftText: {
		marginLeft: 5,
		fontWeight: "bold",
		fontSize: 18
	}
});
