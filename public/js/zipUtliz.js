/**
 * node-compress-commons
 *
 * Copyright (c) 2014 Chris Talkington, contributors.
 * Licensed under the MIT license.
 * https://github.com/archiverjs/node-compress-commons/blob/master/LICENSE-MIT
 */
var util = {};
export default util

util.dateToDos = function (d, forceLocalTime) {
	forceLocalTime = forceLocalTime || false;

	var year = forceLocalTime ? d.getFullYear() : d.getUTCFullYear();

	if (year < 1980) {
		return 2162688; // 1980-1-1 00:00:00
	} else if (year >= 2044) {
		return 2141175677; // 2043-12-31 23:59:58
	}

	var val = {
		year: year,
		month: forceLocalTime ? d.getMonth() : d.getUTCMonth(),
		date: forceLocalTime ? d.getDate() : d.getUTCDate(),
		hours: forceLocalTime ? d.getHours() : d.getUTCHours(),
		minutes: forceLocalTime ? d.getMinutes() : d.getUTCMinutes(),
		seconds: forceLocalTime ? d.getSeconds() : d.getUTCSeconds(),
	};

	return (
		((val.year - 1980) << 25) |
		((val.month + 1) << 21) |
		(val.date << 16) |
		(val.hours << 11) |
		(val.minutes << 5) |
		(val.seconds / 2)
	);
};

util.dosToDate = function (dos) {
	return new Date(
		((dos >> 25) & 0x7f) + 1980,
		((dos >> 21) & 0x0f) - 1,
		(dos >> 16) & 0x1f,
		(dos >> 11) & 0x1f,
		(dos >> 5) & 0x3f,
		(dos & 0x1f) << 1
	);
};

util.getShortBytes = function (v) {
	let view = new DataView(new ArrayBuffer(2));
	view.setUint16(0, (v & 0xffff) >>> 0, true)
	return new Uint8Array(view.buffer);
};

util.getLongBytes = function (v) {
	let view = new DataView(new ArrayBuffer(4));
	view.setUint32(0, (v & 0xffffffff) >>> 0, true)
	return new Uint8Array(view.buffer)
};

