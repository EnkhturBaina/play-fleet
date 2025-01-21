import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { deleteData, fetchData, insertLoginData, updateData } from "../helper/db";

const TestSQL = () => {
	const [offlineData, setOfflineData] = useState([]);
	return (
		<View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
			<Text>TestRealmScreen</Text>
			{/* <TodoList /> */}
			<TouchableOpacity
				onPress={() => {
					fetchData().then((e) => {
						console.log("fetchData", e);
					});
				}}
				style={styles.container}
			>
				<Text style={styles.text}>FETCH</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => {
					insertLoginData("Коффее", "zzz", "хаяг№", 23.12, 33.233);
				}}
				style={styles.container}
			>
				<Text style={styles.text}>INSERT</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => {
					updateData(3);
				}}
				style={styles.container}
			>
				<Text style={styles.text}>UPDATE</Text>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => {
					deleteData(1);
				}}
				style={styles.container}
			>
				<Text style={styles.text}>DELETE</Text>
			</TouchableOpacity>
		</View>
	);
};

export default TestSQL;

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
		padding: 10,
		backgroundColor: "blue",
		borderRadius: 10,
		width: 100
	},
	text: {
		color: "white",
		textAlign: "center"
	}
});
