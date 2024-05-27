import { StyleSheet, Text, View, StatusBar, Platform, ScrollView } from "react-native";
import React, { useContext, useState } from "react";
import HeaderUser from "../components/HeaderUser";
import Constants from "expo-constants";
import { Button } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_COLOR_GREEN, MAIN_COLOR_RED } from "../constant";
import MainContext from "../contexts/MainContext";

const CheckListScreen = () => {
	const state = useContext(MainContext);
	const [checkListData, setCheckListData] = useState([
		{
			key: 1,
			label: "КАБИН - АНХААРУУЛАХ БОЛОН ҮЙЛДЛИЙН ГЭРЛҮҮД",
			isChecked: false
		},
		{
			key: 2,
			label: "КАБИН - ХЯНАХ САМБАР БОЛОН ЗААГЧУУД",
			isChecked: false
		},
		{
			key: 3,
			label: "КАБИН - БҮХ УДИРДЛАГУУДЫН АЖИЛЛАГАА, ПЕДАЛИУД",
			isChecked: false
		},
		{
			key: 4,
			label: "КАБИН - ГЭРЭЛҮҮД БОЛОН ДУУТ ДОХИО",
			isChecked: true
		},
		{
			key: 5,
			label: "КАБИН - ШИЛ АРЧИГЧ, РЕЗИН",
			isChecked: true
		},
		{
			key: 6,
			label: "КАБИН – КАБИНЫ ГАДНА ХЭСЭГ, КАБИНЫ ЛАП",
			isChecked: false
		},
		{
			key: 7,
			label: "КАБИН – РАДИО СТАНЦ",
			isChecked: false
		},
		{
			key: 8,
			label: "КАБИН – СУУДАЛ, СУУДЛЫН БҮС, КАБИНЫ ДОТОРХ БҮРДЭЛ",
			isChecked: false
		},
		{
			key: 9,
			label: "КАБИН – ГАЛЫН ХОРНЫ БҮРДЭЛ, БЭХЭЛГЭЭ, СУУРЬ",
			isChecked: false
		},
		{
			key: 10,
			label: "КАБИН – КУНДАКТОРЫН ТҮЛХҮҮР, АЖИЛЛАГАА",
			isChecked: false
		},
		{
			key: 11,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН ТОСНЫ ТҮВШИН, ГООЖИЛТ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		},
		{
			key: 12,
			label: "ХӨДӨЛГҮҮР – ХӨДӨЛГҮҮРИЙН САПУНЫ ТАГ, ШҮБ",
			isChecked: false
		}
	]);
	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				paddingBottom: 20
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser />
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 10
				}}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				{checkListData?.map((el, index) => {
					return (
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								padding: 10,
								borderBottomWidth: 1,
								borderBottomColor: "#ebebeb"
							}}
							key={index}
						>
							<Text style={{ width: "68%" }}>{el.label}</Text>
							<Button
								containerStyle={{
									width: "28%",
									marginTop: 10
								}}
								buttonStyle={{
									backgroundColor: el.isChecked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
									paddingVertical: 10
								}}
								title={el.isChecked ? "ТЭНЦСЭН" : "ТЭНЦЭЭГҮЙ"}
								titleStyle={{
									fontSize: 14
								}}
								onPress={() => {
									const newData = [...checkListData];

									const index = newData.findIndex((item) => item.key === el.key);

									if (index !== -1) {
										newData[index] = { ...newData[index], isChecked: !el.isChecked };
										setCheckListData(newData);
									}
								}}
							/>
						</View>
					);
				})}
			</ScrollView>
			<Button
				containerStyle={{
					width: "100%",
					paddingHorizontal: 20,
					paddingTop: 10
				}}
				buttonStyle={{
					backgroundColor: MAIN_COLOR,
					paddingVertical: 10,
					borderRadius: MAIN_BORDER_RADIUS
				}}
				title="Болсон"
				titleStyle={{
					fontSize: 14
				}}
				onPress={() => {
					state.setCheckListDone(true);
				}}
			/>
		</View>
	);
};

export default CheckListScreen;

const styles = StyleSheet.create({});
