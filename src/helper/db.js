import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("offline_data");

// 1. SQLite хүснэгт үүсгэх
export const createTable = async () => {
	console.log("RUN createTable");

	try {
		await db.execAsync(`
            CREATE TABLE IF NOT EXISTS places (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, imageUri TEXT NOT NULL, address TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL);
            `);
	} catch (error) {
		console.log("error createTable", error);
	}
};

// 2. Локал өгөгдлийг хадгалах функц
export const insertData = async (title, imageUri, address, lat, lng) => {
	console.log("title", title);

	const statement = await db.prepareAsync(
		"INSERT INTO places (title, imageUri, address, lat, lng) VALUES ($title, $imageUri, $address, $lat, $lng)"
	);
	console.log("insertData statement", statement);
};

// 3. Локал өгөгдлийг авах функц
export const fetchData = async () => {
	console.log("RUN fetchData");
	try {
		const allRows = await db.getAllAsync("SELECT * FROM places");
		console.log("allRows", allRows);
		return allRows;
	} catch (error) {
		console.log("error fetchData", error);
	}
};

// 4. Локал өгөгдлийг сервер рүү илгээх функц
export const syncDataToServer = async () => {
	db.transaction((tx) => {
		tx.executeSql(
			"SELECT * FROM local_data;",
			[],
			async (_, { rows }) => {
				const data = rows._array;
				console.log("Offline data:", data);

				// Датаг нэг бүрчлэн сервер рүү илгээх
				for (let item of data) {
					try {
						const response = await fetch("https://your-server.com/api", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: item.data
						});

						if (response.ok) {
							// Амжилттай илгээгдсэн бол SQLite доторх датаг устгах
							deleteData(item.id);
						} else {
							console.error("Failed to sync data:", item);
						}
					} catch (error) {
						console.error("Error syncing data:", error);
					}
				}
			},
			(_, error) => console.error("Error fetching data for sync:", error)
		);
	});
};

// 5. Локал өгөгдлийг устгах функц
export const deleteData = (id) => {
	db.transaction((tx) => {
		tx.executeSql(
			"DELETE FROM local_data WHERE id = ?;",
			[id],
			() => console.log(`Data with id ${id} deleted successfully`),
			(_, error) => console.error("Error deleting data:", error)
		);
	});
};

// 6. Сүлжээний статусыг хянах функц
export const monitorNetworkStatus = () => {
	NetInfo.addEventListener((state) => {
		if (state.isConnected) {
			console.log("Internet is available. Syncing data to server...");
			syncDataToServer(); // Сүлжээтэй үед датаг сервер рүү илгээх
		} else {
			console.log("No internet connection. Data will be stored locally.");
		}
	});
};
