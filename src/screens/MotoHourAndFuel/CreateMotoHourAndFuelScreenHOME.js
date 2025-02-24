import {
	StyleSheet,
	Text,
	View,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Keyboard,
	Platform,
	ScrollView,
	ActivityIndicator,
	BackHandler
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import LoanInput from "../../components/LoanInput";
import MainContext from "../../contexts/MainContext";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL } from "../../constant";
import { Button } from "@rneui/base";
import { addCommas, removeNonNumeric } from "../../helper/functions";
import axios from "axios";
import CustomDialog from "../../components/CustomDialog";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";

const CreateMotoHourAndFuelScreenHOME = (props) => {
	const state = useContext(MainContext);
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

	useEffect(() => {
		onToggleSnackBar("Таны ээлж дууслаа. Та Мото цагийн болон түлшний бүртгэл ээ оруулна уу.");
	}, []);

	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => true; // Prevents ANDROID back action

			BackHandler.addEventListener("hardwareBackPress", onBackPress);
			return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
		}, [])
	);

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
				await axios
					.post(
						`${SERVER_URL}/mobile/truck/fuel/save`,
						{
							PMSEquipmentId: state.selectedEquipment?.id,
							PMSShiftId: state.shiftData?.id,
							SavedDate: dayjs().format("YYYY-MM-DD"),
							StartSMU: startSMU,
							FinishSMU: finishSMU,
							Fuel: fuel,
							ProgressSMU: 0 // Дараа нь хасах
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${state.token}`
							}
						}
					)
					.then(function (response) {
						// console.log("save SMU response", JSON.stringify(response.data));
						if (response.data?.Type == 0) {
							setDialogType("success");
							setDialogBtnText("Үргэлжлүүлэх");
						} else {
							setDialogType("warning");
							setDialogBtnText("Хаах");
						}
						setVisibleDialog(true);
						setDialogText(response.data?.Msg);
					})
					.catch(function (error) {
						console.log("error save SMU", error.response.data);
					})
					.finally(async () => {
						setSavingSMU(false);
					});
			} catch (error) {
				console.log("CATCH save SMU", error);
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
				<CustomSnackbar
					visible={visibleSnack}
					dismiss={onDismissSnackBar}
					text={snackBarMsg}
					topPos={0}
					duration={3000}
				/>
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
						dialogType == "success" && state.logout();
					}}
					declineFunction={() => {
						setVisibleDialog(false);
					}}
					text={dialogText}
					confirmBtnText={dialogBtnText}
					DeclineBtnText=""
					type={dialogType}
					screenOrientation={state.orientation}
				/>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
};

export default CreateMotoHourAndFuelScreenHOME;

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingTop: 10
	}
});
