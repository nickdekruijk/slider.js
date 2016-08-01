/*
    Slider jQuery plugin
    ====================
    (c)2016 Nick de Kruijk
    
    Version 0.0.1
    
    Usage:
    HTML:
    <div class="slider">
        <div>Slide 1 content</div>
        <div>Slide 2 content</div>
        <div>Slide 3 content</div>
    </div>
    
    CSS:
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

    
    JS:
    $('DIV.slider').slider({
        option1:'value1',
        option2:'value2'
    );
    
    Options: default value|other options
    
    transition: fade|swipe|scroll   # Fadein/-out, Swipe from right to left or scroll everything
    transitionspeed: 400            # The transition speed in milliseconds, e.g. time it takes to fadein/-out or swipe to next slide
    autoplay: true|false            # Automaticaly start playing
    pauseonhover true|false         # Pause autoplay when user hovers over the viewport
    arrowkeys: true|false           # Enable keyboard left and right arrow keys    
    touchwipe: true|false           # Enable touch device left and right swipe gestures    
    sliderspeed: 5000               # Time to wait in milliseconds before next slide is shown when autoplay=true
    slideselector: 'div'            # The viewport DOM child element that will represent slides. Could also be .slide if you have html like <div class="slider"><div class="slide">Slide content</div> etc.
    activeslide: 'activeslide'      # Class to add to the active slide/dot
*/

(function ( $ ) {
    
    $.fn.slider = function(options) {
        
        var defaults = {
            transition: 'fade',
            transitionspeed: 400,
            autoplay: true,
            pauseonhover: true,
            arrowkeys: true,
            touchwipe: true,
            sliderspeed: 5000,
            slideselector: 'div',
            activeslide: 'activeslide',
        };
        
        var settings = $.extend( {}, defaults, options );
        var autoplayTimeout=false;
        
        return this.each(function() {
            var slider = $(this);
            
            // So viewport position to relative if current position is undefined or static
            if (!slider.css('position') || slider.css('position')=='static')
                slider.css('position', 'relative');
            
            // Set each slide to absolute, block and 100% width/height
            slider.children(settings.slideselector).css('position','absolute').css('display','block').width('100%').height('100%');
            
            if (settings.transition=='fade') {
                // Give first slide z-index:2
                slider.children(settings.slideselector).first().css('z-index',2);
            }
            if (settings.transition=='swipe') {
                // Give first slide z-index:2
                slider.children(settings.slideselector).first().css('z-index',2);
            }
            if (settings.transition=='scroll') {
                // Copy last and 2nd to last slide to the front and first and second slide to the end
                slider.prepend(slider.children(settings.slideselector).slice(-2).clone());
                slider.append(slider.children(settings.slideselector).slice(2,4).clone());
                slider.children(settings.slideselector).each(function(n) {
                    $(this).css('left',(n-2)*100+'%')
                });
            }

            // If slider has only 1 slide stop further action since we won't need autoplay, next/previous etc.
            if (slideCount(slider)<=1) return true;
            
            // Add dots
            slider.append('<span class="dots"></span>');
            for (i=0; i<slideCount(slider); i++) slider.children('.dots').append('<span>'+(i+1)+'</span>');
            slider.children('.dots').children('span').first().addClass(settings.activeslide);
            slider.children('.dots').children('span').click(function() {
                stopautoplay(slider);
                gotoSlide(slider,$(this).text()-1);
            });
            
            // Add previous and next arrows
            slider.append('<span class="next"><span></span></span>');
            slider.append('<span class="prev"><span></span></span>');
            slider.children('span.next').click(function() {
                stopautoplay(slider);
                nextSlide(slider);
            });
            slider.children('span.prev').click(function() {
                stopautoplay(slider);
                prevSlide(slider);
            });
                        
            // Apply activeslide class to first slide
            slider.children(settings.slideselector).first().addClass(settings.activeslide);
            
            if (settings.pauseonhover) {
                slider.mouseover(function() {
                    clearTimeout(autoplayTimeout);
                })
                slider.mouseout(function() {
                    autoplay(slider, true);
                })
            }
            autoplay(slider)

            // Activate arrow keys on keyboard
        	if (settings.arrowkeys) $(document).keydown(function(e) {
        		var keyCode=e.keyCode || e.which;
        		if (keyCode==39) {
                    slider.children('span.next').click();
        		}
        		if (keyCode==37) {
                    slider.children('span.prev').click();
        		}
        	});

            // Activate touch gestures
        	if (settings.touchwipe && isTouch()) {
        		$(slider).touchwipe_slider({
        			wipeLeft: function() { slider.children('span.next').click(); },
        			wipeRight: function() { slider.children('span.prev').click(); },
        			min_move_x: 50,
        			min_move_y: 2000,
        			preventDefaultEvents: false
        		});
        		// Hide arrow keys on touch devices
        		$(slider).children('span.next').hide();
        		$(slider).children('span.prev').hide();
        	}
        });
                
        function stopautoplay(slider) {
            settings.autoplay=false;
            clearTimeout(autoplayTimeout);
        }
        function autoplay(slider, aftermouseout) {
            if (settings.autoplay) {
                // After mouseout and pauseonhover we don't want a quicker speed
                var speed=settings.sliderspeed;
                if (aftermouseout && speed>1000) speed=1000;
                
                autoplayTimeout=setTimeout(function() {
                    nextSlide(slider);
                }, speed);
            }
        }
        
        function gotoSlide(slider,slide) {

/*
            var direction=0;
            if (slide==0 && currentSlide(slider)>1) direction=1;
            else if (slide==slideCount(slider)-1 && currentSlide(slider)==0) direction=-1;
            else if (slide>currentSlide(slider)) direction=1;
            else if (slide<currentSlide(slider)) direction=-1;
*/

            if (settings.transition=='fade') {
                if (slide>=slideCount(slider)) slide=0;
                if (slide<0) slide=slideCount(slider)-1;
                slider.children(settings.slideselector).css('z-index',0);
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide).css('z-index',1);
                slider.children(settings.slideselector).eq(slide).hide().addClass(settings.activeslide).css('z-index',2).fadeIn(settings.transitionspeed);
            } else if (settings.transition=='swipe') {
                slider.children(settings.slideselector).css('z-index',0);
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide).css('z-index',1);
                slider.children(settings.slideselector).eq(slide).addClass(settings.activeslide).css('z-index',2).css('left',direction==-1?'-100%':'100%').animate({left:0},settings.transitionspeed);
            } else if (settings.transition=='scroll') {
                // Todo: Scroll it!
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide);
                slider.children(settings.slideselector).eq(slide).addClass(settings.activeslide);
                slider.children(settings.slideselector).each(function(n) {
                    $(this).animate({'left':((n-2-slide)*100)+'%'})
                });
            }
            // Activate the right dot
            slider.children('.dots').children('span').removeClass(settings.activeslide);
            slider.children('.dots').children('span').eq(slide).addClass(settings.activeslide);

            autoplay(slider);
        }
        
        function currentSlide(slider) {
            var currentSlide=false;
            slider.children(settings.slideselector).each(function(n) {
                if ($(this).hasClass(settings.activeslide)) currentSlide=n;
            });
            return currentSlide;
        }

        function slideCount(slider) {
            if (settings.transition=='scroll')
                return slider.children(settings.slideselector).length-4;
            else
                return slider.children(settings.slideselector).length;
        }
        
        function nextSlide(slider) {
            gotoSlide(slider, currentSlide(slider)+1);
        }
        function prevSlide(slider) {
            gotoSlide(slider, currentSlide(slider)-1);
        }

        function isTouch() {
        	return 'ontouchstart' in window || 'onmsgesturechange' in window;
        }
        
    };

}( jQuery ));

/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */
(function($){$.fn.touchwipe_slider=function(settings){var config={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:true};if(settings)$.extend(config,settings);this.each(function(){var startX;var startY;var isMoving=false;function cancelTouch(){this.removeEventListener('touchmove',onTouchMove);startX=null;isMoving=false}function onTouchMove(e){if(config.preventDefaultEvents){e.preventDefault()}if(isMoving){var x=e.touches[0].pageX;var y=e.touches[0].pageY;var dx=startX-x;var dy=startY-y;if(Math.abs(dx)>=config.min_move_x){cancelTouch();if(dx>0){config.wipeLeft()}else{config.wipeRight()}}else if(Math.abs(dy)>=config.min_move_y){cancelTouch();if(dy>0){config.wipeDown()}else{config.wipeUp()}}}}function onTouchStart(e){if(e.touches.length==1){startX=e.touches[0].pageX;startY=e.touches[0].pageY;isMoving=true;this.addEventListener('touchmove',onTouchMove,false)}}if('ontouchstart'in document.documentElement){this.addEventListener('touchstart',onTouchStart,false)}});return this}})(jQuery);


/*
var sliders = new Array();
var sliderTimeout = false;
function sliderSize(t) {
    $(t).children('UL').children('LI').each(function(n) {
        $(this).css('left',(n-2-sliders[t])*$(t).width())
    });
}
function sliderGo(t,slide,instant) {
    if (!instant) {
        var max=$(t).children('UL').children('LI').length-4;
        if (slide>=max) {
            sliderGo(t,-1,true)
            slide=0;
        }
        if (slide<0) {
            sliderGo(t,max,true)
            slide=max-1;
        }
    }
    $(t).find('.dots > span.active').removeClass('active');
    $(t).find('.dots > span:eq('+slide+')').addClass('active');
    
    sliders[t]=slide;
    
    $(t).children('UL').children('LI').each(function(n) {
        if (instant)
            $(this).css('left',(n-2-slide)*$(t).width())
        else
            $(this).animate({'left':(n-2-slide)*$(t).width()})
    });
}
function sliderInit(t) {
    sliders[t]=0;
    $(t).append('<div class="dots"></div><span class="next"></span><span class="prev"></span>');
    $(t).find('SPAN.next').click(function() {
        clearInterval(sliderTimeout);
        sliderGo(t,sliders[t]+1);
    });
    $(t).find('SPAN.prev').click(function() {
        clearInterval(sliderTimeout);
        sliderGo(t,sliders[t]-1);
    });
    for (i=0; i<$(t).children('UL').children('LI').length; i++) {
        $(t).find('.dots').append('<span data-dot="'+i+'"></span>');
    }
    $(t).find('.dots > span:first').addClass('active');
    $(t).find('.dots > span').click(function() {
        clearInterval(sliderTimeout);
        sliderGo(t,$(this).data('dot'));
    });
    $(t).children('UL').prepend($(t).children('UL').children('LI:last').clone());
    $(t).children('UL').prepend($(t).children('UL').children('LI:nth-last-child(2)').clone());
    $(t).children('UL').append($(t).children('UL').children('LI:first').next().next().clone());
    $(t).children('UL').append($(t).children('UL').children('LI:first').next().next().next().clone());
    $(t).children('UL').children('LI').children('A').click(function() {
        var i=$(this).parent().index()-2;
        if (i!=sliders[t]) {
            clearInterval(sliderTimeout);
            sliderGo(t,i);
            return false;        
        }
    });
    sliderSize(t);
    $(window).resize(function() {
        sliderSize(t);
    });
	if (isTouch()) {
		$(t).touchwipe({
			wipeLeft: function() { $(t).find('SPAN.next').click(); },
			wipeRight: function() { $(t).find('SPAN.prev').click(); },
			min_move_x: 50,
			min_move_y: 2000,
			preventDefaultEvents: false
		});
		$(t).find('SPAN.next').hide();
		$(t).find('SPAN.prev').hide();
	}
}

$(document).ready(function() {
    $('SPAN.down').click(function() {
        var s=$(this).parent().offset().top+$(this).parent().outerHeight();
        console.log($(this).parent().offset().top,$(window).scrollTop());
        $('html, body').stop().animate({scrollTop:s}, '500', 'swing');
    });
    sliderInit('.slider1');
    sliderInit('.slider2');
    sliderInit('.slider3');
    sliderInit('.slider4');
	sliderTimeout=setInterval(function() { sliderGo('.slider1',sliders['.slider1']+1); }, 3000);
	sliderTimeout=setInterval(function() { sliderGo('.slider4',sliders['.slider4']+1); }, 3000);
	$(document).keydown(function(e) {
		var keyCode=e.keyCode || e.which;
		if (keyCode==39) {
			$('.slider .next').click();
			return false;
		}
		if (keyCode==37) {
			$('.slider .prev').click();
			return false;
		}
	});
    $('.menuicon').click(function() {
        $('NAV').toggleClass('menuactive'); 
    });
});

function isTouch() {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 * 
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */
//(function($){$.fn.touchwipe=function(settings){var config={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:true};if(settings)$.extend(config,settings);this.each(function(){var startX;var startY;var isMoving=false;function cancelTouch(){this.removeEventListener('touchmove',onTouchMove);startX=null;isMoving=false}function onTouchMove(e){if(config.preventDefaultEvents){e.preventDefault()}if(isMoving){var x=e.touches[0].pageX;var y=e.touches[0].pageY;var dx=startX-x;var dy=startY-y;if(Math.abs(dx)>=config.min_move_x){cancelTouch();if(dx>0){config.wipeLeft()}else{config.wipeRight()}}else if(Math.abs(dy)>=config.min_move_y){cancelTouch();if(dy>0){config.wipeDown()}else{config.wipeUp()}}}}function onTouchStart(e){if(e.touches.length==1){startX=e.touches[0].pageX;startY=e.touches[0].pageY;isMoving=true;this.addEventListener('touchmove',onTouchMove,false)}}if('ontouchstart'in document.documentElement){this.addEventListener('touchstart',onTouchStart,false)}});return this}})(jQuery);