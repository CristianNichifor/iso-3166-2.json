var fs = require("node:fs");
var path = require("node:path");
var parse = require("csv-parse/sync").parse;

function compile(source, duplicateExceptions = {}) {
  var output = {};
  var currentCode;
  var subdivisionRows = new Map();
  parse(source).forEach(function (row) {
    var code = row[0];
    var sub = row[1] || row[2];
    var name = row[3];
    if (code) {
      if (!/^[A-Z]{2}$/.test(code) || Object.hasOwn(output, code)) {
        throw new Error("invalid or duplicate country code: " + code);
      }
      currentCode = code;
      output[code] = { name: name, divisions: {} };
    }
    if (sub) {
      if (!currentCode || !sub.startsWith(currentCode + "-")) {
        throw new Error("country did not equal subdivision code: " + sub);
      }
      if (!subdivisionRows.has(sub)) subdivisionRows.set(sub, []);
      subdivisionRows.get(sub).push(row);
      output[currentCode].divisions[sub] = name;
    }
    if ((code || sub) && !name.trim()) throw new Error("missing name");
  });
  var usedExceptions = new Set();
  subdivisionRows.forEach(function (rows, sub) {
    // Identical names in the two hierarchy columns produce the same flat value.
    if (new Set(rows.map(function (row) { return row[3]; })).size === 1) return;
    // Retain historical last-wins output only for the exact reviewed row sequence.
    if (!Object.hasOwn(duplicateExceptions, sub) ||
        JSON.stringify(rows) !== JSON.stringify(duplicateExceptions[sub])) {
      throw new Error("conflicting duplicate subdivision code: " + sub);
    }
    usedExceptions.add(sub);
  });
  Object.keys(duplicateExceptions).forEach(function (sub) {
    if (!usedExceptions.has(sub)) throw new Error("unused duplicate exception: " + sub);
  });
  return output;
}

module.exports = { compile: compile };

if (require.main === module) {
  try {
    var outputFile = path.join(__dirname, "iso-3166-2.json");
    var exceptions = JSON.parse(fs.readFileSync(path.join(__dirname, "data/duplicate-exceptions.json"), "utf8"));
    var result = JSON.stringify(compile(fs.readFileSync(path.join(__dirname, "data/eQuest.csv"), "utf8"), exceptions), null, "  ");
    if (process.argv.includes("--check")) {
      if (fs.readFileSync(outputFile, "utf8") !== result) {
        throw new Error("generated data differs; run npm run build and review the source/output diff");
      }
      console.log("Generated JSON matches the committed source.");
    } else {
      fs.writeFileSync(outputFile, result);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
