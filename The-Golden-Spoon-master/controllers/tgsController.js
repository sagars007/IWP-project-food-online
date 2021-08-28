const express = require('express');
const app = express.Router();
const mongoose = require('mongoose');
const models = require('../models/models');
const nodemailer = require('nodemailer');

module.exports.updateMenu = function(data, res){
  models.Item.create(data).then(function(i){
    res.send(i);
  });
};

fetchMenu = function(req, res){
  models.Item.find({}).then(function(data){
    res.render('menu', {menu: data, user: req.session.user});
  });
};
module.exports.fetchMenu = fetchMenu;

module.exports.signupSubmit = function(req, res){
  var data = req.body;
  models.User.findOne({email: data.email}, function (err, docs) {
    if(docs==undefined){
      if (!("newsletter" in data)){
        data.newsletter = false;
      }
      models.User.create(data).then(function(data){
        data.newsletter=Boolean(data.newsletter);
        if(data.newsletter==true){
          models.Subscriber.create({email: data.email}).then(function(){});
          sendMail(data.email);
        }
        sendMail(data.email,"Signup Successful", "Thank you for joining our family!");
        req.session.user = data.email;
        console.log('After signup: ', req.session);
        fetchMenu(req, res);
        //res.render('index', {message: ''});
      });
    }
    else{
      res.send("User already exists");
    }
  });
};

module.exports.loginSubmit = function(req, res){
  var data = req.body;
  models.User.findOne({email: data.username}, function (err, docs){
    if(docs==undefined){
      res.render('login', {message: '**User does not exist**'});
    }
    else if(docs.password!=data.password){
      res.render('login', {message: '**Incorrect password**'});
    }
    else if(docs.password==data.password){
      req.session.user = data.username;
      console.log('After login: ',req.session);
      fetchMenu(req, res);
      //res.render('index', {message: '', user: req.session.user});
      //res.render('login', {message: '**Successfully logged in**'});
    }
  });
};

module.exports.logout = function(req, res){
  req.session.user = undefined;
  console.log('After logout: ', req.session);
  res.render('login', {message: '**Successfully logged out**'});
};

module.exports.forgotPasswordSubmit = function(data, res){
  models.User.findOne({email: data.username}, function (err, docs){
    if(docs==undefined){
      res.render('forgotPassword', {message: '**User does not exist**'});
    }
    else{
      sendMail(data.username,"Forgot Password", "Your password is: "+docs.password);
      res.render('forgotPassword', {message: '**Mail containing password has been sent**'});
    }
  });
};

function write(temp){
  models.Cart.create(temp);
}

function fetch(item, quantity, req, callback){
  models.Item.findOne({name: item}, function (err, docs){
    var temp = {};
    temp['quantity'] = quantity;
    temp['email'] = req.session.user;
    temp['item'] = docs.item;
    temp['name'] = docs.name;
    temp['totalprice'] = docs.price * quantity;
    callback(temp);
  });
}

function checkIfExists(temp, item, req){
  return new Promise((resolve) => {
    setTimeout(()=>{
      models.Cart.findOne({name: item}, function (err, docs){
        if(docs==undefined){
          fetch(item, temp[item], req, write);
        }
        else{
          docs.quantity+=temp[item];
          docs.save();
        }
      });
      resolve(item);
    }, 1000);
  });
}

module.exports.add2cart = function(req, res){
  var data = req.body;
  var temp = {};
  for (item in data){
    data[item] = Number(data[item]);
    if(data[item]>0 && data[item]<6){
      temp[item] = data[item];
    }
  }
  let promises=[];
  for(item in temp){
    promises.push(checkIfExists(temp, item, req));
  }
  Promise.all(promises).then((results) => {
    models.Item.find({}).then(function(data){
      res.render('menu', {menu: data, user: '*'+req.session.user});
    });
    //printCart(req, res);
  }).catch((e) => {});
};

module.exports.deleteFromCart = function(req, res){
  var name = req.body.name;
  models.Cart.find({ name:name }).remove().exec().then(function(){
    printCart(req, res);
  });
};

printCart = function(req, res){
  models.Cart.find({email: req.session.user}, function(err, docs){
    /*docs = JSON.stringify(docs);
    console.log(docs);*/
    res.render('cart', {user: req.session.user, data: docs});
  });
};
module.exports.printCart = printCart;

module.exports.printOrders = function(req, res){
  models.Order.find({email: req.session.user}, function(err, docs){
    res.render('orders', {user: req.session.user, data: docs});
  });
};

module.exports.cart2orders = function(req, res){
  models.Cart.find({email: req.session.user}, function(err, docs){
    docs.forEach(function(doc){
      var temp = {};
      temp['quantity'] = doc.quantity;
      temp['email'] = doc.email;
      temp['item'] = doc.item;
      temp['name'] = doc.name;
      temp['totalprice'] = doc.totalprice;
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      temp['date'] = dateTime;
      models.Order.create(temp);
      models.Cart.find({ name:doc.name, email:doc.email }).remove().exec();
    });
  });
  res.render('ordersuccess', {user: req.session.user});
};

printProfile = function(req, res){
  var details={};
  models.User.findOne({email: req.session.user}, function (err, docs){
    details['firstName'] = docs.firstName;
    details['lastName'] = docs.lastName;
    details['email'] = docs.email;
    details['phnumber'] = docs.phnumber;
    details['newsletter'] = docs.newsletter;
    details['password'] = docs.password;
    res.render('profile', {user: req.session.user, data: details});
  });
};
module.exports.printProfile = printProfile;

module.exports.editProfile = function(req, res){
  //console.log(req.body.phnumber);
  models.User.findOne({email: req.session.user}, function (err, docs){
    if(req.body.firstName!='')
      docs.firstName = req.body.firstName;
    if(req.body.lastName!='')
      docs.lastName = req.body.lastName;
    if(req.body.password!='')
      docs.password = req.body.password;
    if(req.body.phnumber!='')
      docs.phnumber = req.body.phnumber;
    if(req.body.newsletter == 'true'){
      docs.newsletter = true;
      sendMail(req.session.user);
    }
    else{
      docs.newsletter = false;
      models.Subscriber.find({email: req.session.user}).remove().exec().then(function(){});
    }
    docs.save();
  }).then(function(){
    printProfile(req, res);
  });
};

var sendMail = function(receiver, sub='Newsletter subscription', msg="Thank you for subscribing to our weekly newsletter!"){
	models.Subscriber.findOne({email: receiver}, function(err, docs){
    if(docs==undefined){
      models.Subscriber.create({email: receiver}).then(function(){});
    }
  });
  var transporter = nodemailer.createTransport({
  		service: 'gmail',
  		auth: {
    		user: 'thegoldenspoon.tgs@gmail.com',
    		pass: 'dholakpur123'
  		}
	});

	var mailOptions = {
  		from: 'thegoldenspoon.tgs@gmail.com',
  		to: receiver,
  		subject: sub,
  		//text: 'Thank you for subscribing to our weekly newsletter!'
  		html: '<h3 style="font-family: verdana; text-align: center;">'+msg+'</h3>'
	};

	transporter.sendMail(mailOptions, function(error, info){
  		if (error) {
    		console.log(error);
        return false;
  		} else {
    		console.log('Email sent: ' + info.response);
        console.log('Email sent to: '+receiver);
        return true;
  		}
	});
};
module.exports.sendMail = sendMail;



