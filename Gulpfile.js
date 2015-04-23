var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var webpack = require('webpack');
var jshint = require('gulp-jshint');
var map = require('map-stream');
//var header = require('gulp-header');

var pkg = require('./package.json');

var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> - '
+ '<%= new Date().toISOString() %>\n'
+ '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>'
+ '* Copyright (c) <%= new Date().getFullYear() %> <%= pkg.author.name %>;'
+ ' Licensed <%= pkg.license %> */'

gulp.task('build', [ ], function(callback) {
  webpack({
    cache: true,
    entry: './src/js/ripple/index.js',
    output: {
      library: 'payshares',
      path: './build/',
      filename: 'payshares-lib.js'
    },
  }, callback);
});

gulp.task('build-min', [ 'build' ], function(callback) {
  return gulp.src('./build/payshares-lib.js')
  .pipe(uglify())
  .pipe(rename('payshares-lib-min.js'))
  .pipe(gulp.dest('./build/'));
});

gulp.task('build-debug', [ ], function(callback) {
  webpack({
    cache: true,
    entry: './src/js/ripple/index.js',
    output: {
      library: 'payshares',
      path: './build/',
      filename: 'payshares-lib-debug.js'
    },
    debug: true,
    devtool: 'eval'
  }, callback);
});

gulp.task('lint', function() {
  gulp.src('src/js/ripple/*.js')
  .pipe(jshint())
  .pipe(map(function(file, callback) {
    if (!file.jshint.success) {
      console.log('\nIn', file.path);

      file.jshint.results.forEach(function(err) {
        if (err && err.error) {
          var col1 = err.error.line + ':' + err.error.character;
          var col2 = '[' + err.error.reason + ']';
          var col3 = '(' + err.error.code + ')';

          while (col1.length < 8) {
            col1 += ' ';
          }

          console.log('  ' + [ col1, col2, col3 ].join(' '));
        }
      });
    }

    callback(null, file);
  }));
});

gulp.task('watch', function() {
  gulp.watch('src/js/ripple/*', [ 'build-debug' ]);
});

gulp.task('default', [ 'build', 'build-debug', 'build-min' ]);
