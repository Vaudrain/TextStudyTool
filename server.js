/** Required Packages */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');
const fs = require('fs');
const date = require('date-and-time');
const http = require('http');
const https = require('https');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const randomstring = require('randomstring');

/** Services Used for sending emails */
const services = {
    email: [{
            address: 'FYPDeviceStudy@gmail.com',
            name: 'Nicholas bentley',
            smtp: nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'FYPDeviceStudy@gmail.com',
                    pass: 'FYPStudyPass'
                },
            }),
            imap: new Imap({
                //   debug: console.log,
                user: 'FYPDeviceStudy@gmail.com',
                password: 'FYPStudyPass',
                host: 'imap.gmail.com',
                port: 993,
                tls: true
            })
        }
    ]
}

/** https credentials */
const credentials = {
  key: fs.readFileSync(path.join(__dirname,'Back End','server-key.pem')),
  cert: fs.readFileSync(path.join(__dirname,'Back End','server-cert.pem'))
};

/** variable for storing statistics, updated on startup and hourly */
var statistics = {};

/**

 _______  _______  _        _______  _______  ______   ______              _______  _______  _        _______  _______  _______  _______  _______
(       )(  ___  )( (    /|(  ____ \(  ___  )(  __  \ (  ___ \        /\  (       )(  ___  )( (    /|(  ____ \(  ___  )(  ___  )(  ____ \(  ____ \
| () () || (   ) ||  \  ( || (    \/| (   ) || (  \  )| (   ) )      / /  | () () || (   ) ||  \  ( || (    \/| (   ) || (   ) || (    \/| (    \/
| || || || |   | ||   \ | || |      | |   | || |   ) || (__/ /      / /   | || || || |   | ||   \ | || |      | |   | || |   | || (_____ | (__
| |(_)| || |   | || (\ \) || | ____ | |   | || |   | ||  __ (      / /    | |(_)| || |   | || (\ \) || | ____ | |   | || |   | |(_____  )|  __)
| |   | || |   | || | \   || | \_  )| |   | || |   ) || (  \ \    / /     | |   | || |   | || | \   || | \_  )| |   | || |   | |      ) || (
| )   ( || (___) || )  \  || (___) || (___) || (__/  )| )___) )  / /      | )   ( || (___) || )  \  || (___) || (___) || (___) |/\____) || (____/\
|/     \|(_______)|/    )_)(_______)(_______)(______/ |/ \___/   \/       |/     \|(_______)|/    )_)(_______)(_______)(_______)\_______)(_______/


*/

/* connect to MongoDB */
mongoose.connect('mongodb://localhost:27017');
var db = mongoose.connection;

/* handle mongo error */
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

/* Define User Schema */
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: false,
    required: false,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  results: {
    type: Array,
    required: false,
  },
  hoursUntilEmail: {
    type: Number,
    required: false,
  }
});

/* authenticate input against database */
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      if(bcrypt.compareSync(password, user.password)) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
}

/* Apply User Schema */
var User = mongoose.model('User', UserSchema);
module.exports = User;

/**

 _______           _______  _______  _______  _______  _______        _______  _______ _________          _______
(  ____ \|\     /|(  ____ )(  ____ )(  ____ \(  ____ \(  ____ \      (  ____ \(  ____ \\__   __/|\     /|(  ____ )
| (    \/( \   / )| (    )|| (    )|| (    \/| (    \/| (    \/      | (    \/| (    \/   ) (   | )   ( || (    )|
| (__     \ (_) / | (____)|| (____)|| (__    | (_____ | (_____       | (_____ | (__       | |   | |   | || (____)|
|  __)     ) _ (  |  _____)|     __)|  __)   (_____  )(_____  )      (_____  )|  __)      | |   | |   | ||  _____)
| (       / ( ) \ | (      | (\ (   | (            ) |      ) |            ) || (         | |   | |   | || (
| (____/\( /   \ )| )      | ) \ \__| (____/\/\____) |/\____) |      /\____) || (____/\   | |   | (___) || )
(_______/|/     \||/       |/   \__/(_______/\_______)\_______)      \_______)(_______/   )_(   (_______)|/


*/

var app = express();

/* Use sessions for tracking logins */
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));


/* parse incoming requests */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


/* Set Favicon */
app.use(favicon(path.join(__dirname, 'User Environment','Sitewide Assets','logo.png')));

/* Set up static page serving and landing page (dependent on session) */
app.use(express.static('User Environment'));
app.get(['/','/User Environment/Main Menu.html','/Login Page.html'], function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.sendFile(path.join(__dirname,'User Environment','Login Page.html'));
        } else {
          return res.sendFile(path.join(__dirname,'User Environment','Main Menu.html'));
        }
      }
    });
});



/**

 _______  _______          _________ _______  _______
(  ____ )(  ___  )|\     /|\__   __/(  ____ \(  ____ \
| (    )|| (   ) || )   ( |   ) (   | (    \/| (    \/
| (____)|| |   | || |   | |   | |   | (__    | (_____
|     __)| |   | || |   | |   | |   |  __)   (_____  )
| (\ (   | |   | || |   | |   | |   | (            ) |
| ) \ \__| (___) || (___) |   | |   | (____/\/\____) |
|/   \__/(_______)(_______)   )_(   (_______/\_______)


*/

/* POST route for creating users or logging in */
app.post('/create-user', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    return next(err);
  }
    /* Signup */
  if (req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (req.body.email) {
          var userData = {
            email: req.body.email,
            username: req.body.username,
            password: hash
          }
        } else {
          var userData = {
            username: req.body.username,
            password: hash
          }
        }

    User.create(userData, function (error, user) {
      if (error) {
        var err = new Error('User already exists.');
        err.status = 422;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });
  });
    /* Login */
  } else if (req.body.logname && req.body.logpassword) {
    User.authenticate(req.body.logname, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

/* Profile serving with ejs rendering */
app.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        var err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        res.render(path.join(__dirname,'User Environment','Profile.ejs'), {username:user.username,mail:user.email}); //Render error page with error message
        delete req.session.error; // remove variable from further requests
      }
    }
  });
});

/* GET route for password reset */
app.get(['/ForgotPassword'], function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.sendFile(path.join(__dirname,'User Environment','Forgot Password.html'));
        } else {
          return res.sendFile(path.join(__dirname,'User Environment','Main Menu.html'));
        }
      }
    });
});

/* POST route for password reset email*/
app.post(['/ResetPassword'], function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          User.findOne({ username: JSON.parse(JSON.stringify(req.body)).username }).exec(function (err, user) {
            if (err) {
              return res.send("Invalid username");
            } else if (!user) {
              var err = new Error('User not found.');
              err.status = 401;
              return res.status(401).send(err);
            } else {
              if (!user.email) {
                return res.status(401).send("No email for this user");
              } else {
                var newPassword = randomstring.generate(8);
                bcrypt.hash(newPassword, 10, function(err, hash) {
                  user.password = hash;
                  user.save(function err(){});
                });
                var passResetMailOptions = {
                    from: '"Nicholas Bentley" <FYPDeviceStudy@gmail.com>', // sender address
                    to: user.email, // list of receivers
                    subject: 'Password Reset', // Subject line
                    text: 'Hello ' + user.username + ', your password for the study has been reset, it is now ' + newPassword, // plain text body
                    html: 'Hello ' + user.username + ', your password for the study has been reset, it is now <b>' + newPassword + '</b>' // html body
                };
                // send mail with defined transport object
                services['email'][0].smtp.sendMail(passResetMailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: Password Reset at %s', user.email);
                });
                return res.send("success");
              }
            }
          });
        } else {
          return res.sendFile(path.join(__dirname,'User Environment','Main Menu.html'));
        }
      }
    });
});

/* Updates password on request */
app.post('/update-password', function (req, res, next) {
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Old Passwords do not match.');
    err.status = 400;
    return next(err);
  }
  if (req.body.newPassword !== req.body.newPasswordConf) {
    var err = new Error('New Passwords do not match.');
    err.status = 400;
    return next(err);
  }

  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      User.authenticate(user.username, req.body.password, function (error, user) {
        if (error || !user) {
          var err = new Error('Wrong old password.');
          err.status = 401;
          return next(err);
        } else {
          bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
            user.password = hash;
            user.save(function err(){});
          });
          //user.save(function err(){});
          return res.redirect('/profile');
        }
      });
    }
  });
});

/* Updates email address on request */
app.post('/update-email', function (req, res, next) {
  if (req.body.newEmail !== req.body.newEmailConf) {
    var err = new Error('Emails do not match.');
    err.status = 400;
    return next(err);
  }
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        var err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        user.email = req.body.newEmail;
        user.save(function err(){});
        return res.redirect('/profile');
      }
    }
  });
});

/* Removes email address on request */
app.post('/remove-email', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        var err = new Error('Not authorized! Go back!');
        err.status = 400;
        return next(err);
      } else {
        user.email = null;
        delete user.email;
        user.save(function err(){});
        return res.redirect('/profile');
      }
    }
  });
});

/* GET for signup */
app.get('/SignUp', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.sendFile(path.join(__dirname,'User Environment','Introduction.html'));
        } else {
          return res.redirect('/');
        }
      }
    });
  });

/* GET for release form */
app.get('/ReleaseForm', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          return res.sendFile(path.join(__dirname,'User Environment','Release Form.html'));
        } else {
          return res.redirect('/');
        }
      }
    });
  });

/* GET for help */
app.get('/Help', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user != null) {
          return res.sendFile(path.join(__dirname,'User Environment','Help.html'));
        } else {
          return res.redirect('/');
        }
      }
    });
});

/* GET for logout */
app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

/* GET for environment page */
app.get('/test', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user != null) {
          return res.sendFile(path.join(__dirname,'User Environment','Test Environment.html'));
        } else {
          return res.redirect('/');
        }
      }
    });
});

/* GET for statistics page - serving */
app.get('/statistics', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user != null) {
          return res.sendFile(path.join(__dirname,'User Environment','Statistics Page.html'));
        } else {
          return res.redirect('/');
        }
      }
    });
  });

/* POST for statistics - for retrieving data */
app.post('/statisticsData', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user != null) {
          return res.send(JSON.stringify(statistics)); // Return stored statistics
        } else {
          return res.redirect('/');
        }
      }
    });
  });

/* Method for reading dictionaries */
function readDictionary(dictionaryName,res) {
  var tokens = [];
  fs.readFile(path.join(__dirname,'Back End','Dictionaries',dictionaryName), 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    data = data.split('\n'); // get array of all words
    for (var i = 0; i < 500; i++) {
      tokens.push(data[Math.floor(Math.random() * data.length)]);
    }
    res.send(JSON.stringify(tokens));
  });
}

/* POST request for token array */
app.post('/token', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        var err = new Error('User not found?');
        err.status = 400;
        return next(err);
      } else {
        if (user === null) {
          var err = new Error('User has been logged out?');
          err.status = 400;
          return next(err);
        } else {
          var tokenType = JSON.parse(JSON.stringify(req.body)).tokenType;
          /** Serve up correct token type - ideally should be refactored, along with dictionary names, for more modularity */

          switch (tokenType) {
            case "Alphabetic strings without capitalisation or special characters":
              readDictionary('Alphabetic_c_n',res);
              break;

            case "Alphabetic strings without capitalisation and with special characters":
              readDictionary('Alphabetic_c_y',res);
              break;

            case "Alphabetic strings with capitalisation and without special characters":
              readDictionary('Alphabetic_C_n',res);
              break;

            case "Alphabetic strings with capitalisation and with special characters":
              readDictionary('Alphabetic_C_y',res);
              break;

            case "Alphanumeric strings without capitalisation or special characters":
              readDictionary('Alphanumeric_c_n',res);
              break;

            case "Alphanumeric strings without capitalisation and with special characters":
              readDictionary('Alphanumeric_c_y',res);
              break;

            case "Alphanumeric strings with capitalisation and without special characters":
              readDictionary('Alphanumeric_C_n',res);
              break;

            case "Alphanumeric strings with capitalisation and with special characters":
              readDictionary('Alphanumeric_C_y',res);
              break;

            case "Proper Nouns":
              readDictionary('Proper_Nouns',res);
              break;

            case "Words":
              readDictionary('Words',res);
              break;

            case "Multi-word concatenated strings": //special case, uses existing dictionary
              var tokens = [];
              fs.readFile(path.join(__dirname,'Back End','Dictionaries','Words'), 'utf8', function (err,data) {
                if (err) {
                  return console.log(err);
                }
                data = data.split('\n'); // get array of all words
                for (var i = 0; i < 500; i++) {
                  tokens.push(data[Math.floor(Math.random() * data.length)] + data[Math.floor(Math.random() * data.length)] + data[Math.floor(Math.random() * data.length)] + data[Math.floor(Math.random() * data.length)]);
                }
                res.send(JSON.stringify(tokens));
              });
              break;

            case "Sentences without punctuation":
              readDictionary('Sentences_n',res);
              break;

            case "Sentences with punctuation":
              readDictionary('Sentences_y',res);
              break;

            default: //This should never happen
              var err = new Error('Invalid Token Type requested');
              err.status = 400;
              return next(err);
          }
        }
      }
    });
});

/* Takes test result input from user */
app.post('/tokenResults', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        var err = new Error('User not found?');
        err.status = 400;
        return next(err);
      } else {
        if (user === null) {
          var err = new Error('User has been logged out?');
          err.status = 400;
          return next(err);
        } else {
          var results = JSON.parse(JSON.stringify(req.body));
          results.time = (date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));
          user.results.push(results);
          user.hoursUntilEmail = 84; // Whenever a user sends results, reset email timer.
          user.save(function err(){});
          res.send({});
        }
      }
    });
});

/* Error Handler */
app.use(function errorHandler (err, req, res, next) {
  req.session.error = err.status.toString() + ": " + err.toString(); //Store error message in variable
  res.redirect('/error'); // redirect URI
});

/* Error Page renderer */
app.use('/error',function(req, res) {
  res.render(path.join(__dirname,'User Environment','Error.ejs'), {error:req.session.error}); //Render error page with error message
  delete req.session.error; // remove variable from further requests
});

/* Set up 404 Route */
app.get('*', function(req, res){
  res.sendFile(path.join(__dirname,'User Environment','404.html'), 404);
});

/**

 _______  _        ______         _______  _______        _______  _______          _________ _______  _______
(  ____ \( (    /|(  __  \       (  ___  )(  ____ \      (  ____ )(  ___  )|\     /|\__   __/(  ____ \(  ____ \
| (    \/|  \  ( || (  \  )      | (   ) || (    \/      | (    )|| (   ) || )   ( |   ) (   | (    \/| (    \/
| (__    |   \ | || |   ) |      | |   | || (__          | (____)|| |   | || |   | |   | |   | (__    | (_____
|  __)   | (\ \) || |   | |      | |   | ||  __)         |     __)| |   | || |   | |   | |   |  __)   (_____  )
| (      | | \   || |   ) |      | |   | || (            | (\ (   | |   | || |   | |   | |   | (            ) |
| (____/\| )  \  || (__/  )      | (___) || )            | ) \ \__| (___) || (___) |   | |   | (____/\/\____) |
(_______/|/    )_)(______/       (_______)|/             |/   \__/(_______)(_______)   )_(   (_______/\_______)


*/

/*

 _______  _______           _______  ______            _        _______  ______        _________ _______  _______  _        _______
(  ____ \(  ____ \|\     /|(  ____ \(  __  \ |\     /|( \      (  ____ \(  __  \       \__   __/(  ___  )(  ____ \| \    /\(  ____ \
| (    \/| (    \/| )   ( || (    \/| (  \  )| )   ( || (      | (    \/| (  \  )         ) (   | (   ) || (    \/|  \  / /| (    \/
| (_____ | |      | (___) || (__    | |   ) || |   | || |      | (__    | |   ) |         | |   | (___) || (_____ |  (_/ / | (_____
(_____  )| |      |  ___  ||  __)   | |   | || |   | || |      |  __)   | |   | |         | |   |  ___  |(_____  )|   _ (  (_____  )
      ) || |      | (   ) || (      | |   ) || |   | || |      | (      | |   ) |         | |   | (   ) |      ) ||  ( \ \       ) |
/\____) || (____/\| )   ( || (____/\| (__/  )| (___) || (____/\| (____/\| (__/  )         | |   | )   ( |/\____) ||  /  \ \/\____) |
\_______)(_______/|/     \|(_______/(______/ (_______)(_______/(_______/(______/          )_(   |/     \|\_______)|_/    \/\_______)


*/

var j = schedule.scheduleJob('00 45 * * * *', function(){
  User.find({}, function(err, users) {
    var processedResults = {}; //Declare results object
    users.forEach(function(user) {

      /** Reminder Emails */
      if (user.hoursUntilEmail > 0) { // If email already sent don't bother
        user.hoursUntilEmail--;
        user.save(function err(){});
        if (user.hoursUntilEmail == 0) { // If hours is now 0, send email
          if (user.email) { // Don't send if no email address
            var reminderMailOptions = {
                from: '"Nicholas Bentley" <FYPDeviceStudy@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Device Study re-test', // Subject line
                text: 'Hello ' + user.username + ', It has been roughly half a week since you last completed a test. If you are still interested, could you please go to www.affordance.co.uk and take a repeat test. If you are no longer interested, simply do nothing, you will not receive another email unless you complete another test.', // plain text body
                html: 'Hello ' + user.username + ', It has been roughly half a week since you last completed a test. If you are still interested, could you please go to <a href="www.affordance.co.uk">www.affordance.co.uk</a> and take a repeat test. If you are no longer interested, simply do nothing, you will not receive another email unless you complete another test.' // html body
            };
            // send mail with defined transport object
            services['email'][0].smtp.sendMail(reminderMailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: Reminder at %s', user.email);
            });
          }
        }
      }

      /** Statistics */
      calculateStatistics();
    });
  });
});

/*

 _______ _________ _______ __________________ _______ __________________ _______  _______
(  ____ \\__   __/(  ___  )\__   __/\__   __/(  ____ \\__   __/\__   __/(  ____ \(  ____ \
| (    \/   ) (   | (   ) |   ) (      ) (   | (    \/   ) (      ) (   | (    \/| (    \/
| (_____    | |   | (___) |   | |      | |   | (_____    | |      | |   | |      | (_____
(_____  )   | |   |  ___  |   | |      | |   (_____  )   | |      | |   | |      (_____  )
      ) |   | |   | (   ) |   | |      | |         ) |   | |      | |   | |            ) |
/\____) |   | |   | )   ( |   | |   ___) (___/\____) |   | |   ___) (___| (____/\/\____) |
\_______)   )_(   |/     \|   )_(   \_______/\_______)   )_(   \_______/(_______/\_______)


*/


function calculateStatistics() {
  var newStatistics = {};
  User.find({}, function(err, users) {
    var processedResults = {};
    users.forEach(function(user) {
      var numTests = {};
      user.results.forEach(function(results) {
        if (typeof processedResults[results.Scheme] == 'undefined') {
          processedResults[results.Scheme] = {};
        }
        if (typeof numTests[results.Scheme] == 'undefined') {
          numTests[results.Scheme] = {};
        }
        if (typeof processedResults[results.Scheme][results.TokenType] == 'undefined') {
          processedResults[results.Scheme][results.TokenType] = [];
        }
        if (results.Correct > 0) { //Cull tests where no input was made.
          if (typeof numTests[results.Scheme][results.TokenType] == 'undefined') {
            numTests[results.Scheme][results.TokenType] = 0;
          }
          processedResults[results.Scheme][results.TokenType].push({ ["Correct"] : results.Correct, ["Error"] : results.Percentage , ["TestNumber"] : numTests[results.Scheme][results.TokenType]}); //Push results to array
          numTests[results.Scheme][results.TokenType]++;
        }
      });
    });

    for (var scheme in processedResults) {

      for (var tokenType in processedResults[scheme]) {
        if (typeof newStatistics[scheme] == 'undefined') {
          newStatistics[scheme] = {};
        }
        if (typeof newStatistics[scheme][tokenType] == 'undefined') {
          newStatistics[scheme][tokenType] = {};
        }
        processedResults[scheme][tokenType].sort((a, b) => parseFloat(a.TestNumber) - parseFloat(b.TestNumber));

        var xTestNumbers = [];
        var xUniqueTestNumbers = [];
        var yCorrect = [];
        var yError = [];
        var yAvgCorrect = [];
        var yAvgError = [];
        var sumCorrect = 0;
        var sumError = 0;
        var counter = 0;
        var currentTest = 0;
        processedResults[scheme][tokenType].forEach( function (results) {

          xTestNumbers.push(results.TestNumber);
          yCorrect.push(results.Correct);
          yError.push(results.Error);

          if (results.TestNumber != currentTest) { //assumes sorted
            yAvgCorrect.push(sumCorrect/counter);
            yAvgError.push(sumError/counter);
            xUniqueTestNumbers.push(currentTest);
            sumCorrect = 0;
            sumError = 0;
            counter = 0;
            currentTest = results.TestNumber;
          }

          counter++;
          sumCorrect += Number(results.Correct);
          sumError += Number(results.Error);
          //console.log(sumError);
        });
        yAvgCorrect.push(sumCorrect/counter);
        yAvgError.push(sumError/counter);
        xUniqueTestNumbers.push(currentTest);
        //console.log(yCorrect);

        var arrayCorrect = [];
        var arrayError = [];
        var arrayCorrectAvg = [];
        var arrayErrorAvg = [];
        for (var i = 0; i < xTestNumbers.length; i++) {
          arrayCorrect.push({"number" : xTestNumbers[i], "correct" : yCorrect[i]});
          arrayError.push({"number" : xTestNumbers[i], "error" : yError[i]});
        }

        for (var i = 0; i < xUniqueTestNumbers.length; i++) {
          arrayCorrectAvg.push({"number" : xUniqueTestNumbers[i], "correct" : yAvgCorrect[i]});
          arrayErrorAvg.push({"number" : xUniqueTestNumbers[i], "error" : yAvgError[i]});
        }

        newStatistics[scheme][tokenType].Correct = arrayCorrect;
        newStatistics[scheme][tokenType].CorrectAvg = arrayCorrectAvg;
        newStatistics[scheme][tokenType].Error = arrayError;
        newStatistics[scheme][tokenType].ErrorAvg = arrayErrorAvg;
      }
    }
    statistics = newStatistics;
  });
}

// Calculate statistics on startup
calculateStatistics();

  /* Start server listening */
  http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80, function(){
    console.log((new Date()) + " Server is redirecting to https from port 80 at " + __dirname);
  });
  https.createServer(credentials, app).listen(443, function() {
    console.log((new Date()) + " Server is listening with https on port 443 at " + __dirname);
  });
