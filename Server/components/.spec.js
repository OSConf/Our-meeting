var expect = require('chai').expect;
var fs = require('fs');

describe('Server Component Specs', function(){
	it('server/components should have a file called .spec.js in each folder', function(done){
		fs.readdir('.', function(err, data){
			var dir = './server/components';

			fs.readdir(dir, function(err, items){
				if(err){
					done(err);
				} else {
					var completed = 0;
					items.forEach(function(path){
						path = dir + '/' + path;
						if(fs.statSync(path).isDirectory()){
							fs.readdir(path, function(err, data){
								if(err){
									done(err);
								} else {
									expect(!!data.join('').match(/\.spec\.js/)).to.equal.true;
									completed++;
									if(completed === items.length){
										done();
									}
								}
							});
						} else {
							completed++;
              if(completed === items.length){
                    done();
              }
						}
					});
				}
			});
		});

	});
});
