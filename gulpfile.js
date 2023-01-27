const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass'));           //конвертер sass in css
const concat = require('gulp-concat');                        //обьеденение файлов в один или изменение имени файла
const autoprefixer = require('gulp-autoprefixer');            //автопрефиксер
const imagemin = require('gulp-imagemin');                    //сжатие img           
const uglify = require('gulp-uglify');                        //сжатие js файлов
const del = require('del');
const browserSync = require('browser-sync').create();         //автообновление страницы при изменениях в вайлах



//функция автообновления страницы при изменениях в вайлах
function browsersync() {
  browserSync.init({
    server: {
      baseDir: './app/'                                       //все что находится в папке арр
    },
  });
}

//функция которая конвертирует sass,scss в css 
function styles() {
  return src('./app/scss/style.scss')                   //путь к файлу .scss
    .pipe(scss({ outputStyle: 'compressed' }))          // конвертация scss -> css, options: outputStyle: compressed, expanded
    .pipe(concat('style.min.css'))                      // переименовываем файл style.css в style.min.css 
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],       // добавляет префиксы для последних 10 версий браузеров
      grid: true,
    })) 
    .pipe(dest('./app/css'))                            //куда сохранить css
    .pipe(browserSync.stream())                         // обновить страницу после изменений (stream - без перезагрузки страницы)
}

//функция которая конвертирует js
function scripts() {
  return src([
    './node_modules/jquery/dist/jquery.js',
    './app/js/main.js',                               //перечисляем все файлы js
  ])
    .pipe(concat('main.min.js'))                      // обьеденяем в один файл
    .pipe(uglify())                                   //сжатие js файлов
    .pipe(dest('./app/js'))                           //папка куда сохраняем
    .pipe(browserSync.stream())                       // обновить страницу после изменений (stream - без перезагрузки страницы)
}

//функция сжатия img 
function images() {
    return src('./app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      }),
    ]))
    .pipe(dest('./dist/images'))
}

//сборка
function build() {                                     //сборка сайта - перенос всех нужныч файлов в папку dist  
  return src([
    './app/**/*.html',
    './app/css/style.min.css',                         //перечисляем нужные файлы
    './app/js/main.min.js',
  ], {base: 'app'})                                    // чтобы файлы перенеслись в такиеже папки в которых они сейчас
    .pipe(dest('./dist'))                             // куда перенести файлы
}

//удаление папок и файлов (очищаем папку dist)
function cleanDist() {
  return del('./dist')
}

//функция слежения за изменениями в файлах
function watching() {
  watch(['./app/scss/**/*.scss'], styles);
  watch(['./app/js/**/*.js', '!./app/js/main.min.js'], scripts);
  watch(['./app/**/*.html']).on('change', browserSync.reload);            //(reload - с перезагрузкой страницы)
} 


exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);                      // с помощью siries описываем запуск тасков при команде gulp build

exports.default = parallel(styles, scripts, browsersync, watching);    //паралельный запуск при команде gulp