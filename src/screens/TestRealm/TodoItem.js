import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useState } from "react";

export default function TodoItem({ todo, editable, onDeletePress, onUpdatePress }) {
	const [title, setTitle] = useState();

	const handleDeleteTodo = () => {
		onDeletePress(todo.id);
	};

	const handleUpdateTodo = () => {
		if (title) {
			onUpdatePress(todo.id, title);
		}
	};

	const handleChangeText = (text) => setTitle(text);

	useEffect(() => {
		setTitle(todo.title);
	}, [editable]);

	return (
		<View style={styles.container}>
			{editable ? (
				<TextInput
					style={styles.textInput}
					defaultValue={todo.title}
					placeholder="Todo Title"
					onChangeText={handleChangeText}
				/>
			) : (
				<Text>{`${todo.title}`}</Text>
			)}

			<View style={styles.rowContainer}>
				{editable ? (
					<Button title="Save" onPress={handleUpdateTodo} disabled={!title} />
				) : (
					<Button title="Delete" onPress={handleDeleteTodo} color="red" />
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	textInput: {
		borderWidth: 1,
		flex: 1,
		padding: 8,
		borderRadius: 8,
		borderColor: "gray"
	},

	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 16
	},

	rowContainer: {
		flexDirection: "row",
		gap: 8
	}
});
