var http = require('http'),
	exec = require('child_process').exec,
	pieces, interface, method, dbus_send, child;

http.createServer(function(request, response) 
{
	pieces = request.url.split('/');
	
	response.writeHead(200, {'Content-Type': 'text/plain'});

	if (pieces.length == 3)
	{
		interface = pieces[1].toLowerCase();
		method    = pieces[2].toLowerCase();
		
		dbus_send = 'dbus-send --session --print-reply --type=method_call'
		          + '    --dest=com.ubuntuone.SyncDaemon /' + interface
				  + '    com.ubuntuone.SyncDaemon.' + interface.charAt(0).toUpperCase() + interface.slice(1) + '.' + method.toLowerCase();

		child = exec(dbus_send, function(error, stdout, stderr)
		{
			if (error !== null)
			{
				response.end(stderr);
			}
			else
			{
				response.end(stdout);
			}

		});
	}
}).listen(3000, "127.0.0.1");
