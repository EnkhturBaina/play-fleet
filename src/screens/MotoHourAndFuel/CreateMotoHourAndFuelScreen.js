import {
	StyleSheet,
	Text,
	View,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
	Platform,
	ScrollView
} from "react-native";
import React, { useContext, useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import LoanInput from "../../components/LoanInput";
import MainContext from "../../contexts/MainContext";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../../constant";
import { Button } from "@rneui/base";

const CreateMotoHourAndFuelScreen = () => {
	const state = useContext(MainContext);
	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");
	const [value, setValue] = useState("");
	const [value2, setValue2] = useState("");

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				behavior={Platform.OS == "ios" ? "padding" : ""}
				style={{
					flex: 1,
					backgroundColor: "#fff"
				}}
			>
				<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={0} />
				<View style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
						<LoanInput label="Equipment Name" value={value} disabled />
						<LoanInput
							label="Progress SMU (h)"
							value={value}
							onChangeText={(e) => {
								setValue(state.addCommas(state.removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<LoanInput
							label="Finish SMU (h)"
							value={value}
							onChangeText={(e) => {
								setValue(state.addCommas(state.removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<LoanInput
							label="Fuel (Litre)"
							value={value}
							onChangeText={(e) => {
								setValue(state.addCommas(state.removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<Button
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								height: MAIN_BUTTON_HEIGHT
							}}
							title="Хадгалах"
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() => {}}
						/>
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default CreateMotoHourAndFuelScreen;

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingTop: 10
	}
});
