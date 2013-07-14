#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLDEFAULT = "http://www.google.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLValid = function(urlString){
    var parsedUrl = url.parse(urlString.toString());
    //var client = http.createClient(80, parsedUrl.host);
    if(parsedUrl == undefined || parsedUrl == null){
	console.log("Invalid URL: %s", urlString);
	process.exit(1);
    }
    return parsedUrl;
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};
 

var finalFunction = function(checkJSON){
    //console.log(checkJSON);
    var outJson = JSON.stringify(checkJSON, null, 4);
    console.log(outJson);
}


var checkURL = function(urlo, checksfile){
    var options = {
    host: urlo.host,
    path: urlo.path
    }
    var request = http.request(options, function (res) {
	var data = '';
	res.on('data', function (chunk) {
            data += chunk;
	});
	res.on('end', function () {
            //console.log(data);
	    $ = cheerio.load(data);
	    var checks = loadChecks(checksfile).sort();
	    var out = {};
	    for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	    }
	    finalFunction(out);

    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();
}





var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var arrayContains = function(arr, str){
    var bcon = false;
    for(i=0;i<arr.length;i++){
	if(arr[i]==str)
	    {
		bcon = true;
		i = arr.length;
	    }
    }
    return bcon;
} 

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u --url <url>', 'URL to html file', clone(assertURLValid), URLDEFAULT)
        .parse(process.argv);
    
    if(arrayContains(process.argv,'--file')){  
	var checkJson = checkHtmlFile(program.file, program.checks);
	finalFunction(checkJson);	
    }
    else if(arrayContains(process.argv,'--url')){
	checkURL(program.url, program.checks);  
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

