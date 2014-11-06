// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
 
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
    || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
      timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
    };
  }

}());

function ScrubberView() {
  this.makeAccessors();
  this.createDOM();
  this.attachListeners();
  this.onValueChanged = function () {};
  this.animating = false;
}

ScrubberView.prototype.makeAccessors = function () {
  var value = 0;
  var min = 0;
  var max = 1;
  var step = 0;
  var orientation = 'horizontal';
  var duration = 2000;

  this.value = function (_value) {
    if (_value === undefined) return value;
    if (value === _value) return this;

    _value = Math.max(min, Math.min(max, _value));

    if (step > 0) {
      var nsteps = Math.round((_value - min)/step);
      
      var invStep = 1/step;
      if (invStep === Math.round(invStep)) {
        _value = (min*invStep + nsteps)/invStep;
      } else {
        _value = (min/step + nsteps)*step;
      }
      
      value = Math.max(min, Math.min(max, _value));
    } else {
      value = _value;
    }

    this.redraw();
    this.onValueChanged(value);
    return this;
  };

  this.min = function (_min) {
    if (_min === undefined) return min;
    if (min === _min) return this;
    min = _min;
    this.redraw();
    return this;
  };

  this.max = function (_max) {
    if (_max === undefined) return max;
    if (max === _max) return this;
    max = _max;
    this.redraw();
    return this;
  };

  this.step = function (_step) {
    if (_step === undefined) return step;
    if (step === _step) return this;
    step = _step;
    this.redraw();
    return this;
  };

  this.orientation = function(_orientation) {
    if (_orientation === undefined) return orientation;
    if (_orientation === orientation) return this;
    orientation = _orientation;
    this.redraw();
    return this;
  };

  this.duration = function(_duration) {
    if (_duration === undefined) return duration;
    if (_duration === duration) return this;
    duration = _duration;
    return this;
  };
};

ScrubberView.prototype.createDOM = function () {
  this.elt = document.createElement('div');
  this.track = document.createElement('div');
  this.thumb = document.createElement('div');

  this.elt.className = this.orientation() === 'horizontal' ? 'scrubber' : 'scrubber-vert';
  this.track.className = 'track';
  this.thumb.className = 'thumb';

  this.elt.appendChild(this.track);
  this.elt.appendChild(this.thumb);
};

ScrubberView.prototype.redraw = function () {
  var frac = (this.value() - this.min())/(this.max() - this.min());
  if (this.orientation() === 'horizontal') {
    this.elt.className = 'scrubber';
    this.thumb.style.top = '50%';
    this.thumb.style.left = frac*100 + '%';
  }
  else {
    this.elt.className = 'scrubber-vert';
    this.thumb.style.left = '50%';
    this.thumb.style.top = 100 - (frac*100) + '%';
  }
};

ScrubberView.prototype.attachListeners = function ()  {
  var self = this;
  var mousedown = false;
  var cachedLeft;
  var cachedWidth;
  var cachedTop;
  var cachedHeight;

  var start = function () {
    mousedown = true;
    var rect = self.elt.getBoundingClientRect();
    // NOTE: page[X|Y]Offset and the width and height
    // properties of getBoundingClientRect are not
    // supported in IE8 and below.
    //
    // Scrubber doesn't attempt to support IE<9.
    var xOffset = window.pageXOffset;
    var yOffset = window.pageYOffset;

    cachedLeft = rect.left + xOffset;
    cachedWidth = rect.width;
    cachedTop = rect.top + yOffset;
    cachedHeight = rect.height;
    self.thumb.className +=  ' dragging';
  };

  var stop = function () {
    mousedown = false;
    cachedLeft = undefined;
    cachedWidth = undefined;
    cachedTop = undefined;
    cachedHeight = undefined;
    self.thumb.className = 'thumb';
  };

  var setValueFromPageX = function (pageX) {
    var frac = Math.min(1, Math.max((pageX - cachedLeft)/cachedWidth, 0));
    self.value((1-frac)*self.min() + frac*self.max());
  };

  var setValueFromPageY = function (pageY) {
    var frac = Math.min(1, Math.max(1 - (pageY - cachedTop)/cachedHeight, 0));
    self.value((1-frac)*self.min() + frac*self.max());
  };

  this.elt.addEventListener('mousedown', start);
  this.elt.addEventListener('touchstart', start);

  document.addEventListener('mousemove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    if (self.orientation() === 'horizontal')
      setValueFromPageX(evt.pageX);
    else
      setValueFromPageY(evt.pageY);
  });

  document.addEventListener('touchmove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    if (self.orientation() === 'horizontal')
      setValueFromPageX(evt.changedTouches[0].pageX);
    else
      setValueFromPageY(evt.changedTouches[0].pageY);
  });

  this.elt.addEventListener('mouseup', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    if (self.orientation() === 'horizontal')
      setValueFromPageX(evt.pageX);
    else
      setValueFromPageY(evt.pageY);
  });

  this.elt.addEventListener('touchend', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    if (self.orientation() === 'horizontal')
      setValueFromPageX(evt.changedTouches[0].pageX);
    else
      setValueFromPageY(evt.changedTouches[0].pageY);
  });

  document.addEventListener('mouseup', stop);
  document.addEventListener('touchend', stop);

};

ScrubberView.prototype.play = function() {
  var self = this;
  this.animating = true;
  var duration = this.duration();
  var max = this.max();
  var min = this.min();
  var value = this.value();
  if (value === max) {
    this.value(min);
    value = min;
  }
  var sliderRange = max - min;
  var remainingRange = max - value;
  var remainingDuration = (remainingRange/sliderRange)*duration;
  var startTime = new Date().getTime();
  var tick = function() {
    if (self.animating) {
      var elapsed = new Date().getTime() - startTime;
      self.value((elapsed/remainingDuration)*remainingRange + value);
      if (self.value() === max) self.animating = false;
      requestAnimationFrame(tick);
    }
  };
  tick();
};

ScrubberView.prototype.pause = function() {
  this.animating = false;
};
