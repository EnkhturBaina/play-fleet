import { StyleSheet, Text, Image, View, FlatList, TouchableOpacity, TextInput } from "react-native";
import React, { useContext, useState } from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_COLOR_GRAY, MAIN_COLOR_RED, MAIN_INPUT_HEIGHT } from "../constant";
import { Dialog, Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import { Icon } from "@rneui/base";

export default function ({ visible, confirmFunction, declineFunction, text, confirmBtnText, DeclineBtnText, type }) {
	const state = useContext(MainContext);
	const [employeeId, setEmployeeId] = useState("");
	var imageType = null;
	if (type == "warning") {
		imageType = require("../../assets/warning.png");
	} else if (type == "error") {
		imageType = require("../../assets/checkmark.png");
	} else {
		imageType = require("../../assets/checkmark.png");
	}

	return (
		<Dialog
			isVisible={visible}
			overlayStyle={{
				padding: 10,
				paddingTop: 20,
				backgroundColor: "#fff",
				borderRadius: MAIN_BORDER_RADIUS,
				alignItems: "center",
				width: "90%"
			}}
		>
			<View style={{ width: "90%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
				<TextInput
					label="Компани ID"
					style={styles.generalInput}
					value={state.mainCompanyId}
					onChangeText={(e) => {
						state.setMainCompanyId(e);
					}}
					editable={false}
				/>
				<TouchableOpacity
					style={{
						height: 50,
						width: 50,
						justifyContent: "center",
						borderRadius: MAIN_BORDER_RADIUS
					}}
					onPress={() => {
						state.setMainCompanyId((prevText) => prevText.slice(0, prevText.length - 1));
					}}
				>
					<Icon name="backspace-outline" type="ionicon" size={30} />
				</TouchableOpacity>
			</View>
			<FlatList
				bounces={false}
				columnWrapperStyle={{
					justifyContent: "space-evenly"
				}}
				contentContainerStyle={{
					marginVertical: 5,
					width: "100%"
				}}
				data={[1, 2, 3, 4, 5, 6, 7, 8, 9, "x", 0, "login"]}
				renderItem={({ item }) => {
					if (item == "x") {
						return (
							<TouchableOpacity style={styles.numbers} onPress={() => state.setMainCompanyId("")}>
								<Icon name="x" type="feather" size={30} color={MAIN_COLOR_RED} />
							</TouchableOpacity>
						);
					}
					if (item == "login") {
						return (
							<TouchableOpacity
								style={[styles.numbers, { backgroundColor: "#FFF" }]}
								onPress={() => state.setMainCompanyId("")}
								disabled
							></TouchableOpacity>
						);
					}
					return (
						<TouchableOpacity style={styles.numbers} onPress={() => state.setMainCompanyId(state.mainCompanyId + item)}>
							<Text
								style={{
									color: "#000",
									fontSize: 24,
									fontWeight: "500"
								}}
							>
								{item}
							</Text>
						</TouchableOpacity>
					);
				}}
				numColumns={3}
				keyExtractor={(item, index) => index}
			/>
			<Dialog.Actions>
				<View
					style={{
						width: "100%",
						flexDirection: "column"
					}}
				>
					<View style={{ marginHorizontal: 50 }}>
						<Button
							containerStyle={{
								width: "100%"
							}}
							buttonStyle={{
								backgroundColor: MAIN_COLOR,
								borderRadius: MAIN_BORDER_RADIUS,
								paddingVertical: 10
							}}
							title={confirmBtnText}
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() => confirmFunction()}
						/>
					</View>
					{DeclineBtnText != "" ? (
						<Dialog.Button
							title={DeclineBtnText}
							onPress={() => declineFunction()}
							containerStyle={styles.dialogDeclineBtn}
							radius={MAIN_BORDER_RADIUS}
							titleStyle={{
								fontWeight: "bold",
								color: "#000"
							}}
						/>
					) : null}
				</View>
			</Dialog.Actions>
		</Dialog>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%"
	},
	dialogBtn: {
		marginBottom: 10,
		marginHorizontal: 50,
		backgroundColor: MAIN_COLOR
	},
	dialogDeclineBtn: {
		marginHorizontal: 50,
		marginVertical: 5
	},
	generalInput: {
		width: "50%",
		backgroundColor: "#fff",
		padding: 0,
		height: MAIN_INPUT_HEIGHT,
		fontSize: 18,
		textAlign: "center",
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		borderColor: MAIN_COLOR
	},
	numbers: {
		flexDirection: "column",
		margin: 4,
		width: "25%",
		height: 60,
		backgroundColor: MAIN_COLOR_GRAY,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: MAIN_BORDER_RADIUS
	}
});
