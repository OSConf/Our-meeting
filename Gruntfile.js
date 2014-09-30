module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['app/**/*.js', '!app/**/*.bundle.js', 'server/**/*.js', 'Gruntfile.js'],
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
        tasks:['nodemon', 'node-inspector', 'watch', 'watchify:example'],
        options:{
          logConcurrentOutput: true
        }
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      my_target: {
        files: {
          'dist/omapi.min.js': ['dist/ourmeeting.api.js']
        }
      }
    },
    /* Using browserify instead
    concat: {
      options: {
        separator: '',
      },
      dist: {
        src: ['app/components/WebRTC/webrtc.js', 'app/components/WebRTC/signalling.js', 'app/components/WebRTC/rtcpeerconnection.js', 'app/api/front-end.js', 'app/components/client/scripts/directives.js'],
        dest: 'dist/om.concat.js',
      },
    },*/

    watchify: {
      options:{
        standalone:'OurMeeting'
      },
      dist: {
        src:'./app/api/front-end.js',
        dest:'dist/ourmeeting.api.js'
      },
      example: {
        src: './app/components/WebRTC/logic.js',
        dest:'./app/components/WebRTC/logic.bundle.js'
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-watchify');

  grunt.registerTask('test', ['jshint', /*'mochaTest',*/ 'watchify:dist', 'watch' ]);
  //Concurent will us watchify:example
  grunt.registerTask('serve', ['concurrent']);
  grunt.registerTask('build', ['test', 'uglify']);
};