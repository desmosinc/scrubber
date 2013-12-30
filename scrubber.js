function ScrubberView() {
  this.makeAccessors();
  this.createDOM();
  this.attachListeners();
  this.onValueChanged = function () {};
}

ScrubberView.prototype.makeAccessors = function () {
  var value = 0;
  var min = 0;
  var max = 1;
  var step = 0;
  var orientation = 'horizontal';

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

  function totalOffset(obj) {
    var currLeft = currTop = 0;
    if (obj.offsetParent) {
      do {
        currLeft += obj.offsetLeft;
        currTop += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
    return [currLeft, currTop];
  }

  var start = function () {
    mousedown = true;
    cachedLeft = totalOffset(self.elt)[0];
    cachedWidth = self.elt.offsetWidth;
    cachedTop = totalOffset(self.elt)[1];
    cachedHeight= self.elt.offsetHeight;
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
