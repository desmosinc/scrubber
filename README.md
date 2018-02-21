scrubber
========

Simple, attractive html+js scrubber control.

Tested in recent versions of Firefox, Chrome, Safari, and IE9+. Works with mouse events and touch events.

### Example Usage:
```javascript
// Make a new scrubber
var scrubber = new ScrubberView();
// Append it to the dom
document.body.appendChild(scrubber.elt);

// onScrubStart is called whenever a user starts scrubbing
scrubber.onScrubStart = function (value) {
    console.log(value); // the value at the time of scrub start
}

// onValueChanged is called whenever the scrubber is moved.
scrubber.onValueChanged = function (value) {
  console.log(value); // the value at time of invocation
}

// onScrubEnd is called whenever a user stops scrubbing
scrubber.onScrubEnd = function (value) {
    console.log(value); // the value at the time of scrub end
}

// You can read and update the scrubber's min, max, step, value, and orientation
// using accessor functions
scrubber.min();// 0
scrubber.max(); // 1
scrubber.step(); // 0
scrubber.value(); // 0
scrubber.orientation(); // 'horizontal'

scruber.value(0.5); // Updates the scrubber's value
scrubber.value(); // 0.5

// Setters are chainable
scrubber.min(-10).max(10).step(.5).value(3).orientation('vertical');

// jQuery isn't required, but you can use it to append scrubbers after you've
// created them if you want
var scrubber2 = new ScrubberView();
$('.my-container').append(scrubber2.elt);

// By default, scrubbers are 200px wide. You can use css to change their size
scrubber2.elt.style.width = "300px";
```

Live example at http://jsbin.com/iyexuVAR/8/
