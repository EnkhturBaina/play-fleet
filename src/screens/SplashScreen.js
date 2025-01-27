import { StyleSheet, View, LogBox, Text } from "react-native";
import React, { useContext, useEffect, useRef } from "react";
import LottieView from "lottie-react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import MainContext from "../contexts/MainContext";

if (__DEV__) {
	const ignoreWarns = [
		"EventEmitter.removeListener",
		"[fuego-swr-keys-from-collection-path]",
		"Setting a timer for a long period of time",
		"ViewPropTypes will be removed from React Native",
		"AsyncStorage has been extracted from react-native",
		"exported from 'deprecated-react-native-prop-types'.",
		"Non-serializable values were found in the navigation state.",
		"VirtualizedLists should never be nested inside plain ScrollViews"
	];

	const warn = console.warn;
	console.warn = (...arg) => {
		for (const warning of ignoreWarns) {
			if (arg[0].startsWith(warning)) {
				return;
			}
		}
		warn(...arg);
	};

	LogBox.ignoreLogs(ignoreWarns);
}
const SplashScreen = () => {
	const state = useContext(MainContext);
	const animation = useRef(null);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: "#fff",
				alignItems: "center",
				justifyContent: "center"
			}}
		>
			<Image
				style={{ width: "70%", height: "50%" }}
				// source={talent_logo}
				source={require("../../assets/mainLogo.png")}
				contentFit="contain"
			/>
			<LottieView
				autoPlay
				ref={animation}
				style={{
					width: 100,
					height: 100,
					backgroundColor: "transparent"
				}}
				source={require("../../assets/loader.json")}
			/>
			{state.isCheckingUpdate ? null : (
				<>
					<Text>{state.updateAvailable ? "Шинэчлэл хийж байна." : "Шинэчлэл шалгаж байна."}</Text>
				</>
			)}
			{state.checkMsg ? <Text>{state.checkMsg}</Text> : null}
			<Text>v{Constants.expoConfig.version}</Text>
		</View>
	);
};

export default SplashScreen;

const styles = StyleSheet.create({});
