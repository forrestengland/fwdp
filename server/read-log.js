// read a pine-http log and print out info

import fs from 'node:fs';
import readline from 'node:readline';
import djson from 'dirty-json';

export default class LogFile {

    constructor(filePath) {
	this.filePath = filePath;
	this.data = [];
    }

    async readData() {

	this.fileStream = fs.createReadStream(this.filePath);
	const rl = readline.createInterface({
	    input: this.fileStream,
	    crlfDelay: Infinity
	});

	for await (const line of rl) {

	    const result = djson.parse(line);
//	    console.log(result);
	    this.data.push(result);
//	    console.log(this.data);
	}
    }

    getData() {
	return this.data;
    }
}

async function processLog() {
    const logFile = new LogFile("test-log-backup.json");
    await logFile.readData();
    const data = logFile.getData();
    console.log(JSON.stringify(data));
}
processLog();
