import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("offline_data");

// 1.DONE SQLite хүснэгт үүсгэх
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

// 2.DONE Локал өгөгдлийг хадгалах функц
export const insertData = async (title, imageUri, address, lat, lng) => {
	try {
		const result = await db.runAsync("INSERT INTO places (title, imageUri, address, lat, lng) VALUES (?, ?, ?, ?, ?)", [
			title,
			imageUri,
			address,
			lat,
			lng
		]);

		console.log("result", result);
	} catch (error) {
		console.log("error", error);
	}
};

// 3.DONE Локал өгөгдлийг авах функц
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

// 4.DONE Локал өгөгдлийг устгах функц
export const deleteData = async (id) => {
	try {
		const result = await db.runAsync("DELETE FROM places WHERE id = $value", { $value: id });
		console.log("delete result", result);
	} catch (error) {
		console.log("error", error);
	}
};

// 5.DONE Локал өгөгдлийг засах функц
export const updateData = async (id) => {
	try {
		const result = await db.runAsync("UPDATE places SET imageUri = ? WHERE id = ?", ["z1", id]);
		console.log("update result", result);
	} catch (error) {
		console.log("error", error);
	}
};

// 6. Локал өгөгдлийг сервер рүү илгээх функц
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
