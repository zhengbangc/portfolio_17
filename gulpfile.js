var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.sass('sass', function(){
	return gulp.src('app/scss/**/*')
		.pipe(sass()) //Converts Sass to CSS with gulp-sass
		.pipe(gulp.dest('app/**/*'))
})