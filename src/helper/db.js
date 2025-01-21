import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("offline_data");

// 1.DONE SQLite хүснэгт үүсгэх
export const createTable = async () => {
	console.log("RUN createTable");
	try {
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS employee (
        id INTEGER PRIMARY KEY,
        PMSCompanyId INTEGER,
        PMSRosterId INTEGER,
        Code TEXT,
        FirstName TEXT,
        LastName TEXT,
        Profile TEXT,
        Email TEXT,
        IsActive INTEGER,
        IsOperator INTEGER,
        CreatedBy INTEGER,
        ModifiedBy INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        FullName TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY,
        Code TEXT,
        Name TEXT,
        Image TEXT,
        email TEXT,
        Mobile TEXT,
        IsMain INTEGER,
        ViewOrder INTEGER,
        CreatedBy INTEGER,
        ModifiedBy INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS roster (
        id INTEGER PRIMARY KEY,
        PMSProjectId INTEGER,
        Name TEXT,
        Description TEXT,
        IsSystem INTEGER,
        IsActive INTEGER,
        CreatedBy INTEGER,
        ModifiedBy INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS equipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId INTEGER,
        FOREIGN KEY(employeeId) REFERENCES employee(id)
      );`
		);
	} catch (error) {
		console.log("error createTable", error);
	}
};

export const saveLoginDataWithClear = async (data, is_clear) => {
	console.log("run saveLoginDataWithClear");
	try {
		let result;

		// clearLoginTables амжилттай дууссаны дараа insert хийх
		if (is_clear) {
			await clearLoginTables();
			result = await insertLoginData(data);
		} else {
			result = await insertLoginData(data);
		}

		return result;
	} catch (error) {
		return "saveLoginDataWithClear: " + error.message;
	}
};

// 2.DONE Локал өгөгдлийг хадгалах функц
export const insertLoginData = async (data) => {
	console.log("RUN insertLoginData");

	try {
		const employee = data.employee;
		const company = employee.company;
		const roster = employee.roster;

		// employee ширээнд өгөгдөл оруулах
		const resultEmployee = await db.runAsync(
			`INSERT INTO employee (id, PMSCompanyId, PMSRosterId, Code, FirstName, LastName, Profile, Email, IsActive, IsOperator, CreatedBy, ModifiedBy, created_at, updated_at, deleted_at, FullName, status)
		  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			[
				employee.id,
				employee.PMSCompanyId,
				employee.PMSRosterId,
				employee.Code,
				employee.FirstName,
				employee.LastName,
				employee.Profile,
				employee.Email,
				employee.IsActive,
				employee.IsOperator,
				employee.CreatedBy,
				employee.ModifiedBy,
				employee.created_at,
				employee.updated_at,
				employee.deleted_at,
				employee.FullName,
				employee.status
			]
		);

		// Amжилттай нэмсэн мөрийн тоог шалгах
		if (resultEmployee.rowsAffected === 0) {
			throw new Error("Employee өгөгдлийг оруулж чадсангүй.");
		}

		// company ширээнд өгөгдөл оруулах
		if (company) {
			const resultCompany = await db.runAsync(
				`INSERT INTO company (id, Code, Name, Image, email, Mobile, IsMain, ViewOrder, CreatedBy, ModifiedBy, created_at, updated_at, deleted_at)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
				[
					company.id,
					company.Code,
					company.Name,
					company.Image,
					company.email,
					company.Mobile,
					company.IsMain,
					company.ViewOrder,
					company.CreatedBy,
					company.ModifiedBy,
					company.created_at,
					company.updated_at,
					company.deleted_at
				]
			);

			if (resultCompany.rowsAffected === 0) {
				throw new Error("Company өгөгдлийг оруулж чадсангүй.");
			}
		}

		// roster ширээнд өгөгдөл оруулах
		if (roster) {
			const resultRoster = await db.runAsync(
				`INSERT INTO roster (id, PMSProjectId, Name, Description, IsSystem, IsActive, CreatedBy, ModifiedBy, created_at, updated_at, deleted_at, status)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
				[
					roster.id,
					roster.PMSProjectId,
					roster.Name,
					roster.Description,
					roster.IsSystem,
					roster.IsActive,
					roster.CreatedBy,
					roster.ModifiedBy,
					roster.created_at,
					roster.updated_at,
					roster.deleted_at,
					roster.status
				]
			);

			if (resultRoster.rowsAffected === 0) {
				throw new Error("Roster өгөгдлийг оруулж чадсангүй.");
			}
		}

		return "DONE";
	} catch (error) {
		return "insertLoginData" + error.message;
	}
};

// Login TABLE үүдийг цэвэрлэж. Шинэ дата хадгалахад бэлдэх
export const clearLoginTables = async (id) => {
	console.log("RUN clearLoginTables");

	try {
		await db.runAsync("DELETE FROM employee");
		await db.runAsync("DELETE FROM company");
		await db.runAsync("DELETE FROM roster");
	} catch (error) {
		console.log("error", error);
	}
};

// 3.DONE Локал өгөгдлийг авах функц
export const fetchData = async () => {
	console.log("RUN fetchData");
	try {
		const allRows = await db.getAllAsync("SELECT * FROM company");
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
