document.addEventListener("DOMContentLoaded", function () {
	themeToggle();
	header();
	horizontalScroll();
	accordion()
});

function themeToggle() {
	const toggleBtn = document.querySelector('.theme-toggle');
	const body = document.body;

	const savedTheme = localStorage.getItem('theme');

	if (savedTheme === 'dark') {
		body.classList.add('dark-theme');
	}

	if (!toggleBtn) return;

	toggleBtn.addEventListener('click', e => {
		e.preventDefault();

		body.classList.toggle('dark-theme');

		const isDark = body.classList.contains('dark-theme');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	});
}

function header() {
	
	// logo animation
	const navBlock = document.getElementById('navigation-block');
	let isScrolled = false;

	function checkScroll() {
		if (!navBlock) return;
		
		if (!isScrolled && window.scrollY > 0) {
			navBlock.classList.add('fixed-position');
			isScrolled = true;
		} else if (isScrolled && window.scrollY === 0) {
			navBlock.classList.remove('fixed-position');
			isScrolled = false;
		}
	}

	checkScroll();
	window.addEventListener('scroll', checkScroll);
	
	// responsive
	ResponsiveHelper.addRange({
		'..1023': {
			on: function () {
				// mobile navigation
				mobileNav('#nav-bar');
				
				// nav opener click
				document.querySelectorAll('.nav-opener').forEach((btn) => {
					btn._handler = function () {
						document.documentElement.style.overflow =
						document.getElementById('nav-bar').classList.contains('nav-active')
						? 'hidden'
						: 'unset';
					};
					
					btn.addEventListener('click', btn._handler);
				});
			},
			off: function () {
				// mobile navigation
				mobileNav('#nav-bar', 'destroy');
				
				// nav opener click
				document.querySelectorAll('.nav-opener').forEach((btn) => {
					if (btn._handler) {
						btn.removeEventListener('click', btn._handler);
						delete btn._handler;
					}
				});
				
				document.documentElement.style.overflow = 'unset';
			}
		}
	});
}

function horizontalScroll() {
	
	// custom horizontal scroll
	const scrollers = document.querySelectorAll(".scroller");
	
	if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		addAnimation();
	}
	
	function addAnimation() {
		scrollers.forEach((scroller) => {
			scroller.setAttribute("data-animated", true);
			
			const scrollerInner = scroller.querySelector(".scroller__inner");
			const scrollerContent = Array.from(scrollerInner.children);
			
			scrollerContent.forEach((item) => {
				const duplicatedItem = item.cloneNode(true);
				duplicatedItem.setAttribute("aria-hidden", true);
				scrollerInner.appendChild(duplicatedItem);
			});
		});
	}
}

function accordion() {
	
	// accordion
	const accordion = document.querySelector('.accordion--skills');
	
	if (accordion) {
		new Accordion(accordion, {
			openOnInit: [0],
			duration: 200,
			elementClass: 'accordion__item',
			triggerClass: 'accordion__opener',
			panelClass: 'accordion__slide'
		});
	}
}



/*
* Simple Mobile Navigation
*/
(function() {
	
	class MobileNav {
		constructor(options = {}) {
			this.options = Object.assign({
				container: null,
				hideOnClickOutside: false,
				menuActiveClass: 'nav-active',
				menuOpener: '.nav-opener',
				menuDrop: '.nav-drop',
				toggleEvent: 'click',
				outsideClickEvent: 'click touchstart pointerdown MSPointerDown'
			}, options);
			
			this.initStructure();
			this.attachEvents();
		}
		
		initStructure() {
			this.page = document.documentElement;
			this.container = this.options.container;
			this.opener = this.container.querySelector(this.options.menuOpener);
			this.drop = this.container.querySelector(this.options.menuDrop);
		}
		
		attachEvents() {
			const self = this;
			
			// init global resize handler once
			if (activateResizeHandler) {
				activateResizeHandler();
				activateResizeHandler = null;
			}
			
			// outside click
			this.outsideClickHandler = function(e) {
				if (self.isOpened()) {
					const target = e.target;
					if (!self.opener.contains(target) && !self.drop.contains(target)) {
						self.hide();
					}
				}
			};
			
			// opener click
			this.openerClickHandler = function(e) {
				e.preventDefault();
				self.toggle();
			};
			
			this.opener.addEventListener(this.options.toggleEvent, this.openerClickHandler);
		}
		
		isOpened() {
			return this.container.classList.contains(this.options.menuActiveClass);
		}
		
		show() {
			this.container.classList.add(this.options.menuActiveClass);
			
			if (this.options.hideOnClickOutside) {
				this.options.outsideClickEvent.split(' ').forEach(ev =>
					this.page.addEventListener(ev, this.outsideClickHandler)
				);
			}
		}
		
		hide() {
			this.container.classList.remove(this.options.menuActiveClass);
			
			if (this.options.hideOnClickOutside) {
				this.options.outsideClickEvent.split(' ').forEach(ev =>
					this.page.removeEventListener(ev, this.outsideClickHandler)
				);
			}
		}
		
		toggle() {
			if (this.isOpened()) this.hide();
			else this.show();
		}
		
		destroy() {
			this.container.classList.remove(this.options.menuActiveClass);
			
			this.opener.removeEventListener(this.options.toggleEvent, this.openerClickHandler);
			
			this.options.outsideClickEvent.split(' ').forEach(ev =>
				this.page.removeEventListener(ev, this.outsideClickHandler)
			);
			
			this.container.mobileNavInstance = null;
		}
	}
	
	let activateResizeHandler = function() {
		const doc = document.documentElement;
		const resizeClass = 'resize-active';
		let flag = false;
		let timer;
		
		function removeClassHandler() {
			flag = false;
			doc.classList.remove(resizeClass);
		}
		
		function resizeHandler() {
			if (!flag) {
				flag = true;
				doc.classList.add(resizeClass);
			}
			clearTimeout(timer);
			timer = setTimeout(removeClassHandler, 500);
		}
		
		window.addEventListener('resize', resizeHandler);
		window.addEventListener('orientationchange', resizeHandler);
	};
	
	window.mobileNav = function(selector, optionsOrMethod) {
		const elements = document.querySelectorAll(selector);
		
		elements.forEach(el => {
			let instance = el.mobileNavInstance;
			
			if (!instance && (typeof optionsOrMethod === 'object' || optionsOrMethod === undefined)) {
				instance = new MobileNav(Object.assign({ container: el }, optionsOrMethod));
				el.mobileNavInstance = instance;
			} else if (instance && typeof optionsOrMethod === 'string') {
				if (typeof instance[optionsOrMethod] === 'function') {
					instance[optionsOrMethod]();
				}
			}
		});
	};
	
})();


/*
* Responsive Layout helper
*/
window.ResponsiveHelper = (function() {
	// init variables
	var handlers = [],
	prevWinWidth,
	win = window,
	nativeMatchMedia = false;
	
	// detect match media support
	if (window.matchMedia) {
		if (window.Window && window.matchMedia === Window.prototype.matchMedia) {
			nativeMatchMedia = true;
		} else if (window.matchMedia.toString().indexOf('native') > -1) {
			nativeMatchMedia = true;
		}
	}
	
	// prepare resize handler
	function resizeHandler() {
		var winWidth = win.innerWidth;
		if (winWidth !== prevWinWidth) {
			prevWinWidth = winWidth;
			
			// loop through range groups
			handlers.forEach(function(rangeObject) {
				
				// disable current active area if needed
				Object.keys(rangeObject.data).forEach(function(property) {
					var item = rangeObject.data[property];
					if (item.currentActive && !matchRange(item.range[0], item.range[1])) {
						item.currentActive = false;
						if (typeof item.disableCallback === 'function') {
							item.disableCallback();
						}
					}
				});
				
				// enable areas that match current width
				Object.keys(rangeObject.data).forEach(function(property) {
					var item = rangeObject.data[property];
					if (!item.currentActive && matchRange(item.range[0], item.range[1])) {
						item.currentActive = true;
						if (typeof item.enableCallback === 'function') {
							item.enableCallback();
						}
					}
				});
			});
		}
	}
	
	// bind native events
	window.addEventListener('load', resizeHandler);
	window.addEventListener('resize', resizeHandler);
	window.addEventListener('orientationchange', resizeHandler);
	
	// test range
	function matchRange(r1, r2) {
		var mediaQueryString = '';
		if (r1 > 0) {
			mediaQueryString += '(min-width: ' + r1 + 'px)';
		}
		if (r2 < Infinity) {
			mediaQueryString += (mediaQueryString ? ' and ' : '') + '(max-width: ' + r2 + 'px)';
		}
		return matchQuery(mediaQueryString, r1, r2);
	}
	
	// media query function
	function matchQuery(query, r1, r2) {
		if (window.matchMedia && nativeMatchMedia) {
			return matchMedia(query).matches;
		} else if (window.styleMedia) {
			return styleMedia.matchMedium(query);
		} else if (window.media) {
			return media.matchMedium(query);
		} else {
			return prevWinWidth >= r1 && prevWinWidth <= r2;
		}
	}
	
	// range parser
	function parseRange(rangeStr) {
		var rangeData = rangeStr.split('..');
		var x1 = parseInt(rangeData[0], 10) || -Infinity;
		var x2 = parseInt(rangeData[1], 10) || Infinity;
		return [x1, x2].sort(function(a, b) {
			return a - b;
		});
	}
	
	// export public functions
	return {
		addRange: function(ranges) {
			// parse data and add items to collection
			var result = { data: {} };
			
			Object.keys(ranges).forEach(function(property) {
				var data = ranges[property];
				result.data[property] = {
					range: parseRange(property),
					enableCallback: data.on,
					disableCallback: data.off
				};
			});
			
			handlers.push(result);
			
			// call resizeHandler to recalculate all events
			prevWinWidth = null;
			resizeHandler();
		}
	};
}());


/**
* Accordion v3.4.1
* Lightweight and accessible accordion module created in pure Javascript
* https://github.com/michu2k/Accordion
*
* Copyright (c) MichaÅ‚ Strumpf
* Published under MIT License
*/
"use strict";!function(e){let t=0;const s=function(e,n){const i="js-enabled",o=this;let r=!1;if(Array.isArray(e))return!!e.length&&e.map((e=>new s(e,n)));const l={init(){this.options=Object.assign({duration:500,ariaEnabled:!0,collapse:!0,showMultiple:!1,onlyChildNodes:!0,openOnInit:[],elementClass:"ac",triggerClass:"ac-trigger",panelClass:"ac-panel",activeClass:"is-active",beforeOpen:()=>{},onOpen:()=>{},beforeClose:()=>{},onClose:()=>{}},n);const t="string"==typeof e;this.container=t?document.querySelector(e):e,this.createDefinitions(),o.attachEvents()},createDefinitions(){const{elementClass:e,openOnInit:s,onlyChildNodes:n}=this.options,o=n?this.container.childNodes:this.container.querySelectorAll(a(e));this.elements=Array.from(o).filter((t=>t.classList&&t.classList.contains(e))),this.firstElement=this.elements[0],this.lastElement=this.elements[this.elements.length-1],this.elements.filter((e=>!e.classList.contains(i))).forEach((e=>{e.classList.add(i),this.generateIDs(e),this.setARIA(e),this.setTransition(e);const n=this.elements.indexOf(e);t++,s.includes(n)?this.showElement(e,!1):this.closeElement(e,!1)}))},setTransition(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const{duration:s,panelClass:n}=this.options;e.querySelector(a(n)).style.transitionDuration=t?null:"".concat(s,"ms")},generateIDs(e){const{triggerClass:s,panelClass:n}=this.options,i=e.querySelector(a(s)),o=e.querySelector(a(n));e.setAttribute("id",e.id||"ac-".concat(t)),i.setAttribute("id",i.id||"ac-trigger-".concat(t)),o.setAttribute("id",o.id||"ac-panel-".concat(t))},removeIDs(e){const{triggerClass:t,panelClass:s}=this.options,n=e.querySelector(a(t)),i=e.querySelector(a(s));e.id.startsWith("ac-")&&e.removeAttribute("id"),n.id.startsWith("ac-")&&n.removeAttribute("id"),i.id.startsWith("ac-")&&i.removeAttribute("id")},setARIA(e){const{ariaEnabled:t,triggerClass:s,panelClass:n}=this.options;if(!t)return;const i=e.querySelector(a(s)),o=e.querySelector(a(n));i.setAttribute("role","button"),i.setAttribute("aria-controls",o.id),i.setAttribute("aria-disabled",!1),i.setAttribute("aria-expanded",!1),o.setAttribute("role","region"),o.setAttribute("aria-labelledby",i.id)},updateARIA(e,t){let{ariaExpanded:s,ariaDisabled:n}=t;const{ariaEnabled:i,triggerClass:o}=this.options;if(!i)return;const r=e.querySelector(a(o));r.setAttribute("aria-expanded",s),r.setAttribute("aria-disabled",n)},removeARIA(e){const{ariaEnabled:t,triggerClass:s,panelClass:n}=this.options;if(!t)return;const i=e.querySelector(a(s)),o=e.querySelector(a(n));i.removeAttribute("role"),i.removeAttribute("aria-controls"),i.removeAttribute("aria-disabled"),i.removeAttribute("aria-expanded"),o.removeAttribute("role"),o.removeAttribute("aria-labelledby")},focus(e,t){e.preventDefault();const{triggerClass:s}=this.options;t.querySelector(a(s)).focus()},focusFirstElement(e){this.focus(e,this.firstElement),this.currFocusedIdx=0},focusLastElement(e){this.focus(e,this.lastElement),this.currFocusedIdx=this.elements.length-1},focusNextElement(e){const t=this.currFocusedIdx+1;if(t>this.elements.length-1)return this.focusFirstElement(e);this.focus(e,this.elements[t]),this.currFocusedIdx=t},focusPrevElement(e){const t=this.currFocusedIdx-1;if(t<0)return this.focusLastElement(e);this.focus(e,this.elements[t]),this.currFocusedIdx=t},showElement(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];const{panelClass:s,activeClass:n,collapse:i,beforeOpen:o}=this.options;t&&o(e);const r=e.querySelector(a(s)),l=r.scrollHeight;e.classList.add(n),requestAnimationFrame((()=>{requestAnimationFrame((()=>{r.style.height=t?"".concat(l,"px"):"auto"}))})),this.updateARIA(e,{ariaExpanded:!0,ariaDisabled:!i})},closeElement(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];const{panelClass:s,activeClass:n,beforeClose:i}=this.options,o=e.querySelector(a(s)),r=o.scrollHeight;e.classList.remove(n),t?(i(e),requestAnimationFrame((()=>{o.style.height="".concat(r,"px"),requestAnimationFrame((()=>{o.style.height=0}))}))):o.style.height=0,this.updateARIA(e,{ariaExpanded:!1,ariaDisabled:!1})},toggleElement(e){const{activeClass:t,collapse:s}=this.options,n=e.classList.contains(t);if(!n||s)return n?this.closeElement(e):this.showElement(e)},closeElements(){const{activeClass:e,showMultiple:t}=this.options;t||this.elements.forEach(((t,s)=>{t.classList.contains(e)&&s!==this.currFocusedIdx&&this.closeElement(t)}))},handleClick(e){const t=e.currentTarget;this.elements.forEach(((s,n)=>{s.contains(t)&&"A"!==e.target.nodeName&&(this.currFocusedIdx=n,this.closeElements(),this.focus(e,s),this.toggleElement(s))}))},handleKeydown(e){switch(e.key){case"ArrowUp":return this.focusPrevElement(e);case"ArrowDown":return this.focusNextElement(e);case"Home":return this.focusFirstElement(e);case"End":return this.focusLastElement(e);default:return null}},handleFocus(e){const t=e.currentTarget,s=this.elements.find((e=>e.contains(t)));this.currFocusedIdx=this.elements.indexOf(s)},handleTransitionEnd(e){if(e.stopPropagation(),"height"!==e.propertyName)return;const{onOpen:t,onClose:s}=this.options,n=e.currentTarget,i=parseInt(n.style.height),o=this.elements.find((e=>e.contains(n)));i>0?(n.style.height="auto",t(o)):s(o)}};this.attachEvents=()=>{if(r)return;const{triggerClass:e,panelClass:t}=l.options;l.handleClick=l.handleClick.bind(l),l.handleKeydown=l.handleKeydown.bind(l),l.handleFocus=l.handleFocus.bind(l),l.handleTransitionEnd=l.handleTransitionEnd.bind(l),l.elements.forEach((s=>{const n=s.querySelector(a(e)),i=s.querySelector(a(t));n.addEventListener("click",l.handleClick),n.addEventListener("keydown",l.handleKeydown),n.addEventListener("focus",l.handleFocus),i.addEventListener("transitionend",l.handleTransitionEnd)})),r=!0},this.detachEvents=()=>{if(!r)return;const{triggerClass:e,panelClass:t}=l.options;l.elements.forEach((s=>{const n=s.querySelector(a(e)),i=s.querySelector(a(t));n.removeEventListener("click",l.handleClick),n.removeEventListener("keydown",l.handleKeydown),n.removeEventListener("focus",l.handleFocus),i.removeEventListener("transitionend",l.handleTransitionEnd)})),r=!1},this.toggle=e=>{const t=l.elements[e];t&&l.toggleElement(t)},this.open=e=>{const t=l.elements[e];t&&l.showElement(t)},this.openAll=()=>{const{activeClass:e,onOpen:t}=l.options;l.elements.forEach((s=>{s.classList.contains(e)||(l.showElement(s,!1),t(s))}))},this.close=e=>{const t=l.elements[e];t&&l.closeElement(t)},this.closeAll=()=>{const{activeClass:e,onClose:t}=l.options;l.elements.forEach((s=>{s.classList.contains(e)&&(l.closeElement(s,!1),t(s))}))},this.destroy=()=>{this.detachEvents(),this.openAll(),l.elements.forEach((e=>{l.removeIDs(e),l.removeARIA(e),l.setTransition(e,!0),e.classList.remove(i)})),r=!0},this.update=()=>{l.createDefinitions(),this.detachEvents(),this.attachEvents()};const a=e=>".".concat(CSS.escape(e));l.init()};"undefined"!=typeof module&&void 0!==module.exports?module.exports=s:e.Accordion=s}(window);
