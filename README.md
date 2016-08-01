# slider.js

##Usage
HTML:
<div class="slider">
    <div>Slide 1 content</div>
    <div>Slide 2 content</div>
    <div>Slide 3 content</div>
</div>

###CSS
Style your slider however you want. 
The .slider element will be the viewport. You probably want this to have CSS {overflow:hidden}
The slides(divs) inside the viewport will be set to absolute positioned, 100% width and 100% height of the viewport/parent div
You do need to add CSS for the dots if you want them, for example:
    DIV.slider .dots {display:block;z-index:10;position:absolute;left:0;right:0;text-align:center}
    DIV.slider .dots>SPAN {display:inline-block;width:16px;height:16px;border-radius:10px;border:1px solid #fff;margin:10px 5px 0;color:transparent;font-size:11px;line-height:15px}
    DIV.slider .dots>SPAN:hover {background-color:rgba(255,255,255,0.5);cursor:pointer}
    DIV.slider .dots>SPAN.activeslide {background-color:#fff}
You probably want CSS for the previous and next buttons too, for example:
    DIV.slider:hover .next,
    DIV.slider:hover .prev {position:absolute;top:50%;height:50px;width:50px;border-radius:50px;border:2px transparent #fff;margin:-27px 25px 0;z-index:10;background-color:rgba(0,0,0,0.25)}
    DIV.slider:hover .next {right:0}
    DIV.slider:hover .next>SPAN,
    DIV.slider:hover .prev>SPAN {position:absolute;border-top:3px solid #fff;border-right:3px solid #fff;width:20px;height:20px}
    DIV.slider:hover .next>SPAN {transform:rotate(45deg);top:13px;left:9px}
    DIV.slider:hover .prev>SPAN {transform:rotate(-135deg);top:13px;left:17px}
    DIV.slider:hover .next:hover,
    DIV.slider:hover .prev:hover {background-color:rgba(0,0,0,0.6);cursor:pointer}


###JS
$('DIV.slider').slider({
    option1:'value1',
    option2:'value2'
);

###Options: default value|other options

transition: fade|swipe|scroll   # Fadein/-out, Swipe from right to left or scroll everything
transitionspeed: 400            # The transition speed in milliseconds, e.g. time it takes to fadein/-out or swipe to next slide
autoplay: true|false            # Automaticaly start playing
pauseonhover true|false         # Pause autoplay when user hovers over the viewport
arrowkeys: true|false           # Enable keyboard left and right arrow keys    
touchwipe: true|false           # Enable touch device left and right swipe gestures    
sliderspeed: 5000               # Time to wait in milliseconds before next slide is shown when autoplay=true
slideselector: 'div'            # The viewport DOM child element that will represent slides. Could also be .slide if you have html like <div class="slider"><div class="slide">Slide content</div> etc.
activeslide: 'activeslide'      # Class to add to the active slide/dot