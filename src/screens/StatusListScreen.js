import { StyleSheet, Text, View, SafeAreaView, StatusBar, Platform, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import HeaderUser from "../components/HeaderUser";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY } from "../constant";
import CustomDialog from "../components/CustomDialog";

const StatusListScreen = (props) => {
	const navigation = useNavigation();

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	const MENU_LIST = [
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S2) Хурал, уулзалт"
		},
		{
			label: "(S3) Оператор хангалтгүй"
		},
		{
			label: "(S4) Ачих техник байхгүй"
		},
		{
			label: "(S5) Бусад техникийн ослоос шалтгаалсан"
		},
		{
			label: "(S6) Цаг агаарын байдал"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		},
		{
			label: "(S1) Машины илүүдэл"
		}
	];
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
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Сул зогсолт</Text>
			</TouchableOpacity>
			<View style={{ flex: 1, backgroundColor: MAIN_COLOR_GRAY }}>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						marginHorizontal: 20,
						backgroundColor: "#fff"
					}}
					bounces={false}
					showsVerticalScrollIndicator={false}
				>
					{MENU_LIST?.map((el, index) => {
						return (
							<TouchableOpacity
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									padding: 15,
									borderBottomWidth: 1,
									borderBottomColor: "#ebebeb"
								}}
								key={index}
								onPress={() => setVisibleDialog(true)}
							>
								<Text style={{ width: "68%", color: MAIN_COLOR_BLUE }}>{el.label}</Text>
								<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
							</TouchableOpacity>
						);
					})}
				</ScrollView>
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

export default StatusListScreen;

const styles = StyleSheet.create({});
