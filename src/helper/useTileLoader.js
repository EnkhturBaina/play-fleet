import { useState, useEffect, useContext } from "react";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Platform } from "react-native";
import { ANDROID_MAP_API, IOS_MAP_API, ZOOM_LEVEL } from "../constant";
import MainContext from "../contexts/MainContext";

// Улаанбаатар хотын төв координатууд
const UB_CENTER_LAT = 47.92123;
const UB_CENTER_LON = 106.918556;
const LAT_START = 47.89; // Улаанбаатарын өмнөд хэсэг
const LAT_END = 47.95; // Улаанбаатарын хойд хэсэг
const LON_START = 106.85; // Баруун
const LON_END = 106.99; // Зүүн
const MAPS_API_KEY = Platform.OS == "ios" ? IOS_MAP_API : Platform.OS == "android" ? ANDROID_MAP_API : ""; // Зүүн

var Buffer = require("buffer/").Buffer;

const useTileLoader = (isRemove, mapType) => {
	const state = useContext(MainContext);
	const [tileUri, setTileUri] = useState(null);
	const [tilesReady, setTilesReady] = useState(false);
	const [progress, setProgress] = useState(null);

	useEffect(() => {
		if (isRemove) {
			removeOldTiles().then(() => loadTiles());
		} else {
			loadTiles();
		}
	}, []);

	const latLonToTile = (lat, lon, z) => {
		const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
		const y = Math.floor(
			((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
				Math.pow(2, z)
		);
		return { x, y };
	};

	const downloadTile = async (z, x, y) => {
		var mapType = "";
		if (state.mapType == "satellite") {
			mapType = "s";
		} else {
			mapType = "m";
		}
		console.log("state.mapType", state.mapType);

		console.log("mapType ==========================>", mapType);

		const url = `https://mt1.google.com/vt/lyrs=${mapType}&x=${x}&y=${y}&z=${z}&key=${MAPS_API_KEY}`;
		const fileUri = `${FileSystem.documentDirectory}local_tile/${z}/${x}/${y}.png`;
		const dir = fileUri.substring(0, fileUri.lastIndexOf("/"));
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

		try {
			const response = await axios.get(url, { responseType: "arraybuffer" });
			await FileSystem.writeAsStringAsync(fileUri, Buffer.from(response.data).toString("base64"), {
				encoding: FileSystem.EncodingType.Base64
			});
			console.log("progress", `${x}${y} хадгалсан`);

			setProgress(`${x}${y} хадгалсан`);
		} catch (error) {
			console.error(`Error downloading tile ${z}/${x}/${y}: `, error);
			setProgress(`Газрын зураг татах үед алдаа гарлаа`);
		}
	};

	const downloadTilesForRegion = async (z, latStart, latEnd, lonStart, lonEnd) => {
		const start = latLonToTile(latStart, lonStart, z);
		const end = latLonToTile(latEnd, lonEnd, z);

		for (let x = start.x; x <= end.x; x++) {
			for (let y = end.y; y <= start.y; y++) {
				await downloadTile(z, x, y);
			}
		}
	};

	const loadTiles = async () => {
		console.log("RUN loadTiles");

		const start = latLonToTile(LAT_START, LON_START, ZOOM_LEVEL);
		const end = latLonToTile(LAT_END, LON_END, ZOOM_LEVEL);
		let allTilesExist = true;

		for (let x = start.x; x <= end.x; x++) {
			for (let y = end.y; y <= start.y; y++) {
				const tileUri = `${FileSystem.documentDirectory}local_tile/${ZOOM_LEVEL}/${x}/${y}.png`;
				const fileInfo = await FileSystem.getInfoAsync(tileUri);
				if (!fileInfo.exists) {
					allTilesExist = false;
					break;
				}
			}
			if (!allTilesExist) break;
		}

		if (allTilesExist) {
			setProgress("Файлаас газрын зураг уншсан");
			setTileUri(`${FileSystem.documentDirectory}local_tile/{z}/{x}/{y}.png`);
			setTilesReady(true);
		} else {
			setProgress("Файлаас мэп олдсонгүй. Газрын зураг татаж байна...");
			downloadTiles();
		}
	};

	const downloadTiles = async () => {
		setProgress("Газрын зураг татаж эхэллээ...");
		await downloadTilesForRegion(ZOOM_LEVEL, LAT_START, LAT_END, LON_START, LON_END);
		setProgress("Газрын зураг татаж дууслаа!");
		setTilesReady(true);
		setTileUri(`${FileSystem.documentDirectory}local_tile/{z}/{x}/{y}.png`);
	};

	const removeOldTiles = async () => {
		console.log("RUN removeOldTiles");

		const tileDir = `${FileSystem.documentDirectory}local_tile`;
		const fileInfo = await FileSystem.getInfoAsync(tileDir);
		if (fileInfo.exists) {
			await FileSystem.deleteAsync(tileDir, { idempotent: true });
			setProgress("Хуучин tile-ууд устгагдлаа");
		}
	};
	return { tileUri, tilesReady, progress, callFnc: () => removeOldTiles().then(() => loadTiles()) };
};

export default useTileLoader;
