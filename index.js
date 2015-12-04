var http = require('http');
var exec = require('child_process').exec;
var fs = require('fs');

http.createServer(function(req, res) {
    var body='';
    var method = req.method;
    if(method === 'POST') {
        req.on('data', function(d) {
            body += d || '';
        });
        req.on('end', function() {
            console.log('request data: ' + body);
            var artifact = getArtifact(body);
            var artifacts = artifact.split(';');
            var o = '';
            var count = 0;

            function outdata(error, stdout, stderr) { 
                var out = 'stdout: \r\n' + stdout;
                out += '\r\n';
                out += stderr ? 'stderr: ' + stderr : '';
                if (error !== null) {
                    out += '\r\n';
                    out += 'exec error: ' + error;
                }
                res.write(out);
                count++;
                if(count >= artifacts.length) {
                    res.end('\r\n---Finished---');
                    console.log('finished');
                }
                else {
                    res.write('--------------------------------------------------------------------------------\r\n\r\n');
                }
            }

            for (var i = 0; i < artifacts.length; i++) {       
                var output = getOutput(body) || 'out/' + artifacts[i].replace(/:/g, '-') + '.jar';
                child = exec('mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:get -Dartifact=' 
                    + artifacts[i]+ ' -Ddest=' + output, outdata);
            }
        });
    }
    else {
        fs.readFile('index.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data);
        });
    }
}).listen(80, '0.0.0.0');

function getArtifact(b) {
    return unescape(b.match(/artifact=([^&]*)/i)[1]);
}

function getOutput(b) {
    return unescape(b.match(/output=([^&]*)/i)[1]);
}