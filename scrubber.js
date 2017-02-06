var Keys = {
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  UP: 38,
  PAGEDOWN: 34,
  PAGEUP: 33,
  HOME: 36,
  END: 35
};

function ScrubberView() {
  this.makeAccessors();
  this.createDOM();
  this.attachListeners();
  this.onValueChanged = function () {};
  this.onScrubStart = function () {};
  this.onScrubEnd = function () {};
}

ScrubberView.prototype.makeAccessors = function () {
  var value = 0;
  var min = 0;
  var max = 1;
  var step = 0;
  var orientation = 'horizontal';
  var ariaLabel = 'slider';

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
    this.thumb.setAttribute('aria-valuenow', value);
    return this;
  };

  this.min = function (_min) {
    if (_min === undefined) return min;
    if (min === _min) return this;
    min = _min;
    this.redraw();
    this.thumb.setAttribute('aria-valuemin', min);
    return this;
  };

  this.max = function (_max) {
    if (_max === undefined) return max;
    if (max === _max) return this;
    max = _max;
    this.redraw();
    this.thumb.setAttribute('aria-valuemax', max);
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

  this.ariaLabel = function(_ariaLabel) {
    if (_ariaLabel === undefined) return ariaLabel;
    if (_ariaLabel === ariaLabel) return this;
    ariaLabel = _ariaLabel;
    this.thumb.setAttribute('aria-label', ariaLabel);
    return this;
  };
};

ScrubberView.prototype.createDOM = function () {
  this.elt = document.createElement('div');
  this.track = document.createElement('div');
  this.thumb = document.createElement('div');

  this.thumb.tabIndex = 0;
  this.thumb.setAttribute('role', 'slider');
  this.thumb.setAttribute('aria-label', this.ariaLabel());
  this.thumb.setAttribute('aria-valuenow', this.value());
  this.thumb.setAttribute('aria-valuemin', this.min());
  this.thumb.setAttribute('aria-valuemax', this.max());

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

  var start = function (evt) {
    evt.preventDefault();
    self.onScrubStart(self.value());

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
    self.onScrubEnd(self.value());
  };

  var setValueFromPageX = function (pageX) {
    var frac = Math.min(1, Math.max((pageX - cachedLeft)/cachedWidth, 0));
    self.value((1-frac)*self.min() + frac*self.max());
  };

  var setValueFromPageY = function (pageY) {
    var frac = Math.min(1, Math.max(1 - (pageY - cachedTop)/cachedHeight, 0));
    self.value((1-frac)*self.min() + frac*self.max());
  };

  // If the step is 0, we'd still like to be able to change the slider with
  // the keyboard, so figure out what step would correspond to 1px of movement.
  var getDefactoStep = function() {
    var rawStep = self.step();
    if (rawStep > 0) return rawStep;
    var w = self.elt.getBoundingClientRect().width;
    return (self.max() - self.min()) / w;
  };

  var increment = function() {
    var keyStep = getDefactoStep();
    self.value(self.value() + keyStep);
  };

  var decrement = function() {
    var keyStep = getDefactoStep();
    self.value(self.value() - keyStep);
  };

  var toMin = function() {
    self.value(self.min());
  };

  var toMax = function() {
    self.value(self.max());
  };

  this.elt.addEventListener('mousedown', start);
  this.elt.addEventListener('touchstart', start);

  this.thumb.addEventListener('keydown', function(evt) {
    switch (evt.which) {
      case Keys.LEFT:
      case Keys.DOWN:
        decrement();
        break;
      case Keys.RIGHT:
      case Keys.UP:
        increment();
        break;
      case Keys.PAGEUP:
      case Keys.HOME:
        toMin();
        break;
      case Keys.PAGEDOWN:
      case Keys.END:
        toMax();
        break;
      default:
        return;
    }
  });

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
