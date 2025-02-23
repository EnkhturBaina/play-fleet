import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainContext from "../../contexts/MainContext";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR } from "../../constant";
import { formatTime } from "../../helper/functions";

export default function (props) {
	const state = useContext(MainContext);
	const animatedValue = useRef(new Animated.Value(1)).current;
	const [stateParentId, setStateParentId] = useState(null);
	const [mainStates, setMainStates] = useState(null);
	const [selectedStateImage, setSelectedStateImage] = useState(null);

	const handleSheetChanges = useCallback((index) => {
		console.log("handleSheetChanges", index);
	}, []);

	const IMAGE_LIST = [
		{
			code: "Loading",
			img: require("../../../assets/images/Picture4.png")
		},
		{
			code: "Hauling",
			img: require("../../../assets/images/Picture5.png")
		},
		{
			code: "Dumping",
			img: require("../../../assets/images/Picture7.png")
		},
		{
			code: "Traveling",
			img: require("../../../assets/images/Picture8.png")
		},
		{
			code: "Queueing",
			img: require("../../../assets/images/Picture9.png")
		}
	];

	useEffect(() => {
		// 1. "W1" ActivityShort-той объектын ID-г авах
		const w1Item = state.refStates?.find((item) => item.ActivityShort === "W1");
		if (w1Item) {
			setStateParentId(w1Item.id);
		}

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

	useEffect(() => {
		if (stateParentId !== null) {
			const filteredData = state.refStates?.filter(
				(item) => item.PMSParentId === stateParentId && item.Type === state.selectedEquipmentCode && item.IsActive === 1
			);

			setMainStates(filteredData);
		}
	}, [stateParentId]);

	useEffect(() => {
		const filteredDefaultState = state.refStates?.filter(
			(item) => item.id === state.projectData?.PMSProgressStateId && item.IsActive === 1
		);

		state.setSelectedState(filteredDefaultState[0]);
	}, []);

	const selectState = (selectedState, selectedStateImage) => {
		animatedValue.setValue(1);
		state.handleReset();
		state.handleStart();
		state.setSelectedState(selectedState);
		setSelectedStateImage(selectedStateImage);

		//setSelectedId(id === selectedId ? null : id); // Дахин дарахад анивчилтыг зогсооно
	};

	return (
		<BottomSheet ref={props.bottomSheetRef} snapPoints={[135, 500]} onChange={handleSheetChanges}>
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
					<Image
						source={selectedStateImage ? selectedStateImage?.img : require("../../../assets/only_icon.png")}
						style={{ height: 50, width: 50 }}
					/>
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
						{state.selectedState ? state.selectedState?.Activity : "Төлөв сонгогдоогүй"}
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
					{mainStates &&
						mainStates?.map((el) => {
							const matchedImage = IMAGE_LIST.find((img) => img.code === el.ActivityShort);
							const borderColor =
								34 === el.id
									? animatedValue.interpolate({
											inputRange: [0.5, 1],
											outputRange: [MAIN_COLOR, "#fff"]
									  })
									: "transparent";

							return (
								<TouchableOpacity
									style={[styles.eachBottomList, { borderWidth: 3, borderColor }]}
									key={el.id}
									onPress={() => selectState(el, matchedImage)}
								>
									<Image
										source={matchedImage ? matchedImage?.img : require("../../../assets/only_icon.png")}
										style={{ height: 50, width: 50, marginRight: 5 }}
									/>
									<Text style={{}}>{el.Activity}</Text>
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
