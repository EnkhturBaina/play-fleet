import React, { useCallback, useContext } from "react";
import { StyleSheet, TouchableOpacity, Text, Dimensions, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "@rneui/base";

import MainContext from "../contexts/MainContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import StatusListScreen from "../screens/StatusListScreen";
import WorkRegistrationScreen from "../screens/WorkRegistration/WorkRegistrationScreen";
import CreateReisScreen from "../screens/WorkRegistration/Reis/CreateReisScreen";
import { useNavigation } from "@react-navigation/native";
import MotoHoursAndFuelScreen from "../screens/MotoHourAndFuel/MotoHoursAndFuelScreen";
import CreateMotoHourAndFuelScreen from "../screens/MotoHourAndFuel/CreateMotoHourAndFuelScreen";
import TestSQL from "../screens/TestSQL";
// import * as SplashScreen from "expo-splash-screen";
import TestRenderUurhai from "../screens/TestRenderUurhai";
import TestTilesScreen from "../screens/TestTilesScreen";
import SplashScreen from "../screens/SplashScreen";
import SelectEquipmentScreen from "../screens/SelectEquipmentScreen";
import InspectionScreen from "../screens/InspectionScreen";
import InspectionReportScreen from "../screens/Sidebar/InspectionReportScreen";
import CreateMotoHourAndFuelScreenHOME from "../screens/MotoHourAndFuel/CreateMotoHourAndFuelScreenHOME";

const Stack = createStackNavigator();
const width = Dimensions.get("screen").width;

const MainStackNavigator = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();

	// SplashScreen.preventAutoHideAsync();

	// const onLayoutRootView = useCallback(() => {
	// 	if (state.appIsReady) {
	// 		SplashScreen.hide();
	// 	}
	// }, [state.appIsReady]);

	// if (!state.appIsReady) {
	// 	return null;
	// }
	if (state.isLoading) {
		// Апп ачааллах бүрт SplashScreen харуулах
		return <SplashScreen />;
	}
	if (!state.isLoading && !state.isLoggedIn) {
		// Login хийгээгүй үед
		return <LoginScreen />;
	}
	if (!state.isLoading && state.isLoggedIn && state.appIsReady && state.selectedEquipment == null) {
		// Login хийсэн ч EQUIPMENT сонгоогүй үед
		return <SelectEquipmentScreen />;
	}
	if (!state.isLoading && state.isLoggedIn && state.appIsReady && state.selectedEquipment && !state.inspectionDone) {
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
					name="TestSQL"
					component={TestSQL}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="TestRenderUurhai"
					component={TestRenderUurhai}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
					}}
				/>
				<Stack.Screen
					name="TestTilesScreen"
					component={TestTilesScreen}
					options={{
						headerShown: false,
						title: "",
						headerTitleStyle: {},
						headerLeft: () => <></>
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
