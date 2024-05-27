import {
	Image,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Linking
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Icon, CheckBox, Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import CustomSnackbar from "../components/CustomSnackbar";
import { TextInput } from "react-native-paper";
import { MAIN_COLOR, MAIN_BORDER_RADIUS, SERVER_URL } from "../constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
import * as Location from "expo-location";
import * as LocalAuthentication from "expo-local-authentication";

const LoginScreen = (props) => {
	const state = useContext(MainContext);
	const [isBiometricSupported, setIsBiometricSupported] = useState(false);
	const [hidePassword, setHidePassword] = useState(true);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");

	const regex_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

	const [loadingAction, setLoadingAction] = useState(false);
	const [loadingActionReset, setLoadingActionReset] = useState(false);
	useEffect(() => {
		(async () => {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			setIsBiometricSupported(compatible);

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

	const checkHandleUseBiometric = () => {
		state.setIsUseBiometric(!state.isUseBiometric);
	};

	const hideShowPassword = () => {
		setHidePassword(!hidePassword);
	};

	// var tempUUID = uuidv4();

	const resetPassword = async () => {
		setLoadingActionReset(true);
		if (state.email == "") {
			onToggleSnackBar("И-мэйл хаягаа оруулна уу.");
		} else if (!regex_email.test(state.email)) {
			onToggleSnackBar("И-мэйл хаягаа зөв оруулна уу.");
		} else {
			await axios({
				method: "post",
				url: `${SERVER_URL}/send/recovery`,
				headers: {
					Authorization: `Bearer ${state.token}`
				},
				data: {
					email: state.email
				}
			})
				.then(async (response) => {
					// console.log("reset Password =====>", response.data);
					if (response.data?.Type == 0) {
						onToggleSnackBar(response.data.Msg);
						state.setLoginErrorMsg("");
					} else if (response.data?.Type == 1) {
						state.setLoginErrorMsg(response.data.Msg);
					} else if (response.data?.Type == 2) {
						state.setLoginErrorMsg(response.data.Msg);
					}
					setLoadingActionReset(false);
				})
				.catch(function (error) {
					setLoadingActionReset(false);
					if (!error.status) {
						// network error
						state.logout();
						state.setIsLoading(false);
						state.setLoginErrorMsg("Холболт салсан байна. reset");
					}
				});
		}
	};
	const login = async () => {
		console.log("A");
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
			<ScrollView contentContainerStyle={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
				<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={30} />

				<View style={styles.loginImageContainer}>
					<Image style={styles.loginImg} source={require("../../assets/mainLogo.png")} />
				</View>
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
				{/* loc_permission_fix */}
				{/* {state.locationStatus == "denied" ? (
          <Button
            disabled={loadingAction}
            containerStyle={{
              width: "80%",
              marginTop: 10,
              marginRight: "auto",
              marginLeft: "auto",
            }}
            buttonStyle={{
              backgroundColor: MAIN_COLOR,
              borderRadius: MAIN_BORDER_RADIUS,
              paddingVertical: 10,
            }}
            title="Тохиргоо хийх"
            titleStyle={{
              fontSize: 16,
              fontFamily: FONT_FAMILY_BOLD,
            }}
            onPress={() => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            }}
          />
        ) : null} */}
				<View style={styles.stackSection}>
					<TextInput
						label="И-мэйл"
						mode="outlined"
						style={styles.generalInput}
						dense={true}
						value={state.email}
						returnKeyType="done"
						keyboardType="email-address"
						onChangeText={(e) => {
							state.setEmail(e);
						}}
						theme={{
							fonts: {
								regular: {
									fontWeight: "bold"
								}
							},
							colors: {
								primary: MAIN_COLOR
							},
							roundness: MAIN_BORDER_RADIUS
						}}
					/>
					<View
						style={{
							width: "100%",
							marginRight: "auto",
							marginLeft: "auto",
							alignItems: "center"
						}}
					>
						<TextInput
							label="Нууц үг"
							mode="outlined"
							style={styles.generalInput}
							dense={true}
							value={state.password}
							returnKeyType="done"
							secureTextEntry={hidePassword}
							onChangeText={state.setPassword}
							theme={{
								fonts: {
									regular: {
										fontWeight: "bold"
									}
								},
								colors: {
									primary: MAIN_COLOR
								},
								roundness: MAIN_BORDER_RADIUS
							}}
						/>
						<TouchableOpacity style={styles.imageStyle} onPress={() => hideShowPassword()}>
							<Icon name={hidePassword ? "eye" : "eye-closed"} type="octicon" />
						</TouchableOpacity>
					</View>
				</View>
				<View style={styles.stackSection2}>
					<CheckBox
						containerStyle={styles.customCheckBox}
						textStyle={{
							fontWeight: "normal",
							marginLeft: 5,
							fontSize: 12,
							fontWeight: "bold"
						}}
						title={isBiometricSupported ? "FaceID ашиглах" : "И-мэйл сануулах"}
						iconType="material-community"
						checkedIcon="checkbox-outline"
						uncheckedIcon="checkbox-blank-outline"
						checked={state.isUseBiometric}
						onPress={checkHandleUseBiometric}
						checkedColor={MAIN_COLOR}
						uncheckedColor={MAIN_COLOR}
					/>
					<TouchableOpacity
						onPress={() => resetPassword()}
						disabled={loadingActionReset}
						style={{ flexDirection: "row" }}
					>
						<Text
							style={{
								textDecorationLine: "underline",
								fontSize: 12,
								fontWeight: "bold"
							}}
						>
							Нууц үг сэргээх
						</Text>
						{loadingActionReset ? <ActivityIndicator style={{ marginLeft: 5 }} color="#000" /> : null}
					</TouchableOpacity>
				</View>
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
							paddingVertical: 10
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
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#fff"
	},
	loginImageContainer: {
		height: 350,
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
		height: 150,
		resizeMode: "contain",
		marginTop: "30%"
	},
	generalInput: {
		width: "80%",
		// height: 40,
		backgroundColor: "#fff",
		marginTop: 10,
		padding: 0
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
		marginLeft: "auto",
		marginTop: 10
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
