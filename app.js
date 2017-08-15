var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var company = require('./routes/company');
var nds = require('./routes/nds');
var app = express();

require('./utils/constants');
require('./utils/Orion_Map');
require('./utils/Dictionary');
var common = require('./utils/common');
var moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());  
app.use(session({  
  resave: true, // don't save session if unmodified  
  saveUninitialized: false, // don't create session until something stored  
  secret: 'gdrats'  
})); 
//登录拦截器
app.use(function (req, res, next) {
	var ret = {};
	common.CopyQuerySession(ret,req);	
	res.result = ret;

	if (req.session.userid) {  // 判断用户是否登录
    next();
  } else {
    // 解析用户请求的路径
    var arr = req.url.split('/');//把一个字符串分割成字符串数组
    // 去除 GET 请求路径上携带的参数
    for (var i = 0, length = arr.length; i < length; i++) {
      arr[i] = arr[i].split('?')[0];
    }
    // 判断请求路径是否为根、登录、注册、登出，如果是不做拦截
    if (arr.length > 1 && arr[1] == '') {
      next();
    } else if (arr.length > 2 && (arr[2] == 'register' || arr[2] == 'login' || arr[2] == 'logout')) {
      next();
    } else {  // 登录拦截
      req.session.originalUrl = req.originalUrl ? req.originalUrl : null;  // 记录用户原始请求路径
//    req.flash('error', '请先登录');
      // res.render('./common/login',rpdata);  // 将用户重定向到登录页面
      res.redirect('/');
    }
  }
});
app.use('/', index);
app.use('/users', users);
app.use('/company',company);
app.use('/nds',nds);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



//=========================================================
//数据字典
app.locals.getDic_rencaistate = function(key){
		return rencaiState.get(key);
}
//当前/推荐状态 字典
app.locals.getDic_tuijianstate = function(key){
		return tuijianState.get(key);
}
app.locals.getDic_workyears = function(key){
    return workyears.get(key);
}
app.locals.getDic_collegelevel = function(key){
    return college_level.get(key);
}
app.locals.getDic_customer_guimo = function(key){
    return customer_guimo.get(key);
}
app.locals.getDic_customer_status = function(key){
    return customer_status.get(key);
}
//项目状态 字典
app.locals.getDic_job_status = function(key){
    return job_status.get(key);
}

//==========================================================
app.locals.dateformat = function(con,form){
	if(con==""||con==undefined||con==null){							
			return
	}
	con = parseInt(con);					
	var tt = moment(con).format(form);	
	return tt;
}
module.exports = app;

