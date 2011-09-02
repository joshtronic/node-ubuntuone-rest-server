var http = require('http'),
	exec = require('child_process').exec,
	pieces, interface, method, dbus_send, child,
	lines, length, i, line,
	variable = '', value = '', payload = '';

http.createServer(function(request, response) 
{
	pieces = request.url.split('/');
	
	response.writeHead(200, {'Content-Type': 'application/json'});

	if (pieces.length == 3)
	{
		interface = pieces[1].toLowerCase();
		method    = pieces[2].toLowerCase();
		
		dbus_send = 'dbus-send --session --print-reply --type=method_call --dest=com.ubuntuone.SyncDaemon /' + interface + ' com.ubuntuone.SyncDaemon.' + interface.charAt(0).toUpperCase() + interface.slice(1) + '.' + method.toLowerCase();

		child = exec(dbus_send, function(error, stdout, stderr)
		{
			if (error !== null)
			{
				response.end(stderr);
			}
			else
			{
				lines = stdout.split("\n");
				lines.shift();

				length = lines.length;

				payload  = '';
				variable = '';
				value    = '';

				for (i = 0; i < length; ++i)
				{
					line = lines[i].replace(/^\s*|\s*$/, '');

					switch (line)
					{
						case 'array [':
							if (payload.charAt(payload.length - 1) == '}')
							{
								payload += ',';
							}

							payload += '{';
							break;

						case ']':
							payload += '}';
							break;

						case 'dict entry(':
						case ')':
							// Ignored
							break;

						default:
							pieces = line.split('"');

							if (variable == '')
							{
								variable = pieces[1];
							}
							else
							{
								value = pieces[1];

								if (value == '')
								{
									value = null;
								}
							}

							line = '';

							break;
					}

					if (variable != '' && value != '')
					{
						if (payload.charAt(payload.length - 1) == '"')
						{
							payload += ',';
						}

						payload += '"' + variable + '":';
						
						if (value == null)
						{
							payload += '""';
						}
						else
						{
							payload += '"' + value + '"';
						}
						
						variable = '';
						value    = '';
					}
				}

				response.end(payload.replace('{{', '[{').replace('}}', '}]'));
			}

		});
	}
}).listen(3000, "127.0.0.1");
