// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mysql      = require('./mysqlpool.js');
var redis      = require('./myredis.js');
var events     = require('events');
var emitter    = new events.EventEmitter();

var mongoose   = require('mongoose');
mongoose.connect('mongodb://arts.things.buzz:27017/webuzz'); // connect to live database
//mongoose.connect('mongodb://192.168.0.202:27017/webuzz'); // connect to test database

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

var port = process.env.PORT || 2397;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    console.log(req.originalUrl);
    if (req.originalUrl == '/api/cache/heatchart') {
        console.log('cache for heatchart refresh...');
        var callback = function (args) {
            emitter.emit('refreshCache', args);
        };

        mysql.getHeatChartData(callback);
    }
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:2397/api)
router.get('/', function(req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

// model schema
// -------------------------------------------------
var User 		 = require('./app/models/user');
var Catalog 	 = require('./app/models/catalog');
var Beacon       = require('./app/models/beacon');
var Post         = require('./app/models/post');
var Things       = require('./app/models/things');
var Group        = require('./app/models/group');
var Type         = require('./app/models/type');
var Topic        = require('./app/models/topic');
var TopicType    = require('./app/models/topictype');
var Log          = require('./app/models/log');
// -------------------------------------------------

// more routes for our API will happen here
// on routes that end in /users
// ----------------------------------------------------
router.route('/users')
    // create a user (accessed at POST http://localhost:2397/api/users)
    .post(function(req, res) {
        // console.log(req.body);
        var user        = new User();      // create a new instance of the User model
        user.nickname 	= req.body.nickname;  // set the user info (comes from the request)
        user.firstname 	= req.body.firstname;
        user.lastname 	= req.body.lastname;
        user.password   = req.body.password;
        user.gender     = req.body.gender;
        user.email 		= req.body.email;
        user.photo      = req.body.photo;
        user.wechat 	= req.body.wechat;
        user.facebook 	= req.body.facebook;

        // console.log(user);
        // save the user and check for errors
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'User created!' ,data:user._id});
        });

    })

    // get all the users (accessed at GET http://localhost:2397/api/users)
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err)
                res.send(err);

            res.json(users);
        });
    });

//find by email
router.route('/users/login/:email')
    .get(function(req, res) {
        User.findOne({'email':req.params.email}, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });

//find by email & password
router.route('/users/login/:email/:password')
    .get(function(req, res) {
        User.findOne({
            'email'     : req.params.email,
            'password'  : req.params.password
        }, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });

//find by facebook
router.route('/users/facebook/:id')
    .get(function(req, res) {
        User.findOne({'facebook.id':req.params.id}, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    });

//find by wechat
router.route('/users/wechat/:id')
    .get(function(req, res) {
        User.findOne({'wechat.id':req.params.id}, function(err, user) {
            if (err){
                res.send(err);
            }
            res.json(user);
        });
    });

// on routes that end in /users/:id
// ----------------------------------------------------
router.route('/users/:id')
    // get the user with that id (accessed at GET http://localhost:2397/api/users/:id)
    .get(function(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })

    // update the user with this id (accessed at PUT http://localhost:2397/api/users/:id)
    .put(function(req, res) {
        // use our user model to find the user we want
        User.findById(req.params.id, function(err, user) {
            if (err)
                res.send(err);

            user.nickname   = req.body.nickname;  // update the user info
            user.firstname 	= req.body.firstname;
            user.lastname 	= req.body.lastname;
            user.password   = req.body.password;
            user.gender     = req.body.gender;
            user.email      = req.body.email;
            user.photo      = req.body.photo;
            user.wechat 	= req.body.wechat;
            user.facebook 	= req.body.facebook;

            // save the user
            user.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'User updated!' });
            });

        });
    })

    // delete the user with this id (accessed at DELETE http://localhost:2397/api/users/:id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

router.route('/catalogs')
    // create a catalog (accessed at POST http://localhost:2397/api/catalogs)
    .post(function(req, res) {
        var catalog 		= new Catalog();
        catalog.tag 		= req.body.tag;
        catalog.name 		= req.body.name;
        catalog.updateDate 	= new Date();

        catalog.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Catalog created!' });
        });

    })

    // get all the catalogs (accessed at GET http://localhost:2397/api/catalogs)
    .get(function(req, res) {
        Catalog.find(function(err, catalogs) {
            if (err)
                res.send(err);

            res.json(catalogs);
        });
    });

router.route('/catalogs/:id')
    .get(function(req, res) {
        Catalog.findById(req.params.id, function(err, catalog) {
            if (err)
                res.send(err);
            res.json(catalog);
        });
    })

    .put(function(req, res) {
        Catalog.findById(req.params.id, function(err, catalog) {
            if (err)
                res.send(err);

            catalog.tag 		= req.body.tag;
            catalog.name 		= req.body.name;
            catalog.updateDate 	= new Date();

            catalog.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Catalog updated!' });
            });

        });
    })

    .delete(function(req, res) {
        Catalog.remove({
            _id: req.params.id
        }, function(err, catalog) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


router.route('/things/addtopic')
    .post(function(req, res) {
        var topic             = new Topic();
        topic.title           = req.body.title;
        topic.link            = req.body.link;
        topic.type            = req.body.type;
        topic.createBy        = req.body.createBy;
        topic.createDate      = new Date();
        topic.things          = req.body.things;
        topic.comments        = [];

        topic.save(function(err) {
            if (err)
                res.send(err);

            res.json({message: 'Topic created!'});
        });

    });

router.route('/things/addcomment/:id/:title')
    .post(function(req, res) {
        Topic.findOne({
                'things'    :req.params.id,
                'title'     :req.params.title
            }
            ,function(err, topic) {
                if (err)
                    res.send(err);

                var newComment = topic.comments.create({
                    "text"   : req.body.text,
                    "html"   : req.body.html,
                    "photo"  : req.body.photo,
                    "audio"  : req.body.audio,
                    "video"  : req.body.video,
                    "doodle" : req.body.doodle,
                    "type"   : req.body.type,
                    "createBy"   : req.body.createBy,
                    "createDate" : new Date()
                });
                console.log(newComment);
                topic.comments.push(newComment);
                Topic.update({_id:topic._id},{ $set: {comments: topic.comments} },function(err){
                    if (err)
                        res.send(err);
                });

                res.json({ message: 'Comments update!' ,status:'success', data:newComment._id});
            });
    });

router.route('/things/getAllChangingLocation')
    .get(function(req,res){
        redis.getAllThingLocation(function(data){
            res.json(data);
        })
    });

router.route('/things/updatelocation/:id')
    .post(function(req, res) {
        if(!req.params.id || req.params.id=="" || !req.body.location){
            res.json({message:"Data format error",status:"failed"});
            return
        }
        redis.setThingLocation(req.params.id,req.body.location);
        Things.findById(req.params.id,function(err, things) {
            if (err)
                res.send(err);
            if(!things){
                res.json({ message: 'Things not exist!' });
                return
            }
            things.location = req.body.location;
            things.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Location update!' });
            });
        });
    });

router.route('/things')
    // create a things (accessed at POST http://localhost:2397/api/things)
    .post(function(req, res) {
        var things 			= new Things();
        things.catalog      = req.body.catalog;
        things.name         = req.body.name;
        things.photo        = req.body.photo;
        things.description  = req.body.description;
        things.contactInfo  = req.body.contactInfo;
        things.type         = req.body.type;
        things.subType      = req.body.subType;
        things.keyWord      = req.body.keyWord;
        things.owner        = req.body.owner;
        things.createDate   = new Date();
        things.audioInfo    = req.body.audioInfo;
        things.beacons      = req.body.beacons;
        things.location     = req.body.location;
        things.areacode     = req.body.areacode;

        things.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Things created!' });
        });

    })

    // get all the things (accessed at GET http://localhost:2397/api/things)
    .get(function(req, res) {
        /*
         Things.find(function(err, things) {
         if (err)
         res.send(err);

         res.json(things);
         });*/

        Things.find()
            .populate('catalog')
            .populate('owner')
            .exec(function(err,things){
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

router.route('/things/:id')
    /*
     .get(function(req, res) {
     Things.findById(req.params.id, function(err, things) {
     if (err)
     res.send(err);
     res.json(things);
     });
     })*/

    .get(function(req, res) {
        Things.findById(req.params.id)
            .populate('catalog')
            .populate('owner')
            .exec(function(err,things){
                if (err)
                    res.send(err);
                res.json(things);
            });
    })

    .put(function(req, res) {
        Things.findById(req.params.id, function(err, things) {
            if (err)
                res.send(err);

            if(things != null){
                things.catalog      = req.body.catalog;
                things.name         = req.body.name;
                things.photo        = req.body.photo;
                things.description  = req.body.description;
                things.contactInfo  = req.body.contactInfo;
                things.type         = req.body.type;
                things.subType      = req.body.subType;
                things.keyWord      = req.body.keyWord;
                things.owner        = req.body.owner;
                things.audioInfo    = req.body.audioInfo;
                things.beacons      = req.body.beacons;
                things.location     = req.body.location;
                things.areacode     = req.body.areacode;
                //add by Brian
                things.relatedCount = req.body.relatedCount? req.body.relatedCount : 0;
                things.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Things updated!'});
                });
            }
            else {
                res.json({message: 'Things not exists!'});
            }

        });
    })

    .delete(function(req, res) {
        Things.findById(req.params.id, function (err, things) {
            if (err)
                res.send(err);

            if (things != null) {
                Things.remove({
                    _id: req.params.id
                }, function (err, things) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Successfully deleted'});
                });
            }
            else {
                res.send({message: 'Things not exists!'});
            }
        });
    });

//filter catalog
router.route('/things/catalog/:id')
    .get(function(req, res) {
        Things.find({'catalog': req.params.id})
            /*
             .populate({
             path  : 'catalog',
             match : {tag : req.params.tag}
             })*/
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter catalog & group(keyword)
router.route('/things/catalog/:catalogId/:groupName')
    .get(function(req, res) {
        var query = {
            'catalog': req.params.catalogId,
            'keyWord': {"$in": [req.params.groupName]}
        };

        Things.find(query)
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

router.route('/things/search/:keyWords')
    .get(function(req,res) {
        var reg = new RegExp(req.params.keyWords, "i");

        var query = {
            'name': reg
        };

        Things.find(query)
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter owner
router.route('/things/owner/:id')
    .get(function(req, res) {
        Things.find({
            'owner': req.params.id
        })
            //.populate('catalog')
            //.populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter type
router.route('/things/type/:type')
    .get(function(req, res) {
        Things.find({
            'type': req.params.type
        })
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter type & sub type
router.route('/things/type/:type/:subType')
    .get(function(req, res) {
        Things.find({
            'type': req.params.type,
            'subType': req.params.subType
        })
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter key words
router.route('/things/keyword/:key')
    .get(function(req, res) {
        Things.find({
            'keyWord': {"$in": [req.params.key]}
        })
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter things topic & comments
router.route('/things/topics/:id/:title')
    .get(function(req, res) {
        Topic.findOne({
            'things': req.params.id,
            'title': req.params.title
        })
            .populate('createBy')
            .exec(function (err, topic) {
                if (err)
                    res.send(err);
                res.json(topic);
            });
    });

//filter things topics
router.route('/things/topics/:id')
    .get(function(req, res) {
        Topic.find({
            'things': req.params.id
        })
            .populate('createBy')
            .populate('comments.createBy')
            .exec(function (err, topics) {
                if (err)
                    res.send(err);
                res.json(topics);
            });
    });

//filter areacode
router.route('/things/areacode/:areacode')
    .get(function(req, res) {
        Things.find({'areacode': req.params.areacode})
            .select('-photo')
            .populate('catalog')
            .populate('owner')
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

//filter beacon
router.route('/things/beacon/:major/:minor')
    .get(function(req, res) {
        Things.findOne({
            'beacons.major': req.params.major,
            'beacons.minor': req.params.minor
        })
        .exec(function (err, things) {
            if (err)
                res.send(err);
            res.json(things);
        });
    });

//filter location
router.route('/things/location/:latMin/:latMax/:lngMin/:lngMax')
    .get(function(req, res) {
        Things
            .where('location.lat').gt(req.params.latMin).lt(req.params.latMax)
            .where('location.lng').gt(req.params.lngMin).lt(req.params.lngMax)
            .exec(function (err, things) {
                if (err)
                    res.send(err);
                res.json(things);
            });
    });

router.route('/posts')
    // create a posts (accessed at POST http://localhost:2397/api/posts)
    .post(function(req, res) {
        var posts 		    = new Post();
        posts.title 		= req.body.title;
        posts.description 	= req.body.description;
        posts.html          = req.body.html;
        posts.photo         = req.body.photo;
        posts.audio 		= req.body.audio;
        posts.video 		= req.body.video;
        posts.updateBy	    = req.body.updateBy;
        posts.updateDate	= new Date();
        posts.topic 	    = req.body.topic;

        posts.save(function(err) {
            if (err)
                res.send(err);

            res.json({message: 'Post created!'});
        });
    })

    // get all the posts (accessed at GET http://localhost:2397/api/posts)
    .get(function(req, res) {
        Post.find(function (err, posts) {
            if (err)
                res.send(err);

            res.json(posts);
        });
    });

router.route('/posts/topic/:id')
    .get(function(req, res) {
        Post.find({'topic': req.params.id}, function (err, posts) {
            if (err)
                res.send(err);

            res.json(posts);
        });
    });

router.route('/posts/:id')
    .get(function(req, res) {
        Post.findById(req.params.id, function (err, posts) {
            if (err)
                res.send(err);
            res.json(posts);
        });
    })

    .put(function(req, res) {
        Post.findById(req.params.id, function(err, posts) {
            if (err)
                res.send(err);

            posts.title         = req.body.title;
            posts.description   = req.body.description;
            posts.html          = req.body.html;
            posts.photo         = req.body.photo;
            posts.audio         = req.body.audio;
            posts.video         = req.body.video;
            posts.updateBy      = req.body.updateBy;
            posts.updateDate    = new Date();
            posts.topic         = req.body.topic;

            posts.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Post updated!' });
            });

        });
    })

    .delete(function(req, res) {
        Post.findById(req.params.id, function (err, post) {
            if (err)
                res.send(err);

            if (post != null) {
                Post.remove({
                    _id: req.params.id
                }, function (err, post) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Successfully deleted'});
                });
            }
            else {
                res.send({message: 'Post not exists!'});
            }
        });
    });

router.route('/types')
    // create a types (accessed at POST http://localhost:2397/api/types)
    .post(function(req, res) {
        var types       = new Type();
        types.tag       = req.body.tag;
        types.name      = req.body.name;
        types.subType   = req.body.subType;

        types.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Type created!'});
        });

    })

    // get all the types (accessed at GET http://localhost:2397/api/types)
    .get(function(req, res) {
        Type.find(function (err, types) {
            if (err)
                res.send(err);

            res.json(types);
        });
    });

router.route('/topictypes')
    .post(function(req, res) {
        var topictype   = new TopicType();
        topictype.name  = req.body.name;
        topictype.rule  = req.body.rule;

        topictype.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Topic Type created!'});
        });

    })

    .get(function(req, res) {
        TopicType.find(function (err, topictypes) {
            if (err)
                res.send(err);

            res.json(topictypes);
        });
    });

router.route('/logs')
    // create a log (accessed at POST http://localhost:2397/api/logs)
    .post(function(req, res) {
        var logs        = new Log();
        logs.logTime    = new Date();
        logs.logType    = req.body.logType;
        logs.createBy   = req.body.createBy;
        logs.things     = req.body.things;
        logs.beacon     = req.body.beacon;
        logs.location   = req.body.location;

        /*
         logs.save(function(err) {
         if (err)
         res.send(err);

         res.json({ message: 'Log created!' });
         });
         */

        //integrated with mysql
        mysql.addLog(
            res, [
                "" + logs.things,
                "" + logs.createBy,
                logs.logType,
                logs.logTime,
                logs.beacon.major,
                logs.beacon.minor,
                logs.beacon.range,
                logs.location.lat,
                logs.location.lng
            ]
        );
        var callback = function (args) {
            emitter.emit('refreshCache', args);
        };

        mysql.getHeatChartData(callback);
    })

    // get all the logs (accessed at GET http://localhost:2397/api/logs)
    .get(function(req, res) {
        Log.find(function (err, logs) {
            if (err)
                res.send(err);

            res.json(logs);
        });
    });

emitter.on('refreshCache',function(args){
    redis.updateCache(args);
});

router.route('/cache/heatchart')
    .get(function(req, res) {
        redis.heatChart(res);
    });

router.route('/groups')
    .post(function(req, res) {
        var group = new Group();
        group.name = req.body.name;
        group.updateDate = new Date();
        group.things = [];
        group.priority = req.body.priority;

        group.save(function (err) {
            if (err)
                res.send(err);

            res.json({message: 'Group created!'});
        });

    })

    .get(function(req, res) {
        Group.find()
            .populate('things')
            .exec(function (err, groups) {
                if (err)
                    res.send(err);

                res.json(groups);
            });
    });

router.route('/groups/:id')
    .get(function(req, res) {
        Group.findById(req.params.id)
            .populate('things')
            .exec(function (err, group) {
                if (err)
                    res.send(err);

                res.json(group);
            });
    })

    .put(function(req, res) {
        Group.findById(req.params.id, function(err, group) {
            if (err)
                res.send(err);

            group.name          = req.body.name;
            group.updateDate    = new Date();
            group.things        = req.body.things;
            group.priority      = req.body.priority;

            group.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Group updated!' });
            });

        });
    })

    .delete(function(req, res) {
        Group.findById(req.params.id, function (err, group) {
            if (err)
                res.send(err);

            if (group != null) {
                Group.remove({
                    _id: req.params.id
                }, function (err, group) {
                    if (err)
                        res.send(err);

                    res.json({message: 'Successfully deleted'});
                });
            }
            else {
                res.send({message: 'Group not exists!'});
            }
        });
    });

//Create by Brian add 2016/04/27
var refreshDucksCount = function(thingId,callback) {
    console.log("refreshDucksCount...on");
    Things.findById(thingId)
        .populate('owner')
        .exec(function (err, thing) {
            if (err || thing == undefined || thing.owner == undefined) {
                if (err) {
                    console.log("[refreshDucksCount err]-" + err);
                }
                if (callback) {
                    callback({"count": 0})
                }
                return;
            }

            var ownerId = thing.owner._id.toString();
            console.log("on refreshDucksCount...thing:" + thing.name + "," + thing._id);

            mysql.getThingsRelatedCountViaThingId(thingId, ownerId, function (data) {
                console.log(data);
                if (data) {
                    if (data.err) {
                        if (callback) {
                            callback({"count": 0})
                        }
                        return null;
                    } else {
                        console.log(data);
                        if (callback) {
                            callback(data)
                        }
                        redis.setThingRelatedCount(thingId, data.count);
                        return null;
                    }
                }
            })
        });
};

var refreshOwnerDucksCount = function(ownerId) {
    try {
        Things.find({'owner': ownerId}, function (err, things) {
            var resultObj = {};
            if (err) {
                resultObj.err = err;
                console.log("refreshOwnerDucksCount err:" + err);
                return;
            }
            console.log("refreshing owner's duck");
            if (things && things.length > 0) {
                things.map(function (thing) {
                    refreshDucksCount(thing._id.toString());
                })
            }
        })
    }
    catch (ex) {
        console.log("refreshOwnerDucksCount err:" + ex);
    }
};

router.route('/user/favor/:userId')
    .get(function(req, res) {
        if (!req.params.userId || req.params.userId == "") {
            res.json([]);
            return;
        }
        console.log("getFavorThingsIdViaOwnerId start");
        mysql.getFavorThingsIdViaOwnerId(req.params.userId, function (result) {
            if (!result.data || result.data.length <= 0) {
                res.json([]);
                return;
            }
            console.log("getFavorThingsIdViaOwnerId success");
            // console.log(result);
            var query = {
                '_id': {"$in": result.data}
            };

            Things.find(query, function (err, things) {
                if (err) {
                    res.send(err);
                    return;
                }
                console.log("get things from mongo success");
                // console.log(things);
                res.json(things);
            })
        });
    });

router.route('/user/favor/')
    .post(function(req, res) {
        var ownerId = req.body.ownerId;
        var thingsId = req.body.thingsId;

        if (!ownerId || ownerId == "" || !thingsId || thingsId.length <= 0) {
            res.json(
                {
                    'status': 'failed',
                    'message': 'object undefined'
                });
            return;
        }

        console.log('add favor start');

        res.json({'status': 'success'});
        //refresh the user's things ducks
        // refreshOwnerDucksCount(ownerId);
        mysql.addFavors(ownerId, thingsId, function (result) {
            console.log(result);
            console.log(thingsId);
            if (result) {
                emitter.emit('refreshOwnerDucksCount', ownerId);
                //  res.json({'status':'success'});
                //refresh cache

                thingsId.map(function (thingId) {
                    console.log("add favor call refreshDucksCount");
                    console.log(thingId);
                    refreshDucksCount(thingId);
                });

            } else {
                //  res.json({'status':'failed'});
            }
        });

    })

    .delete(function(req,res) {
        console.log("delete favor start...");
        var ownerId = req.body.ownerId;
        var thingsId = req.body.thingsId;

        if (!ownerId || ownerId === "" || !thingsId || thingsId.length <= 0) {
            res.json({'status': 'failed'});
        }

        mysql.deleteFavorsViaThingsId(ownerId, thingsId, function (result) {
            if (result) {
                res.json({'status': 'success'});

                //refresh cache
                thingsId.map(function (thingId) {
                    refreshDucksCount(thingId);
                });
            } else {
                res.json({'status': 'failed'});
            }
        });

        //refresh the user's things ducks
        // refreshOwnerDucksCount(ownerId);
        emitter.emit('refreshOwnerDucksCount', ownerId);
    });

router.route('/cache/thing/ducks/:thingId')
    .get(function(req,res) {
        var thingId = req.params.thingId;
        // var ownerId = req.params.ownerId

        if (!thingId || thingId == "") {
            res.json({'count': 0});
            return;
        }

        redis.getThingRelatedCount(thingId, function (data) {
            if (data) {
                if (data.err) {
                    res.json({'count': 0});
                } else {
                    res.json({'count': data});
                }
            } else {
                refreshDucksCount(thingId, function (data) {
                    res.json(data);
                });
            }
        });
    });

router.route('/friends/:userId')
    .get(function(req,res) {
        var userId = req.params.userId;
        if (!userId || userId == "") {
            res.json({'followIds': []});
            return;
        }

        mysql.getMyFriends(userId, function (data) {
            res.json({'followIds': data});
        });
    })

    .post(function(req,res) {
        var userId = req.params.userId;
        var follows = req.body.follows;

        if (!userId || userId == "" || !follows || follows.length <= 0) {
            res.json({'status': 'failed'});
            return;
        }

        mysql.setFriends(userId, follows, function (result) {
            if (result.err) {
                res.json({'status': 'failed'});
            } else {
                res.json({'status': 'success'});
            }
        })
    });

router.route('/friends/wechat/:userId')
    .post(function(req,res) {
        var userId = req.params.userId;
        var userData = req.body;

        if (!userId || !userData || !userData.wechat.id) {
            res.json({message: "Data miss", status: "failed"});
            return;
        }

        User.findOne({'wechat.id': userData.wechat.id}, function (findErr, userFromDB) {
            if (findErr) {
                res.send({err: findErr});
                return;
            }

            if (!userFromDB) {
                var user        = new User();      // create a new instance of the User model
                user.nickname   = req.body.nickname;  // set the user info (comes from the request)
                user.firstname  = req.body.firstname;
                user.lastname   = req.body.lastname;
                user.password   = req.body.password;
                user.gender     = req.body.gender;
                user.email      = req.body.email;
                user.photo      = req.body.photo;
                user.wechat     = req.body.wechat;
                user.facebook   = req.body.facebook;

                // console.log(user);
                // save the user and check for errors
                user.save(function (createErr) {
                    if (createErr) {
                        res.json({message: "Create user failed", status: "failed", err: createErr});
                    }
                    console.log(user);
                    mysql.setFriends(userId, [{followId: user._id.toString(), source: 'wechat'}], function (result) {
                        if (result.err) {
                            res.json({'message': 'Add friend failed', 'status': 'failed'});
                        } else {
                            res.json({'status': 'success'});
                        }
                    });
                });
            } else {
                console.log(userFromDB);
                mysql.setFriends(userId, [{followId: userFromDB._id.toString(), source: 'wechat'}], function (result) {
                    if (result.err) {
                        res.json({'message': 'Add friend failed', 'status': 'failed'});
                    } else {
                        res.json({'status': 'success'});
                    }
                });
            }
        });

    });

router.route('/follows/:userId')
    .get(function(req,res) {
        var userId = req.params.userId;
        if (!userId || userId == "") {
            res.json({'followIds': []});
            return;
        }

        mysql.getFollows(userId, function (data) {
            res.json({'followIds': data});
        });
    })

    .post(function(req,res) {
        var userId = req.params.userId;
        var follows = req.body.follows;

        if (!userId || userId == "" || !follows || follows.length <= 0) {
            res.json({'status': 'failed'});
            return;
        }

        mysql.setFollows(userId, follows, function (result) {
            if (result.err) {
                res.json({'status': 'failed'});
            } else {
                res.json({'status': 'success'});
            }
        })
    })

    .delete(function(req,res) {
        var userId = req.params.userId;
        var follows = req.body.follows;

        if (!userId || userId == "" || !follows || follows.length <= 0) {
            res.json({'status': 'failed'});
            return;
        }

        mysql.deleteFollows(userId, follows, function (result) {
            if (result.err) {
                res.json({'status': 'failed'});
            } else {
                res.json({'status': 'success'});
            }
        })
    });

emitter.on('refreshOwnerDucksCount',function(ownerId) {
    console.log("start refresh owner's duck with ownerId:" + ownerId);
    refreshOwnerDucksCount(ownerId);
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Mongo Server running on port ' + port);
