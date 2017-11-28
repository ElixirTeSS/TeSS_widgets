var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    sass = require('gulp-sass'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create();

var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle;

// Use 'NODE_ENV=production gulp' for production mode.
env = process.env.NODE_ENV || 'development';

if (env==='development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

// Sources (arrays)
jsSources = ['components/scripts/standalone.js'];
sassSources = ['components/sass/tess-widget.scss'];
htmlSources = [outputDir + '*.html'];

gulp.task('serve', ['js', 'sass'], function() {
    browserSync.init({
        server: outputDir
    });

    gulp.watch("components/sass/*.scss", ['sass']);
    gulp.watch("components/scripts/**", ['js']);
    gulp.watch(outputDir + '*.html', ['html']);
});

gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(browserify({ standalone: 'TessWidget' }))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(browserSync.stream());
});

gulp.task('sass', function() {
  gulp.src("components/sass/*.scss")
  .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
  .pipe(gulp.dest(outputDir + 'css'))
  .pipe(browserSync.stream());
});

gulp.task('html', function() {
  gulp.src(outputDir + '*.html')
    .pipe(gulp.dest(outputDir))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
