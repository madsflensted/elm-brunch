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

      var dependencyPaths = [];
      var modules = [];
      var buildingDependency = false;

      if(config.mainModules instanceof Array) {
        modules = config.mainModules;
      }
      else if (config.mainModules) {
        // If the current file is a dependency, find the mainModule it corresponds to
        // so we can build that instead since you can't build dependencies in isolation.
        for(mainModulePath in config.mainModules) {
          if(config.mainModules[mainModulePath].indexOf(file) != -1) {
            file = mainModulePath;
            buildingDependency = true;
            break;
          }
        }

        dependencyPaths = config.mainModules[file] || [];
        modules = Object.keys(config.mainModules);
      }
      else {
        modules = [file];
      }

      var mainModuleIndex = modules.indexOf(file);

      return { mainModulePath: modules[mainModuleIndex], dependencyPaths: dependencyPaths, buildingDependency: buildingDependency }
    }

    ElmCompiler.prototype.compile = function(data, inFile, callback) {
      var info = findModuleToCompile(this.elm_config, inFile);

      if (!info.mainModulePath) {
        return callback(null, '');
      }

      // compile will be called for each file when brunch starts, we only want
      // it to build the main file once, so we use this to skip building it for dependencies.
      if (info.buildingDependency && !this.skipedOnInit[inFile]) {
        this.skipedOnInit[inFile] = true;
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
