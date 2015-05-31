(function() {
  var ElmCompiler, elmCompile, exec, path;

  exec = require('child_process').exec;

  path = require('path');

  module.exports = ElmCompiler = (function() {
    ElmCompiler.prototype.brunchPlugin = true;

    ElmCompiler.prototype.type = 'javascript';

    ElmCompiler.prototype.extension = 'elm';

    function ElmCompiler(config) {
      var elm_config = {};
      elm_config.outputFolder = (config.plugins.elmBrunch || {}).outputFolder || path.join(config.paths.public, 'js');
      elm_config.mainModules = (config.plugins.elmBrunch || {}).mainModules;
      this.elm_config = elm_config;
    }

    ElmCompiler.prototype.compile = function(data, file, callback) {
      var modules = this.elm_config.mainModules || [file];
      var file_is_module_index = modules.indexOf(file);
      if (file_is_module_index >= 0) {
        modules = [modules[file_is_module_index]];
      }
      var outputFolder = this.elm_config.outputFolder;
      return modules.forEach(function(src) {
        var moduleName;
        moduleName = path.basename(src, '.elm').toLowerCase();
        return elmCompile(src, path.join(outputFolder, moduleName + '.js'), callback);
      });
    };

    return ElmCompiler;

  })();

  elmCompile = function(srcFile, outputFile, callback) {
    console.log('Elm compile: ' + srcFile + ', to ' + outputFile);
    return exec('elm make --yes --output ' + outputFile + ' ' + srcFile, function(error, stdout, stderr) {
      return callback(error, error ? stderr : null);
    });
  };

}).call(this);
