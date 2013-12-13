var uv = require('uv');

var assert = require('../support/assert');
var StringView = require('../support/StringView');
var TextEncoder = require('./encoding').TextEncoder;

var encoder = new TextEncoder('utf-8');
var buf = encoder.encode('hello world!').buffer;

var tcp_handle = uv.tcp_init(uv.default_loop());

tcp_handle.bind({
    port: 8080,
    family: 'IPv4',
    address: '0.0.0.0'
});

var err = tcp_handle.listen(0, function(server, status) {
    //print('>connection');

    // will accept the connection
    // and makes a new handle for it
    var client = tcp_handle.accept();

    //print(">accepted");

    var err = client.read_start(function(err, data) {
        if (err) {
            print(err);
            return client.close(function() {
                print('client closed');
            });
        }

        // eof
        if (!data) {
            tcp_handle.close(function() {});
            return;
        }

        //var str = new StringView(data);
        //print('got:', str);

        client.write(data, function() {
        });
    });
    assert(err == 0); // success starting read
});

var count = 0;
var ping_handle = uv.tcp_init(uv.default_loop());
ping_handle.connect({ address: '127.0.0.1', port: 8080, family: 'IPv4'}, function() {
    print('connected client');

    ping_handle.read_start(function(err, data) {
        if (err) {
            print(err);
        }

        if (!data) {
        }

        //var str = new StringView(data);
        //print('client got:', str);
        count++;
        //assert(str == 'hello world!');

        var err = ping_handle.write(buf, function() {
        });

    });

    var err = ping_handle.write(buf, function() {
    });

    var timer = uv.timer_init(uv.default_loop());
    timer.start(1000, 0, function() {
        print('ping count', count);
        ping_handle.close(function() {
        });
    });
});

uv.run(uv.default_loop(), uv.UV_RUN_DEFAULT);
