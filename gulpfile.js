process.env['NODE_PATH'] = __dirname + "/gulpcore/task";
require('module')._initPaths();

require("babel-polyfill");
require("babel-register");
require("./gulpcore/index.js");