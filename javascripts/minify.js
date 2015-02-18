// Requires
var fs = require('fs'),
	UglifyJS = require('uglify-js');

// Minify
function minify(code) {
	console.log(code);
	var toplevel = UglifyJS.parse(code);
	toplevel.figure_out_scope();
	var compressor = UglifyJS.Compressor({
		sequences: true,
		properties: true,
		dead_code: true,
		drop_debugger: true,
		unsafe: true,
		conditionals: true,
		comparisons: true,
		evaluate: true,
		booleans: true,
		loops: true,
		unused: true,
		hoist_funs: true,
		if_return: true,
		join_vars: true,
		cascade: true,
		warnings: true,
		negate_iife: true,
		drop_console: true,
		keep_fargs: false
	});
	var compressed_ast = toplevel.transform(compressor);
	compressed_ast.figure_out_scope();
	compressed_ast.compute_char_frequency();
	compressed_ast.mangle_names();
	return compressed_ast.print_to_string();
}

var code = fs.readFileSync('tictactoe.golf.js', 'ascii');
var minifiedCode = minify(code);


// Report on stats
console.log('Code size: ' + code.length);
console.log('Minified code size: ' + minifiedCode.length);

// Insert into golf.html from shim.html
var shimHTML = fs.readFileSync('../shim.html', 'ascii');
var golfHTML = shimHTML.replace('{{GOLF}}', minifiedCode);
fs.writeFileSync('../golf.html', golfHTML, {encoding: 'ascii'});

// Write minified JS to tictactoe.golf.min.js
fs.writeFileSync('tictactoe.golf.min.js', minifiedCode, {encoding: 'ascii'});