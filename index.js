function init(){
  var cns = document.createElement('canvas');

  cns.width = 500;
  cns.height = 500;

  document.body.appendChild(cns);

  var ctx = cns.getContext('2d');
  
  var btn = document.querySelector('input[type=submit]');
  var arr = document.querySelectorAll('input[type=text]');
  
  btn.addEventListener('click', function (e){
    var n = +arr[0].value || 50;
    var freq = +arr[1].value || 1;
    var times = +arr[2].value || 5;

    initSim(ctx, n, freq, times);
  });
}

function initSim(ctx, n, freq, times){  
  var grid = [];

  var size = 500 / n;

  for(var i = 0, l = n * n; i < l; i++){
    var x = i % n * size;
    var y = Math.floor(i / n) * size;
    grid[i] = new Site(x, y);
  }
  
  var top = n * n, bot = n * n + 1;
  
  var model = new Model(n * n + 2);
  
  var drawer = new Drawer(ctx, grid, size);
  
  Statistics.initStorage();
  
  var stats = new Statistics(grid, times);

  drawer.drawGrid();  
  
  var interval = setInterval(function (){
    var i = Math.floor(Math.random() * grid.length);

    if(grid[i].opened) return;

    drawer.openSite(i);
    
    if (i < n) {
      model.union(i, top)
    } else if (i > top - n) {
      model.union(i, bot);
    }

    var adjacent = [i + 1, i - 1, i + n, i - n];

    for(var p = 0; p < 4; p++){
      var site = adjacent[p];
      if (site >= 0 && site < top) {
        if (grid[site].opened) model.union(i, site);
      }
    }

    if(model.connected(top, bot)){
      window.clearInterval(interval);
      interval = null;
      stats.saveStats();
      if(stats.executed < times){
        initSim(ctx, n, freq, times);
      } else {
        var res = stats.countStats();
        showStats(res);
        Statistics.clearStorage();
      }
    }
  }, freq * 1000);
};

function showStats(arr){
  var str = 'mean:' + arr[0] + '\nstddev:' + arr[1] + '\nconfidence: ' + arr[2] + ' , ' + arr[3];
  document.querySelector('.stats p').textContent = str;
}

function Site(x, y){
  this.x = x;
  this.y = y;
  this.opened = false;
}

function Statistics(grid, times) {
  this.grid = grid;
  
  var arr = JSON.parse(localStorage.getItem('stats')).values;
  
  if (arr && arr.length) {
    this.executed = arr.length + 1;
  } else {
    this.executed = 1;
  }
  
  this.times = times;
}

Statistics.prototype.saveStats = function (){
  var opened = 0;
  for(var i = 0; i < this.grid.length; i++){
    if(this.grid[i].opened) opened++;
  }
  
  opened /= this.grid.length - 2;

  var stats = JSON.parse(localStorage.getItem('stats'));
  stats.values.push(opened);
  
  localStorage.setItem('stats', JSON.stringify(stats));
}

Statistics.initStorage = function (){
  if (localStorage.getItem('stats') !== null) return;
  
  var str = JSON.stringify({
    values : []
  });
  localStorage.setItem('stats', str);
}

Statistics.clearStorage = function (){
  localStorage.removeItem('stats');
}

Statistics.prototype.countStats = function (){
  var arr = JSON.parse(localStorage.getItem('stats')).values;
  
  this._mean(arr);
  this._dev(arr);
  this._conf();
  
  return [this.mean, this.deviation].concat(this.confidence);
}

Statistics.prototype._mean = function (arr){
  this.mean = 0;
  for(var i = 0; i < arr.length; i++){
    this.mean += arr[i];
  }
  
  this.mean /= this.executed;
}

Statistics.prototype._dev = function (arr){
  this.deviation = 0;
  for(var i = 0; i < arr.length; i++){
    this.deviation += Math.pow(arr[i] - this.mean, 2);
  }
  
  this.deviation /= (this.executed - 1);
}

Statistics.prototype._conf = function (){
  var left = this.mean  - 1.96 * this.deviation / Math.sqrt(this.executed);
  var right = this.mean + 1.96 * this.deviation / Math.sqrt(this.executed);
  
  this.confidence = [left, right];
}

function Drawer (ctx, grid, size){
  this.ctx = ctx;
  this.grid = grid;
  this.size = size;
}

Drawer.prototype.drawGrid = function (){
  this.ctx.fillStyle = "#000";
  for(var i = 0; i < this.grid.length; i++){
    var site = this.grid[i];
    this.ctx.fillRect(site.x, site.y, this.size, this.size);
  }
}

Drawer.prototype.openSite = function (i){
  this.ctx.fillStyle = "#fff";
  var site = this.grid[i];
  this.ctx.fillRect(site.x, site.y, this.size, this.size);
  site.opened = true;
}

function Model(n){
  this.parent = [];
  this.size = [];

  for(var i = 0; i < n; i++){
    this.parent[i] = i;
    this.size[i] = 1;
  }
}

Model.prototype._root = function (i){
  while(i != this.parent[i]){
    i = this.parent[i];
  }
  return i;
}

Model.prototype.connected = function (p, q){
  return this._root(p) == this._root(q);
}

Model.prototype.union = function (p, q){
  var rootP = this._root(p), rootQ = this._root(q);

  if(this.size[rootP] > this.size[rootQ]){
    this.parent[rootQ] = rootP;
    this.size[rootP] += this.size[rootQ];
  } else {
    this.parent[rootP] = rootQ;
    this.size[rootQ] += this.size[rootP];
  }
}

init();