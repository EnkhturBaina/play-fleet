import { StyleSheet, View, TextInput } from "react-native";
import React, { useContext } from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_INPUT_HEIGHT } from "../constant";
import { Dialog, Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";

export default function ({ visible, confirmFunction, declineFunction, text, confirmBtnText, DeclineBtnText, type }) {
	const state = useContext(MainContext);
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
				paddingTop: 20,
				backgroundColor: "#fff",
				borderRadius: MAIN_BORDER_RADIUS,
				alignItems: "center",
				width: "90%"
			}}
		>
			<TextInput
				// label="Компани ID"
				style={styles.generalInput}
				value={state.mainCompanyId}
				onChangeText={(e) => {
					state.setMainCompanyId(e);
				}}
				placeholder="_ _ _ _ _ _"
				maxLength={6}
				keyboardType="number-pad"
				returnKeyType="done"
			/>
			<Dialog.Actions>
				<View
					style={{
						width: "60%",
						flexDirection: "column",
						marginTop: 10
					}}
				>
					<View style={{}}>
						<Button
							containerStyle={{
								width: "100%"
							}}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10,
								height: 50
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
							buttonStyle={{ height: 50 }}
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
	dialogDeclineBtn: {
		marginHorizontal: 50,
		marginVertical: 5
	},
	generalInput: {
		width: "80%",
		// height: 40,
		padding: 0,
		height: MAIN_INPUT_HEIGHT,
		fontSize: 40,
		fontWeight: "600",
		textAlign: "center",
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		borderColor: MAIN_COLOR,
		letterSpacing: "6",
		alignSelf: "center"
	}
});
