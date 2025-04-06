import {
	StyleSheet,
	Text,
	View,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
	Platform,
	ScrollView,
	ActivityIndicator
} from "react-native";
import React, { useContext, useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import LoanInput from "../../components/LoanInput";
import MainContext from "../../contexts/MainContext";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../../constant";
import { Button } from "@rneui/base";
import { addCommas, removeNonNumeric } from "../../helper/functions";
import CustomDialog from "../../components/CustomDialog";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { sendMotoHour } from "../../helper/apiService";
import { useNetworkStatus } from "../../contexts/NetworkContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrientationContext } from "../../helper/OrientationContext";

const CreateMotoHourAndFuelScreen = (props) => {
	const state = useContext(MainContext);
	const orientation = useContext(OrientationContext);
	const { isConnected } = useNetworkStatus();
	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");
	const [startSMU, setStartSMU] = useState(null);
	const [finishSMU, setFinishSMU] = useState(null);
	const [fuel, setFuel] = useState(null);

	const [savingSMU, setSavingSMU] = useState(false);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState(null); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text
	const [dialogBtnText, setDialogBtnText] = useState(null); //Dialog text

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const saveSMU = async () => {
		if (!startSMU) {
			onToggleSnackBar("Эхэлсэн мото.цаг оруулна уу.");
		} else if (!finishSMU) {
			onToggleSnackBar("Дууссан мото.цаг оруулна уу.");
		} else if (!fuel) {
			onToggleSnackBar("Түлш (литр) оруулна уу.");
		} else {
			try {
				setSavingSMU(true);

				const lastLogged = await AsyncStorage.getItem("L_last_logged");
				console.log("lastLogged", lastLogged);

				const response = await sendMotoHour(
					state.token,
					state.selectedEquipment,
					state.shiftData,
					`${lastLogged} ${dayjs().format("HH:mm")}`,
					parseInt(startSMU?.replaceAll(",", "")),
					parseInt(finishSMU?.replaceAll(",", "")),
					parseInt(fuel?.replaceAll(",", "")),
					0,
					isConnected,
					lastLogged
				);
				// console.log("SEND_MOTO_HOUR_RESPONSE=>", response);
				if (isConnected) {
					setDialogText(response?.Msg);
					if (response?.Type == 0) {
						setDialogType("success");
						setDialogBtnText("Хаах");
					} else {
						setDialogType("warning");
						setDialogBtnText("Хаах");
					}
				} else {
					if (response?.changes >= 1) {
						setDialogType("success");
						setDialogText("Түлшний мэдээлэл амжилттай хадгалагдлаа.");
						setDialogBtnText("Хаах");
					}
				}
				setVisibleDialog(true);
				setSavingSMU(false);
			} catch (error) {
				console.log("Error in stopProgressHandler:", error);
			}
		}
	};

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
						<LoanInput label="Төхөөрөмж" value={state.selectedEquipment?.Name} disabled />
						<LoanInput
							label="Эхэлсэн мото.цаг"
							value={startSMU}
							onChangeText={(e) => {
								setStartSMU(addCommas(removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<LoanInput
							label="Дууссан мото.цаг"
							value={finishSMU}
							onChangeText={(e) => {
								setFinishSMU(addCommas(removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<LoanInput
							label="Түлш (литр)"
							value={fuel}
							onChangeText={(e) => {
								setFuel(addCommas(removeNonNumeric(e)));
							}}
							keyboardType="number-pad"
						/>
						<Button
							disabled={savingSMU}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								height: MAIN_BUTTON_HEIGHT,
								marginTop: 10
							}}
							title={
								<>
									<Text
										style={{
											fontSize: 16,
											color: "#fff",
											fontWeight: "bold"
										}}
									>
										Хадгалах
									</Text>
									{savingSMU ? <ActivityIndicator style={{ marginLeft: 10 }} color="#fff" /> : null}
								</>
							}
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() => {
								saveSMU();
							}}
						/>
					</ScrollView>
				</View>

				<CustomDialog
					visible={visibleDialog}
					confirmFunction={() => {
						setVisibleDialog(false);
						dialogType == "success" && props.navigation.goBack();
					}}
					declineFunction={() => {
						setVisibleDialog(false);
					}}
					text={dialogText}
					confirmBtnText={dialogBtnText}
					DeclineBtnText=""
					type={dialogType}
					screenOrientation={orientation}
				/>
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
