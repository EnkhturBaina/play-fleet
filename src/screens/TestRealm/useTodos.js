import * as SQLite from "expo-sqlite";
import { useState } from "react";

export function useTodos() {
	const [todos, setTodos] = useState([]);

	/**
	 * Whenever the todos table has mutated, we need to fetch the data set again order to sync DB -> UI State
	 */
	const fetchTodos = (tx) => {
		tx.executeSql("SELECT * FROM todos;", [], (_, { rows: { _array } }) => setTodos(_array));
	};

	const getTodos = (db) => {
		db.readTransaction(fetchTodos);
	};

	const addTodo = (db, title) => {
		db.transaction((tx) => {
			tx.executeSql("INSERT INTO todos (title) VALUES (?);", [title]);

			fetchTodos(tx);
		});
	};

	const updateTodo = (db, id, title) => {
		db.transaction((tx) => {
			tx.executeSql("UPDATE todos SET title = ? WHERE id = ?;", [title, id]);

			fetchTodos(tx);
		});
	};

	const deleteTodo = (db, id) => {
		db.transaction((tx) => {
			tx.executeSql("DELETE FROM todos WHERE id = ?;", [id]);

			fetchTodos(tx);
		});
	};

	return {
		todos,
		getTodos,
		addTodo,
		updateTodo,
		deleteTodo
	};
}
