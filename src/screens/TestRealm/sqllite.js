import * as SQLite from "expo-sqlite";

//Connection is initialised globally
const db = SQLite.openDatabaseAsync("myDatabase.db");

/**
 * If you have a existing database this is where you would import it,
 * otherwise this is where you would create tables and seed DB.
 */
export function initDatabase(db) {
	db.execAsync((tx) => {
		tx.executeSql("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT);");
	});
}

export default db;
