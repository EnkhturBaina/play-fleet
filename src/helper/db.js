import * as SQLite from "expo-sqlite";
import { SERVER_URL } from "../constant";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "dayjs/locale/es";
import dayjs from "dayjs";

export const db = SQLite.openDatabaseSync("offline_data");

const AddColumnsTABLES = async () => {
	const tableInfo = await db.getAllAsync(`PRAGMA table_info(send_state);`);
	const columnNames = tableInfo.map((col) => col.name);

	const columnsToAdd = [
		{ name: "CurrentDate", type: "TEXT" },
		{ name: "StartTime", type: "TEXT" },
		{ name: "EndTime", type: "TEXT" },
		{ name: "PMSShiftId", type: "INTEGER" }
	];

	for (const col of columnsToAdd) {
		if (!columnNames.includes(col.name)) {
			console.log(`⚙️ Adding column: ${col.name}`);
			await db.runAsync(`ALTER TABLE send_state ADD COLUMN ${col.name} ${col.type};`);
		}
	}
};

// 1.DONE SQLite хүснэгт үүсгэх
export const createTable = async () => {
	// console.log("RUN CREATE Table");
	try {
		// await AddColumnsTABLES();
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
        ViewOrder INTEGER
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
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS shift (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				Name TEXT,
				Description TEXT,
				ViewOrder INTEGER,
				IsActive INTEGER,
				status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS equipments (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				PMSCompanyId INTEGER,
				PMSProjectId INTEGER,
				PMSManufacturerId INTEGER,
				PMSTypeId INTEGER,
				PMSModelId INTEGER,
				Code TEXT,
				Name TEXT,
				Capacity TEXT,
				IsActive INTEGER,
				TypeName TEXT,
				status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS project (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				Name TEXT,
				PMSCompanyId INTEGER,
				Commodity TEXT,
				ShiftTime TEXT,
				StartedDate TEXT,
				CurrentProject INTEGER,
				Latitude REAL,
				Longitude REAL,
				PMSProgressStateId INTEGER,
				KMLFile TEXT,
				Radius INTEGER,
				SyncTime INTEGER,
				status TEXT
      );`
		);
		await db.execAsync(`
			DROP TABLE IF EXISTS send_state;
		`);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS send_state (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				PMSProjectId INTEGER,
				PMSEquipmentId INTEGER,
				PMSProgressStateId INTEGER,
				PMSProgressSubStateId INTEGER,
				PMSEmployeeId INTEGER,
				PMSLoaderId INTEGER,
				PMSLocationId INTEGER,
				PMSBlastShotId INTEGER,
				PMSDestination INTEGER,
				PMSMaterialUnitId INTEGER,
				Latitude REAL,
				Longitude REAL,
				CurrentDate TEXT,
				StartTime TEXT,
				EndTime TEXT,
				PMSShiftId INTEGER
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS moto_hour (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				PMSEquipmentId INTEGER,
				PMSShiftId INTEGER,
				SavedDate TEXT,
				StartSMU INTEGER,
				FinishSMU INTEGER,
				Fuel INTEGER,
				ProgressSMU INTEGER,
				LastLogged TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS send_location (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				PMSEquipmentId INTEGER,
				Latitude REAL,
				Longitude REAL,
				Speed INTEGER,
				CurrentDate TEXT,
				EventTime TEXT
      );`
		);
	} catch (error) {
		console.log("error createTable", error);
	}
};

export const saveLoginDataWithClear = async (data, is_clear) => {
	// console.log("run SAVE LoginDataWithClear", data, is_clear);
	try {
		let result;

		// clear_Login_Tables амжилттай дууссаны дараа insert хийх
		if (is_clear) {
			await clearLoginTables().then(async (e) => {
				if (e == "DONE_CLEAR_MAIN_TABLES") {
					result = await insertLoginData(data);
				}
			});
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
	// console.log("RUN INSERT LoginData", JSON.stringify(data));

	try {
		const employee = data.employee;
		const company = employee.company;
		const roster = employee.roster;
		const project = data.project;
		const shift = data.shift;
		const equipments = employee.equipments;
		// console.log("LOCAL shift =================>", shift);

		// employee өгөгдөл оруулах
		const resultEmployee = await db.runAsync(
			`INSERT INTO employee (id, PMSCompanyId, PMSRosterId, Code, FirstName, LastName, Profile, Email, IsActive, IsOperator, FullName, status)
		  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
				employee.FullName,
				employee.status
			]
		);

		// Amжилттай нэмсэн мөрийн тоог шалгах
		if (resultEmployee.rowsAffected === 0) {
			throw new Error("Employee өгөгдлийг оруулж чадсангүй.");
		}

		// company өгөгдөл оруулах
		if (company) {
			const resultCompany = await db.runAsync(
				`INSERT INTO company (id, Code, Name, Image, email, Mobile, IsMain, ViewOrder)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
				[
					company.id,
					company.Code,
					company.Name,
					company.Image,
					company.email,
					company.Mobile,
					company.IsMain,
					company.ViewOrder
				]
			);

			if (resultCompany.rowsAffected === 0) {
				throw new Error("Company өгөгдлийг оруулж чадсангүй.");
			}
		}

		// roster өгөгдөл оруулах
		if (roster) {
			const resultRoster = await db.runAsync(
				`INSERT INTO roster (id, PMSProjectId, Name, Description, IsSystem, IsActive, status)
				VALUES (?, ?, ?, ?, ?, ?, ?);`,
				[
					roster.id,
					roster.PMSProjectId,
					roster.Name,
					roster.Description,
					roster.IsSystem,
					roster.IsActive,
					roster.status
				]
			);

			if (resultRoster.rowsAffected === 0) {
				throw new Error("Roster өгөгдлийг оруулж чадсангүй.");
			}
		}

		// project өгөгдөл оруулах
		if (project) {
			const resultProject = await db.runAsync(
				`INSERT INTO project (id, Name, PMSCompanyId, Commodity, ShiftTime, StartedDate, CurrentProject, Latitude, Longitude, PMSProgressStateId, KMLFile, Radius, SyncTime, status)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
				[
					project.id,
					project.Name,
					project.PMSCompanyId,
					project.Commodity,
					project.ShiftTime,
					project.StartedDate,
					project.CurrentProject,
					project.Latitude,
					project.Longitude,
					project.PMSProgressStateId,
					project.KMLFile,
					project.Radius,
					project.SyncTime,
					project.status
				]
			);

			if (resultProject.rowsAffected === 0) {
				throw new Error("Project өгөгдлийг оруулж чадсангүй.");
			}
		}

		// shift өгөгдөл оруулах
		if (shift) {
			const resultShift = await db.runAsync(
				`INSERT INTO shift (id, Name, Description, ViewOrder, IsActive, status)
				VALUES (?, ?, ?, ?, ?, ?);`,
				[shift.id, shift.Name, shift.Description, shift.ViewOrder, shift.IsActive, shift.status]
			);

			if (resultShift.rowsAffected === 0) {
				throw new Error("Shift өгөгдлийг оруулж чадсангүй.");
			}
		}

		// equipments өгөгдөл оруулах (for...of ашиглаж, async/await-г дэмжинэ)
		if (equipments) {
			for (const el of equipments) {
				const resultEquipments = await db.runAsync(
					`INSERT INTO equipments (id, PMSCompanyId, PMSProjectId, PMSManufacturerId, PMSTypeId, PMSModelId, Code, Name, Capacity, IsActive, TypeName, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						el.id,
						el.PMSCompanyId,
						el.PMSProjectId,
						el.PMSManufacturerId,
						el.PMSTypeId,
						el.PMSModelId,
						el.Code,
						el.Name,
						el.Capacity,
						el.IsActive,
						el.TypeName,
						el.status
					]
				);

				if (resultEquipments.rowsAffected === 0) {
					throw new Error("Equipments өгөгдлийг оруулж чадсангүй.");
				}
			}
		}

		return "DONE";
	} catch (error) {
		return "insertLoginData: " + error.message;
	}
};

// Login TABLE үүдийг цэвэрлэж. Шинэ дата хадгалахад бэлдэх
export const clearLoginTables = async (id) => {
	console.log("RUN CLEAR LoginTables");

	const tablesToClear = ["employee", "company", "roster", "equipments", "project", "shift"];

	try {
		// Хүснэгтүүдийг устгах
		for (let table of tablesToClear) {
			await db.runAsync(`DELETE FROM ${table}`);
			// console.log(`Successfully cleared table: ${table}`);
		}

		return "DONE_CLEAR_MAIN_TABLES";
	} catch (error) {
		console.error("Error clearing tables:", error);
		return `Error clearing tables: ${error.message}`;
	}
};

// 3.DONE Локал өгөгдлийг авах функц
export const fetchLoginData = async () => {
	// console.log("RUN fetch-Login-Data");
	let data = null;
	try {
		// Parallel database queries using Promise.all
		const [employee, company, roster, equipments, project, shift] = await Promise.all([
			db.getAllAsync(`SELECT * FROM employee`),
			db.getAllAsync(`SELECT * FROM company`),
			db.getAllAsync(`SELECT * FROM roster`),
			db.getAllAsync(`SELECT * FROM equipments`),
			db.getAllAsync(`SELECT * FROM project`),
			db.getAllAsync(`SELECT * FROM shift`)
		]);
		// Combine results into a single object
		data = {
			employee,
			company,
			roster,
			equipments,
			project,
			shift
		};

		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching login data", error);
		throw new Error("Failed to fetch login data. Please try again later.");
	}
};

// 3.DONE Локал өгөгдлийг авах функц
export const fetchCustomTable = async () => {
	try {
		let data = await db.getFirstAsync(`SELECT * FROM project`);

		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching login data", error);
		throw new Error("Failed to fetch login data. Please try again later.");
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

export const insertSendStateData = async (data) => {
	console.log("---------------insertSendStateData---------------", data);
	if (!data) return;

	// 1. Өмнөх хамгийн сүүлийн мөрийг авчирч шалгана (EndTime == null)
	const prevRow = await db.getFirstAsync(
		`SELECT * FROM send_state 
		 WHERE EndTime IS NULL 
		 ORDER BY id DESC 
		 LIMIT 1`
	);

	if (prevRow) {
		// 2. Хэрвээ өмнөх мөр байгаа бол EndTime-ийг одоогийн StartTime болгож шинэчилнэ
		const result = await db.runAsync(
			`UPDATE send_state 
			 SET EndTime = ? 
			 WHERE id = ?`,
			[data[13], prevRow.id] // data[14] = StartTime
		);
		// console.log("result--------------------------------->", result);
	}

	// 3. Insert хийх
	const resultSendState = await db.runAsync(
		`INSERT INTO send_state (
			PMSProjectId,
			PMSEquipmentId,
			PMSProgressStateId,
			PMSProgressSubStateId,
			PMSEmployeeId,
			PMSLoaderId,
			PMSLocationId,
			PMSBlastShotId,
			PMSDestination,
			PMSMaterialUnitId,
			Latitude,
			Longitude,
			CurrentDate,
			StartTime,
			EndTime,
			PMSShiftId
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		data
	);

	console.log("resultSendState", resultSendState);

	if (resultSendState.rowsAffected === 0) {
		throw new Error("send-state өгөгдлийг оруулж чадсангүй.");
	}

	return resultSendState;
};

export const fetchSendStateDataALL = async () => {
	try {
		const localToken = await AsyncStorage.getItem("L_access_token");

		// 1. EndTime === null мөрийг шинэчлэх
		const lastRow = await db.getFirstAsync(`
			SELECT id FROM send_state WHERE EndTime IS NULL ORDER BY id DESC LIMIT 1
		`);

		if (lastRow) {
			await db.runAsync(`UPDATE send_state SET EndTime = ? WHERE id = ?`, [
				dayjs().format("YYYY-MM-DD HH:mm:ss"),
				lastRow.id
			]);
		}

		// 2. Бүх өгөгдлийг авах
		const data = await db.getAllAsync("SELECT * FROM send_state");
		console.log("data ==========>", data);

		if (data && data.length > 0) {
			try {
				const response = await axios.post(`${SERVER_URL}/mobile/progress/batch`, data, {
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localToken}`
					}
				});

				console.log("response fetch ALL send-state DATA========>", response.data);

				if (response.data?.Type == 0) {
					// Амжилттай үед устгана
					await deleteSendStateAllRow();
				} else {
					console.error(`Failed to send-state ALL`);
				}
			} catch (error) {
				console.error(` Error during send-state ALL:`, error?.response?.data || error.message);
			}
		}
		return data;
	} catch (error) {
		console.error("Error fetching sendState data", error);
		throw new Error("Failed to fetch sendState data. Please try again later.");
	}
};
export const fetchSendStateDataOneByOne = async () => {
	// console.log("RUN fetch Send State Data.");

	try {
		const localToken = await AsyncStorage.getItem("L_access_token");

		// 1. EndTime === null мөрийг шинэчлэх
		const lastRow = await db.getFirstAsync(`
			SELECT id FROM send_state WHERE EndTime IS NULL ORDER BY id DESC LIMIT 1
		`);

		if (lastRow) {
			await db.runAsync(`UPDATE send_state SET EndTime = ? WHERE id = ?`, [
				dayjs().format("YYYY-MM-DD HH:mm:ss"),
				lastRow.id
			]);
		}

		// 2. Бүх өгөгдлийг авах
		const data = await db.getAllAsync("SELECT * FROM send_state");
		console.log("data =========>", data);

		if (data) {
			for (const item of data) {
				// console.log("item =======>", JSON.stringify(item));
				try {
					const response = await axios.post(
						`${SERVER_URL}/mobile/progress/send`,
						{
							PMSProjectId: item?.PMSProjectId,
							PMSEquipmentId: item?.PMSEquipmentId,
							PMSProgressStateId: item?.PMSProgressStateId,
							PMSProgressSubStateId: item?.PMSProgressSubStateId,
							PMSEmployeeId: item?.PMSEmployeeId,
							PMSLoaderId: item?.PMSLoaderId,
							PMSLocationId: item?.PMSLocationId,
							PMSBlastShotId: item?.PMSBlastShotId,
							PMSDestination: item?.PMSDestination,
							PMSMaterialUnitId: item?.PMSMaterialUnitId,
							Latitude: item?.Latitude ? parseFloat(item?.Latitude) : 0,
							Longitude: item?.Longitude ? parseFloat(item?.Longitude) : 0,
							CurrentDate: null,
							StartTime: item?.StartTime,
							EndTime: item?.EndTime,
							PMSShiftId: null
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${localToken}`
							}
						}
					);
					console.log("response", response.data);

					if (response.data?.Type == 0) {
						// Сервер амжилттай хүлээж авсан бол тухайн мөрийг SQLite-с устгах
						await deleteSendStateRowById(item.id);
					} else {
						console.error(`Failed to send item ${item.id}:`);
					}
				} catch (error) {
					console.error(`Error sending item ${item.id}:`, error);
				}
			}
		}
		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching sendState data", error);
		throw new Error("Failed to fetch sendState data. Please try again later.");
	}
};

export const fetchSendStateDataTemp = async () => {
	// console.log("RUN fetch SendLocation Data.");

	try {
		// 1. EndTime === null мөрийг шинэчлэх
		const lastRow = await db.getFirstAsync(`
			SELECT id FROM send_state WHERE EndTime IS NULL ORDER BY id DESC LIMIT 1
		`);

		if (lastRow) {
			await db.runAsync(`UPDATE send_state SET EndTime = ? WHERE id = ?`, [
				dayjs().format("YYYY-MM-DD HH:mm:ss"),
				lastRow.id
			]);
		}
		// Parallel database queries using Promise.all
		const data = await db.getAllAsync("SELECT * FROM send_state");
		// console.log("data TEMP LOCATIONS==========>", data);
		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching SendState data Temp", error);
		throw new Error("Failed to fetch SendState data Temp. Please try again later.");
	}
};
export const deleteSendStateAllRow = async () => {
	try {
		await db.runAsync("DELETE FROM send_state;");
		console.log(`send_state ALL Row with deleted.`);
	} catch (error) {
		console.error(`Error deleting sendState`, error);
	}
};

const deleteSendStateRowById = async (id) => {
	try {
		await db.runAsync("DELETE FROM send_state WHERE id = ?;", [id]);
		console.log(`Row with id ${id} deleted.`);
	} catch (error) {
		console.error(`Error deleting sendState row with id ${id}:`, error);
	}
};

export const insertMotoHourData = async (data) => {
	if (data) {
		const resultMotoHour = await db.runAsync(
			`INSERT INTO moto_hour (
				PMSEquipmentId,
				PMSShiftId,
				SavedDate,
				StartSMU,
				FinishSMU,
				Fuel,
				ProgressSMU,
				LastLogged)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
			data
		);
		// console.log("resultMotoHour", resultMotoHour);

		if (resultMotoHour.rowsAffected === 0) {
			throw new Error("moto_hour өгөгдлийг оруулж чадсангүй.");
		}
		return resultMotoHour;
	}
};

export const fetchMotoHourData = async () => {
	// console.log("RUN fetch MotoHour Data.");

	try {
		await AsyncStorage.getItem("L_access_token").then(async (localToken) => {
			// Parallel database queries using Promise.all
			const data = await db.getAllAsync("SELECT * FROM moto_hour");
			// console.log("data ==========>", data);
			// console.log("token ==========>", token);

			if (data) {
				for (const item of data) {
					// console.log("item =======>", JSON.stringify(item));
					try {
						const response = await axios.post(
							`${SERVER_URL}/mobile/truck/fuel/save`,
							{
								PMSEquipmentId: item.PMSEquipmentId,
								PMSShiftId: item.PMSShiftId,
								SavedDate: item.SavedDate,
								StartSMU: item.StartSMU,
								FinishSMU: item.FinishSMU,
								Fuel: item.Fuel,
								ProgressSMU: item.ProgressSMU, // Дараа нь хасах
								LastLogged: item.LastLogged
							},
							{
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${localToken}`
								}
							}
						);
						console.log("response", response.data);

						if (response.data?.Type == 0) {
							// Сервер амжилттай хүлээж авсан бол тухайн мөрийг SQLite-с устгах
							await deleteMotoHourRowById(item.id);
						} else {
							console.error(`Failed to send motoHour item ${item.id}:`);
						}
					} catch (error) {
						console.error(`Error sending motoHour item ${item.id}:`, error);
					}
				}
			}
			return data; // Return the combined data
		});
	} catch (error) {
		console.error("Error fetching motoHour data", error);
		throw new Error("Failed to fetch motoHour data. Please try again later.");
	}
};

const deleteMotoHourRowById = async (id) => {
	try {
		await db.runAsync("DELETE FROM moto_hour WHERE id = ?;", [id]);
		console.log(`Row with id ${id} deleted.`);
	} catch (error) {
		console.error(`Error deleting motoHour row with id ${id}:`, error);
	}
};

export const insertSendLocationData = async (data) => {
	if (data) {
		const resultSendLocation = await db.runAsync(
			`INSERT INTO send_location (
				PMSEquipmentId,
				Latitude,
				Longitude,
				Speed,
				CurrentDate,
				EventTime)
			VALUES (?, ?, ?, ?, ?, ?);`,
			data
		);
		// console.log("resultSendLocation", resultSendLocation);

		if (resultSendLocation.rowsAffected === 0) {
			throw new Error("send_location өгөгдлийг оруулж чадсангүй.");
		}
		return resultSendLocation;
	}
};

export const fetchSendLocationDataTemp = async () => {
	// console.log("RUN fetch SendLocation Data.");

	try {
		// Parallel database queries using Promise.all
		const data = await db.getAllAsync("SELECT * FROM send_location");
		// console.log("data TEMP LOCATIONS==========>", data);
		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching SendLocation data Temp", error);
		throw new Error("Failed to fetch SendLocation data Temp. Please try again later.");
	}
};
export const fetchSendLocationData = async (a, b, c, d, e, f) => {
	try {
		await AsyncStorage.getItem("L_access_token").then(async (localToken) => {
			// Parallel database queries using Promise.all
			const data = await db.getAllAsync("SELECT * FROM send_location");
			// console.log("send_location data ==========>", JSON.stringify(data));

			if (data) {
				try {
					const response = await axios.post(
						`${SERVER_URL}/mobile/progress/track/save`,
						{
							PMSEquipmentId: a,
							Latitude: b,
							Longitude: c,
							Speed: d,
							CurrentDate: e,
							EventTime: f,
							Items: data
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${localToken}`
							}
						}
					);
					// console.log("response LOCAL TRACK SAVE ==========>", response.data);

					if (response.data?.Type == 0) {
						// Сервер амжилттай хүлээж авсан бол бүх датаг SQLite-с устгах
						await deleteSendLocationAll();
					} else {
						console.error(`Failed to send SendLocation ALL:`);
					}
				} catch (error) {
					console.error(`Error sending SendLocation ALL:`, error);
				}

				// for (const item of data) {
				// 	// console.log("item =======>", JSON.stringify(item));
				// 	try {
				// 		const response = await axios.post(
				// 			`${SERVER_URL}/mobile/progress/track/save`,
				// 			{
				// 				PMSEquipmentId: item.PMSEquipmentId,
				// 				Latitude: item.Latitude,
				// 				Longitude: item.Longitude,
				// 				Speed: item.Speed,
				// 				CurrentDate: item.CurrentDate,
				// 				EventTime: item.EventTime
				// 			},
				// 			{
				// 				headers: {
				// 					"Content-Type": "application/json",
				// 					Authorization: `Bearer ${localToken}`
				// 				}
				// 			}
				// 		);
				// 		console.log("response", response.data);

				// 		if (response.data?.Type == 0) {
				// 			// Сервер амжилттай хүлээж авсан бол тухайн мөрийг SQLite-с устгах
				// 			await deleteSendLocationRowById(item.id);
				// 		} else {
				// 			console.error(`Failed to send SendLocation item ${item.id}:`);
				// 		}
				// 	} catch (error) {
				// 		console.error(`Error sending SendLocation item ${item.id}:`, error);
				// 	}
				// }
			}
			return data; // Return the combined data
		});
	} catch (error) {
		console.error("Error fetching SendLocation data", error);
		throw new Error("Failed to fetch SendLocation data. Please try again later.");
	}
};

const deleteSendLocationRowById = async (id) => {
	try {
		await db.runAsync("DELETE FROM send_location WHERE id = ?;", [id]);
		console.log(`Row with id ${id} deleted.`);
	} catch (error) {
		console.error(`Error deleting SendLocation row with id ${id}:`, error);
	}
};

const deleteSendLocationAll = async () => {
	try {
		await db.runAsync("DELETE FROM send_location");
	} catch (error) {
		console.error(`Error deleting SendLocation ALL`, error);
	}
};

export const fetchEmployeeData = async () => {
	// console.log("RUN fetch Employee Data.");

	try {
		const data = await db.getAllAsync("SELECT * FROM employee");
		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching Employee data", error);
		throw new Error("Failed to fetch Employee data. Please try again later.");
	}
};

export const clearEmployeeTable = async () => {
	// console.log("RUN CLEAR Employee Table");
	try {
		await db.runAsync("DELETE FROM employee");
	} catch (error) {
		console.error(`Error deleting Employee row`, error);
	}
};

export const insertEmployeeData = async (employee_data) => {
	// console.log("employee_data=============>", employee_data);

	try {
		// employee өгөгдөл оруулах
		const resultEmployee = await db.runAsync(
			`INSERT INTO employee (id, PMSCompanyId, PMSRosterId, Code, FirstName, LastName, Profile, Email, IsActive, IsOperator, FullName, status)
		  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			[
				employee_data.id,
				employee_data.PMSCompanyId,
				employee_data.PMSRosterId,
				employee_data.Code,
				employee_data.FirstName,
				employee_data.LastName,
				employee_data.Profile,
				employee_data.Email,
				employee_data.IsActive,
				employee_data.IsOperator,
				employee_data.FullName,
				employee_data.status
			]
		);

		// Amжилттай нэмсэн мөрийн тоог шалгах
		if (resultEmployee.rowsAffected === 0) {
			throw new Error("Employee өгөгдлийг оруулж чадсангүй.");
		}
	} catch (error) {
		console.error(`Error inserting Employee`, error);
	}
};
