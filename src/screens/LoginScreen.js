import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import CustomSnackbar from "../components/CustomSnackbar";
import { MAIN_COLOR, MAIN_BORDER_RADIUS, MAIN_INPUT_HEIGHT, MAIN_BUTTON_HEIGHT, SERVER_URL } from "../constant";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchLoginData, saveLoginDataWithClear } from "../helper/db";
import { useNetworkStatus } from "../contexts/NetworkContext";
import { TextInput } from "react-native-paper";
import LoginCompanyDialog from "../components/LoginCompanyDialog";
import axios from "axios";

const LoginScreen = (props) => {
	const state = useContext(MainContext);
	const { isConnected } = useNetworkStatus();
	const inputRef = useRef(null);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState(null);

	const [loadingLoginAction, setLoadingLoginAction] = useState(false);
	const [loginError, setLoginError] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах

	useEffect(() => {
		state.detectOrientation();
		if (!isConnected) {
			setLoginError("Интернэт холболт шалгана уу?");
			// state.logout();
		}
	}, []);

	const openModal = () => {
		setVisibleDialog(true);
		setTimeout(() => {
			inputRef.current?.focus(); // Focus on the TextInput after the modal opens
		}, 100); // Small delay to ensure the modal renders first
	};

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const login = async () => {
		if (!state.dispId) {
			setLoginError("Операторын код оруулна уу.");
			return;
		}
		if (!state.mainCompanyId) {
			setLoginError("Компаний код оруулаагүй байна.");
			return;
		}

		setLoadingLoginAction(true);
		setLoginError(null);

		try {
			const response = await axios.post(
				`${SERVER_URL}/mobile/operator/login`,
				{
					// CompanyCode: state.mainCompanyId,
					CompanyCode: 100012,
					PIN: state.dispId
				},
				{
					headers: {
						"Content-Type": "application/json"
					}
				}
			);

			console.log("response", JSON.stringify(response.data));

			if (response.data.Type === 1) {
				setLoginError(response.data.Msg);
				return;
			}

			const accessToken = response.data?.Extra?.access_token;
			if (accessToken) {
				state.setToken(accessToken);
				// login response -г SQLite руу хадгалах
				const saveResult = await saveLoginDataWithClear(response.data.Extra, true);
				// console.log("insert Login Data =>", saveResult);

				if (saveResult === "DONE") {
					console.log("LOGIN SUCCESS");

					const responseOfflineLoginData = await fetchLoginData();
					console.log("Fetched Login Data:", JSON.stringify(responseOfflineLoginData));

					// Login response -с state үүд салгаж хадгалах
					state.setEmployeeData(responseOfflineLoginData?.employee[0]);
					state.setCompanyData(responseOfflineLoginData?.company[0]);
					state.setRosterData(responseOfflineLoginData?.roster[0]);
					state.setEquipmentsData(responseOfflineLoginData?.equipments);
					state.setProjectData(responseOfflineLoginData?.project[0]);
					state.setShiftData(responseOfflineLoginData?.shift[0]);

					// Local storage руу access_token хадгалах
					await AsyncStorage.setItem("L_access_token", accessToken);

					if (responseOfflineLoginData?.company[0]?.id) {
						state.getReferencesService(responseOfflineLoginData?.company[0]?.id, accessToken, true);
					}
				} else {
					setLoginError("Өгөгдөл хадгалахад алдаа гарлаа.");
				}
			}
		} catch (error) {
			console.error("Алдаа гарлаа login:", error);
			setLoginError("Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.");
		} finally {
			setLoadingLoginAction(false);
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
						setVisibleDialog(true);
						openModal();
					}}
					delayLongPress={500}
					activeOpacity={1}
				>
					<Image style={styles.loginImg} source={require("../../assets/mainLogo.png")} contentFit="contain" />
				</TouchableOpacity>
				{loginError != null ? <Text style={styles.loginErrorText}>{loginError}</Text> : null}
				<TextInput
					label="Операторын код."
					mode="outlined"
					style={[
						styles.generalInput,
						{
							width: state.orientation == "PORTRAIT" ? "80%" : "40%",
							fontSize: state.dispId ? 40 : null
						}
					]}
					dense={true}
					value={state.dispId}
					returnKeyType="done"
					keyboardType="number-pad"
					onChangeText={(e) => {
						state.setDispId(e);
					}}
					theme={{
						colors: {
							primary: MAIN_COLOR
						},
						roundness: MAIN_BORDER_RADIUS
					}}
					maxLength={4}
				/>
				<Button
					disabled={loadingLoginAction}
					containerStyle={{
						width: state.orientation == "PORTRAIT" ? "80%" : "40%",
						marginTop: 10,
						alignSelf: "center"
					}}
					buttonStyle={styles.loginBtnStyle}
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
							{loadingLoginAction ? <ActivityIndicator style={{ marginLeft: 10 }} color="#fff" /> : null}
						</>
					}
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => login()}
				/>
				<LoginCompanyDialog setVisibleDialog={setVisibleDialog} visibleDialog={visibleDialog} inputRef={inputRef} />
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
	loginImg: {
		width: 200,
		height: 100
	},
	generalInput: {
		width: "80%",
		height: MAIN_INPUT_HEIGHT,
		fontWeight: "600",
		textAlign: "center",
		alignSelf: "center",
		backgroundColor: "#fff"
	},
	loginErrorText: {
		width: "100%",
		textAlign: "center",
		color: "red",
		fontWeight: "600",
		marginBottom: 10
	},
	loginBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		paddingVertical: 10,
		height: MAIN_BUTTON_HEIGHT
	}
});
