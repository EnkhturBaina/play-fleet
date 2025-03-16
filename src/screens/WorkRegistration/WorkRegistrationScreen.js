import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useContext, useState } from "react";
import HeaderUser from "../../components/HeaderUser";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY } from "../../constant";
import CustomDialog from "../../components/CustomDialog";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import MainContext from "../../contexts/MainContext";

const Tab = createMaterialTopTabNavigator();
const WorkRegistrationScreen = (props) => {
	const navigation = useNavigation();
	const state = useContext(MainContext);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	function MyTabBar({ state, descriptors, navigation, position }) {
		return (
			<View style={{ flexDirection: "row", backgroundColor: MAIN_COLOR_GRAY, borderRadius: 5 }}>
				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const label =
						options.tabBarLabel !== undefined
							? options.tabBarLabel
							: options.title !== undefined
							? options.title
							: route.name;

					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: "tabLongPress",
							target: route.key
						});
					};

					return (
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarTestID}
							onPress={onPress}
							onLongPress={onLongPress}
							style={{
								flex: 1,
								backgroundColor: isFocused ? "#fff" : MAIN_COLOR_GRAY,
								textTransform: "none",
								borderRadius: 5,
								margin: 5,
								padding: 8
							}}
							key={index}
						>
							<Text style={{ alignSelf: "center", fontSize: 18 }}>{label}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	}
	return (
		<SafeAreaView
			style={{
				...StyleSheet.absoluteFillObject,
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser isShowNotif={true} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={{
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: "#2C2E45",
					height: 50,
					paddingHorizontal: 10
				}}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Бүтээлийн бүртгэл</Text>
			</TouchableOpacity>
			<View style={{ flex: 1, marginHorizontal: 20, marginTop: 10 }}>
				{/* <Tab.Navigator
					tabBar={(props) => <MyTabBar {...props} />}
					screenOptions={{ swipeEnabled: false }}
					sceneContainerStyle={{ backgroundColor: "#fff", paddingTop: 20 }}
				>
					<Tab.Screen name="Рейс" component={Tab1} />
					<Tab.Screen name="Гүйцэтгэл" component={Tab2} />
				</Tab.Navigator> */}
				<Tab1 />
			</View>
			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					setVisibleDialog(false);
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText="Тийм"
				DeclineBtnText="Үгүй"
				type={dialogType}
				screenOrientation={state.orientation}
			/>
		</SafeAreaView>
	);
};

export default WorkRegistrationScreen;

const styles = StyleSheet.create({});
