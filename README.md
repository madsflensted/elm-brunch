# elm-brunch
Brunch plugin to compile Elm code

# Install Elm
[Elm instalation instructions](http://elm-lang.org/Install.elm)

# Tips
Update the "source-directories" property in the elm-package.json file if you want to compile multifile elm projects.
Then configure elm-brunch:

```
  // Configure your plugins
    plugins: {
      ...

      elmBrunch: {
        main: 'source/path/YourMainModule.elm',  // Set when elm code spans multiple files
        compileTo: 'some/path/elm.js'            // defaults to 'elm.js' in paths.public 'js' folder
      }
   }

```
