var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat');
    connect = require('gulp-connect');
    gulpif = require('gulp-if');
    uglify = require('gulp-uglify');
    minifyHTML = require('gulp-minify-html');
    bower = require('gulp-bower');
    sass = require('gulp-sass');
    inject = require('gulp-inject');
    imagemin = require('gulp-imagemin');
    pngcrush = require('imagemin-pngcrush');  
    wiredep = require('wiredep').stream;


// Create gulp plugins from node install
// npm install --save-dev gulp-**


var jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle
// Create variables for enviroments

env = process.env.NODE_ENV || 'development';

if (env==='development') {
   outputDir = 'builds/development/';
   sassStyle = 'expanded';
} else {
   outputDir = 'builds/production/';
   sassStyle = 'compressed';
}
// Conditions for development and production enviroments

jsSources = ['components/scripts/*.js'];
sassSources = ['components/sass/style.scss'];
htmlSources = ['builds/development/*.html'];
imageSources = ['builds/development/images/**/*.*'];
bowerDir = ['bower_components/' ];
// Paths to files




gulp.task('js', function() {
    gulp.src(jsSources)
     .pipe(concat('script.js'))
     .pipe(browserify())
     .pipe(gulpif (env === 'production', uglify()))
     .pipe(gulp.dest(outputDir + 'js'))
     .pipe(connect.reload())
});
// Concat all javascript files

gulp.task('html', function() {
     gulp.src(htmlSources)
     .pipe(gulpif (env === 'production', minifyHTML()))
     .pipe(gulpif (env === 'production', gulp.dest(outputDir)))
     .pipe(connect.reload())
});
// Reoad changes to HTML & Minify production HTML

gulp.task('images', function() {
     gulp.src(imageSources)
     .pipe(gulpif (env === 'production', imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
     })))
     .pipe(gulpif (env === 'production', gulp.dest(outputDir + 'images')))
     .pipe(connect.reload())
});
// Compress all images 

gulp.task('css', function(){

  var injectBootstrapFiles = gulp.src('bower_components/bootstrap-sass/assets/stylesheets/_bootstrap.scss', {read: false});
 
  function transformBootstrapFilepath(filepath) {
    return '@import "' + filepath + '";';
  }
 
  var injectBootstrapOptions = {
    transform: transformBootstrapFilepath,
    starttag: '// inject:bootstrap',
    endtag: '// endinject-bootstrap',
    addRootSlash: false
  };
  


  return gulp.src('components/sass/style.scss')
    .pipe(wiredep())
    .pipe(inject(injectBootstrapFiles, injectBootstrapOptions))
    .pipe(sass())
    .pipe(gulp.dest(outputDir + 'css'))
});
// Inject Bootstrap & Font Awesome into style.sass


gulp.task('connect', function() {
    connect.server({
    root: outputDir,
    livereload: true
    });
});
// Setup server for live reload

gulp.task('watch', function() {
    gulp.watch(jsSources, ['js']);
    gulp.watch(htmlSources, ['html']);
    gulp.watch(imageSources, ['images']);
    gulp.watch('components/sass/*.scss', ['css']);
});
// Watch task, looks for changes and automatically updates. 

gulp.task('default', ['js', 'css', 'html', 'images','connect', 'watch']);
// Runs all tasks 
