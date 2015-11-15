
var express = require('express');
var jwt = require('jsonwebtoken');
var nodemailer = require("nodemailer");
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

//data containers
var tokens = [];
var usernames = [];
var emails = [];
var tempAccounts = [];
var activatedAccounts = [];
var cert = 'sad76asd5sa8dfd';

var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '**your gmail address**',
        pass: '**password for that gmail account**'
    }
});

app.use("/Scripts", express.static(__dirname + '/Scripts'));
app.use("/Content", express.static(__dirname + '/Content'));
app.use("/Views", express.static(__dirname + '/Views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Server up the webpage
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/create-account', function(req, res){
  /*
    600 = verification email sent
    601 = username in use
    602 = email in use
    603 = both email and username in use
    604 = email failed to send for some reason
  */
  var result = 600;
  if(usernames.indexOf(req.body.username) !== -1)
    result = 601;
  if(emails.indexOf(req.body.email) !== -1)
    result === 600 ? result = 602 : result = 603;

  if(result !== 600)
    res.send('error:' + result);
  else{
    sendEmail(req, function(err){
      if(err)
        res.send('error:' + 604);
      else{
        tempAccounts[new Buffer(req.body.email).toString('base64')] = req.body;
        usernames.push(req.body.username);
        emails.push(req.body.email);
        res.send('success:' + 600);
      }
    });
  }
});

//Sends out Email
var sendEmail = function(req, callback){
  var link="http://"+req.get('host')+"/verify?id="+new Buffer(req.body.email).toString('base64');
  var mailOptions={
      from : 'doNotReply@rackspace_app.com',
      to : req.body.email,
      subject : "Please confirm your Email account",
      html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
  }
  smtpTransport.sendMail(mailOptions, function(err, res){
     callback(err, res);
  });
}

//Verifies Email
app.get('/verify',function(req,res){
    var index = req.query.id;
    if((req.protocol+"://"+req.get('host'))==("http://localhost:3000"))
    {
        console.log("Domain is matched. Information is from Authentic email");
        if(tempAccounts[index])
        {
            console.log("email is verified");
            activatedAccounts[tempAccounts[index].email] = tempAccounts[index];
            res.end("<h1>Email "+tempAccounts[index].email+" has been Successfully verified");
            delete tempAccounts[index];
        }
        else
        {
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    }
    else
    {
        res.end("<h1>Request is from unknown source");
    }
});

app.post('/authenticate', function (req, res) {
  //only need to check activated accounts
  if(activatedAccounts[req.body.email] == null || activatedAccounts[req.body.email].password !== req.body.password)
    res.sendStatus(401);
  else {
    // sign with RSA SHA256
    var token = jwt.sign(req.body, cert, { expiresIn: 1440*3*60});
    tokens.push(token);
    res.send({'token': token, 'username': activatedAccounts[req.body.email].username});
  }
});

app.post('/is-authenticated', function(req, res){
  jwt.verify(req.body.token, cert, function(err, decoded){
    if(err)
      res.sendStatus(401);
    else
      res.send('true');
  });
});

var server = app.listen(3000, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
