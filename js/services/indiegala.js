'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.authContent = 'My Libraries';
this.websiteUrl = 'https://www.indiegala.com/giveaways';
this.authLink = 'https://www.indiegala.com/login';
this.settings.max_level = { type: 'number', trans: this.transPath('max_level'), min: 0, max: 8, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: this.transPath('min_cost'), min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.min_cost = { type: 'number', trans: this.transPath('min_cost'), min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: this.getConfig('min_cost', 0), max: 240, default: this.getConfig('max_cost', 0) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
super.init();
}
authCheck(callback) {
let tmout = (Math.floor(Math.random() * 10000)) + 7000;
$.ajax({
url: 'https://www.indiegala.com',
timeout: tmout,
success: function () {
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
dataType: 'json',
success: function (data) {
if (data.steamnick) {
callback(1);
}
else {
callback(0);
}
},
error: function () {
callback(-1);
}
});
}
});
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/IndieGala.png',
username: 'IG User',
value: 0
};
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function (data) {
userData.avatar = data.steamavatar.replace('fb1.jpg', 'fb1_full.jpg');
userData.username = data.steamnick;
userData.value = data.silver_coins_tot;
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1;
_this.check = 0;
let callback = function () {
page++;
if (page <= _this.getConfig('pages', 1)) {
_this.enterOnPage(page, callback);
}
};
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
let user_level = this.getConfig('max_level', 0),
user_min = this.getConfig('min_cost', 0),
user_max = this.getConfig('max_cost', 0);
_this.check = 1;
if (_this.check === 0) {
_this.check = 1;
let ptmout = (Math.floor(Math.random() * 10000)) + 7000;
$.ajax({
url: 'https://www.indiegala.com/profile',
timeout: ptmout,
success: function () {
$.ajax({
url: 'https://www.indiegala.com/giveaways/library_completed',
type: 'POST',
data: '{"list_type":"tocheck","page":1}',
dataType: 'json',
success: function () {
$.ajax({
url: 'https://www.indiegala.com/giveaways/check_if_won_all',
success: function (html) {
}
});
}
});
}
});
}
let lvl = 'all';
if (this.getConfig('max_level', 0) === 0) {
lvl = '0';
}
$.ajax({
url: 'https://www.indiegala.com/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=' + lvl,
success: function (data) {
let tickets = $(JSON.parse(data).content).find('.tickets-col');
let curr_ticket = 0;
function giveawayEnter() {
if (tickets.length <= curr_ticket || !_this.started || _this.curr_value === 0) {
if (callback) {
callback();
}
return;
}
let next_after = _this.interval();
let ticket = tickets.eq(curr_ticket),
price = ticket.find('.ticket-price strong').text(),
level = parseInt(ticket.find('.type-level span').text().replace('+', '')),
single = ticket.find('.extra-type .fa-clone').length === 0,
entered = false,
enterTimes = 0;
if (single) {
entered = ticket.find('.giv-coupon').length === 0;
}
else {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
entered = enterTimes > 0;
}
if (entered || user_level < level || _this.curr_value < price || price < user_min || price > user_max && user_max > 0) {
next_after = 50;
}
else {
let id = ticket.find('.ticket-right .relative').attr('rel'),
igsteam = ticket.find('.giv-game-img').attr('data-src'),
name = ticket.find('h2 a').text(),
igown = 0,
igapp = 0,
igsub = 0,
igid = '???',
igstm = '';
if (igsteam.includes('apps/')) {
igapp = parseInt(igsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'app/' + igapp;
igstm = 'https://store.steampowered.com/app/' + igapp;
}
if (igsteam.includes('sub/')) {
igsub = parseInt(igsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'sub/' + igsub;
igstm = 'https://store.steampowered.com/sub/' + igsub;
}
if (_this.getConfig('check_in_steam')) {
if (GJuser.ownapps.includes(',' + igapp + ',') && igapp > 0) {
igown = 1;
}
if (GJuser.ownsubs.includes(',' + igsub + ',') && igsub > 0) {
igown = 1;
}
}
if (igown === 0) {
$.ajax({
type: 'POST',
url: 'https://www.indiegala.com/giveaways/new_entry',
contentType: 'application/json; charset=utf-8',
dataType: 'json',
data: JSON.stringify({giv_id: id, ticket_price: price}),
success: function (data) {
if (data.status === 'ok') {
_this.setValue(data.new_amount);
_this.log(Lang.get('service.entered_in') + _this.logLink('https://www.indiegala.com/giveaways/detail/' + id, name) + ' - ' + _this.logLink(igstm, igid) + ' - ' + price + ' iC');
}
}
});
}
else {
next_after = 50;
}
}
curr_ticket++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
}
});
}
}
