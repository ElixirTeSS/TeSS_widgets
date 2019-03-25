var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sass = require('gulp-sass'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync').create();

var env,
    outputDir,
    sassStyle;

// Use 'NODE_ENV=production gulp' for production mode.
env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

gulp.task('serve', ['js', 'sass', 'html'], function() {
    browserSync.init({
        server: outputDir
    });

    gulp.watch('components/sass/*.scss', ['sass']);
    gulp.watch('components/js/**', ['js']);
    gulp.watch('components/html/*.html', ['html']);
});

gulp.task('js', function() {
    var b = browserify({
        entries: './components/js/tess-widget-standalone.js',
        debug: true,
        standalone: 'TessWidget'
    });

    return b.bundle()
        .pipe(source('tess-widget-standalone.js'))
        .pipe(buffer())
        .pipe(babel({ presets: ['@babel/preset-env'] }))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function() {
    return gulp.src('components/sass/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(browserSync.stream());
});

gulp.task('html', function() {
    return gulp.src('components/html/index.html')
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);

gulp.task('build', ['js', 'sass', 'html']);

gulp.task('build-examples', ['js', 'sass', 'html'], function () {
    return gulp.src(outputDir + '/**')
        .pipe(gulp.dest('./docs/'));
});
