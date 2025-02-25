import { db } from "./db";

// 1.Лавлах TABLE үүд үүсгэх
export const createReferenceTables = async () => {
	console.log("RUN CREATE-ReferenceTables");
	try {
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_states (
        id INTEGER PRIMARY KEY NOT NULL,
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
        status TEXT,
        Type INTEGER
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_locations (
        id INTEGER PRIMARY KEY NOT NULL,
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
				Radius INTEGER,
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
        id INTEGER PRIMARY KEY NOT NULL,
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
        id INTEGER PRIMARY KEY NOT NULL,
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
        id INTEGER PRIMARY KEY NOT NULL,
				PMSProjectId INTEGER,
				Name TEXT,
				NameEn TEXT,
				ReportName TEXT,
				Density REAL,
				SwellFactor REAL,
				FillFactor REAL,
				IsCalculated INTEGER,
				Color TEXT,
				IsTopSoil INTEGER,
				IsSubGrade INTEGER,
				IsSystem INTEGER,
				CreatedBy INTEGER,
				ModifiedBy INTEGER,
				created_at TEXT,
				updated_at TEXT,
				deleted_at TEXT
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
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_loaders (
        id INTEGER PRIMARY KEY NOT NULL,
        Code TEXT,
        Name TEXT,
        PMSTypeId INTEGER,
        TypeName TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_loader_types (   
        id INTEGER PRIMARY KEY NOT NULL,
        Name TEXT,
        status TEXT
      );`
		);
		await db.execAsync(
			`CREATE TABLE IF NOT EXISTS ref_shots (   
        id INTEGER PRIMARY KEY NOT NULL,
        ShotName TEXT,
        SavedDate TEXT,
        PMSGeneralStateId INTEGER
      );`
		);
	} catch (error) {
		console.log("error create-Table", error);
	}
};

export const saveReferencesWithClear = async (data, is_clear) => {
	// console.log("run SAVE-ReferencesWithClear");
	try {
		let result;

		// clearReferencesTables амжилттай дууссаны дараа insert хийх
		if (is_clear) {
			await clearReferencesTables().then(async (e) => {
				if (e == "DONE_CLEAR_REF") {
					result = await insertReferencesData(data);
				}
			});
		} else {
			result = await insertReferencesData(data);
		}

		return result;
	} catch (error) {
		return "saveReferencesWithClear: " + error.message;
	}
};

export const insertReferencesData = async (data) => {
	// console.log("RUN INSERT-ReferencesData");

	const insertPromises = []; // Гүйцэтгэсэн бүх insert үйлдлийг хадгалах массив

	try {
		const ref_states = data.states;
		const ref_locations = data.locations;
		const ref_movements = data.movements;
		const ref_operators = data.operators;
		const ref_materials = data.materials;
		const ref_loaders = data.loaders;
		const ref_shots = data.shots;

		// ref_states insert хийх
		if (ref_states) {
			ref_states.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_states (
            id, PMSCompanyId, PMSProjectId, PMSParentId, PMSGroupId, Activity, ActivityEn,
            ActivityShort, Color, ViewOrder, IsSystem, IsActive, created_at, updated_at,
            deleted_at, status, Type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
							el.status,
							el.Type
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref-states өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_states insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_state_groups insert хийх
		if (ref_states) {
			ref_states.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_state_groups (
            id, PMSProjectId, Name, NameEN, Color, ViewOrder, IsSystem,
            WorkingState, IsActive, created_at, updated_at, deleted_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
						[
							el?.group?.id,
							el?.group?.PMSProjectId,
							el?.group?.Name,
							el?.group?.NameEN,
							el?.group?.Color,
							el?.group?.ViewOrder,
							el?.group?.IsSystem,
							el?.group?.WorkingState,
							el?.group?.IsActive,
							el?.group?.created_at,
							el?.group?.updated_at,
							el?.group?.deleted_at,
							el?.group?.status
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_state_groups өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_state_groups insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_locations insert хийх
		if (ref_locations) {
			ref_locations.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_locations (
            id, PMSProjectId, PMSLocationTypeId, Name, ReportName, StartElevation, EndElevation,
            BenchHeight, IsEmergency, IsSubGrade, IsCell, Color, Latitude, Longitude, Radius, ViewOrder,
            IsSystem, IsActive, created_at, updated_at, deleted_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
							el.Radius,
							el.ViewOrder,
							el.IsSystem,
							el.IsActive,
							el.created_at,
							el.updated_at,
							el.deleted_at,
							el.status
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_locations өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_locations insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_location_types insert хийх
		if (ref_locations) {
			ref_locations.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_location_types (
            id, Name, IsActive
          ) VALUES (?, ?, ?);`,
						[el?.type?.id, el?.type?.Name, el?.type?.IsActive]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_location_types өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_location_types insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_movements insert хийх
		if (ref_movements) {
			ref_movements.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_movements (
            id, PMSLocationSrcId, PMSLocationDstId, PMSMaterialUnitId, PMSProjectId, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
						[
							el.id,
							el.PMSLocationSrcId,
							el.PMSLocationDstId,
							el.PMSMaterialUnitId,
							el.PMSProjectId,
							el.created_at,
							el.updated_at
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_movements өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_movements insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_operators insert хийх
		if (ref_operators) {
			ref_operators.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_operators (
            id, PMSCompanyId, PMSRosterId, Code, FirstName, LastName, Profile, Email, IsActive,
            IsOperator, CreatedBy, ModifiedBy, created_at, updated_at, deleted_at, FullName, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
						[
							el.id,
							el.PMSCompanyId,
							el.PMSRosterId,
							el.Code,
							el.FirstName,
							el.LastName,
							el.Profile,
							el.Email,
							el.IsActive,
							el.IsOperator,
							el.CreatedBy,
							el.ModifiedBy,
							el.created_at,
							el.updated_at,
							el.deleted_at,
							el.FullName,
							el.status
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref-operators өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_operators insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_materials insert хийх
		if (ref_materials) {
			ref_materials.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_materials (
            id, PMSProjectId, Name, NameEn, ReportName, Density, SwellFactor,
            FillFactor, IsCalculated, Color, IsTopSoil, IsSubGrade, IsSystem,
            CreatedBy, ModifiedBy, created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
						[
							el.id,
							el.PMSProjectId,
							el.Name,
							el.NameEn,
							el.ReportName,
							el.Density,
							el.SwellFactor,
							el.FillFactor,
							el.IsCalculated,
							el.Color,
							el.IsTopSoil,
							el.IsSubGrade,
							el.IsSystem,
							el.CreatedBy,
							el.ModifiedBy,
							el.created_at,
							el.updated_at,
							el.deleted_at
						]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_materials өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_materials insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_loaders insert хийх
		if (ref_loaders) {
			ref_loaders.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_loaders (
            id, Code, Name, PMSTypeId, TypeName, status
          ) VALUES (?, ?, ?, ?, ?, ?);`,
						[el.id, el.Code, el.Name, el.PMSTypeId, el.TypeName, el.status]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_loaders өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_loaders insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_loader_types insert хийх
		if (ref_loaders) {
			ref_loaders.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_loader_types (
            id, Name, status
          ) VALUES (?, ?, ?);`,
						[el?.type?.id, el?.type?.Name, el?.type?.status]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_loader_types өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_loader_types insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// ref_shots insert хийх
		if (ref_shots) {
			ref_shots.forEach((el) => {
				const promise = db
					.runAsync(
						`INSERT OR REPLACE INTO ref_shots (
            id, ShotName, SavedDate, PMSGeneralStateId
          ) VALUES (?, ?, ?, ?);`,
						[el.id, el.ShotName, el.SavedDate, el.PMSGeneralStateId]
					)
					.then((result) => {
						if (result.changes === 0) throw new Error("ref_shots өгөгдлийг оруулж чадсангүй.");
					})
					.catch((error) => {
						console.log("Error in ref_shots insert", error);
						throw error; // Алдааг throw хийж, бүх insert үйлдлийг үргэлжлүүлэхгүй
					});

				insertPromises.push(promise);
			});
		}

		// Бүх insert үйлдлүүд амжилттай дууссан эсэхийг шалгах
		await Promise.all(insertPromises); // Энд бүх асинхрон үйлдлүүдийг хүлээж дуусгах
		console.log("All insert operations completed successfully.");

		return "DONE_INSERT"; // Бүх үйлдэл амжилттай бол "DONE_INSERT" буцаана
	} catch (error) {
		console.log("Error in insertReferencesData:", error);
		return "Error in insertReferencesData: " + error.message; // Алдаа гарахад дэлгэцэнд алдааг буцаана
	}
};

// References TABLE үүдийг цэвэрлэж. Шинэ дата хадгалахад бэлдэх
export const clearReferencesTables = async () => {
	// console.log("RUN CLEAR-ReferencesTables");

	const tablesToClear = [
		"ref_states",
		"ref_locations",
		"ref_movements",
		"ref_operators",
		"ref_materials",
		"ref_state_groups",
		"ref_location_types",
		"ref_loaders",
		"ref_loader_types",
		"ref_shots"
	];

	try {
		// Хүснэгтүүдийг устгах
		for (let table of tablesToClear) {
			await db.runAsync(`DELETE FROM ${table}`);
			// console.log(`Successfully cleared table: ${table}`);
		}

		return "DONE_CLEAR_REF";
	} catch (error) {
		console.error("Error clearing tables:", error);
		return `Error clearing tables: ${error.message}`;
	}
};

export const fetchReferencesData = async () => {
	console.log("RUN fetch-References-Data");
	let data = null;
	try {
		// Parallel database queries using Promise.all
		const [
			ref_states,
			ref_locations,
			ref_movements,
			ref_operators,
			ref_materials,
			ref_state_groups,
			ref_location_types,
			ref_loaders,
			ref_loader_types,
			ref_shots
		] = await Promise.all([
			db.getAllAsync(`SELECT * FROM ref_states`),
			db.getAllAsync(`SELECT * FROM ref_locations`),
			db.getAllAsync(`SELECT * FROM ref_movements`),
			db.getAllAsync(`SELECT * FROM ref_operators`),
			db.getAllAsync(`SELECT * FROM ref_materials`),
			db.getAllAsync(`SELECT * FROM ref_state_groups`),
			db.getAllAsync(`SELECT * FROM ref_location_types`),
			db.getAllAsync(`SELECT * FROM ref_loaders`),
			db.getAllAsync(`SELECT * FROM ref_loader_types`),
			db.getAllAsync(`SELECT * FROM ref_shots`)
		]);

		// Combine results into a single object
		data = {
			ref_states,
			ref_locations,
			ref_movements,
			ref_operators,
			ref_materials,
			ref_state_groups,
			ref_location_types,
			ref_loaders,
			ref_loader_types,
			ref_shots
		};

		return data; // Return the combined data
	} catch (error) {
		console.error("Error fetching references data", error);
		throw new Error("Failed to fetch references data. Please try again later.");
	}
};

export const dropTable = async (tableName) => {
	try {
		await db.runAsync(`DROP TABLE IF EXISTS ${tableName};`);

		return `DONE_DROP_${tableName}`;
	} catch (error) {
		console.log("error", error);
	}
};
