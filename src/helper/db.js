import * as SQLite from "expo-sqlite";
import { SERVER_URL } from "../constant";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const db = SQLite.openDatabaseSync("offline_data2");

// 1.DONE SQLite хүснэгт үүсгэх
export const createTable = async () => {
	// console.log("RUN CREATE Table");
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
				Longitude REAL
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
				ProgressSMU INTEGER
      );`
		);
	} catch (error) {
		console.log("error createTable", error);
	}
};

export const saveLoginDataWithClear = async (data, is_clear) => {
	console.log("run SAVE LoginDataWithClear", data, is_clear);
	try {
		let result;

		// clearLoginTables амжилттай дууссаны дараа insert хийх
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
	console.log("RUN INSERT LoginData", JSON.stringify(data));

	try {
		const employee = data.employee;
		const company = employee.company;
		const roster = employee.roster;
		const project = data.project;
		const shift = data.shift;
		const equipments = employee.equipments;
		console.log("LOCAL shift =================>", shift);

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
	if (data) {
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
				Longitude)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			data
		);
		console.log("resultSendState", resultSendState);

		if (resultSendState.rowsAffected === 0) {
			throw new Error("send_state өгөгдлийг оруулж чадсангүй.");
		}
		return resultSendState;
	}
};

export const fetchSendStateData = async () => {
	console.log("RUN fetch Send State Data.");

	try {
		await AsyncStorage.getItem("L_access_token").then(async (localToken) => {
			// Parallel database queries using Promise.all
			const data = await db.getAllAsync("SELECT * FROM send_state");
			// console.log("data ==========>", data);
			// console.log("token ==========>", token);

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
								Longitude: item?.Longitude ? parseFloat(item?.Longitude) : 0
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
		});
	} catch (error) {
		console.error("Error fetching sendState data", error);
		throw new Error("Failed to fetch sendState data. Please try again later.");
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
				ProgressSMU)
			VALUES (?, ?, ?, ?, ?, ?, ?);`,
			data
		);
		console.log("resultMotoHour", resultMotoHour);

		if (resultMotoHour.rowsAffected === 0) {
			throw new Error("moto_hour өгөгдлийг оруулж чадсангүй.");
		}
		return resultMotoHour;
	}
};

export const fetchMotoHourData = async () => {
	console.log("RUN fetch MotoHour Data.");

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
								ProgressSMU: item.ProgressSMU // Дараа нь хасах
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
