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
      tasks: ['jshint']
    },

		mochaTest: {
			test:{
				options:{
					reporter: 'spec'
				},
			src:['app/**/*.spec.js', 'server/**/*.spec.js', 'app/**/.spec.js', 'server/**/.spec.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint', 'mochaTest','watch']);
};