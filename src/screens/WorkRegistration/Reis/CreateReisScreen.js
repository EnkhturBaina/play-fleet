import {
	StyleSheet,
	Text,
	View,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
	Platform,
	ScrollView,
	TouchableOpacity
} from "react-native";
import React, { useContext, useState } from "react";
import CustomSnackbar from "../../../components/CustomSnackbar";
import LoanInput from "../../../components/LoanInput";
import MainContext from "../../../contexts/MainContext";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../../../constant";
import { Button, Icon } from "@rneui/base";
import { useHeaderHeight } from "@react-navigation/elements";
import { addCommas, removeNonNumeric } from "../../../helper/functions";

const CreateReisScreen = () => {
	const headerHeight = useHeaderHeight();
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
				keyboardVerticalOffset={headerHeight}
				style={{
					flex: 1,
					backgroundColor: "#fff"
				}}
			>
				<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={0} />
				<View style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
						<View style={styles.touchableSelectContainer}>
							<Text style={styles.title}>From Location</Text>
							<TouchableOpacity style={styles.touchableSelect} onPress={() => {}}>
								<Text
									style={{
										fontWeight: "b",
										flex: 1
									}}
									numberOfLines={1}
								>
									Сонгох
								</Text>

								<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
							</TouchableOpacity>
						</View>
						<View style={styles.touchableSelectContainer}>
							<Text style={styles.title}>To Location</Text>
							<TouchableOpacity style={styles.touchableSelect} onPress={() => {}}>
								<Text
									style={{
										fontWeight: "b",
										flex: 1
									}}
									numberOfLines={1}
								>
									Сонгох
								</Text>

								<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
							</TouchableOpacity>
						</View>
						<View style={styles.touchableSelectContainer}>
							<Text style={styles.title}>Elevation</Text>
							<TouchableOpacity style={styles.touchableSelect} onPress={() => {}}>
								<Text
									style={{
										fontWeight: "b",
										flex: 1
									}}
									numberOfLines={1}
								>
									Сонгох
								</Text>

								<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
							</TouchableOpacity>
						</View>
						<LoanInput label="Material" value={value} disabled />
						<View style={styles.touchableSelectContainer}>
							<Text style={styles.title}>Shot Name</Text>
							<TouchableOpacity style={styles.touchableSelect} onPress={() => {}}>
								<Text
									style={{
										fontWeight: "b",
										flex: 1
									}}
									numberOfLines={1}
								>
									Сонгох
								</Text>

								<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
							</TouchableOpacity>
						</View>
						<View style={styles.touchableSelectContainer}>
							<Text style={styles.title}>Loader</Text>
							<TouchableOpacity style={styles.touchableSelect} onPress={() => {}}>
								<Text
									style={{
										fontWeight: "b",
										flex: 1
									}}
									numberOfLines={1}
								>
									Сонгох
								</Text>

								<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
							</TouchableOpacity>
						</View>
						<LoanInput
							label="TruckCount"
							value={value}
							onChangeText={(e) => {
								setValue(addCommas(removeNonNumeric(e)));
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

export default CreateReisScreen;

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingTop: 10
	},
	touchableSelectContainer: {
		marginTop: 10
	},
	title: {
		fontWeight: "bold"
	},
	touchableSelect: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderColor: MAIN_COLOR,
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		height: 40,
		alignItems: "center",
		paddingVertical: 5,
		paddingLeft: 10,
		paddingRight: 5,
		alignSelf: "flex-start",
		width: "100%",
		marginTop: 5
	},
	dataContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "90%"
	}
});
