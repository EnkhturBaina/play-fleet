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
import EmployeeLoginResponse from "../temp_data/EmployeeLoginResponse.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchData, saveLoginDataWithClear } from "../helper/db";
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
			state.logout();
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
		if (state.dispId == null) {
			setLoginError("Операторын код оруулна уу.");
		} else if (state.mainCompanyId == null) {
			setLoginError("Компаний код оруулаагүй байна.");
		} else {
			setLoadingLoginAction(true);
			setLoginError(null);
			console.log("state.mainCompanyId", state.mainCompanyId);

			await axios
				.post(
					`${SERVER_URL}operator/login`,
					{
						PMSCompanyId: state.mainCompanyId,
						PIN: state.dispId
					},
					{
						headers: {
							"Content-Type": "application/json"
						}
					}
				)
				.then(async (response) => {
					console.log("response", JSON.stringify(response.data));
					if (response.data.Type == 1) {
						setLoginError(response.data.Msg);
					} else {
						if (response.data?.Extra?.access_token) {
							//Local storage руу access_token хадгалах
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
										console.log("insert Login Data =>", e);
										setLoginError(e);
										if (e !== "DONE") {
										} else if (e === "DONE") {
											console.log("LOGIN SUCCESS");
										}
									});
								});
						}
					}
				})
				.catch(function (error) {
					console.error("Error loading local JSON:", error);
				})
				.finally(() => {
					setLoadingLoginAction(false);
				});
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
						openModal();
					}}
					delayLongPress={500}
					activeOpacity={1}
				>
					<Image style={styles.loginImg} source={require("../../assets/mainLogo.png")} contentFit="contain" />
				</TouchableOpacity>
				{loginError != null ? <Text style={styles.loginErrorText}>{loginError}</Text> : null}
				<TextInput
					label="Операторын код"
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
	stackSection: {
		width: "100%",
		flexDirection: "column",
		justifyContent: "space-between",
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
	stackSection3: {
		width: "80%",
		alignItems: "center",
		marginRight: "auto",
		marginLeft: "auto"
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
