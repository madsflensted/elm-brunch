(function() {
  var ElmCompiler, elmCompile, childProcess, path;

  childProcess = require('child_process');
  path = require('path');

  module.exports = ElmCompiler = (function() {
    ElmCompiler.prototype.brunchPlugin = true;
    ElmCompiler.prototype.type = 'javascript';
    ElmCompiler.prototype.extension = 'elm';

    function ElmCompiler(config) {
      var elm_config = {};
      elm_config.outputFolder = (config.plugins.elmBrunch || {}).outputFolder || path.join(config.paths.public, 'js');
      elm_config.mainModules = (config.plugins.elmBrunch || {}).mainModules;
      elm_config.elmFolder = (config.plugins.elmBrunch || {}).elmFolder || null;

      this.elm_config = elm_config;
      this.skipedOnInit = {}
    }

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function findModuleToCompile(config, inFile) {
      var file = inFile;
      var elmFolder = config.elmFolder;

      if (elmFolder) {
        file = inFile.replace(new RegExp('^' + escapeRegExp(elmFolder) + '[/\\\\]?'), '');
      }

      var modules = config.mainModules || [file];
      var mainModuleIndex = modules.indexOf(file);

      return { mainModulePath: modules[mainModuleIndex], dependencyPaths: [] }
    }

    ElmCompiler.prototype.compile = function(data, inFile, callback) {
      var info = findModuleToCompile(this.elm_config, inFile);

      if (!info.mainModulePath) {
        return callback(null, '');
      }

      var outputFolder = this.elm_config.outputFolder;
      var elmFolder = this.elm_config.elmFolder;
      var outputFileName = path.basename(info.mainModulePath, '.elm').toLowerCase() + '.js';
      var elmSourceFiles = [ info.mainModulePath ].concat(info.dependencyPaths).join(" ")

      return elmCompile(elmSourceFiles, elmFolder, path.join(outputFolder, outputFileName), callback);
    };

    return ElmCompiler;
  })();

  elmCompile = function(srcFile, elmFolder, outputFile, callback) {
    var info = 'Elm compile: ' + srcFile;

    if (elmFolder) {
      info += ', in ' + elmFolder;
    }

    info += ', to ' + outputFile;

    console.log(info);

    var command = 'elm make --yes --output ' + outputFile + ' ' + srcFile;

    try {
      childProcess.execSync(command, { cwd: elmFolder })
      callback(null, "");
    } catch (error) {
      callback(error, "");
    }
  };
}).call(this);
