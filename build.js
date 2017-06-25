const UglifyJS = require("uglify-js");
const fs = require('fs');
const opts = {
	toplevel: true,
    output: {
        beautify: false,
        preamble: "/* UltraType extension build */"
    }
};

var OUT = fs.readFileSync('./OUT/OUT.js', 'utf8');
setTimeout(() => {
	var res = UglifyJS.minify(OUT, opts);
	if (res.code) {
		fs.writeFileSync('./OUT/OUT.min.js', res.code, 'utf8');
	} else throw res.error;
}, 10);