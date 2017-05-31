(function() {
  var ElmCompiler, elmCompile, childProcess, path;

  childProcess = require('child_process');

  path = require('path');

  module.exports = ElmCompiler = (function() {
    ElmCompiler.prototype.brunchPlugin = true;

    ElmCompiler.prototype.type = 'javascript';

    ElmCompiler.prototype.extension = 'elm';

    function ElmCompiler(config) {
      const defaults = {executablePath: "", outputFolder: path.join(config.paths.public, 'js'), outputFile: null, elmFolder: null, makeParameters: []};
      this.elm_config = Object.assign({}, defaults, config.plugins.elmBrunch);
      this.skipedOnInit = {};
      this.compiledOnCurrentStep = {};
    }

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    ElmCompiler.prototype.compile = function(data, inFile, callback) {
      this.compiledOnCurrentStep = {};
      return callback(null, '');
    };

    ElmCompiler.prototype.onCompile = function(files, assets) {
      if(!Array.isArray(files)) files = [files];
      const _this = this;

      files.forEach(function(item) {
        item.sourceFiles.forEach(function(file) {
          if(/\.elm$/i.test(file.path)){
            var filePath = file.path;

            const elmFolder = _this.elm_config.elmFolder;
            if (elmFolder) {
              filePath = filePath.replace(new RegExp('^' + escapeRegExp(elmFolder) + '[/\\\\]?'), '');
            }

            const modules = _this.elm_config.mainModules || [filePath];
            const file_is_module_index = modules.indexOf(filePath);

            var compileModules = modules;

            if (file_is_module_index >= 0) {
              compileModules = [modules[file_is_module_index]];
            } else {
              if (!_this.skipedOnInit[filePath]){
                _this.skipedOnInit[filePath] = true;
                return;
              }
            }

            const outputFolder = _this.elm_config.outputFolder;
            const outputFile   = _this.elm_config.outputFile;

            if (outputFile === null) {
              return compileModules.forEach(function(src) {
                if(_this.compiledOnCurrentStep[src]) return;

                const moduleName = path.basename(src, '.elm').toLowerCase();
                return _this.elmCompile(src, path.join(outputFolder, moduleName + '.js'));
              });
            } else {
              if(_this.compiledOnCurrentStep[modules]) return;

              return _this.elmCompile(modules, path.join(outputFolder, outputFile));
            }
          }
        })
      })
    };

    ElmCompiler.prototype.elmCompile = function(srcFile, outputFile) {
      const elmFolder      = this.elm_config.elmFolder;
      const executablePath = this.elm_config.executablePath;
      const makeParameters = this.elm_config.makeParameters;

      const originSrcFile = srcFile;
      if (Array.isArray(srcFile)) srcFile = srcFile.join(' ');

      var info = 'Elm compile: ' + srcFile;
      if (elmFolder) info += ', in ' + elmFolder;
      info += ', to ' + outputFile;
      console.log(info);


      const params = ['--yes']  //  Reply 'yes' to all automated prompts
                    .concat(makeParameters) // other options from brunch-config.js
                    .concat(['--output', outputFile , srcFile ]);

      const executable = path.join(executablePath, 'elm-make');
      const command = executable + ' ' + params.join(' ');


      try {
        childProcess.execSync(command, { cwd: elmFolder });
      } catch (error) {
        // we don't want Elm compilation error to crash the whole Brunch process
      }

      this.compiledOnCurrentStep[originSrcFile] = true;
    };

    return ElmCompiler;
  })();
}).call(this);
