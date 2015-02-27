// Requires
var fs = require('fs'),
    child_process = require('child_process'),
    UglifyJS = require('uglify-js');

function minifyWithReport() {
  // Custom replace
  function keywordReplace(code) {
    var keywords = ['overallwinner', 'tictactoe', 'game', 'square', 'winner', 'side', 'playagain', 'intro', 'player', 'active', 'invisible', 'Elements'];
    var mapping = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'o'];
    for(var i = 0; i < keywords.length; i++) {
      code = code.replace(new RegExp(keywords[i], 'g'), mapping[i]);
    }
    console.log(code);
    return code;
  }

  // Minify
  function minify(code) {
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
  var keywordReplacedCode = keywordReplace(code);
  var minifiedCode = minify(keywordReplacedCode);

  // Print code
  console.log(code);
  console.log(keywordReplacedCode);
  console.log(minifiedCode);

  // Report on stats
  var report = [
    'Code size: ' + code.length,
    'Keyword replaced code size: ' + keywordReplacedCode.length,
    'Minified code size: ' + minifiedCode.length
  ].join('\n');

  console.log(report)

  // Insert into golf.html from shim.html
  var shimHTML = fs.readFileSync('../shim.html', 'ascii');
  var golfHTML = shimHTML.replace('{{GOLF}}', minifiedCode);
  var codeHTML = shimHTML.replace('{{GOLF}}', code);
  fs.writeFileSync('../golf.min.html', golfHTML, {encoding: 'ascii'});
  fs.writeFileSync('../golf.html', codeHTML, {encoding: 'ascii'});

  // Write minified JS to tictactoe.golf.min.js
  fs.writeFileSync('tictactoe.golf.min.js', minifiedCode, {encoding: 'ascii'});
  child_process.execFile('notify-send', ['Build Completed', report])
}

function safeMinifyWithReport() {
  try {
    minifyWithReport();
  } catch(e) {
    console.log(e);
  }
}

// Initial minification
safeMinifyWithReport();

// fs watcher
fs.watchFile('tictactoe.golf.js', safeMinifyWithReport);
