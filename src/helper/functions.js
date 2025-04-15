import AsyncStorage from "@react-native-async-storage/async-storage";

export const addCommas = (num) => {
	return num?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const removeNonNumeric = (num) => {
	if (num?.toString().charAt(0) === "0") {
		num = num?.toString()?.substring(1);
	}
	if (num?.toString()?.replace(/[^0-9]/g, "") > 500000000) {
		num = num?.slice(0, -1);
	}
	return num?.toString()?.replace(/[^0-9]/g, "");
};

export const formatTime = (time) => {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = time % 60;
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;
};

export const convertHexWithAlpha = (kmlColor) => {
	if (!kmlColor || kmlColor?.length !== 8) {
		console.error("Invalid color format. Expected AABBGGRR (8 characters).");
		return null;
	}

	const alphaHex = kmlColor.substring(0, 2); // Alpha
	const blue = kmlColor.substring(2, 4); // Blue
	const green = kmlColor.substring(4, 6); // Green
	const red = kmlColor.substring(6, 8); // Red

	const alphaDecimal = (parseInt(alphaHex, 16) / 255).toFixed(2);

	const color = `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, ${alphaDecimal})`;

	return color;
};

// Газарзүйн зайг тооцоолох (Haversine Formula)
export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
	const R = 6371000; // Дэлхийн радиус (метр)
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Зайг метрээр буцаана
};

export const generateLast3Years = () => {
	//*****Сүүлийн 3 жилийн Он-Сар
	var current_date = new Date();
	var max = new Date().getFullYear();
	var min = max - 2; //*****Одоогоос өмнөх 2 жил
	var date = `${min}-${current_date.getMonth()}`; //*****Одоогоос өмнөх 2 жилийн энэ өдөр
	var yearsWithMonths = []; //*****Жил-Сар түр хадгалах
	var month = 0;

	const end_date = new Date(date.replace(" ", " ,1 "));
	const start_date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

	while (end_date <= start_date) {
		month = start_date.getMonth() + 1;
		if (month.toString()?.length === 1) {
			month = `0${month}`;
		} else {
			month = month;
		}
		yearsWithMonths.push({
			id: start_date.getFullYear() + "-" + month,
			name: start_date.getFullYear() + " - " + month + " сар"
		});
		start_date.setMonth(start_date.getMonth() - 1);
	}

	return yearsWithMonths;
};

export const transformLocations = (refLocations, refLocationTypes) => {
	const locationSource = {
		SRC: {
			STK: [],
			PIT: []
		},
		DST: {
			DMP: [],
			STK: [],
			MILL: []
		}
	};

	// Map location types by ID for easy lookup
	const locationTypeMap = refLocationTypes?.reduce((acc, type) => {
		acc[type.id] = type.Name;
		return acc;
	}, {});

	refLocations?.forEach((location) => {
		const typeName = locationTypeMap[location?.PMSLocationTypeId];
		if (!typeName) return;

		if (locationSource.SRC.hasOwnProperty(typeName)) {
			locationSource.SRC[typeName].push(location);
		}
		if (locationSource.DST.hasOwnProperty(typeName)) {
			locationSource.DST[typeName].push(location);
		}
	});

	return locationSource;
};

//Өгөгдсөн цэгээс distanceKm радиусын 4н цэг олохь Жнь: Төв талбайгаас Баруун, Зүүн, Урд, Хойд гээд
export const getSurroundingPoints = async (latitude, longitude, distanceKm) => {
	const oneKmInDegreesLat = 1 / 111.32; // 1 км-ийн өргөргийн градус
	const oneKmInDegreesLon = 1 / (111.32 * Math.cos(latitude * (Math.PI / 180))); // 1 км-ийн уртрагийн градус

	const distanceInDegreesLat = oneKmInDegreesLat * distanceKm;
	const distanceInDegreesLon = oneKmInDegreesLon * distanceKm;

	// console.log("getSurroundingPoints ====>", {
	// 	north: { latitude: latitude + distanceInDegreesLat, longitude },
	// 	south: { latitude: latitude - distanceInDegreesLat, longitude },
	// 	east: { latitude, longitude: longitude + distanceInDegreesLon },
	// 	west: { latitude, longitude: longitude - distanceInDegreesLon }
	// });
	return {
		north: { latitude: latitude + distanceInDegreesLat, longitude },
		south: { latitude: latitude - distanceInDegreesLat, longitude },
		east: { latitude, longitude: longitude + distanceInDegreesLon },
		west: { latitude, longitude: longitude - distanceInDegreesLon }
	};
};

export const saveProjectCoordinates = async (latitude, longitude) => {
	// Project -н location хадгалах
	try {
		await AsyncStorage.setItem("project_latitude", latitude);
		await AsyncStorage.setItem("project_longitude", longitude);
	} catch (error) {
		console.error("Координат хадгалах үед алдаа гарлаа:", error);
	}
};

export const checkIfCoordinatesChanged = async (newLat, newLng) => {
	// Project -н location өөрчлөгдсөн эсэхийг шалгах
	try {
		const oldLat = await AsyncStorage.getItem("project_latitude");
		const oldLng = await AsyncStorage.getItem("project_longitude");

		let changed = false;

		if (!oldLat || !oldLng) {
			// Анхны хадгалалт
			changed = false;
		} else if (oldLat !== newLat || oldLng !== newLng) {
			// Хуучин координатаас ялгаатай байвал өөрчлөгдсөн гэх
			changed = true;
		}

		// Ямар ч тохиолдолд шинэ координатыг хадгална
		await saveProjectCoordinates(newLat, newLng);

		return changed;
	} catch (error) {
		console.error("Координат шалгах үед алдаа гарлаа:", error);
		return false;
	}
};
