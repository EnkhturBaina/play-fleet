import React, { useCallback, useContext } from "react";
import { StyleSheet, TouchableOpacity, Text, Dimensions, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { Icon } from "@rneui/base";

import MainContext from "../contexts/MainContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CheckListScreen from "../screens/CheckListScreen";
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
				{!state.isLoading && !state.isLoggedIn && state.appIsReady ? (
					<Stack.Screen
						name="LoginScreen"
						component={LoginScreen}
						options={{
							title: "",
							headerShown: false,
							headerTitleStyle: {},
							headerLeft: () => <></>
						}}
					/>
				) : state.isLoggedIn && !state.checkListDone ? (
					<Stack.Screen
						name="CheckListScreen"
						component={CheckListScreen}
						options={{
							headerShown: false,
							title: "",
							headerTitleStyle: {},
							headerLeft: () => <></>
						}}
					/>
				) : (
					<>
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
					</>
				)}
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
