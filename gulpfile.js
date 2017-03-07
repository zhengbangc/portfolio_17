/** 
Author: Zhengbang Chen <zchen94@illinois.edu>
Reference:
	https://www.sitepoint.com/introduction-gulp-js/
	https://www.npmjs.com/package/gulp-nodemon
**/

//Gulp.js
var 
	// modules
	gulp = require('gulp'),
	newer = require('gulp-newer'),
	htmlclean = require('gulp-htmlclean'),
	imagemin = require('gulp-imagemin'),
	concat = require('gulp-concat'),
	deporder = require('gulp-deporder'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	assets = require('postcss-assets'),
	autoprefixer = require('autoprefixer'),
	mqpacker = require('css-mqpacker'),
	cssnano = require('cssnano'),
	nodemon = require('gulp-nodemon'),
	livereload = require('gulp-livereload'),
	jshint = require('gulp-jshint'),
	notify = require('gulp-notify'),

	// development mode?
	devBuild = (process.env.NODE_ENV != 'production'),

	// folders
	folder = {
		src: 'src/',
		build: 'build/'
	}
;

// image processing
gulp.task('images', function(){
	var out = folder.build + 'images/';
	return gulp.src(folder.src + 'images/**/*')
		.pipe(newer(out))
		.pipe(imagemin())
		.pipe(gulp.dest(out));
});


//HTML processing
gulp.task('html',['images'], function(){
	var
		out = folder.build + 'html/',
		page = gulp.src(folder.src + 'html/**/*').pipe(newer(out));

	//minify production code
	if (!devBuild)
		page = page.pipe(htmlclean());

	return page.pipe(gulp.dest(out));
});

//JavaScript processing
gulp.task('js', function(){
	var jsbuild = gulp.src(folder.src + 'js/**/*')
		.pipe(deporder())
		.pipe(concat('main.js'));

	if (!devBuild) {
		jsbuild = jsbuild
			.pipe(stripdebug())
			.pipe(uglify());
	}

	return jsbuild.pipe(gulp.dest(folder.build + 'js/'));
});

//CSS processing
gulp.task('css', ['images'], function(){
	var postCssOpts = [
		assets({ loadPaths: ['images/'] }),
		autoprefixer({ browsers: ['last 2 versions', '>2%'] }),
		mqpacker
	];

	if (!devBuild)
		postCssOpts.push(cssnano);

	return gulp.src(folder.src + 'scss/**/*')
		.pipe(sass({
			outputStyle: 'nested',
			imagesPath: 'images',
			precision: 3,
			errLogToConsole: true
		}))
		.pipe(postcss(postCssOpts))
		.pipe(gulp.dest(folder.build + 'css/'));
});

//run all tasks
gulp.task('run', ['html', 'css', 'js']);

//watch for changes
gulp.task('watch', function(){

	//image changes
	gulp.watch(folder.src + 'images/**/*', ['images']);

	//html changes
	gulp.watch(folder.src + 'html/**/*', ['html']);

	//javascript changes
	gulp.watch(folder.src + 'js/**/*', ['js']);

	//css changes
	gulp.watch(folder.src + 'scss/**/*', ['css']);

});

//lint task
gulp.task('lint', function(){
	gulp.src(folder.src + 'js/**/*')
		.pipe(jshint());
});

//default task
gulp.task('default', ['run', 'watch'], function(){
	// //listen for changes
	livereload.listen();
	//configure nodemon
	nodemon({
		//the script to run the app
		script: 'app.js',
		// ext: 'js html css',
		tasks: ['lint']
	}).on('restart', function(){
		//when the app has restarted, run livereload
		gulp.src('app.js')
			.pipe(livereload())
			.pipe(notify('Reloading page, please wait....'));
	}).on('crash', function(){
		console.error('Application has crashed!\n');
		this.emit('restart', 10);
	});
});