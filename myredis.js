var redis = require("redis");
    RDS_PORT = 6379,
    RDS_HOST = 'arts.things.buzz',
    RDS_PWD = 'porschev',
    RDS_OPTS = {},
    client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.on('end', function (err) {
    console.log('end');
});

client.on("connect", function () {
    /*
     client.set("string key", "string val", redis.print);
     client.hset("hash key", "hashtest 1", "some value", redis.print);
     client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
     client.hkeys("hash key", function (err, replies) {
     console.log(replies.length + " replies:");
     replies.forEach(function (reply, i) {
     console.log("    " + i + ": " + reply);
     });
     client.quit();
     });*/
});

this.updateCache = function (args) {
    client.del("heatChart");

    args.forEach(function (item) {
        client.hmset("heatChart", item.things, item.heat);
    });

    client.hgetall("heatChart", function (err, res) {
        if (err) {
            console.log('Error:' + err);
            return;
        }
        console.dir(res);
    });
};

this.heatChart = function (res) {
    client.hgetall("heatChart", function (err, obj) {
        if (err) {
            console.log('Error:' + err);
            return;
        }
        res.json(obj);
    });
};

//add by Brian
this.getThingRelatedCount = function (thingId, callback) {
    client.hget("thingRelatedCount", thingId, function (err, obj) {
        if (err) {
            console.log('Error:' + err);
            if (callback) {
                callback({'err': err});
            }
            return;
        }
        if (callback) {
            callback(obj);
            return null;
        }
    });
};

this.setThingLocation = function (thingId, location) {
    console.log("setThingLocation " + thingId);
    console.log(location);
    client.hmset("thingsLocation", thingId, JSON.stringify(location));

    // client.set("thingsLocation"+thingId,JSON.stringify(location));
    // console.log(location);
    // client.expire("thingsLocation"+thingId,60);
};

this.getAllThingLocation = function (callback) {
    client.hgetall("thingsLocation", function (err, obj) {
        if (err) {
            console.log('Error:' + err);
            callback({});
            return;
        }
        console.log(obj);
        if (obj && obj != {}) {

            if (callback) {
                console.log(obj);
                callback(obj);
                return null;
            }
        }
        else {
            if (callback) {
                console.log(obj);
                callback(obj);
                return null;
            }
        }
    })
};

this.setThingRelatedCount = function (thingId, count) {
    client.hset("thingRelatedCount", thingId, count);
};

this.getAllThingsRelatedCount = function (callback) {
    client.hgetall("thingRelatedCount", function (err, obj) {
        if (err) {
            console.log('Error:' + err);
            if (callback) {
                callback([]);
            }
            return
        }

        if (callback) {
            callback(obj);
            return null;
        }
    });
};