import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import HeaderUser from "../components/HeaderUser";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY } from "../constant";
import CustomDialog from "../components/CustomDialog";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();
const WorkRegistrationScreen = (props) => {
	const navigation = useNavigation();

	const [selectedTab, setSelectedTab] = useState("Рейс");
	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	const TABS = [
		{
			label: "Рейс"
		},
		{
			label: "Гүйцэтгэл"
		}
	];

	const TabComp = () => {
		return <Text>XXXXXXX</Text>;
	};
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
			<HeaderUser />
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
			<View style={{ flex: 1 }}>
				<Tab.Navigator
					initialRouteName={"Рейс"}
					screenOptions={{
						swipeEnabled: false,
						tabBarAndroidRipple: {
							color: "transparent"
						},
						tabBarLabelStyle: {
							width: "100%",
							textTransform: "none"
						},
						tabBarStyle: {
							backgroundColor: MAIN_COLOR_GRAY
						},
						tabBarIndicatorStyle: {
							height: 0
						}
					}}
					sceneContainerStyle={{
						backgroundColor: "#fff",
						marginTop: 10
					}}
					style={{
						backgroundColor: "#fff"
					}}
				>
					{TABS.map((el, index) => {
						return (
							<Tab.Screen
								key={index}
								name={el.label}
								component={TabComp}
								listeners={{
									focus: (e) => {},
									tabPress: (e) => {
										var tabName = e.target.split("-")?.[0];
										console.log("tabName", tabName);
										setSelectedTab(tabName);
									}
								}}
								options={{
									tabBarContentContainerStyle: {
										backgroundColor: "blue"
									},
									tabBarItemStyle: {
										backgroundColor: el.label == selectedTab ? "red" : "green",
										margin: 5
									},
									animationEnabled: false,
									tabBarLabel: ({ focused }) => (
										<View
											style={{
												width: "100%"
											}}
										>
											<Text
												style={[
													styles.typeText,
													{
														fontSize: el.label == selectedTab ? 18 : 14
													}
												]}
											>
												{el.label}
											</Text>
										</View>
									)
								}}
							/>
						);
					})}
				</Tab.Navigator>
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
			/>
		</SafeAreaView>
	);
};

export default WorkRegistrationScreen;

const styles = StyleSheet.create({});
