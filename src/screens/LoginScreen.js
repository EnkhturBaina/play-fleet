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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import LoginCompanyDialog from "../components/LoginCompanyDialog";
import { Image } from "expo-image";

const LoginScreen = (props) => {
	const state = useContext(MainContext);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");

	const [loadingAction, setLoadingAction] = useState(false);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	useEffect(() => {
		(async () => {
			await AsyncStorage.getItem("password").then(async (value) => {
				state.setPassword(value);
			});
		})();
	}, []);

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const login = async () => {
		state.setIsLoggedIn(true);
		// if (state.email == "") {
		// 	onToggleSnackBar("И-мэйл хаягаа оруулна уу.");
		// } else if (!regex_email.test(state.email)) {
		// 	onToggleSnackBar("И-мэйл хаягаа зөв оруулна уу.");
		// } else if (state.password == "") {
		// 	onToggleSnackBar("Нууц үг оруулна уу.");
		// }
		//loc_permission_fix
		// else if (state.locationStatus == "denied") {
		//   onToggleSnackBar("Байршлын тохиргоо зөвшөөрөгдөөгүй байна.");
		//   (async () => {
		//     let { status } = await Location.requestForegroundPermissionsAsync();
		//     state.setLocationStatus(status);
		//     // console.log("status", status);
		//     if (status !== "granted") {
		//       let { status } = await Location.requestForegroundPermissionsAsync();
		//       state.setLocationStatus(status);

		//       state.setLoginErrorMsg("Байршлын тохиргоо зөвшөөрөгдөөгүй байна.");
		//       state.setIsLoading(false);
		//       state.setIsLoggedIn(false);
		//       return;
		//     }
		//   })();
		//   setLoadingAction(false);
		// }
		// else {
		// setLoadingAction(true);
		// state.setIsLoading(true);
		// await axios({
		// 	method: "post",
		// 	url: `${SERVER_URL}/employee/mobile/login`,
		// 	data: {
		// 		email: state.email?.toLowerCase(),
		// 		password: state.password,
		// 		MobileUUID: state.uuid,
		// 		ExponentPushToken: state.expoPushToken
		// 	}
		// })
		// 	.then(async (response) => {
		// 		// console.log("RES", response.data);
		// 		if (response.data?.Type == 0) {
		// 			try {
		// 				state.setUserData(response.data.Extra?.user);
		// 				state.setToken(response.data.Extra?.access_token);
		// 				state.setHeaderUserName(response.data.Extra?.user.FirstName);
		// 				state.setUserId(response.data.Extra?.user?.id);
		// 				state.setCompanyId(response.data.Extra?.user?.GMCompanyId);
		// 				await AsyncStorage.setItem("password", state.password).then(async (value) => {
		// 					await AsyncStorage.setItem("user_mail", response.data.Extra?.user?.email).then(async (value) => {
		// 						//*****Login Хийсэн User -н Data -г Local Storage -д хадгалах
		// 						await AsyncStorage.setItem(
		// 							"user",
		// 							JSON.stringify({
		// 								token: response.data.Extra?.access_token,
		// 								user: response.data.Extra?.user,
		// 								userFirstName: response.data.Extra?.user.FirstName
		// 							})
		// 						).then(async (value) => {
		// 							if (state.isUseBiometric) {
		// 								//*****Biometric ашиглах CHECK хийгдсэн үед Local Storage -д хадгалах
		// 								await AsyncStorage.setItem("use_bio", "yes").then((value) => {
		// 									state.confirmBio(state.uuid);
		// 								});
		// 							} else {
		// 								//*****Biometric ашиглах CHECK хийгдээгүй үед Local Storage -д хадгалах
		// 								await AsyncStorage.setItem("use_bio", "no").then((value) => {
		// 									state.getUserUUID(
		// 										response.data.Extra?.user.email,
		// 										response.data.Extra?.access_token,
		// 										state.uuid,
		// 										response.data.Extra?.user?.id
		// 									);
		// 								});
		// 							}
		// 						});
		// 					});
		// 				});
		// 			} catch (e) {
		// 				console.log("e====>", e);
		// 			}
		// 			state.setLoginErrorMsg("");
		// 		} else if (response.data?.Type == 1) {
		// 			state.setLoginErrorMsg(response.data.Msg);
		// 			state.setIsLoading(false);
		// 		} else if (response.data?.Type == 2) {
		// 			state.setLoginErrorMsg(response.data.Msg);
		// 			state.setIsLoading(false);
		// 		}
		// 		setLoadingAction(false);
		// 	})
		// 	.catch(function (error) {
		// 		setLoadingAction(false);
		// 		state.setIsLoading(false);
		// 		if (error.code === "ERR_NETWORK") {
		// 			state.setLoginErrorMsg("Интернэт холболтоо шалгана уу.");
		// 		} else {
		// 			state.setLoginErrorMsg("Холболт салсан байна...");
		// 		}
		// 		state.logout();
		// 	});
		// }
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
						disabled={loadingAction}
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
								{loadingAction ? <ActivityIndicator style={{ marginLeft: 5 }} color="#fff" /> : null}
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
