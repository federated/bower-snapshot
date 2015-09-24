"use strict";

var fs = require('graceful-fs');
var bowerJson = require('bower-json');
var async = require('async');

function snap() {

    // Read project Bower file
    bowerJson.read('./bower.json', function (err, json) {
        if (err) {
            console.error('There was an error reading the file');
            console.error(err.message);
            return;
        }

        var updatedVersions = [];
        var dependencies = json.dependencies;

        async.forEachOf(json.dependencies, function (version, dependency, seriesCallback) {

                var filename = 'bower_components/' + dependency + '/.bower.json';

                // Now that we got the filename, we can read its contents
                bowerJson.read(filename, {validate: false}, function (err, jsonComponent) {
                    if (err) {
                        console.error('There was an error reading the file');
                        console.error(err.message);
                        seriesCallback(null);
                        return;
                    }

                    //console.log(dependency + ' : ' + version + ' -> ' + jsonComponent.version);
                    updatedVersions.push({dependency: dependency, version: jsonComponent.version});
                    seriesCallback(null);
                });
            },
            function (err) {

                // Update package versions
                for (var i = 0; i < updatedVersions.length; i++) {
                    for (var key in dependencies) {
                        if (updatedVersions[i].dependency === key) {
                            dependencies[key] = updatedVersions[i].version;
                            break;
                        }
                    }
                }

                // Persist
                var outputFilename = 'bower.json';

                fs.writeFile(outputFilename, JSON.stringify(json, null, 4), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("JSON saved to " + outputFilename);
                    }
                });
            });
    });
}

module.exports = read;