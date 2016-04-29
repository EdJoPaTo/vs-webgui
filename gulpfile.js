var babel = require( 'gulp-babel' );
var concat = require( 'gulp-concat' );
var connect = require( 'gulp-connect' );
var del = require( 'del' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var gzip = require( 'gulp-gzip' );
var minifyHtml = require( 'gulp-minify-html' );
var plumber = require( 'gulp-plumber' );
var responsive = require( 'gulp-responsive' );
var sass = require( 'gulp-sass' );
var sourcemaps = require( 'gulp-sourcemaps' );
var tar = require( 'gulp-tar' );
var uglify = require( 'gulp-uglify' );
var watch = require( 'gulp-watch' );

var paths = { in : {
    angular: [
      'bower_components/angular/angular.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/angular-websocket/angular-websocket.min.js'
    ],
    indexhtml: 'modules/index.html',
    release: 'public/**/*',
    resources: {
      backgrounds: 'resources/backgrounds/**/*'
    },
    scripts: [
      'modules/*/app.js',
      'modules/**/*.js'
    ],
    styles: [
    'style/*.scss',
    'modules/**/*.scss'
    ],
    stylethemes: 'style/theme/*.scss',
    templates: 'modules/**/*.html'
  },
  out: {
    indexhtml: 'public/',
    release: 'release/',
    resources: {
      backgrounds: 'public/resources/backgrounds/'
    },
    scripts: 'public/js',
    styles: 'public/style',
    stylethemes: 'public/style/theme',
    templates: 'public/'
  }
};

// https://www.timroes.de/2015/01/06/proper-error-handling-in-gulp-js/
var gulp_src = gulp.src;
gulp.src = function() {
  return gulp_src.apply( gulp, arguments )
    .pipe( plumber( function( error ) {
      // Output an error message
      gutil.log( gutil.colors.red( 'Error (' + error.plugin + '): ' + error.message ) );
      // emit the end event, to properly end the task
      this.emit( 'end' );
    } ) );
};

gulp.task( 'connect', [ 'build' ], function() {
  return connect.server( {
    root: 'public',
    livereload: true
  } );
} );

gulp.task( 'angular', function() {
  return gulp.src( paths.in.angular )
    .pipe( concat( 'angular.min.js' ) )
    .pipe( gulp.dest( paths.out.scripts ) );
} );

gulp.task( 'html:index', function() {
  return gulp.src( paths.in.indexhtml )
    .pipe( minifyHtml() )
    .pipe( gulp.dest( paths.out.indexhtml ) );
} );
gulp.task( 'html:templates', function() {
  return gulp.src( paths.in.templates )
    .pipe( minifyHtml() )
    .pipe( gulp.dest( paths.out.templates ) );
} );

gulp.task( 'scripts', function() {
  return gulp.src( paths.in.scripts )
    .pipe( sourcemaps.init() )
    .pipe( babel() )
    .pipe( concat( 'scripts.min.js' ) )
    .pipe( uglify( {
      mangle: false
    } ) )
    .pipe( sourcemaps.write( '.' ) )
    .pipe( gulp.dest( paths.out.scripts ) );
} );

gulp.task( 'styles', function() {
  return gulp.src( paths.in.styles )
    .pipe( sourcemaps.init() )
    .pipe( concat( 'styles.min.css' ) )
    .pipe( sass( {
      outputStyle: 'compressed'
    } ) )
    .pipe( sourcemaps.write( '.' ) )
    .pipe( gulp.dest( paths.out.styles ) );
} );

gulp.task( 'styles:themes', function() {
  return gulp.src( paths.in.stylethemes )
    .pipe( sourcemaps.init() )
    .pipe( sass( {
      outputStyle: 'compressed'
    } ).on( 'error', sass.logError ) )
    .pipe( sourcemaps.write( '.' ) )
    .pipe( gulp.dest( paths.out.stylethemes ) );
} );

gulp.task( 'resources:backgrounds', function() {
  return gulp.src( paths.in.resources.backgrounds )
    .pipe( responsive( {
      '*.png': {
        format: 'jpeg',
        rename: {
          extname: '.jpg'
        },
        height: 1000,
        withoutEnlargement: true
      }
    }, {
      quality: 90,
      // Use progressive (interlace) scan for JPEG and PNG output. This typically reduces compression performance by 30% but results in an image that can be rendered sooner when decompressed.
      progressive: true,
      compressionLevel: 9,
      withMetadata: false,
      silent: true,
      stats: false
    } ) )
    .pipe( gulp.dest( paths.out.resources.backgrounds ) );
} );

gulp.task( 'watch', [ 'build' ], function() {
  watch( paths.in.indexhtml, function() {
    return gulp.start( 'html:index' );
  } );
  watch( paths.in.templates, function() {
    return gulp.start( 'html:templates' );
  } );
  watch( paths.in.scripts, function() {
    return gulp.start( 'scripts' );
  } );
  watch( paths.in.styles, function() {
    return gulp.start( 'styles' );
  } );
  watch( paths.in.stylethemes, function() {
    return gulp.start( 'styles:themes' );
  } );
  watch( paths.in.resources.backgrounds, function() {
    return gulp.start( 'resources:backgrounds' );
  } );
  watch( 'public/**/*.*', function() {
    return gulp.src( 'public/**/*.*' )
      .pipe( connect.reload() );
  } );
} );

gulp.task( 'clean', function() {
  return del( [
    paths.out.release,
    paths.in.release,
  ] );
} );

gulp.task( 'release', [ 'build' ], function() {
  //TODO: clean before build (wait for gulp4)
  return gulp.src( paths.in.release )
    .pipe( tar( 'public.tar' ) )
    .pipe( gzip() )
    .pipe( gulp.dest( paths.out.release ) );
} );

gulp.task( 'build', [ 'angular', 'html:index', 'html:templates', 'scripts', 'styles', 'styles:themes', 'resources:backgrounds' ] );

gulp.task( 'default', [ 'build' ] );

gulp.task( 'dev', [ 'connect', 'watch' ] );
