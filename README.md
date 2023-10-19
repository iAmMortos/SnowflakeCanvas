This library depends on JQuery and my custom CappedAnimationFrames library for canvas framerate boilerplate code.
See the `index.html` page's `head` section for the hyperlink to `CappedAnimationFrames.js`

The library handles creating the canvas, configuring it and starting the snowflakes falling. If the screen is resized,
the canvas will adapt to the new size.

Once this library and the libraries above are included, once the document is loaded, simply call

    new SnowflakeCanvas();
    
Or optionally, you can pass the maximum number of snowflakes allowed. The default maximum is 200.

    // only 100 snowflakes allowed on the screen at once
    new SnowflakeCanvas(100);
    
The default numbers in the constructor for the `Snowflake` class can be modified to affect the properties of the snowfall. I went for a slow, drifty snow.