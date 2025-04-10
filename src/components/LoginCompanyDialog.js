import React, { useContext, useState } from "react";
import {
	Modal,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	Text,
	useColorScheme
} from "react-native";
import { Button } from "@rneui/themed";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainContext from "../contexts/MainContext";
import {
	MAIN_COLOR,
	MAIN_BORDER_RADIUS,
	MAIN_BUTTON_HEIGHT,
	MAIN_INPUT_HEIGHT,
	DARK_MODE_BG,
	DARK_MODE_INPUT_BG
} from "../constant";
import { OrientationContext } from "../helper/OrientationContext";

export default function (props) {
	const state = useContext(MainContext);
	const orientation = useContext(OrientationContext);
	const scheme = useColorScheme();
	const [errorMsg, setErrorMsg] = useState(null);

	const setCompanyIdToLocal = async () => {
		if (state.mainCompanyId == null || state.mainCompanyId == "") {
			setErrorMsg("Компаний код оруулна уу.");
		} else {
			await AsyncStorage.setItem("L_main_company_id", state.mainCompanyId).then(() => {
				setErrorMsg(null);
				props.setVisibleDialog(false);
			});
		}
	};

	// Close modal on clicking outside
	const handleModalBackgroundPress = () => {
		props.setVisibleDialog(false);
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.visibleDialog}
			onRequestClose={() => props.setVisibleDialog(false)}
		>
			<TouchableOpacity style={styles.modalBackground} onPress={handleModalBackgroundPress} activeOpacity={1} />

			<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
				<View
					style={{
						...styles.modalContainer,
						width: orientation === "PORTRAIT" ? "80%" : "40%",
						top: "30%",
						// backgroundColor: scheme == "light" ? "#fff" : DARK_MODE_BG
						backgroundColor: "#fff"
					}}
				>
					<TextInput
						ref={props.inputRef}
						label="Компаний код"
						mode="outlined"
						style={[
							styles.generalInput,
							{
								fontSize: state.mainCompanyId ? 40 : null,
								// backgroundColor: scheme == "light" ? "#fff" : DARK_MODE_INPUT_BG
								backgroundColor: "#fff"
							}
						]}
						dense={true}
						value={state.mainCompanyId}
						keyboardType="number-pad"
						onChangeText={(e) => state.setMainCompanyId(e)}
						theme={{
							colors: {
								primary: MAIN_COLOR
							},
							roundness: MAIN_BORDER_RADIUS
						}}
						maxLength={6}
					/>

					{errorMsg != null ? <Text style={styles.errorTextStyle}>{errorMsg}</Text> : null}
					<View style={styles.buttonContainer}>
						<Button
							containerStyle={styles.fullWidthButton}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10,
								height: MAIN_BUTTON_HEIGHT
							}}
							title="Хадгалах"
							titleStyle={{ fontSize: 16, fontWeight: "bold" }}
							onPress={setCompanyIdToLocal}
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
								// color: scheme == "light" ? "#000" : "#fff"
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
	modalBackground: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)" // Semi-transparent background to create the blur effect
	},
	modalContainer: {
		paddingVertical: 20,
		borderRadius: 10,
		alignSelf: "center",
		alignItems: "center"
	},
	generalInput: {
		width: "80%",
		height: MAIN_INPUT_HEIGHT,
		padding: 0,
		fontWeight: "600",
		textAlign: "center",
		alignSelf: "center",
		backgroundColor: "#fff"
	},
	buttonContainer: {
		width: "80%",
		flexDirection: "column",
		marginTop: 10
	},
	fullWidthButton: {
		width: "100%"
	},
	dialogDeclineBtn: {
		marginHorizontal: 50,
		marginVertical: 5
	},
	errorTextStyle: {
		width: "100%",
		textAlign: "center",
		color: "red",
		fontWeight: "600",
		marginTop: 10,
		marginBottom: 5
	}
});
