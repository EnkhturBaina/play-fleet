import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_GRAY } from "../../constant";
import StatusMenu from "./StatusMenu";
import ConfigMenu from "./ConfigMenu";

const HomeScreenSideBarSUB = (props) => {
	return (
		<View>
			<TouchableOpacity style={styles.eachMenuContainer} onPress={() => props.setSideBarStep(1)}>
				<Icon name="chevron-left" type="feather" size={25} color={MAIN_COLOR} />
				<Text style={{ flex: 1, marginHorizontal: 10, color: MAIN_COLOR, fontSize: 18, fontWeight: "500" }}>Буцах</Text>
			</TouchableOpacity>
			{props.menuType === "STATUS" && <StatusMenu {...props} />}
			{props.menuType === "CONFIG" && <ConfigMenu {...props} />}
		</View>
	);
};

export default HomeScreenSideBarSUB;

const styles = StyleSheet.create({
	eachMenuContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: MAIN_COLOR_GRAY,
		borderBottomWidth: 1,
		paddingHorizontal: 10,
		height: 60
	}
});
