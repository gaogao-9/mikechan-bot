import gulp  from "gulp"
import clean from "cleanTask"
import babel from "babelTask"

gulp.task("clean", clean(["temp", "dist"]));

gulp.task("babel:debug", babel(
	"src/**/*.js",
	"dist",
	{
		gulp: {
			option: {
				src: ()=> ({
					since: gulp.lastRun("babel:debug"),
				}),
			},
		},
		sourcemap: true,
	},
));
gulp.task("babel", babel(
	"src/**/*.js",
	"dist",
	{
		gulp: {
			option: {
				src: ()=> ({
					since: gulp.lastRun("babel"),
				}),
			},
		},
		babel: {
			option: {
				compact: true,
			},
		},
	},
));

gulp.task("build:debug", gulp.parallel(
	gulp.task("babel:debug"),
));
gulp.task("build", gulp.parallel(
	gulp.task("babel"),
));

gulp.task("release", gulp.series(
	gulp.task("clean"),
	gulp.task("build"),
));

gulp.task("watch:debug", function watch(){
	return gulp.watch(["src/**/*.js"], gulp.task("build:debug"));
});
gulp.task("watch", function watch(){
	return gulp.watch(["src/**/*.js"], gulp.task("build"));
});

gulp.task("default", gulp.series(
	gulp.task("clean"),
	gulp.task("build:debug"),
	gulp.task("watch:debug")
));
