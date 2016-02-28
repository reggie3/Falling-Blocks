/// <reference path="jquery/jquery.d.ts" />
/// <reference path="underscore/underscore.d.ts" />
/// <reference path="three/three.d.ts" />
/// <reference path="hammer/hammer.d.ts" />
/// <reference path="tween.js/tween.js.d.ts" />


closeSidebar(function(el) {
            $(el).addClass("current");
            setTimeout(function(){openSidebar()}, 300);
        }(this));