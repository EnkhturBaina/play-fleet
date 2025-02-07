import { StyleSheet, View, Modal, KeyboardAvoidingView, Platform } from "react-native";
import React, { useContext } from "react";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, MAIN_INPUT_HEIGHT } from "../constant";
import { Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import { TextInput } from "react-native-paper";

export default function (props) {
	const state = useContext(MainContext);

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.visibleDialog}
			onRequestClose={() => props.setVisibleDialog(false)}
		>
			<View
				style={{
					...StyleSheet.absoluteFillObject,
					backgroundColor: "rgba(0, 0, 0, 0.5)"
				}}
			/>
			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
				<View
					style={{
						width: "90%",
						paddingVertical: 20,
						backgroundColor: "#fff",
						borderRadius: 10,
						alignSelf: "center",
						top: 100,
						alignItems: "center"
					}}
				>
					<TextInput
						ref={props.inputRef}
						label="Компаний код"
						mode="outlined"
						style={[styles.generalInput, state.mainCompanyId ? { fontSize: 40 } : null]}
						dense={true}
						value={state.mainCompanyId}
						keyboardType="number-pad"
						onChangeText={(e) => {
							state.setMainCompanyId(e);
						}}
						theme={{
							colors: {
								primary: MAIN_COLOR
							},
							roundness: MAIN_BORDER_RADIUS
						}}
						maxLength={4}
					/>
					<View
						style={{
							width: "60%",
							flexDirection: "column",
							marginTop: 10
						}}
					>
						<Button
							containerStyle={{
								width: "100%"
							}}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10,
								height: MAIN_BUTTON_HEIGHT
							}}
							title="Хадгалах"
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() => props.setVisibleDialog(false)}
						/>
						<Button
							containerStyle={styles.dialogDeclineBtn}
							buttonStyle={{
								backgroundColor: "transparent",
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10,
								height: MAIN_BUTTON_HEIGHT
							}}
							title="Хаах"
							titleStyle={{
								fontWeight: "bold",
								color: "#000"
							}}
							onPress={() => props.setVisibleDialog(false)}
							radius={MAIN_BORDER_RADIUS}
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
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
		fontWeight: "600",
		textAlign: "center",
		alignSelf: "center",
		backgroundColor: "#fff"
	}
});
