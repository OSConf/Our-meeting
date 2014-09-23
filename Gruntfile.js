module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//Don't currently need
		// qunit: {
		// 	files:['app/**/*.html']
		// },

		jshint: {
			files: ['app/**/*.js', 'server/**/*.js', 'Gruntfile.js']
		},

		watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint'],
      server: {
        files: ['.rebooted'],
        options: {
          livereload: true
        }
      }
    },

		mochaTest: {
			test:{
				options:{
					reporter: 'spec'
				},
			src:['app/**/*.spec.js', 'server/**/*.spec.js']
			}
		},

    'node-inspector':{
      dev:{}
    },

    nodemon: {
      server:{
        script:'server.js',
        watch: ['server'],
        callback: function (nodemon) {
          nodemon.on('log', function (event) {
            console.log(event.colour);
          });

          // opens browser on initial server start
          nodemon.on('config:update', function () {
            // Delay before server listens on port
            setTimeout(function() {
              require('open')('http://localhost:5455');
            }, 1000);
          });

          // refreshes browser when server reboots
          nodemon.on('restart', function () {
            // Delay before server listens on port
            setTimeout(function() {
              require('fs').writeFileSync('.rebooted', 'rebooted');
            }, 1000);
          });
        }
      }
    },

    concurrent: {
      dev:{
        tasks:['nodemon', 'node-inspector', 'watch'],
        options:{
          logConcurrentOutput: true
        }
      }
    }
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('test', ['jshint', 'mochaTest','watch']);
  grunt.registerTask('serve', ['concurrent']);
};