module.exports = (grunt) ->
  pkg = require './package.json'
  grunt.initConfig
    pkg: pkg

    coffee:
      compile:
        options:
          join: true
          bare: true
        files: [
          'bin/ficdown.js': ['src/*.coffee']
        ]

    stylus:
      compile:
        options:
          compress: true
          expand: true
        files: [
          'bin/example/player.css': ['src/example/*.styl']
        ]

    uglify:
      js:
        files:
          'bin/ficdown.min.js': [
            'bin/ficdown.js'
          ]

    copy:
      static:
        files: [
          expand: true
          flatten: true
          src: ['src/*.html']
          dest: 'bin/'
        ]
      example:
        files: [
          expand: true
          flatten: true
          src: ['src/example/*.html', 'src/example/*.png', 'src/example/*.md']
          dest: 'bin/example/'
        ]

    watch:
      js:
        files: ['src/**/*.coffee']
        tasks: ['build:js']
      css:
        files: ['src/**/*.styl']
        tasks: ['stylus:compile']
      static:
        files: ['src/**/*.html','src/**/*.js','src/**/*.md']
        tasks: ['copy:static', 'copy:example']

  for name of pkg.devDependencies when name.substring(0, 6) is 'grunt-'
    grunt.loadNpmTasks name

  grunt.registerTask 'build:js', [
    'coffee:compile'
    'uglify:js'
  ]

  grunt.registerTask 'default', [
    'coffee:compile'
    'uglify:js'
    'stylus:compile'
    'copy:static'
    'copy:example'
  ]
