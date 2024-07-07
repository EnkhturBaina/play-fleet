import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import HeaderUser from "../../components/HeaderUser";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY } from "../../constant";
import CustomDialog from "../../components/CustomDialog";

const MotoHoursAndFuelScreen = (props) => {
	const navigation = useNavigation();

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

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
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Мото цагийн болон түлшний бүртгэл</Text>
			</TouchableOpacity>
			<View style={{ flex: 1, paddingHorizontal: 20, marginTop: 10 }}>
				<Button
					buttonStyle={{
						backgroundColor: MAIN_COLOR,
						borderRadius: MAIN_BORDER_RADIUS,
						height: MAIN_BUTTON_HEIGHT
					}}
					title="Бүртгэл нэмэх"
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => navigation.navigate("CreateMotoHourAndFuelScreen")}
					style={{ alignSelf: "flex-end" }}
				/>
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

export default MotoHoursAndFuelScreen;

const styles = StyleSheet.create({});
