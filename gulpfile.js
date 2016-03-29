'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var uglify = require('gulp-uglifyjs');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var gulpIf = require('gulp-if');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var autoprefixer = require('gulp-autoprefixer');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

gulp.task('browser-sync', function() {
	browserSync({
            server: {
                    baseDir: 'src'
            },
            notify: false
            });
});

gulp.task('sass', function(){
	return gulp.src('src/scss/**/*.scss')
            .pipe(gulpIf(isDevelopment, sourcemaps.init()))
            .pipe(sass({
                includePaths: require('node-bourbon').includePaths
            }).on('error', sass.logError))
            .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
            .pipe(gulpIf(isDevelopment, sourcemaps.write()))
            .pipe(gulp.dest('src/css'))
            .pipe(browserSync.reload({stream: true}));
});

//gulp.task('scripts', function() {
//	return gulp.src([
//        './src/libs/modernizr/modernizr.js',
//        './src/libs/jquery/jquery-1.11.2.min.js',
//        './src/libs/waypoints/waypoints.min.js',
//        './src/libs/animate/animate-css.js',
//	'./src/libs/hover-dropdown/hover-dropdown.js'
//  ])
//            .pipe(concat('libs.min.js'))
//            .pipe(uglify())
//            .pipe(gulp.dest('src/js'));
//});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src([
            'src/css/fonts.css',
            'src/css/header.css'
            ])
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
            .pipe(gulp.dest('src/css'));
});

gulp.task('watch', ['browser-sync', 'css-libs'], function() {
	gulp.watch('src/scss/**/*.scss', ['sass']);
        gulp.watch('src/libs/**/*.js', ['scripts']);
        gulp.watch('src/*.html', browserSync.reload);
	gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*')
            .pipe(cache(imagemin({
                interlaced: true,
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            })))
            .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['clean', 'img', 'sass'], function() {

	var buildCss = gulp.src([
		'src/css/main.css',
		'src/css/fonts.min.css'
		])
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('src/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*')
	.pipe(gulp.dest('dist/js'));

        var buildLibsjs = gulp.src('src/libs/**/*')
	.pipe(gulp.dest('dist/libs'));

	var buildHtml = gulp.src('src/*.html')
	.pipe(gulp.dest('dist'));

	var buildFavicon = gulp.src(['src/*.ico', 'src/*.png'])
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
});

gulp.task('default', ['watch']);
