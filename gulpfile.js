require('babel-register')
const gulp        = require('gulp')
const plumber     = require('gulp-plumber')
const mocha       = require('gulp-mocha')
const concat      = require('gulp-concat')
const minifyHTML  = require('gulp-minify-html')
const sass        = require('gulp-sass')
const babel       = require('gulp-babel')
const uglify      = require('gulp-uglify')
const riot        = require('gulp-riot')

gulp.task('default', ['test', 'compile'])

gulp.task('compile', ['html', 'sass', 'js', 'riot'])

gulp.task('html', () => {
  gulp.src('src/html/index.html')
    .pipe(plumber())
    .pipe(minifyHTML())
    .pipe(gulp.dest('dist'))
})

gulp.task('sass', () => {
  gulp.src('src/sass/app.scss')
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest('dist'))
})

gulp.task('js', () => {
  gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
})

gulp.task('riot', () => {
  gulp.src('src/tags/*.tag')
    .pipe(plumber())
    .pipe(riot())
    .pipe(concat('app.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
})

gulp.task('test', () => {
  gulp.src('test/**/*.test.js', { read: false })
    .pipe(plumber())
    .pipe(mocha())
})

gulp.task('watch', () => {
  gulp.watch(['src/**', 'test/**'], ['test', 'compile'])
})
