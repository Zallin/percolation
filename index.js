var ctx, grid, interval, experiments = 0;

var btn = document.querySelector('input[type=submit]');
var arr = document.querySelectorAll('input[type=text]');

btn.addEventListener('click', function (e){
  if(interval) return;

  var n = +arr[0].value || 50;
  var freq = +arr[1].value || 1;
  var times = +arr[2].value || 5;

  initSim(n, freq, times);
});

function init(){
  var cns = document.createElement('canvas');

  cns.width = 500;
  cns.height = 500;

  document.body.appendChild(cns);

  ctx = cns.getContext('2d');

  var str = JSON.stringify({
    values : [];
  });
  localStorage.set('stats', str);
}

function initSim(n, freq, times){
  grid = [];

  experiments++;

  var size = Site.size = 500 / n;

  for(var i = 0, l = n * n; i < l; i++){
    var x = i % n * size;
    var y = Math.floor(i / n) * size;
    grid[i] = new Site(x, y);
  }

  var model = new Model(n * n + 2);

  interval = setInterval(function (){
    var i = generateRandom();

    if(grid[i].opened) return;

    grid[i].opened = true;

    openSite(i);

    var top = n * n, bot = n * n + 1;

    if(i < n){
      model.union(i, top);
    } else if(i > top - n - 1){
      model.union(i, bot);
    }

    var adjacent = [i + 1, i - 1, i + n, i - n];

    for(var p = 0; p < 4; p++){
      var site = adjacent[p];
      if(site > 0 && site < n * n){
        if(grid[site].opened) model.union(i, site);
      }
    }

    if(model.connected(top, bot)){
      window.clearInterval(interval);
      interval = null;
      if(experiments < times){
        saveStats();
        initSim(n, freq, times);
      } else {
        showStats();
      }
    }
  }, freq * 1000)

  drawGrid();
};

function Site(x, y){
  this.x = x;
  this.y = y;
  this.opened = false;
}

function drawGrid(){
  ctx.fillStyle = "#000";
  for(var i = 0; i < grid.length; i++){
    var site = grid[i];
    ctx.fillRect(site.x, site.y, Site.size, Site.size);
  }
}

function openSite(i, j){
  ctx.fillStyle = "#fff";
  var site = grid[i];
  ctx.fillRect(site.x, site.y, Site.size, Site.size);
}

function generateRandom(){
  return Math.floor(Math.random() * grid.length);
}

function saveStats(){
  var opened = 0;
  for(var i = 0; i < grid.length; i++){
    if(grid[i].opened) opened++;
  }

  var stats = JSON.parse(localStorage.get('stats'));
  stats[]

}

function showStats(){
  console.log('Stats are:');
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
