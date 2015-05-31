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
        // Set to the elm file(s) containing your "main" function 
        // `elm make` handles all elm dependencies
        mainModules: ['source/path/YourMainModule.elm'],
        // Defaults to 'js/' folder in paths.public
        outputFolder: 'some/path/'
      }
   }

```

The output filename is the lowercase version of the main module name:
```
YourMainModule.elm => outputFolder/yourmainmodule.elm
```
