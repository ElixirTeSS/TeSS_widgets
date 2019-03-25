const gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sass = require('gulp-sass'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    babelify = require('babelify'),
    browserSync = require('browser-sync').create(),
    process = require('process');

// Use 'NODE_ENV=production gulp' for production mode.
const env = process.env.NODE_ENV || 'development';
const outputDir = (env === 'development') ? 'builds/development/' : 'builds/production/';

const html = function () {
    return gulp.src('components/html/index.html')
        .pipe(gulp.dest(outputDir))
};

const css = function () {
    return gulp.src('components/sass/*.scss')
        .pipe(sass({ outputStyle: (env === 'development') ? 'expanded' : 'compressed' }).on('error', sass.logError))
        .pipe(gulp.dest(outputDir + 'css'))
};

const js = function () {
    return browserify('./components/js/tess-widget-standalone.js', { debug: true, standalone: 'TessWidget' })
        .transform(babelify, { global: true, presets: ["@babel/preset-env"] })
        .bundle()
        .pipe(source('tess-widget-standalone.js'))
        .pipe(buffer())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
};

const build = gulp.parallel(js, css, html);

const serve = gulp.series(build, function () {
    browserSync.init({ server: outputDir });
    function reload(done) {
        browserSync.reload();
        done();
    }
    gulp.watch('components/sass/*.scss', gulp.series(css, reload));
    gulp.watch('components/js/**', gulp.series(js, reload));
    gulp.watch('components/html/*.html', gulp.series(html, reload));
});

const buildExamples = gulp.series(build, function () {
    return gulp.src(outputDir + '/**')
        .pipe(gulp.dest('./docs/'));
});

exports.default = serve;
exports.build = build;
exports['build-examples'] = buildExamples;
