# elm-brunch
[Brunch](http://brunch.io) plugin to compile Elm code

# Install Elm
[Elm installation instructions](http://elm-lang.org/Install.elm)

# Install elm-brunch
```
npm install --save elm-brunch
```

# Tips
Update the "source-directories" property in the elm-package.json file if you want to compile multi-file elm projects.
Then configure elm-brunch:

```
  // Configure your plugins in brunch-config.js (or .coffee)
    plugins: {
      ...

      elmBrunch: {
        // Set to path where elm-package.json is located, defaults to project root (optional)
        // if your elm files are not in /app then make sure to configure paths.watched in main brunch config
        elmFolder: 'path/to/elm-files',
        
        // Set to the elm file(s) containing your "main" function
        // `elm make` handles all elm dependencies (required)
        // relative to `elmFolder`
        mainModules: ['source/path/YourMainModule.elm'],
        
        // Defaults to 'js/' folder in paths.public (optional)
        outputFolder: 'some/path/',
        
        // optional: add some parameters that are passed to elm-make
        makeParameters : ['--warn']
      }
   }

```

The output filename is the lowercase version of the main module name:
```
YourMainModule.elm => outputFolder/yourmainmodule.js
```

# Examples
The following repos are examples of elm-brunch configuration:
- https://github.com/joedski/brunch-with-elm/blob/master/brunch-config.coffee
- https://github.com/madsflensted/dots/blob/master/brunch-config.js
- https://github.com/ivanoats/Bingo/blob/master/brunch-config.js
