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

export const calcDistance = (lat1, lon1, lat2, lon2) => {
	const toRad = (degree) => degree * (Math.PI / 180); // Дэгрийг радиан болгон хөрвүүлэх
	// const R = 6371; // Дэлхийн радиус, км
	const R = 6371000; // Дэлхийн радиус, метр

	const lat1Rad = toRad(lat1);
	const lon1Rad = toRad(lon1);
	const lat2Rad = toRad(lat2);
	const lon2Rad = toRad(lon2);

	const dLat = lat2Rad - lat1Rad;
	const dLon = lon2Rad - lon1Rad;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Зай, км-ээр

	return distance; // Зайг км-ээр буцаана
};
