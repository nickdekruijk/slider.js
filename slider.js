/*
    Slider jQuery plugin
    ====================
    (c)2019 Nick de Kruijk

    Version 0.0.8

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
    And finaly some example CSS for position index/total element
        DIV.slider .position {position:absolute;bottom:0;text-align:center}
        DIV.slider .position .divider {margin:0 5px}
        DIV.slider .position .divider:after {content:'/'}

    JS:
    $('DIV.slider').slider({
        option1:'value1',
        option2:'value2'
    );

    Options: default value|other options

    transition: fade|swipe|scroll   # Fadein/-out, Swipe from right to left or scroll everything
    transitionspeed: 400            # The transition speed in milliseconds, e.g. time it takes to fadein/-out or swipe to next slide
    alternativefade: false|true     # Use alternative method for fading so slides with transparent elements will work better but site background will be slightly visible during transition
    autoplay: true|false            # Automaticaly start playing
    pauseonhover true|false         # Pause autoplay when user hovers over the viewport
    arrowkeys: true|false           # Enable keyboard left and right arrow keys
    touchkeys: false|true           # Show arrow keys on touch devices
    touchwipe: true|false           # Enable touch device left and right swipe gestures
    sliderspeed: 5000               # Time to wait in milliseconds before next slide is shown when autoplay=true
    slideselector: 'div'            # The viewport DOM child element that will represent slides. Could also be .slide if you have html like <div class="slider"><div class="slide">Slide content</div> etc.
    slidewidth: '100',              # Width of each slide in percentage
    activeslide: 'activeslide'      # Class to add to the active slide/dot
    showdots: true,                 # Show the navigation dots
    showposition: false,            # Show the position index/total element
    lazy: false                     # Lazy load images in the slider, set data-lazy="imageurl" on elements. On an img the src attribute will be set and the background-image style will be set on other element types
*/

(function ( $ ) {

    $.fn.slider = function(options) {

        var defaults = {
            transition: 'fade',
            transitionspeed: 400,
            alternativefade: false,
            autoplay: true,
            pauseonhover: true,
            arrowkeys: true,
            touchkeys: false,
            touchwipe: true,
            sliderspeed: 5000,
            slideselector: 'div',
            activeslide: 'activeslide',
            slidewidth: 100,
            showdots: true,
            showposition: false,
            lazy: false,
        };

        var settings = $.extend( {}, defaults, options );
        var autoplayTimeout=false;

        return this.each(function() {
            var slider = $(this);

            // So viewport position to relative if current position is undefined or static
            if (!slider.css('position') || slider.css('position')=='static')
                slider.css('position', 'relative');

            // Set each slide to absolute, block and 100% width/height
            slider.children(settings.slideselector).css('position','absolute').css('display','block').width(settings.slidewidth+'%').height('100%');

            if (settings.transition=='fade') {
                // Hide all slides except first
                slider.children(settings.slideselector).not(':eq(0)').css('opacity',0);
                // Give first slide z-index:2
                slider.children(settings.slideselector).first().css('z-index',2);
            }
            if (settings.transition=='swipe') {
                // Give first slide z-index:2
                slider.children(settings.slideselector).first().css('z-index',2);
            }
            if (settings.transition=='scroll') {
                // Copy last and 2nd to last slide to the front and first and second slide to the end
//                 slider.prepend(slider.children(settings.slideselector).slice(-2).clone());
//                 slider.append(slider.children(settings.slideselector).slice(2,4).clone());
                slider.children(settings.slideselector).each(function(n) {
                    $(this).css('left',(n)*settings.slidewidth+((100-settings.slidewidth)/2)+'%')
                });
            }

            // If slider has only 1 slide stop further action since we won't need autoplay, next/previous etc. But do lazy load
            if (slideCount(slider)<=1) {
                lazy(slider.children(settings.slideselector).eq(0));
                return true;
            }

            // Add dots
            if (settings.showdots) {
                slider.append('<span class="dots"></span>');
                for (i=0; i<slideCount(slider); i++) {
                    var t = slider.children(settings.slideselector).eq(i);
                    slider.children('.dots').append('<span aria-label="' + t.attr('aria-label') + '">' + (t.data('dot') ? t.data('dot') : (i+1)) + '</span>');
                }
                slider.children('.dots').children('span').first().addClass(settings.activeslide);
                slider.children('.dots').children('span').each(function(n) {
                    $(this).click(function() {
                        stopautoplay(slider);
                        gotoSlide(slider, n);
                    });
                });
            }

            // Add position
            if (settings.showposition) {
                slider.append('<span class="position"><span class="index">1</span><span class="divider"></span><span class="total">'+slideCount(slider)+'</span></span>');
            }

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
            slider.children(settings.slideselector).first().addClass(settings.activeslide).attr('aria-hidden', false);
            // If lazy loading is active load the first and 2nd slider
            lazy(slider.children(settings.slideselector).eq(0));
            lazy(slider.children(settings.slideselector).eq(1));

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
                if (!settings.touchkeys) {
                    $(slider).children('span.next').hide();
                    $(slider).children('span.prev').hide();
                }
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
            lazy(slider.children(settings.slideselector).eq(slide));
            lazy(slider.children(settings.slideselector).eq(slide+1));

            if (settings.transition=='fade') {
                if (slide>=slideCount(slider)) slide=0;
                if (slide<0) slide=slideCount(slider)-1;
                slider.children(settings.slideselector).css('z-index',0);
                if (settings.alternativefade) {
                    slider.children('.'+settings.activeslide).animate({opacity:0},settings.transitionspeed);
                }
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide).css('z-index',1).attr('aria-hidden', true);
                slider.children(settings.slideselector).eq(slide).addClass(settings.activeslide).css('z-index',2).css('opacity',0).animate({opacity:1},settings.transitionspeed).attr('aria-hidden', false);
            } else if (settings.transition=='swipe') {
                var direction = 0;
                if ((slide == 0 && currentSlide(slider) > 1) || slide>currentSlide(slider)) {
                    direction=1;
                } else if ((slide == slideCount(slider) - 1 && currentSlide(slider) == 0) || slide<currentSlide(slider)) {
                    direction=-1;
                }
                slider.children(settings.slideselector).css('z-index',0);
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide).css('z-index',1).attr('aria-hidden', true);
                slider.children(settings.slideselector).eq(slide).addClass(settings.activeslide).css('z-index',2).css('left',direction==-1?'-100%':'100%').animate({left:0},settings.transitionspeed).attr('aria-hidden', false);
            } else if (settings.transition=='scroll') {
                // Todo: Scroll looping
                if (slide>=slideCount(slider)) slide=0;
                if (slide<0) slide=slideCount(slider)-1;
                slider.children('.'+settings.activeslide).removeClass(settings.activeslide).attr('aria-hidden', true);
                slider.children(settings.slideselector).eq(slide).addClass(settings.activeslide).attr('aria-hidden', false);
                slider.children(settings.slideselector).each(function(n) {
                    $(this).animate({'left':((n-slide)*settings.slidewidth)+((100-settings.slidewidth)/2)+'%'})
                });
            }
            // Activate the right dot
            if (settings.showdots) {
                slider.children('.dots').children('span').removeClass(settings.activeslide);
                slider.children('.dots').children('span').eq(slide).addClass(settings.activeslide);
            }
            // Update position index
            if (settings.showposition) {
                slider.children('.position').children('.index').text(slide+1);
            }

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

        function lazy(t) {
            if (!settings.lazy) return false;
            function loadIt(t) {
                if ($(t).parent().prop('nodeName')=='IMG')
                    $(t).attr('src', $(t).data('lazy'));
                else
                    $(t).css('background-image', "url('"+$(t).data('lazy')+"')");
            }
            if ($(t).data('lazy')) loadIt(t);
            $(t).find('[data-lazy]').each(function() {
                loadIt(this);
            });
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
