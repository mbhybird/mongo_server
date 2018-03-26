var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'things.buzz',
    user: 'webuzz.user',
    password: 'Webuzz.P@ssw0rd.2397',
    port: '3306',
    database: 'webuzz'
});

this.addLog = function (res, params) {
    pool.getConnection(function (err, connection) {
        var sql = 'insert logs(things,createBy,logType,logTime,beacon_major,beacon_minor,beacon_range,location_lat,location_lng) values (?,?,?,?,?,?,?,?,?)';
        try {
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.log('[Log created error] - ', err.message);
                }
                console.log(result);
                res.json({message: 'Log created!'});
                connection.release();
            });
        } catch (ex) {
            res.json({message: 'Log failed!'});
        }
    });
};

this.getHeatChartData = function (callback) {
    pool.getConnection(function (err, connection) {
        var sql = 'call proc_HeatChart(?);';
        var params = [1];
        try {
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.log('[getHeatChartData error] - ', err.message);
                }
                console.log('[getHeatChartData okay]');
                //console.log(JSON.stringify(result[0]));
                var arr = [];
                if (result && result[0] && result[0].length > 0) {
                    result[0].map(function (item) {
                        arr.push({things: item.things, heat: item.heat});
                    });
                }
                callback(arr);
                connection.release();
            });
        } catch (ex) {
            console.log('[getHeatChartData error] - ', ex);
        }
    });
};

//add by brian
var handleConnctionError = function (err, connection, callback) {
    // console.log(connection);
    var resultObj = {};
    if (!connection) {
        console.log("connection err");
        var error = {'message': 'failed to connect server'};
        console.log(err);
        resultObj.err = error;

        if (callback) {
            callback(resultObj);
        }
        return;
    }

    if (err) {
        resultObj.err = err;
        if (callback) {
            callback(resultObj);
        }
        return null;
    }
};

this.addFavors = function (ownerId, thingsId, callback) {
    try {
        pool.getConnection(function (cnnErr, connection) {
            // handleConnctionError(err,connection,function(data){
            //   if(data.err){
            //     console.log("addFavors error:"+data.err);
            //     if(callback){
            //       callback(false);
            //     }
            //     return;
            //   }
            // });
            if (cnnErr) {
                if (callback) {
                    callback({'err': cnnErr});
                }
                console.log("[addFavor error]" + cnnErr);
                return;
            }

            console.log('add favors thingsId' + thingsId);
            var sql = "insert favors(ownerId,thingId) values";
            var value = "";
            var params = [];
            thingsId.map(function (thingId) {
                if (value == "") {
                    value += "(?,?)";
                }
                else {
                    value += ",(?,?)";
                }
                params.push(ownerId);
                params.push(thingId);
            });
            sql += value;
            // console.log(sql);
            // console.log(params);
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.log('[addFavor error] - ', err.message);
                    if (callback) {
                        callback(false);
                    }
                    connection.release();
                    return;
                }
                console.log('[addFavor okay]');
                if (callback) {
                    callback(true);
                }
                connection.release();
            });

        });
    } catch (ex) {
        console.log('[addFavor error] - ', ex);
        if (callback) {
            callback(false);
        }
    }
};

this.getFavorThingsIdViaOwnerId = function (ownerId, callback) {
    try {
        var resultObj = {};
        pool.getConnection(function (cnnErr, connection) {
            if (cnnErr) {
                if (callback) {
                    callback({'err': cnnErr});
                }
                console.log("[getFavorThingsIdViaOwnerId] connection error:" + cnnErr);
                return;
            }

            var sql = "select thingId from favors where ownerId = ?";
            var params = [ownerId];
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.log('[getFavorThingsIdViaOwnerId error] - ', err.message);
                    resultObj.err = err;
                    callback(resultObj);
                    connection.release();
                    return;
                }
                console.log('[getFavorThingsIdViaOwnerId okay]');
                arr = [];
                result.map(function (item) {
                    arr.push(item.thingId);
                });

                resultObj.data = arr;
                callback(resultObj);
                connection.release();
            });
        });
    } catch (ex) {
        resultObj.err = ex;
        callback(resultObj);
        console.log('[getFavorThingsIdViaOwnerId error] - ', ex);
    }
};

this.deleteFavorsViaThingsId = function (ownerId, thingsId, callback) {
    try {
        pool.getConnection(function (cnnErr, connection) {
            if (cnnErr) {
                if (callback) {
                    callback({'err': cnnErr});
                }
                console.log("[getFavorThingsIdViaOwnerId] connection error:" + cnnErr);
                return;
            }
            var params = [];
            var sql = "delete from favors where ownerId = ? and thingId in ";
            params.push(ownerId);

            var value = "";

            thingsId.forEach(function (thingId) {
                if (value == "") {
                    value += "?";
                }
                else {
                    value += ",?";
                }
                params.push(thingId);
            });
            sql += "(" + value + ")";
            connection.query(sql, params, function (err, result) {
                if (err) {
                    console.log('[deleteFavorsViaThingsId error] - ', err.message);
                    callback(false);
                    connection.release();
                    return;
                }
                console.log('[deleteFavorsViaThingsId okay]');
                callback(true);
                connection.release();
            });
        });
    } catch (ex) {
        console.log('[deleteFavorsViaThingsId error] - ', ex);
        callback(false);
    }
};

this.getThingsRelatedCountViaThingId = function (thingId, ownerId, callback) {
    console.log("getThingsRelatedCountViaThingId hits");
    var resultObj = {};
    try {
        pool.getConnection(function (cnnErr, connection) {
            // Make sure the connection has been got
            // otherwise would cause the server app crash
            if (cnnErr) {
                if (callback) {
                    callback({'err': cnnErr});
                }
                console.log("[getFavorThingsIdViaOwnerId] connection error:" + cnnErr);
                return;
            }

            var sql = ' select sum(ownercount) as ownercount FROM ('
                + ' select count(*) as ownercount from favors where thingid = ?'
                + ' union all '
                + ' select count(*) as thingcount from favors where ownerId = ?'
                + ' ) as  a';
            console.log("getThingsRelatedCountViaThingId connection get");
            var params = [thingId, ownerId];
            // console.log(params);
            connection.query(sql, params, function (err, result) {
                if (err) {
                    // console.log(err);
                    resultObj.err = err;
                    if (callback) {
                        callback(resultObj);
                    }
                    return;
                }
                // console.log(result);
                resultObj.count = result[0].ownercount;
                callback(resultObj);
                connection.release();
            });
        });
    }
    catch (ex) {
        console.log('[getOwnersViaThingId error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};

//2016年06月21日
this.deleteFollows = function (userId, follows, callback) {
    console.log("deleteFollows hits");
    var errModule = "err-mysql-deleteFollows";
    try {
        pool.getConnection(function (cnnErr, connection) {
            if (cnnErr || !connection) {
                if (callback) {
                    callback({err: cnnErr ? cnnErr : "Get mysql connection failed."});
                }
                console.log('[' + errModule + '-getConnection]:' + cnnErr);
                return;
            }

            if (connection) {
                var params = [];
                var value = "";
                var sql = "delete from follows where userId = ? and followId in ";
                params.push(userId);

                follows.forEach(function (follow) {
                    if (follow == undefined || follow.followId == undefined) {
                        var errMessage = "Undefined followId";
                        console.log('[' + errModule + '-getSql]:' + errMessage);

                        if (callback) {
                            callback({'err': errMessage});
                        }
                        onnection.release();
                        return;
                    }

                    value += value == "" ? "?" : ",?";

                    params.push(follow.followId);
                });
                sql += "(" + value + ")";

                connection.query(sql, params, function (err, result) {
                    if (err) {
                        if (callback) {
                            callback({err: err ? err : "Execute sql connection failed."});
                        }
                        console.log('[err-mysql-deleteFollows-execSql]:' + err);
                        connection.release();
                        return;
                    }

                    if (callback) {
                        callback(true);
                    }
                    connection.release();
                });
            }

        });
    } catch (ex) {
        console.log('[setFollow error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};

this.setFriends = function (userId, follows, callback) {
    console.log("setFriends hits");
    var errModule = "err-mysql-setFriends";
    try {
        pool.getConnection(function (cnnErr, connection) {
            if (cnnErr || !connection) {
                if (callback) {
                    callback({err: cnnErr ? cnnErr : "Get mysql connection failed."});
                }
                console.log('[' + errModule + '-getConnection]:' + cnnErr);
                return;
            }

            if (connection) {
                var sql = "insert IGNORE into follows(userId,followId,source,createDate) values";
                var value = "";
                var params = [];
                follows.forEach(function (follow) {
                    if (follow == undefined || follow.followId == undefined || follow.followId == "") {
                        var errMessage = "Undefined followId";
                        console.log('[' + errModule + '-getSql]:' + errMessage);

                        if (callback) {
                            callback({'err': errMessage});
                        }
                        connection.release();
                        return;
                    }

                    value += value == "" ? "(?,?,?,now()),(?,?,?,now())" : ",(?,?,?,now()),(?,?,?,now())";

                    params.push(userId);
                    params.push(follow.followId);
                    params.push(follow.source ? follow.source : "");
                    params.push(follow.followId);
                    params.push(userId);
                    params.push(follow.source ? follow.source : "");
                    console.log(params);
                });
                sql += value;

                connection.query(sql, params, function (err, result) {
                    if (err) {
                        if (callback) {
                            callback({err: err ? err : "Execute sql connection failed."});
                        }
                        console.log('[' + errModule + '-execSql]:' + err);
                        connection.release();
                        return;
                    }

                    if (callback) {
                        callback(true);
                        connection.release();
                    }
                });
            }

        });

    } catch (ex) {
        console.log('[setFollow error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};

this.setFollows = function (userId, follows, callback) {
    console.log("setFollows hits");
    var errModule = "err-mysql-setFollows";
    try {
        pool.getConnection(function (cnnErr, connection) {
            if (cnnErr || !connection) {
                if (callback) {
                    callback({err: cnnErr ? cnnErr : "Get mysql connection failed."});
                }
                console.log('[' + errModule + '-getConnection]:' + cnnErr);
                return;
            }

            if (connection) {
                var sql = "insert IGNORE into follows(userId,followId,source,createDate) values";
                var value = "";
                var params = [];

                follows.forEach(function (follow) {
                    if (follow == undefined || follow.followId == undefined || follow.followId == "") {
                        var errMessage = "Undefined followId";
                        console.log('[' + errModule + '-getSql]:' + errMessage);

                        if (callback) {
                            callback({'err': errMessage});
                        }
                        connection.release();
                        return;
                    }

                    value += value == "" ? "(?,?,?,now())" : ",(?,?,?,now())";

                    params.push(userId);
                    params.push(follow.followId);
                    params.push(follow.source ? follow.source : "");
                });
                sql += value;

                connection.query(sql, params, function (err, result) {
                    if (err) {
                        if (callback) {
                            callback({err: err ? err : "Execute sql connection failed."});
                        }
                        console.log('[' + errModule + '-execSql]:' + err);
                        connection.release();
                        return;
                    }

                    if (callback) {
                        callback(true);
                    }
                    connection.release();
                });
            }

        });

    } catch (ex) {
        console.log('[setFollow error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};

this.getFollows = function (userId, callback) {
    console.log("getFollows hits");
    var result = [];
    try {
        pool.getConnection(function (cnnErr, connection) {
            //If error call back empty array.
            if (cnnErr || !connection) {
                if (callback) {
                    callback([]);
                }
                console.log('[err-mysql-getFollows-getConnection]:' + cnnErr);
                return;
            }

            //If connection has been got.
            if (connection) {
                //Make query
                var sql =
                    'select a.followId from follows a ' +
                    'where a.userId=?';
                var params = [userId];

                //Execute sql
                connection.query(sql, params, function (err, result) {
                    //Execute sql error should return an empty array and log errors.
                    if (err) {
                        if (callback) {
                            callback([]);
                            console.log("err->mysql-getFollows-execSql:" + err);
                        }
                        connection.release();
                        return;
                    }

                    if (callback) {
                        callback(result && result.length > 0 ? result[0].followId : []);
                    }
                    connection.release();
                });
            }
        });
    } catch (ex) {
        console.log('[getFollows error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};

this.getMyFriends = function (userId, callback) {
    console.log("getMyFriends hits");
    var result = [];
    try {
        pool.getConnection(function (cnnErr, connection) {
            //If error call back empty array.
            if (cnnErr || !connection) {
                if (callback) {
                    callback([]);
                }
                console.log('[err-mysql-getMyFriends-getConnection]:' + cnnErr);
                return;
            }

            //If connection has been got.
            if (connection) {
                //Make query
                var sql =
                    'select a.followId from follows a ' +
                    'inner join follows b on a.followId = b.userId and a.userId = b.followId ' +
                    'where a.userId=?';
                var params = [userId];

                //Execute sql
                connection.query(sql, params, function (err, result) {
                    //Execute sql error should return an empty array and log errors.
                    if (err) {
                        if (callback) {
                            callback([]);
                            console.log("err->mysql-getMyFriends-execSql:" + err);
                        }
                        connection.release();
                        return;
                    }
                    var arr = [];

                    result.map(function (item) {
                        arr.push(item.followId);
                    });

                    if (callback) {
                        callback(arr && arr.length > 0 ? arr : []);
                    }
                    connection.release();
                });
            }
        });
    } catch (ex) {
        console.log('[getMyFriends error] - ', ex);
        resultObj.err = ex;
        callback(resultObj);
    }
};
