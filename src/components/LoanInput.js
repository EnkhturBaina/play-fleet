import { StyleSheet, Text, View, TextInput } from "react-native";
import React from "react";
import { FONT_FAMILY_LIGHT, MAIN_COLOR_GRAY } from "../constant";

const LoanInput = (props) => {
	return (
		<View>
			<Text style={styles.label}>{props.label}</Text>
			<TextInput
				{...props}
				autoCapitalize="none"
				autoCorrect={false}
				returnKeyType="done"
				style={[styles.generalInput, { backgroundColor: !props.disabled ? "#fff" : MAIN_COLOR_GRAY }]}
				editable={!props.disabled}
				selectTextOnFocus={false}
			/>
		</View>
	);
};

export default LoanInput;

const styles = StyleSheet.create({
	generalInput: {
		paddingLeft: 15,
		paddingRight: 10,
		backgroundColor: "#fff",
		marginBottom: 5,
		height: 40,
		borderRadius: 8,
		fontFamily: FONT_FAMILY_LIGHT,
		borderWidth: 1,
		borderColor: MAIN_COLOR_GRAY,
		color: "#000"
	},
	label: {
		fontWeight: "bold",
		padding: 5
	}
});
