'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'http://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'http://tf2r.com/login';
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.withValue = false;
this.getTimeout = 10000;
delete this.settings.pages;
super.init();
}
authCheck(callback) {
let authContent = this.authContent;
this.ajaxReq(this.websiteUrl, (response) => {
if (response.success) {
if (response.data.indexOf(authContent) >= 0) {
callback(1);
}
else {
callback(0);
}
}
else {
callback(-1);
}
});
}
getUserInfo(callback) {
if (GJuser.tf.length > 601) {
GJuser.tf = ',';
}
let userData = {
avatar: __dirname + '/images/TF2R.png',
username: 'TF2R User'
};
this.ajaxReq('http://tf2r.com/notifications.html', (response) => {
if (response.success) {
userData.username = $(response.data).find('#nameho').text();
userData.avatar = $(response.data).find('#avatar a img').attr('src');
}
callback(userData);
});
}
joinService() {
let _this = this;
_this.ajaxReq('http://tf2r.com/raffles.html', (response) => {
let giveaways = $(response.data).find('.pubrhead-text-right');
let tfcurr = 0;
let random = Array.from(Array(giveaways.length).keys());
if (_this.getConfig('rnd', true)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (giveaways.length <= tfcurr || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'));
_this.log(Lang.get('service.checked') + 'Public Raffles');
}
return;
}
let tfrnd = random[tfcurr],
giveaway = giveaways.eq(tfrnd),
link = giveaway.find('a').attr('href'),
name = giveaway.find('a').text(),
rid = link.replace('http://tf2r.com/k', '').replace('.html', '');
_this.ajaxReq(link, (response) => {
if (response.success) {
let html = $('<div>' + response.data + '</div>');
let entered = html.find('#enbut').length === 0;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + _this.logLink(link, name));
}
if (entered || response.data.indexOf('Fuck off') >= 0 || GJuser.tf.includes(rid + ',')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'));
}
return;
}
setTimeout(function () {
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let lastentrys = 0;
lastentrys = data.substring(data.indexOf("var entryc =")+12,data.indexOf("var lastchat")).slice(0, 11).replace(';', '').replace('=', '').trim();
}
});
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
setTimeout(function () {
$.ajax({
type: 'POST',
dataType: 'json',
url: 'http://tf2r.com/job.php',
headers: {
'User-Agent': mainWindow.webContents.session.getUserAgent(),
Cookie: _this.cookies
},
data: {enterraffle: 'true', rid: rid, ass: 'yup, indeed'},
success: function () {
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name));
GJuser.tf = GJuser.tf + rid + ',';
},
error: function () {
_this.log(Lang.get('service.cant_join'));
}
});
}, (Math.floor(Math.random() * 1000)) + 1000);
}
});
}, (Math.floor(Math.random() * 1000)) + 1000);
}
});
tfcurr++;
setTimeout(giveawayEnter, _this.interval());
}
giveawayEnter();
});
}
ajaxReq(url, callback) {
let response = {
success: false,
data: ''
};
$.ajax({
url: url,
timeout: this.getTimeout,
success: function (html) {
response.success = true;
response.data = html;
},
error: function (error) {
if (error.responseText !== undefined && error.responseText.indexOf('!DOCTYPE') >= 0) {
response.success = true;
response.data = error.responseText;
}
},
complete: function () {
callback(response);
}
});
}
}
