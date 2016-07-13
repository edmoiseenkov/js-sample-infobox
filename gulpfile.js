
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	watch = require('gulp-watch'),
	autoprefixer = require('gulp-autoprefixer');

var path = {
	build: {
		css: 'src/css/'
	},
	src: {
		scss: 'src/scss/**/*.scss'
	}
};


gulp.task('scss:build', function () {
	gulp.src(path.src.scss)
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(gulp.dest(path.build.css));
});

gulp.task('default', function () {
	gulp.watch([path.src.scss], ['scss:build']);
});