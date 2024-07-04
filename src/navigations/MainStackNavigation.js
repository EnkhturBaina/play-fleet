import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { FONT_FAMILY_BOLD } from "../constant";
import { Icon } from "@rneui/base";

import MainContext from "../contexts/MainContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import CheckListScreen from "../screens/CheckListScreen";
import StatusLsitScreen from "../screens/StatusLsitScreen";

const Stack = createStackNavigator();
const width = Dimensions.get("screen").width;

const MainStackNavigator = (props) => {
	const state = useContext(MainContext);
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: {
					shadowColor: "transparent",
					elevation: 0
				}
			}}
		>
			{!state.isLoggedIn ? (
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
						name="StatusLsitScreen"
						component={StatusLsitScreen}
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
