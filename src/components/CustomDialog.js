import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR } from "../constant";
import { Dialog, Button } from "@rneui/themed";
import { Image } from "expo-image";

export default function ({ visible, confirmFunction, declineFunction, text, confirmBtnText, DeclineBtnText, type }) {
	var imageType = null;
	if (type == "warning") {
		imageType = require("../../assets/warning.png");
	} else if (type == "error") {
		imageType = require("../../assets/checkmark.png");
	} else {
		imageType = require("../../assets/checkmark.png");
	}

	return (
		<Dialog
			isVisible={visible}
			overlayStyle={{
				padding: 10,
				backgroundColor: "#fff",
				borderRadius: MAIN_BORDER_RADIUS,
				alignItems: "center"
			}}
		>
			<Image source={imageType} style={{ width: 100, height: 100 }} contentFit="contain" />
			<Text
				style={{
					fontWeight: "bold",
					textAlign: "center",
					marginVertical: 10
				}}
			>
				{text}
			</Text>
			<Dialog.Actions>
				<View
					style={{
						width: "100%",
						flexDirection: "column"
					}}
				>
					<View style={{ marginHorizontal: 50 }}>
						<Button
							containerStyle={{
								width: "100%"
							}}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10
							}}
							title={confirmBtnText}
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() => confirmFunction()}
						/>
					</View>
					{DeclineBtnText != "" ? (
						<Dialog.Button
							title={DeclineBtnText}
							onPress={() => declineFunction()}
							containerStyle={styles.dialogDeclineBtn}
							radius={MAIN_BORDER_RADIUS}
							titleStyle={{
								fontWeight: "bold",
								color: "#000"
							}}
						/>
					) : null}
				</View>
			</Dialog.Actions>
		</Dialog>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%"
	},
	dialogBtn: {
		marginBottom: 10,
		marginHorizontal: 50,
		backgroundColor: MAIN_COLOR
	},
	dialogDeclineBtn: {
		marginHorizontal: 50,
		marginVertical: 5
	}
});
