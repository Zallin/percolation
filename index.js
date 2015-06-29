var ctx, grid;

var btn = document.querySelector('input[type=submit]');
var arr = document.querySelectorAll('input[type=text]');

btn.addEventListener('click', function (e){
  var n = arr[0].value || 50;
  var freq = arr[1].value || 1;

  initSim(n, freq);
});

function init(){
  var cns = document.createElement('canvas');

  cns.width = 500;
  cns.height = 500;

  document.body.appendChild(cns);

  ctx = cns.getContext('2d');
}

function initSim(n, freq){
  grid = [];

  var size = Site.size = 500 / n;

  for(var i = 0; i < n; i++){
    grid[i] = [];
    for(var k = 0; k < n; k++){
      grid[i][k] = new Site(k * size, i * size);
    }
  }

  setInterval(function (){
    var i = generateRandom(), j = generateRandom();

    grid[i][j].opened = true;

    openSite(i, j);

  }, freq * 1000)

  drawGrid();
}

function Site(x, y){
  this.x = x;
  this.y = y;
  this.opened = false;
}

function drawGrid(){
  ctx.fillStyle = "#000";
  for(var i = 0; i < grid.length; i++){
    for(var k = 0; k < grid[i].length; k++){
      var site = grid[i][k];
      ctx.fillRect(site.x, site.y, Site.size, Site.size);
    }
  }
}

function openSite(i, j){
  ctx.fillStyle = "#fff";
  var site = grid[i][j];
  ctx.fillRect(site.x, site.y, Site.size, Site.size);
}

function generateRandom(){
  return Math.floor(Math.random() * grid.length);
}

init();
