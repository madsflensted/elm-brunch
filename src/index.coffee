exec = require('child_process').exec
join = require('path').join

module.exports = class ElmCompiler
  brunchPlugin: yes
  type: 'javascript'
  extension: 'elm'

  constructor: (@config) ->
    @outputDir = @config.plugins.elmBrunch?.outputDir ? join(@config.paths.public, 'js')

  compile: (data, path, callback) ->
    exec('elm make --yes --output ' + join(@outputDir, 'elm.js') + ' ' + path, (error, stdout, stderr) ->
      callback(error, if error then stderr else null))
