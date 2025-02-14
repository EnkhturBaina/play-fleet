import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useContext, useEffect, useRef } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainContext from "../../contexts/MainContext";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR } from "../../constant";
import { formatTime } from "../../helper/functions";

export default function (props) {
	const state = useContext(MainContext);
	const animatedValue = useRef(new Animated.Value(1)).current;

	const handleSheetChanges = useCallback((index) => {
		console.log("handleSheetChanges", index);
	}, []);

	const BOTTOM_SHEET_MENU_LIST = [
		{ id: "1", label: "АЧААЛАГДАХ /СЭЛГЭЭ ХИЙХ/", img: require("../../../assets/images/Picture4.png") },
		{ id: "2", label: "АЧААТАЙ ЧИГЛЭЛД ТЭЭВЭРЛЭХ", img: require("../../../assets/images/Picture5.png") },
		{ id: "3", label: "АЧАА БУУЛГАХ /СЭЛГЭЭ ХИЙХ/", img: require("../../../assets/images/Picture7.png") },
		{ id: "4", label: "ХООСОН БУЦАХ", img: require("../../../assets/images/Picture8.png") },
		{ id: "5", label: "АЧИЛТ ХИЙЛГЭХЭЭР ХҮЛЭЭХ", img: require("../../../assets/images/Picture9.png") }
	];
	const BOTTOM_SHEET_MENU_LIST2 = [
		{ id: "1", label: "Ажиллаж буй (W2)", img: require("../../../assets/images/Picture4.png") },
		{ id: "2", label: "Зогссон (DC)", img: require("../../../assets/images/Picture5.png") }
	];

	useEffect(() => {
		// console.log("state", state.);

		if (state.seconds == 3) {
			if (1 == 1) {
				Animated.loop(
					Animated.sequence([
						Animated.timing(animatedValue, {
							toValue: 0.5,
							duration: 500,
							useNativeDriver: true
						}),
						Animated.timing(animatedValue, {
							toValue: 1,
							duration: 500,
							useNativeDriver: true
						})
					])
				).start();
			} else {
				animatedValue.setValue(1); // Эхлэл төлөвт буцаана
			}
		}
	}, [state.seconds]);

	const handlePress = (id) => {
		animatedValue.setValue(1);
		state.handleReset();
		state.handleStart();
		//setSelectedId(id === selectedId ? null : id); // Дахин дарахад анивчилтыг зогсооно
	};
	return (
		<BottomSheet ref={props.bottomSheetRef} snapPoints={[130, 500]} onChange={handleSheetChanges}>
			<BottomSheetView style={styles.contentContainer}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between"
					}}
				>
					<View
						style={{
							backgroundColor: MAIN_COLOR,
							borderRadius: 50,
							padding: 5,
							paddingHorizontal: 10,
							alignSelf: "flex-start"
						}}
					>
						<Text style={{ color: "#fff", fontSize: 20 }}>CОНГОГДСОН ТӨЛӨВ</Text>
					</View>
					<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 28 }}>{formatTime(state.seconds)}</Text>
				</View>
				<View style={styles.eachBottomList}>
					<Image source={require("../../../assets/images/Picture4.png")} style={{ height: 50, width: 50 }} />
					<Text
						style={{
							color: "#6287CA",
							fontSize: 22,
							flex: 1,
							marginLeft: 10,
							textAlign: "center",
							flexWrap: "wrap"
						}}
					>
						(S5) Бусад техникийн ослоос шалтгаалсан
					</Text>
				</View>
				<View
					style={{
						backgroundColor: MAIN_COLOR_GREEN,
						borderRadius: 50,
						padding: 5,
						paddingHorizontal: 10,
						alignSelf: "flex-start",
						marginTop: 10,
						marginBottom: 10
					}}
				>
					<Text style={{ color: "#fff", fontSize: 20 }}>БҮТЭЭЛТЭЙ АЖИЛЛАХ</Text>
				</View>
				<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
					{BOTTOM_SHEET_MENU_LIST.map((el) => {
						const borderColor =
							"2" === el.id
								? animatedValue.interpolate({
										inputRange: [0.5, 1],
										outputRange: [MAIN_COLOR, "#fff"]
								  })
								: "transparent";

						return (
							<TouchableOpacity
								style={[styles.eachBottomList, { borderWidth: 3, borderColor }]}
								key={el.id}
								onPress={() => handlePress(el.id)}
							>
								<Image source={el.img} style={{ height: 50, width: 50 }} />
								<Text style={styles.menuText}>{el.label}</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</BottomSheetView>
		</BottomSheet>
	);
}
const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		marginHorizontal: 20
	},
	eachBottomList: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: MAIN_COLOR_GRAY,
		borderRadius: MAIN_BORDER_RADIUS,
		marginTop: 10,
		padding: 5,
		height: 60
	}
});
