const {CRC32Stream,DeflateCRC32Stream} = require('crc32-stream');
const path = require("path")
const fs = require("fs")

const source = fs.createReadStream(
	path.join(
		path.resolve(),
		"public",
		"tmp",
		"ag.mp4"
	)
);
const checksum = new DeflateCRC32Stream({level : 8});

checksum.on('end', function(err) {
	console.log(
		"crc : %s \nsize : %s\ncomp. size : %s"+
		"\npercent : %s%", 
		checksum.digest("hex"),
		checksum.size()+'',
		checksum.size(1)+'',
		((checksum.size() - checksum.size(1))/checksum.size()*100)
		.toFixed(2)+''
	)
	
});

// either pipe it
source.pipe(checksum);
checksum.pipe(fs.createWriteStream("cs.mp4"))