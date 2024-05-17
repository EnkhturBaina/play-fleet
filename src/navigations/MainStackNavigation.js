import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { FONT_FAMILY_BOLD } from "../constant";
import { Icon } from "@rneui/base";

import MainContext from "../contexts/MainContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();
const width = Dimensions.get("screen").width;

const MainStackNavigator = (props) => {
	const state = useContext(MainContext);
	return (
		<Stack.Navigator
			initialRouteName={state.isLoggedIn ? "HomeScreen" : "LoginTab"}
			screenOptions={{
				headerStyle: {
					shadowColor: "transparent",
					elevation: 0
				}
			}}
		>
			<Stack.Screen
				name="LoginTab"
				component={LoginScreen}
				options={{
					title: "",
					headerShown: false,
					headerTitleStyle: {},
					headerLeft: () => <></>
				}}
			/>
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
		</Stack.Navigator>
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
		fontFamily: FONT_FAMILY_BOLD,
		fontSize: 18
	}
});
