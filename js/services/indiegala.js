'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.authContent = 'My Profile';
this.websiteUrl = 'https://www.indiegala.com';
this.authLink = 'https://www.indiegala.com/login';
this.settings.ending = { type: 'number', trans: this.transPath('ending'), min: 0, max: 720, default: this.getConfig('ending', 0) };
this.settings.join_qty = { type: 'number', trans: this.transPath('join_qty'), min: 1, max: 100, default: this.getConfig('join_qty', 1) };
this.settings.min_entries = { type: 'ten_number', trans: 'service.min_entries', min: 0, max: 10000, default: this.getConfig('min_entries', 0) };
this.settings.min_level = { type: 'number', trans: 'service.min_level', min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: 'service.max_level', min: this.getConfig('min_level', 0), max: 8, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: 'service.min_cost', min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: 'service.max_cost', min: this.getConfig('min_cost', 0), max: 240, default: this.getConfig('max_cost', 0) };
this.settings.points_reserve = { type: 'number', trans: 'service.points_reserve', min: 0, max: 500, default: this.getConfig('points_reserve', 0) };
this.settings.ending_first = { type: 'checkbox', trans: this.transPath('ending_first'), default: this.getConfig('ending_first', false) };
this.settings.blacklist_on = { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) };
this.settings.sort_by_level = { type: 'checkbox', trans: 'service.sort_by_level', default: this.getConfig('sort_by_level', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.sbl_ending_ig = { type: 'checkbox', trans: this.transPath('sbl_ending_ig'), default: this.getConfig('sbl_ending_ig', false) };
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.settings.check_in_steam = { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) };
super.init();
this.log(this.logLink('https://www.indiegala.com/login', Lang.get('service.login')));
}
authCheck(callback) {
$.ajax({
url: 'https://www.indiegala.com/',
success: function () {
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function (data) {
if (data.steamnick) {
GJuser.ig = data.profile;
if (data.giveaways_user_lever !== undefined || GJuser.iglvl === undefined) {
GJuser.iglvl = data.giveaways_user_lever;
}
else {
GJuser.iglvl = this.getConfig('max_level', 0);
}
callback(1);
}
else {
GJuser.ig = '';
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
if (_this.getConfig('timer_to', 70) !== _this.getConfig('timer_from', 50)) {
let igtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 70) - _this.getConfig('timer_from', 50))) + _this.getConfig('timer_from', 50));
_this.stimer = igtimer;
}
let page = 1;
_this.ua = mainWindow.webContents.session.getUserAgent();
_this.lvlmax = _this.getConfig('max_level', 0);
_this.lvlmin = _this.getConfig('min_level', 0);
_this.entmin = _this.getConfig('min_entries', 0);
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = _this.getConfig('sort_by_level', false);
_this.ending = _this.getConfig('ending', 0);
_this.ending_first = _this.getConfig('ending_first', false);
_this.reserve = _this.getConfig('points_reserve', 0);
_this.sort_after = false;
_this.url = 'https://www.indiegala.com';
$.ajax({
url: _this.url + '/giveaways/library_completed',
type: 'POST',
data: '{"list_type":"tocheck","page":1}',
dataType: 'json',
success: function (response) {
if (response.check_it_all_enabled === true) {
rq({
method: 'GET',
uri: _this.url + '/giveaways/check_if_won_all',
headers: {
'origin': 'https://www.indiegala.com',
'referer': _this.url + '/profile?user_id=' + GJuser.iglvl,
'user-agent': _this.ua,
'cookie': _this.cookies
},
json: false
})
.then((html) => {
let igwon = $(html).find('p').eq(1).text().trim();
if (igwon.includes('Congratulations! You won')) {
igwon = igwon.replace('Congratulations! You won','').replace('Giveaways','').trim();
_this.log(_this.logLink(_this.url + '/profile?user_id=' + GJuser.ig, Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + igwon + ')'), 'win');
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
});
}
}
});
$.ajax({
url: _this.url + '/claimprofile/sync_username_avatar',
type: 'POST'
});
if (_this.check === undefined) {
setTimeout(function () {
_this.check = 1;
}, 10000);
}
if (GJuser.iglvl === 0) {
_this.sort = false;
}
if (_this.ending_first && _this.ending !== 0 && _this.sort) {
_this.sort = false;
_this.sort_after = true;
}
if (_this.lvlmax > GJuser.iglvl || _this.lvlmax === 0) {
_this.lvlmax = GJuser.iglvl;
}
if (_this.lvlmin > GJuser.iglvl) {
_this.lvlmin = GJuser.iglvl;
}
_this.lvl = _this.lvlmax;
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
if (_this.sort && page > _this.pagemax && _this.lvl > _this.lvlmin) {
_this.lvl = _this.lvl - 1;
_this.pagemax = _this.getConfig('pages', 1);
page = 1;
_this.enterOnPage(page, callback);
}
};
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
if (!_this.sort && GJuser.iglvl > 0) {
_this.lvl = 'all';
}
if (page === 1) {
_this.pageurl = _this.url + '/giveaways';
_this.urlref = _this.url + '/';
}
else {
_this.pageurl = _this.url + '/giveaways/' + page + '/expiry/asc/level/' + _this.lvl;
_this.urlref = _this.url + '/giveaways/' + (page - 1) + '/expiry/asc/level/' + _this.lvl;
}
rq({
method: 'GET',
uri: _this.pageurl,
headers: {
'authority': 'www.indiegala.com',
'upgrade-insecure-requests': 1,
'user-agent': _this.ua,
'sec-fetch-user': '?1',
'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'navigate',
'referer': _this.urlref,
'cookie': _this.cookies
},
json: false
})
.then(() => {
$.ajax({
url: _this.url + '/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=' + _this.lvl,
success: function (data) {
if (data.indexOf('CONTENT="NOINDEX, NOFOLLOW"') >= 0) {
setTimeout(function () {
_this.enterOnPage(page, callback);
}, (Math.floor(Math.random() * 4000)) + 5000);
}
let tickets = $(JSON.parse(data).content).find('.tickets-col'),
igcurr = 0,
igrtry = 0;
function giveawayEnter() {
if (tickets.length < 12 || _this.curr_value === _this.reserve || !_this.started) {
_this.pagemax = page;
}
if (tickets.length <= igcurr || !_this.started || _this.curr_value === _this.reserve) {
if (_this.getConfig('log', true)) {
if (igcurr < 12 && !_this.sort && _this.started) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
if (page === _this.pagemax) {
if (_this.sort) {
_this.log(Lang.get('service.checked') + _this.lvl + 'L|' + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
}
else {
if (_this.sort) {
_this.log(Lang.get('service.checked') + _this.lvl + 'L|' + page + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
}
}
if (_this.sort_after && page === _this.pagemax) {
page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = true;
_this.lvl = _this.lvlmax + 1;
_this.sort_after = false;
}
if (callback) {
callback();
}
return;
}
let ignext = _this.interval();
let ticket = tickets.eq(igcurr),
price = ticket.find('.ticket-price strong').text(),
level = parseInt(ticket.find('.type-level span').text().replace('+', '')),
single = ticket.find('.extra-type .fa-clone').length === 0,
id = ticket.find('.ticket-right .relative').attr('rel'),
igsteam = ticket.find('.giv-game-img').attr('data-src'),
name = ticket.find('h2 a').text(),
time = ticket.find('.box_pad_5 > .info-row:nth-of-type(5)').text(),
sold = ticket.find('.box_pad_5 > .info-row:nth-of-type(3) > .tickets-sold').text().trim(),
entered = false,
enterTimes = 0,
igtime = '';
if (time.includes('day')) {
igtime = time.replace('day left','').replace('days left','').trim();
time = (24 * igtime);
igtime = igtime + 'd|';
}
else {
if (time.includes('hour')) {
time = time.replace('hour left','').replace('hours left','').trim();
igtime = time + 'h|';
}
else {
if (time.includes('minute')) {
igtime = time.replace('minute left','').replace('minutes left','').trim() + 'm|';
time = 0;
}
}
}
if (single) {
entered = ticket.find('.giv-coupon').length === 0;
}
else {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
entered = enterTimes > (_this.getConfig('join_qty', 1) - 1);
}
if (
(entered) ||
(_this.lvlmax < level && _this.lvlmax !== 0) ||
(GJuser.iglvl < level) ||
(_this.lvlmin > level) ||
(_this.curr_value < price) ||
(_this.reserve > _this.curr_value - price) ||
(_this.entmin > sold) ||
(price < _this.getConfig('min_cost', 0) && _this.getConfig('min_cost', 0) !== 0) ||
(price > _this.getConfig('max_cost', 0) && _this.getConfig('max_cost', 0) !== 0) ||
(time > _this.ending && _this.ending !== 0 && !_this.sort) ||
(time > _this.ending && _this.ending !== 0 && _this.sort && !_this.getConfig('sbl_ending_ig', false))
)
{
if (_this.getConfig('log', true) && igrtry === 0) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (igcurr + 1) + '№|' + igtime + level + 'L|' + price + '$|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name), 'chk');
}
if (
(time > _this.ending && _this.ending !== 0 && !_this.sort) ||
(time > _this.ending && _this.ending !== 0 && _this.sort && !_this.getConfig('sbl_ending_ig', false))
)
{
_this.pagemax = page;
igcurr = 100;
}
if (_this.getConfig('log', true) && igrtry === 0) {
if (entered && igcurr !== 100) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
if (!entered && _this.curr_value < price && igcurr !== 100) {
_this.log(Lang.get('service.points_low'), 'skip');
}
if (!entered && _this.curr_value >= price && igcurr !== 100) {
_this.log(Lang.get('service.skipped'), 'skip');
}
if (igcurr === 100) {
_this.log(Lang.get('service.time'), 'skip');
}
}
ignext = 100;
igrtry = 0;
igcurr++;
}
else {
let igown = 0,
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
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), 'err');
igown = 2;
}
if (GJuser.ownapps.includes(',' + igapp + ',') && igapp > 0) {
igown = 1;
}
if (GJuser.ownsubs.includes(',' + igsub + ',') && igsub > 0) {
igown = 1;
}
}
if (GJuser.black.includes(igid + ',') && _this.getConfig('blacklist_on', false)) {
igown = 4;
}
if (_this.getConfig('log', true) && igrtry === 0) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (igcurr + 1) + '№|' + igtime + level + 'L|' + price + '$|' + _this.logLink(igstm, igid) + '|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name) + _this.logBlack(igid), 'chk');
if (igown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (igown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
}
if (igown === 0) {
igrtry++;
rq({
method: 'POST',
uri: _this.url + '/giveaways/new_entry',
form: JSON.stringify({giv_id: id, ticket_price: price}),
headers: {
'authority': 'www.indiegala.com',
'accept': 'application/json, text/javascript, */*; q=0.01',
'origin': 'https://www.indiegala.com',
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'x-requested-with': 'XMLHttpRequest',
'user-agent': _this.ua,
'referer': _this.url + '/giveaways/' + page + '/expiry/asc/level/' + _this.lvl,
'cookie': _this.cookies
},
json: true
})
.then((response) => {
if (response.status === 'ok') {
igrtry = 0;
_this.setValue(response.new_amount);
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (igcurr + 1) + '№|' + igtime + level + 'L|' + price + '$|' + _this.logLink(igstm, igid) + '|  ' + _this.logLink(_this.url + '/giveaways/detail/' + id, name) + _this.logBlack(igid), 'enter');
igcurr++;
}
else {
ignext = (Math.floor(Math.random() * 400)) + 600;
}
});
}
else {
ignext = 100;
igrtry = 0;
igcurr++;
}
}
if (igrtry >= 12) {
igrtry = 0;
igcurr++;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
setTimeout(giveawayEnter, ignext);
}
giveawayEnter();
}
});
});
}
}
