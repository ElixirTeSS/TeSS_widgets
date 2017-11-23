var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
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
jsSources = ['components/scripts/embed.js'];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];

gulp.task('serve', ['compass'], function() {
    browserSync.init({
        server: outputDir
    });

    gulp.watch("components/sass/*.scss", ['compass']);
    gulp.watch("components/scripts/**", ['js']);
    gulp.watch(outputDir + '*.html', ['html']);
});

gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(browserSync.stream());
});

gulp.task('compass', function() {
  gulp.src("components/sass/*.scss")
  .pipe(compass({
    css: outputDir + 'css',
    sass: 'components/sass',
    style: sassStyle
  }))
  .pipe(browserSync.stream());
});

gulp.task('html', function() {
  gulp.src(outputDir + '*.html')
    .pipe(gulp.dest(outputDir))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
