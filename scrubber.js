function ScrubberView() {
  this.makeAccessors();
  this.createDOM();
  this.attachListeners();
  this.onValueUpdated = function () {};
}

ScrubberView.prototype.resize = function () {
  this.width = this.elt.offsetWidth;
  this.left = this.elt.offsetLeft;
  this.redraw();
};

ScrubberView.prototype.makeAccessors = function () {
  var value = 0;
  var min = 0;
  var max = 1;
  
  this.value = function (_value) {
    if (_value === undefined) return value;
    value = _value;
    this.redraw();
    this.onValueUpdated(_value);
    return this;
  };
  
  this.min = function (_min) {
    if (_min === undefined) return min;
    min = _min;
    this.redraw();
    return this;
  };
  
  this.max = function (_max) {
    if (_max === undefined) return max;
    max = _max;
    this.redraw();
    return this;
  };
};

ScrubberView.prototype.createDOM = function () {
  this.elt = document.createElement('div');
  this.track = document.createElement('div');
  this.thumb = document.createElement('div');
  
  this.elt.className = 'scrubber';
  this.track.className = 'track';
  this.thumb.className = 'thumb';
  
  this.elt.appendChild(this.track);
  this.elt.appendChild(this.thumb);
};

ScrubberView.prototype.redraw = function () {
  
  var frac = this.value()/(this.max() - this.min());
  
  var translateString = "translateX(" + Math.max(0, Math.min(1, frac))*this.width + "px)";
  
  this.thumb.style['-webkit-transform'] = translateString;
  this.thumb.style['-ms-transform'] = translateString;
  this.thumb.style.transform = translateString;
};

ScrubberView.prototype.setValueFromPageX = function (pageX) {
  var frac = Math.min(1, Math.max((pageX - this.left)/this.width, 0));
    
  this.value((1-frac)*this.min() + frac*this.max());
};

ScrubberView.prototype.attachListeners = function ()  {
  var self = this;
  var mousedown = false;
  
  var start = function () {
    mousedown = true;
    self.resize();
  };
  
  this.elt.addEventListener('mousedown', start);
  this.elt.addEventListener('touchstart', start);
  
  document.addEventListener('mousemove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    self.setValueFromPageX(evt.pageX);
  });
  
  document.addEventListener('touchmove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    self.setValueFromPageX(evt.changedTouches[0].pageX);
  });
  
  this.elt.addEventListener('mouseup', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    self.setValueFromPageX(evt.pageX);
  });
  
  this.elt.addEventListener('touchend', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    self.setValueFromPageX(evt.changedTouches[0].pageX);
  });
  
  document.addEventListener('mouseup', function () {
    mousedown = false;
  });
  
  document.addEventListener('touchend', function (evt) {
    mousedown = false;
  });
};
