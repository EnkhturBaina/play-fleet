import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Button } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../../constant";
import { useNavigation } from "@react-navigation/native";

const Tab1 = (props) => {
	const navigation = useNavigation();
	return (
		<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
			<Text>Рейсийн түүх /20/</Text>
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
				onPress={() => navigation.navigate("CreateReisScreen")}
			/>
		</View>
	);
};

export default Tab1;

const styles = StyleSheet.create({});
