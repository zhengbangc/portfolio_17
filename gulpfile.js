/**
	Author: Zhengbang Chen <zhengbangc@gmail.com>
	Reference: https://css-tricks.com/gulp-for-beginners/
*/

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var nodemon = require('gulp-nodemon');

gulp.task('sass', function(){
	return gulp.src('app/scss/**/*')
		.pipe(sass()) //Converts Sass to CSS with gulp-sass
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('watch', ['browserSync', 'sass'], function(){
	gulp.watch('app/scss/**/*', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
})

gulp.task('useref', function(){
	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
	return gulp.src('app/images/**/*')
		//caching images that ran through imagemin
		.pipe(cache(imagemin({
			// interlaced: true
		})))
		.pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function(){
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
});

gulp.task('clean:dist', function(){
	return del.sync('dist');
});

gulp.task('build', function(callback){
	runSequence('clean:dist',
		['sass', 'useref', 'images', 'fonts'], 
		'nodemon',
		callback
	)
	console.log('Building Production Files');
});

gulp.task('default', function(callback){
	runSequence(['sass','browserSync','watch'],
		callback
	)
})

gulp.task('nodemon', function(callback){
	var started = false;
	return nodemon({
		script: 'app.js'
	}).on('start', function(){
		if (!started) {
			callback();
			started = true;
		}
	})
})