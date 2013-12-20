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

  this.value = function (_value) {
    if (_value === undefined) return value;
    if (value === _value) return this;

    _value = Math.max(min, Math.min(max, _value));

    if (step > 0) {
      var remainder = (_value - min) % step;
      value = _value - remainder;
      if (Math.abs(remainder) * 2 >= step) {
        value += (remainder > 0) ? step : (-step);
      }
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
  var frac = (this.value() - this.min())/(this.max() - this.min());
  this.thumb.style.left = frac*100 + '%';
};

ScrubberView.prototype.attachListeners = function ()  {
  var self = this;
  var mousedown = false;
  var cachedLeft;
  var cachedWidth;

  var start = function () {
    mousedown = true;
    cachedLeft = self.elt.offsetLeft;
    cachedWidth = self.elt.offsetWidth;
    self.thumb.className +=  ' dragging';
  };

  var stop = function () {
    mousedown = false;
    cachedLeft = undefined;
    cachedWidth = undefined;
    self.thumb.className = 'thumb';
  };

  var setValueFromPageX = function (pageX) {
    var frac = Math.min(1, Math.max((pageX - cachedLeft)/cachedWidth, 0));
    self.value((1-frac)*self.min() + frac*self.max());
  };

  this.elt.addEventListener('mousedown', start);
  this.elt.addEventListener('touchstart', start);

  document.addEventListener('mousemove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    setValueFromPageX(evt.pageX);
  });

  document.addEventListener('touchmove', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    setValueFromPageX(evt.changedTouches[0].pageX);
  });

  this.elt.addEventListener('mouseup', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    setValueFromPageX(evt.pageX);
  });

  this.elt.addEventListener('touchend', function (evt) {
    if (!mousedown) return;
    evt.preventDefault();
    setValueFromPageX(evt.changedTouches[0].pageX);
  });

  document.addEventListener('mouseup', stop);
  document.addEventListener('touchend', stop);
};

