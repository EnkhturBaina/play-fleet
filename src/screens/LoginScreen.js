import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	FlatList,
	TextInput
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Icon, CheckBox, Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import CustomSnackbar from "../components/CustomSnackbar";
import {
	MAIN_COLOR,
	MAIN_BORDER_RADIUS,
	SERVER_URL,
	MAIN_INPUT_HEIGHT,
	MAIN_BUTTON_HEIGHT,
	MAIN_COLOR_GRAY,
	MAIN_COLOR_RED
} from "../constant";
import axios from "axios";
import LoginCompanyDialog from "../components/LoginCompanyDialog";
import { Image } from "expo-image";
import EmployeeLoginResponse from "../temp_data/EmployeeLoginResponse.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchData, saveLoginDataWithClear } from "../helper/db";

const LoginScreen = (props) => {
	const state = useContext(MainContext);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");

	const [loadingLoginAction, setLoadingLoginAction] = useState(false);
	const [loginError, setLoginError] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	useEffect(() => {}, []);

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const login = async () => {
		setLoadingLoginAction(true);

		try {
			const response = {
				data: EmployeeLoginResponse,
				status: 200,
				statusText: "OK",
				headers: {},
				config: {},
				request: {}
			};
			// console.log("response", JSON.stringify(response));

			//Local storage руу access_token хадгалах
			if (response.data?.Extra?.access_token) {
				await AsyncStorage.setItem("access_token", response.data?.Extra?.access_token)
					.then(async (value) => {
						// Login response -с state үүд салгаж хадгалах
						state.setEmployeeData(response.data?.Extra?.employee);
						state.setCompanyData(response.data?.Extra?.employee?.company);
						state.setRosterData(response.data?.Extra?.employee?.roster);
						state.setEquipmentsData(response.data?.Extra?.employee?.equipments);
					})
					.finally(() => {
						// login response -г SQLite руу хадгалах
						saveLoginDataWithClear(response.data?.Extra, true).then((e) => {
							console.log("insert Login Data error =>", e);
							setLoginError(e);
							if (e !== "DONE") {
							} else if (e === "DONE") {
								console.log("LOGIN SUCCESS");
							}
						});
					});
			}
		} catch (error) {
			console.error("Error loading local JSON:", error);
		} finally {
			setLoadingLoginAction(false);
			fetchData();
			// state.setIsLoggedIn(true);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS == "ios" ? "padding" : ""}
			style={{
				flex: 1,
				flexDirection: "column"
			}}
		>
			<View style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled>
				<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={30} />
				<TouchableOpacity
					style={styles.loginImageContainer}
					onLongPress={() => {
						console.log("LONG PRESS");
						setVisibleDialog(true);
					}}
					delayLongPress={500}
					activeOpacity={1}
				>
					<Image style={styles.loginImg} source={require("../../assets/mainLogo.png")} contentFit="contain" />
				</TouchableOpacity>
				{loginError != null ? (
					<Text style={{ width: "100%", textAlign: "center", color: "red", fontWeight: "600", marginBottom: 10 }}>
						{loginError}
					</Text>
				) : null}
				{state.loginErrorMsg != "" ? (
					<Text
						style={{
							fontWeight: "bold",
							color: "red",
							textAlign: "center",
							marginHorizontal: 20
						}}
					>
						{state.loginErrorMsg}
					</Text>
				) : null}
				<TextInput
					style={styles.generalInput}
					value={state.dispId}
					onChangeText={(e) => {
						state.setDispId(e);
					}}
					placeholder="_ _ _ _"
					maxLength={4}
					keyboardType="number-pad"
					returnKeyType="done"
				/>
				<View style={styles.stackSection3}>
					<Button
						disabled={loadingLoginAction}
						containerStyle={{
							width: "100%",
							marginTop: 10
						}}
						buttonStyle={{
							backgroundColor: MAIN_COLOR,
							borderRadius: MAIN_BORDER_RADIUS,
							paddingVertical: 10,
							height: 50
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
									Нэвтрэх
								</Text>
								{loadingLoginAction ? <ActivityIndicator style={{ marginLeft: 5 }} color="#fff" /> : null}
							</>
						}
						titleStyle={{
							fontSize: 16,
							fontWeight: "bold"
						}}
						onPress={() => login()}
					/>
				</View>
				<LoginCompanyDialog
					visible={visibleDialog}
					confirmFunction={() => {
						setVisibleDialog(false);
					}}
					declineFunction={() => {
						setVisibleDialog(false);
					}}
					text={dialogText}
					confirmBtnText="Хадгалах"
					DeclineBtnText="Хаах"
					type={dialogType}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		justifyContent: "center"
	},
	loginImageContainer: {
		alignItems: "center"
	},
	stackSection: {
		width: "100%",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center"
	},
	loginImg: {
		width: 180,
		height: 150
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
		letterSpacing: "10",
		alignSelf: "center"
	},
	stackSection2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 10,
		width: "80%",
		marginRight: "auto",
		marginLeft: "auto"
	},
	stackSection3: {
		width: "80%",
		alignItems: "center",
		marginRight: "auto",
		marginLeft: "auto"
	},
	imageStyle: {
		position: "absolute",
		zIndex: 999,
		right: "15%",
		top: "45%"
	},
	customCheckBox: {
		padding: 0,
		margin: 0,
		marginLeft: 0,
		alignItems: "center"
	}
});
