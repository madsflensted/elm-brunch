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
      elm_config.optimize = (config.plugins.elmBrunch || {}).optimize || false;
      elm_config.elmMake = (config.plugins.elmBrunch || {}).elmMake || "elm make";
      elm_config.executablePath = (config.plugins.elmBrunch || {}).executablePath || "";
      elm_config.outputFolder = (config.plugins.elmBrunch || {}).outputFolder || path.join(config.paths.public, 'js');
      elm_config.outputFile = (config.plugins.elmBrunch || {}).outputFile || null;
      elm_config.mainModules = (config.plugins.elmBrunch || {}).mainModules;
      elm_config.independentModules = (config.plugins.elmBrunch || {}).independentModules || null;
      elm_config.elmFolder = (config.plugins.elmBrunch || {}).elmFolder || null;
      elm_config.makeParameters = (config.plugins.elmBrunch || {}).makeParameters || [];
      this.elm_config = elm_config;
      this.skipedOnInit = {};
    }

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    ElmCompiler.prototype.compile = function(data, inFile, callback) {
      var elmFolder = this.elm_config.elmFolder;
      var file = inFile;
      if (elmFolder) {
        file = inFile.replace(new RegExp('^' + escapeRegExp(elmFolder) + '[/\\\\]?'), '');
      }
      var modules = this.elm_config.mainModules || [file];
      var compileModules = modules;
      var file_is_module_index = modules.indexOf(file);
      if (file_is_module_index >= 0) {
        compileModules = [modules[file_is_module_index]];
      } else {
        if (this.skipedOnInit[file]){
        } else {
          this.skipedOnInit[file] = true;
          return callback(null, '');
        }
      }
      var elmMake = this.elm_config.elmMake + ( this.elm_config.optimize ? " --optimize" : "" );
      var executablePath = this.elm_config.executablePath;
      var outputFolder = this.elm_config.outputFolder;
      var independentModules = this.elm_config.independentModules;
      var outputFile = this.elm_config.outputFile;
      const makeParameters = this.elm_config.makeParameters;
      if (outputFile === null) {
        return compileModules.forEach(function(src) {
          var moduleName;
          moduleName = path.basename(src, '.elm').toLowerCase();
          if(independentModules){
            var src_path_length = src.split(path.sep).length;
            if(src_path_length > 1){
                moduleName = path.dirname(src).replace(path.sep,'_') + '_' + moduleName;
                outputFolder = ('..' + path.sep).repeat(src_path_length - 1) + outputFolder;
                if(elmFolder == null)
                    elmFolder = path.dirname(src);
                else
                    elmFolder = elmFolder + path.sep + path.dirname(src);
            }
            src = path.basename(src);
          }
          return elmCompile ( executablePath
                            , src
                            , elmMake
                            , elmFolder
                            , path.join(outputFolder, moduleName + '.js')
                            , makeParameters
                            , callback );
        });
      } else {
        return elmCompile ( executablePath
                          , modules
                          , elmMake
                          , elmFolder
                          , path.join(outputFolder, outputFile)
                          , makeParameters
                          , callback );
      }
    };

    return ElmCompiler;

  })();

  elmCompile = function(executablePath, srcFile, elmMake, elmFolder, outputFile, makeParameters, callback) {
    if (Array.isArray(srcFile)) {
      srcFile = srcFile.join(' ');
    }
    var info = 'Elm compile: ' + srcFile;
    if (elmFolder) {
      info += ', in ' + elmFolder;
    }
    info += ', to ' + outputFile;
    console.log(info);

    const params = []  //  Reply 'yes' to all automated prompts
                  .concat(makeParameters) // other options from brunch-config.js
                  .concat(['--output', outputFile , srcFile ]);

    var executable = path.join(executablePath, elmMake);
    var command = executable + ' ' + params.join(' ');

    try {
      childProcess.execSync(command, { cwd: elmFolder });
      callback(null, "");
    } catch (error) {
      callback(error, "");
    }
  };

}).call(this);
