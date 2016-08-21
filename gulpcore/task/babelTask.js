import gulp from "gulp";
import gulpBabel from "gulp-babel";
import gulpSourcemaps from "gulp-sourcemaps";
import errorPopup from "./lib/error-popup.js";

function babelTask(input, output, option){
	const {sourcemap, babel, gulpOpt} = option || {};
	
	return function babelTask(){
		return new Promise((resolve, reject)=> {
			let stream = gulp.src(input, (gulpOpt && gulpOpt.option && gulpOpt.option.src && gulpOpt.option.src()))
				.on("error", errorPopup);
			
			if(sourcemap){
				stream = stream
					.pipe(gulpSourcemaps.init(sourcemap.option))
					.on("error", errorPopup);
			}
			
			stream = stream
				.pipe(gulpBabel(babel && babel.option))
				.on("error", errorPopup);
			
			if(sourcemap){
				stream = stream
					.pipe(gulpSourcemaps.write((sourcemap && sourcemap.output && sourcemap.output.path), (sourcemap && sourcemap.output && sourcemap.output.option)))
					.on("error", errorPopup);
			}
			
			stream = stream
				.pipe(gulp.dest(output))
				.on("error", errorPopup)
				.on("end", resolve);
		});
	};
}

export default babelTask;