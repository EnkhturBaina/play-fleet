import * as FileSystem from "expo-file-system";
import { parseString } from "react-native-xml2js";
import { convertHexWithAlpha } from "../helper/functions";

// Файл байгааг шалгах
export const checkIfFileExists = async (fileUri) => {
	try {
		const fileInfo = await FileSystem.getInfoAsync(fileUri);
		return fileInfo.exists;
	} catch (error) {
		console.error("Error checking file:", error);
		return false;
	}
};

// KML файлыг серверээс татаж авах
export const loadKML = async (url, fileUri) => {
	try {
		const response = await fetch(url);
		const serverFileContent = await response.text();
		await FileSystem.writeAsStringAsync(fileUri, serverFileContent);
		return serverFileContent;
	} catch (error) {
		console.error("Error loading KML file:", error);
		throw error;
	}
};

// KML файлыг боловсруулж полигонуудыг буцаах
export const processKML = (fileContent) => {
	return new Promise((resolve, reject) => {
		parseString(fileContent, { trim: true }, (err, result) => {
			if (err) {
				reject("Error parsing KML");
			}
			const placemarks = result.kml.Document[0].Folder[0].Placemark || [];
			const extractedPolygons = placemarks.map((placemark) => {
				const strokeColor = convertHexWithAlpha(placemark?.Style?.[0]?.LineStyle?.[0]?.color?.[0]);
				const strokeWidth = placemark?.Style?.[0]?.LineStyle?.[0]?.width?.[0];
				const coordinatesString = placemark?.LineString[0]?.coordinates[0];
				const coordinatesArray = coordinatesString
					.trim()
					.split(" ")
					.map((coordinate) => {
						const [longitude, latitude] = coordinate.split(",").map(Number);
						return { latitude, longitude };
					});
				return { coords: coordinatesArray, strokeColor, strokeWidth };
			});
			resolve(extractedPolygons);
		});
	});
};
