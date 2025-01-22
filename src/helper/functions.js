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
