scrubber
========

Simple, attractive html+js scrubber control.

Tested in recent versions of Firefox, Chrome, Safari, and IE9+. Works with mouse events and touch events.

###Example Usage:
```javascript
// Make a new scrubber
var scrubber = new ScrubberView();
// Append it to the dom
document.body.appendChild(scrubber.elt);

// onValueChanged is called whenever the scrubber is moved.
scrubber.onValueChanged = function (value) {
  console.log(value);
}

// You can read and update the scrubber's min, max, step, value, orientation, and animation duration
// using accessor functions
scrubber.min();// 0
scrubber.max(); // 1
scrubber.step(); // 0
scrubber.value(); // 0
scrubber.orientation(); // 'horizontal'
scrubber.duration(); // 2000 (ms)

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

// Scrubbers support two animation methods
scrubber.play();  // Starts or resumes animation. Restarts if value() is equal to max().
scrubber.pause();
```

Live example at http://jsbin.com/hefolu/3/
