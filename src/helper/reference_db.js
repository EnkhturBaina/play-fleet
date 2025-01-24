import { db } from "./db";

// 1.Лавлах TABLE үүд үүсгэх
export const createReferenceTables = async () => {
	console.log("RUN CREATE ReferenceTables");
	try {
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_states (
        id INTEGER PRIMARY KEY,
        PMSCompanyId INTEGER,
        PMSProjectId INTEGER,
        PMSParentId INTEGER,
        PMSGroupId INTEGER,
        Activity TEXT,
        ActivityEn TEXT,
        ActivityShort TEXT,
        Color TEXT,
        ViewOrder INTEGER,
        IsSystem INTEGER,
        IsActive INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_locations (
        id INTEGER PRIMARY KEY,
        PMSProjectId INTEGER,
        PMSLocationTypeId INTEGER,
        Name TEXT,
        ReportName TEXT,
        StartElevation INTEGER,
        EndElevation INTEGER,
        BenchHeight INTEGER,
        IsEmergency INTEGER,
        IsSubGrade INTEGER,
        IsCell INTEGER,
        Color TEXT,
        Latitude TEXT,
        Longitude TEXT,
        ViewOrder INTEGER,
        IsSystem INTEGER,
        IsActive INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_movements (
        id INTEGER PRIMARY KEY,
        PMSLocationSrcId INTEGER,
        PMSLocationDstId INTEGER,
        PMSMaterialUnitId INTEGER,
        PMSProjectId INTEGER,
        created_at TEXT,
        updated_at TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_operators (
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
			`CREATE TABLE IF NOT EXISTS ref_materials (
        id INTEGER PRIMARY KEY,
        PMSProjectId INTEGER,
        Name TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_state_groups (
        id INTEGER PRIMARY KEY NOT NULL,
        PMSProjectId INTEGER,
        Name TEXT,
        NameEN TEXT,
        Color TEXT,
        ViewOrder INTEGER,
        IsSystem INTEGER,
        WorkingState INTEGER,
        IsActive INTEGER,
        created_at TEXT,
        updated_at TEXT,
        deleted_at TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_location_types (   
        id INTEGER PRIMARY KEY NOT NULL,
        Name TEXT,
        IsActive INTEGER
      );`
		);
	} catch (error) {
		console.log("error createTable", error);
	}
};

export const saveReferencesWithClear = async (data, is_clear) => {
	console.log("run SAVE ReferencesWithClear");
	try {
		let result;

		// clearReferencesTables амжилттай дууссаны дараа insert хийх
		if (is_clear) {
			await clearReferencesTables();
			result = await insertReferencesData(data);
		} else {
			result = await insertReferencesData(data);
		}

		return result;
	} catch (error) {
		return "saveReferencesWithClear: " + error.message;
	}
};

export const insertReferencesData = async (data) => {
	console.log("RUN INSERT ReferencesData");

	try {
		const ref_states = data.states;
		const ref_locations = data.locations;
		const ref_movements = data.movements;
		const ref_operators = data.operators;
		const ref_materials = data.materials;

		if (ref_states) {
			console.log("ref_states EXIST !");

			// ref_states өгөгдөл оруулах
			ref_states?.map(async (el) => {
				const resultRefStates = await db.runAsync(
					`INSERT INTO ref_states (
          id, PMSCompanyId, PMSProjectId, PMSParentId, PMSGroupId, Activity, ActivityEn,
          ActivityShort, Color, ViewOrder, IsSystem, IsActive, created_at, updated_at,
          deleted_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						el.id,
						el.PMSCompanyId,
						el.PMSProjectId,
						el.PMSParentId,
						el.PMSGroupId,
						el.Activity,
						el.ActivityEn,
						el.ActivityShort,
						el.Color,
						el.ViewOrder,
						el.IsSystem,
						el.IsActive,
						el.created_at,
						el.updated_at,
						el.deleted_at,
						el.status
					]
				);

				// Amжилттай нэмсэн мөрийн тоог шалгах
				if (resultRefStates.rowsAffected === 0) {
					throw new Error("ref_states өгөгдлийг оруулж чадсангүй.");
				}

				insertStateGroupData(el);
			});
		}

		// ref_locations өгөгдөл оруулах
		if (ref_locations) {
			console.log("ref_locations EXIST !");

			ref_locations?.map(async (el) => {
				const resultRefLocations = await db.runAsync(
					`INSERT INTO ref_locations (
          id, PMSProjectId, PMSLocationTypeId, Name, ReportName, StartElevation, EndElevation,
          BenchHeight, IsEmergency, IsSubGrade, IsCell, Color, Latitude, Longitude, ViewOrder,
          IsSystem, IsActive, created_at, updated_at, deleted_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						el.id,
						el.PMSProjectId,
						el.PMSLocationTypeId,
						el.Name,
						el.ReportName,
						el.StartElevation,
						el.EndElevation,
						el.BenchHeight,
						el.IsEmergency,
						el.IsSubGrade,
						el.IsCell,
						el.Color,
						el.Latitude,
						el.Longitude,
						el.ViewOrder,
						el.IsSystem,
						el.IsActive,
						el.created_at,
						el.updated_at,
						el.deleted_at,
						el.status
					]
				);
				if (resultRefLocations.rowsAffected === 0) {
					throw new Error("ref_locations өгөгдлийг оруулж чадсангүй.");
				}
				insertLocationTypesData(el);
			});
		}
		// ref_movements өгөгдөл оруулах
		if (ref_movements) {
			ref_movements?.map(async (el) => {
				const resultRefMovements = await db.runAsync(
					`INSERT INTO ref_movements (
          id, PMSLocationSrcId, PMSLocationDstId, PMSMaterialUnitId, PMSProjectId, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
					[
						ref_movements.id,
						ref_movements.PMSLocationSrcId,
						ref_movements.PMSLocationDstId,
						ref_movements.PMSMaterialUnitId,
						ref_movements.PMSProjectId,
						ref_movements.created_at,
						ref_movements.updated_at
					]
				);

				if (resultRefMovements.rowsAffected === 0) {
					throw new Error("ref_movements өгөгдлийг оруулж чадсангүй.");
				}
			});
		}

		// ref_operators өгөгдөл оруулах
		if (ref_operators) {
			ref_operators?.map(async (el) => {
				const resultRefOperators = await db.runAsync(
					`INSERT INTO ref_operators (
          id, PMSCompanyId, PMSRosterId, Code, FirstName, LastName, Profile, Email, IsActive,
          IsOperator, CreatedBy, ModifiedBy, created_at, updated_at, deleted_at, FullName, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						ref_operators.id,
						ref_operators.PMSCompanyId,
						ref_operators.PMSRosterId,
						ref_operators.Code,
						ref_operators.FirstName,
						ref_operators.LastName,
						ref_operators.Profile,
						ref_operators.Email,
						ref_operators.IsActive,
						ref_operators.IsOperator,
						ref_operators.CreatedBy,
						ref_operators.ModifiedBy,
						ref_operators.created_at,
						ref_operators.updated_at,
						ref_operators.deleted_at,
						ref_operators.FullName,
						ref_operators.status
					]
				);

				if (resultRefOperators.rowsAffected === 0) {
					throw new Error("ref_operators өгөгдлийг оруулж чадсангүй.");
				}
			});
		}

		// ref_materials өгөгдөл оруулах
		if (ref_materials) {
			ref_materials?.map(async (el) => {
				const resultRefMaterials = await db.runAsync(
					`INSERT INTO ref_materials (
          id, PMSProjectId, Name
        ) VALUES (?, ?, ?);`,
					[ref_materials.id, ref_materials.PMSProjectId, ref_materials.Name]
				);

				if (resultRefMaterials.rowsAffected === 0) {
					throw new Error("ref_materials өгөгдлийг оруулж чадсангүй.");
				}
			});
		}

		return "DONE";
	} catch (error) {
		return "insertReferencesData" + error.message;
	}
};

export const insertStateGroupData = async (eachStateGroupData) => {
	console.log("RUN INSERT StateGroupData");

	try {
		if (1) {
			// ref_state_groups ширээнд өгөгдөл оруулах
			const resultRefStateGroups = await db.runAsync(
				`INSERT OR REPLACE INTO ref_state_groups (
          id, PMSProjectId, Name, NameEN, Color, ViewOrder, IsSystem,
          WorkingState, IsActive, created_at, updated_at, deleted_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					eachStateGroupData?.group?.id,
					eachStateGroupData?.group?.PMSProjectId,
					eachStateGroupData?.group?.Name,
					eachStateGroupData?.group?.NameEN,
					eachStateGroupData?.group?.Color,
					eachStateGroupData?.group?.ViewOrder,
					eachStateGroupData?.group?.IsSystem,
					eachStateGroupData?.group?.WorkingState,
					eachStateGroupData?.group?.IsActive,
					eachStateGroupData?.group?.created_at,
					eachStateGroupData?.group?.updated_at,
					eachStateGroupData?.group?.deleted_at,
					eachStateGroupData?.group?.status
				]
			);

			if (resultRefStateGroups.rowsAffected === 0) {
				throw new Error("ref_state_groups өгөгдлийг оруулж чадсангүй.");
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};

export const insertLocationTypesData = async (eachLocationTypeData) => {
	console.log("RUN INSERT LocationTypesData");

	try {
		// ref_location_types ширээнд өгөгдөл оруулах
		if (1) {
			const resultRefLocationTypes = await db.runAsync(
				`INSERT OR REPLACE INTO ref_location_types (
          id, Name, IsActive
        ) VALUES (?, ?, ?)`,
				[eachLocationTypeData?.type?.id, eachLocationTypeData?.type?.Name, eachLocationTypeData?.type?.IsActive]
			);

			if (resultRefLocationTypes.rowsAffected === 0) {
				throw new Error("ref_location_types өгөгдлийг оруулж чадсангүй.");
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};
// References TABLE үүдийг цэвэрлэж. Шинэ дата хадгалахад бэлдэх
export const clearReferencesTables = async (id) => {
	console.log("RUN CLEAR ReferencesTables");

	try {
		await db.runAsync("DELETE FROM ref_states");
		await db.runAsync("DELETE FROM ref_locations");
		await db.runAsync("DELETE FROM ref_movements");
		await db.runAsync("DELETE FROM ref_operators");
		await db.runAsync("DELETE FROM ref_materials");
		await db.runAsync("DELETE FROM ref_state_groups");
		await db.runAsync("DELETE FROM ref_location_types");
	} catch (error) {
		console.log("error", error);
	}
};

export const fetchReferencesData = async () => {
	console.log("RUN fetchData");
	try {
		const allRows = await db.getAllAsync(`
			SELECT rl.*, lt.Name AS LocationTypeName
			FROM ref_locations rl
			INNER JOIN ref_location_types lt ON rl.PMSLocationTypeId = lt.id`);
		// console.log("allRows", allRows);
		return allRows;
	} catch (error) {
		console.log("error fetchData", error);
	}
};
