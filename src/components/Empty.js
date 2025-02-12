import { StyleSheet, Text, View } from "react-native";
import React from "react";
import empty from "../../assets/empty.png";
import { Image } from "expo-image";

const Empty = ({ text }) => {
	return (
		<View style={{ flex: 1, alignItems: "center" }}>
			<Image source={empty} style={{ width: 200, height: 350 }} contentFit="contain" />
			<Text style={styles.emptyText}>{text}</Text>
		</View>
	);
};

export default Empty;

const styles = StyleSheet.create({
	emptyText: {
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 10
	}
});
