exec = require('child_process').exec
join = require('path').join

module.exports = class ElmCompiler
  brunchPlugin: yes
  type: 'javascript'
  extension: 'elm'

  constructor: (@config) ->
    @main = @config.plugins.elmBrunch?.main
    @compileTo = @config.plugins.elmBrunch?.compileTo ? join(@config.paths.public, 'js', 'elm.js')

  compile: (data, path, callback) ->
    src = @main ? path
    exec('elm make --yes --output ' + @compileTo + ' ' + src, (error, stdout, stderr) ->
      # For now - do not pass generated code to brunch to avoid concatenation
      callback(error, if error then stderr else null))
