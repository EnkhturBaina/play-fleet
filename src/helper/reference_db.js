import { db } from "./db";

// 1.Лавлах TABLE үүд үүсгэх
export const createReferenceTables = async () => {
	console.log("RUN createReferenceTables");
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
			`CREATE TABLE IF NOT EXISTS ref_operatorss (
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
	} catch (error) {
		console.log("error createTable", error);
	}
};

export const saveReferencesWithClear = async (data, is_clear) => {
	console.log("run saveReferencesWithClear");
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
		return "saveLoginDataWithClear: " + error.message;
	}
};

export const insertReferencesData = async (data) => {
	console.log("RUN insertReferencesData");

	try {
		const ref_states = data.states;
		const ref_locations = ref_states.locations;
		const ref_movements = ref_states.roster;
		const ref_operators = ref_states.roster;
		const ref_materials = ref_states.roster;

		// ref_states өгөгдөл оруулах
		const resultRefStates = await db.runAsync(
			`INSERT INTO ref_states (
          id, PMSCompanyId, PMSProjectId, PMSParentId, PMSGroupId, Activity, ActivityEn,
          ActivityShort, Color, ViewOrder, IsSystem, IsActive, created_at, updated_at,
          deleted_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
			[
				ref_states.id,
				ref_states.PMSCompanyId,
				ref_states.PMSProjectId,
				ref_states.PMSParentId,
				ref_states.PMSGroupId,
				ref_states.Activity,
				ref_states.ActivityEn,
				ref_states.ActivityShort,
				ref_states.Color,
				ref_states.ViewOrder,
				ref_states.IsSystem,
				ref_states.IsActive,
				ref_states.created_at,
				ref_states.updated_at,
				ref_states.deleted_at,
				ref_states.status
			]
		);

		// Amжилттай нэмсэн мөрийн тоог шалгах
		if (resultRefStates.rowsAffected === 0) {
			throw new Error("Employee өгөгдлийг оруулж чадсангүй.");
		}

		// ref_locations өгөгдөл оруулах
		if (ref_locations) {
			const resultRefLocations = await db.runAsync(
				`INSERT INTO ref_locations (
          id, PMSProjectId, PMSLocationTypeId, Name, ReportName, StartElevation, EndElevation,
          BenchHeight, IsEmergency, IsSubGrade, IsCell, Color, Latitude, Longitude, ViewOrder,
          IsSystem, IsActive, created_at, updated_at, deleted_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
				[
					ref_locations.id,
					ref_locations.PMSProjectId,
					ref_locations.PMSLocationTypeId,
					ref_locations.Name,
					ref_locations.ReportName,
					ref_locations.StartElevation,
					ref_locations.EndElevation,
					ref_locations.BenchHeight,
					ref_locations.IsEmergency,
					ref_locations.IsSubGrade,
					ref_locations.IsCell,
					ref_locations.Color,
					ref_locations.Latitude,
					ref_locations.Longitude,
					ref_locations.ViewOrder,
					ref_locations.IsSystem,
					ref_locations.IsActive,
					ref_locations.created_at,
					ref_locations.updated_at,
					ref_locations.deleted_at,
					ref_locations.status
				]
			);

			if (resultRefLocations.rowsAffected === 0) {
				throw new Error("Company өгөгдлийг оруулж чадсангүй.");
			}
		}
		// ref_movements өгөгдөл оруулах
		if (ref_movements) {
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
				throw new Error("Company өгөгдлийг оруулж чадсангүй.");
			}
		}

		// roster ширээнд өгөгдөл оруулах
		if (ref_operators) {
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
				throw new Error("Roster өгөгдлийг оруулж чадсангүй.");
			}
		}

		// roster ширээнд өгөгдөл оруулах
		if (ref_materials) {
			const resultRefMaterials = await db.runAsync(
				`INSERT INTO ref_materials (
          id, PMSProjectId, Name
        ) VALUES (?, ?, ?);`,
				[ref_materials.id, ref_materials.PMSProjectId, ref_materials.Name]
			);

			if (resultRefMaterials.rowsAffected === 0) {
				throw new Error("Roster өгөгдлийг оруулж чадсангүй.");
			}
		}

		return "DONE";
	} catch (error) {
		return "insertReferencesData" + error.message;
	}
};

// References TABLE үүдийг цэвэрлэж. Шинэ дата хадгалахад бэлдэх
export const clearReferencesTables = async (id) => {
	console.log("RUN clearReferencesTables");

	try {
		await db.runAsync("DELETE FROM ref_states");
		await db.runAsync("DELETE FROM ref_locations");
		await db.runAsync("DELETE FROM ref_movements");
		await db.runAsync("DELETE FROM ref_operators");
		await db.runAsync("DELETE FROM ref_materials");
	} catch (error) {
		console.log("error", error);
	}
};
