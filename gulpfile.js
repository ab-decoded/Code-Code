var gulp  = require('gulp'),
    gutil = require('gulp-util'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload');

// create a default task and just log a message
gulp.task('default',["develop","watch"], function() {
  return gutil.log('Gulp is running!');
});

gulp.task('develop', function () {
  nodemon({
    script: 'index.js', 
    ext: 'js',
    env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['public/**']).on('change',livereload.changed);
  gulp.watch(['app/views/**']).on('change',livereload.changed);
});