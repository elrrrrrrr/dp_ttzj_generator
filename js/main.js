(function ($) {
    var Carousel = function (element, options) {
        var option = $.extend($.Carousel.Defaults, options);

        this.wrapper = $(element);
        this.roller = this.wrapper.find('.container');
        this.list = this.roller.find('li');
        this.itemLength = this.list.length;
        this.distance = 0;
        this.current = 1;

        this.timer = null;

        this.autoPlay = option.autoPlay;
        this.duration = option.duration;
        this.gap = option.gap;

        this.stepLength = option.stepLength == 'auto' ? this.list.eq(0).width() : option.stepLength;

        if (this.autoPlay) {
            this.start();
        }
    };

    Carousel.prototype.start = function () {
        var _this = this;
        this.timer = setInterval(function () {
            _this.roll();
        }, this.gap);
    };

    Carousel.prototype.stop = function () {
        clearInterval(this.timer);
    };

    Carousel.prototype.roll = function () {
        var _this = this;
        this.roller.animate({
            left: this.distance
        }, this.duration, function () {
            if (_this.current > _this.itemLength - 4) {
                _this.distance = 0;
                _this.current = 1;
            }
            else {
                _this.current += 1;
                _this.distance -= _this.stepLength;
            }
        });
    };

    $.Carousel = {
        Defaults: {
            autoPlay: true,
            duration: 500,
            gap: 3000,
            stepLength: 'auto'
        },
        Manager: []
    };

    $.fn.carousel = function (options) {
        if (!this.length) {
            return;
        }
        return this.each(function () {
            $.Carousel.Manager.push(new Carousel(this, options));
        });
    }
})(jQuery);

(function ($) {
    var Popup = function () {
        this.init();
    };
    $.extend(Popup.prototype, {
        init: function () {
            var _this = this;
            _this.$el = $("<div class='popup-overlay'></div>");
            _this.$mask = $("<div class='popup-mask'></div>").on("click", function () {
                return false;
            });
            _this.$popupWindow = $("<div class='popup-window'></div>");
        },
        setPopup: function (options, open) {
            var _this = this, defaults = {
                width: 'auto',
                height: 'auto',
                className: "",
                domString: "",
                closeable: true
            }, o;
            o = $.extend(defaults, options);
            _this.close();
            _this.closed = true;
            _this.width = o.width;
            _this.height = o.height;
            _this.className = o.className;
            _this.domString = o.domString;
            _this.closeable = o.closeable;
            if (open) {
                _this.open();
            }
        },
        _setSize: function () {
            this.$popupWindow.css({
                width: this.width,
                height: this.height
            });
            this.$popupWindow.css({
                marginLeft: -this.$popupWindow.width() / 2,
                marginTop: -this.$popupWindow.height() / 2
            });
        },
        open: function () {
            var _this = this;
            if (_this.closed) {
                _this.closed = false;
                _this.$popupWindow.empty();
                _this.$el.empty();
                if (_this.closeable) {
                    $("<a href='javascript:void(0);' title='关闭' class='popup-close'></a>").one("click",function () {
                        _this.close();
                        return false;
                    }).appendTo(_this.$popupWindow);
                }
                $(_this.domString).appendTo(_this.$popupWindow);
                _this.$popupWindow.appendTo(_this.$el);
                _this.$mask.appendTo(this.$el);
                _this.$el.appendTo(document.body);
                _this._setSize();
            }
        },
        close: function () {
            if (!this.closed) {
                this.$el.remove();
                this.closed = true;
            }
        }
    });
    $.Popup = new Popup();
})(jQuery);

(function ($) {
    var Roulette = function (o) {
        this._init(o);
    };

    function showInfo(string) {
        var Str = [
            "<div class='popup-info'><h1>",
            string,
            "</h1></div>"
        ];

        $.Popup.setPopup({
            width: 400,
            domString: $(Str.join(''))
        }, true);
    }

    $.extend(Roulette.prototype, {
        _init: function (o) {
            var _this = this;
            _this.options = o;
            _this.ajax = false;
            _this.responseData = {};

            _this.options.element.on('click', function () {
                _this.lottery();
            });
        },
        lottery: function () {
            var _this = this;
            if (!_this.ajax) {
                _this.ajax = true;
                $.ajax({
                    url: "/prize/ajax/prizeDraw",
                    data: _this.options.data,
                    success: function (response) {
                        _this._prizeCheck(response);
                    },
                    error: function () {
                        alert("系统发生错误，请重试！");
                    },
                    complete: function () {
                        _this.ajax = false;
                    }

                });
            }
        },
        _prizeCheck: function (response) {
            var _this = this;
            this.responseData = response;
            switch (this.responseData.code) {
                case 200:
                    if ($.isFunction(_this.options.successCallback)) {
                        _this.options.successCallback.call(_this, response);
                    }
                    break;
                case 403:
                    DP && DP.authBox && DP.authBox();
                    break;
                case 501:
                    showInfo("您今天已经抽过奖啦！");
                    break;
                default:
                    showInfo(this.responseData.msg.message);
                    break;
            }
        },
        sendUserInfo: function (phoneNumber, callback) {
            var _this = this;
            if (!_this.ajax) {
                _this.ajax = true;
                $.ajax({
                    url: "/prize/ajax/userInfo",
                    data: {
                        mobileNo: phoneNumber,
                        recordId: _this.responseData.msg.recordId
                    },
                    success: function (response) {
                        switch (response.code) {
                            case 200:
                                alert("提交成功！");
                                callback.call(_this);
                                break;
                            default :
                                alert("系统发生错误，请重试！");
                                break;
                        }
                    },
                    error: function () {
                        alert("系统发生错误，请重试！");
                    },
                    complete: function () {
                        _this.ajax = false;
                    }

                });
            }
        }
    });

    $.extend({
        Roulette: Roulette
    })
})(jQuery);

/*!
 * $ Templates Plugin 1.0.4
 * https://github.com/KanbanSolutions/jquery-tmpl
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

/*
 Tags:
 {%if <condition> %}<action>{%/if%}
 {%if <condition> %}<action>{%else%}<action>{%/if%}
 {%if <condition> %}<action>{%elif <condition> %}<action>{%else%}<action>{%/if%}
 {%each <array_or_object> %}$value, $index{%/each%}
 {%tmpl <template>%}
 {%= js call %}
 {%html js call %}
 */
(function($, undefined) {
    var oldManip = $.fn.domManip, tmplItmAtt = "_tmplitem",
        newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];


    var regex = {
        sq_escape: /([\\'])/g,
        sq_unescape: /\\'/g,
        dq_unescape: /\\\\/g,
        nl_strip: /[\r\t\n]/g,
        shortcut_replace: /\$\{([^\}]*)\}/g,
        lang_parse: /\{\%(\/?)(\w+|.)(?:\(((?:[^\%]|\%(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\%]|\%(?!\}))*?)\))?\s*\%\}/g,
        old_lang_parse: /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
        template_anotate: /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g,
        text_only_template: /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/,
        html_expr: /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! |\{\%! /,
        last_word: /\w$/
    };

    function newTmplItem(options, parentItem, fn, data) {
        // Returns a template item data structure for a new rendered instance of a template (a 'template item').
        // The content field is a hierarchical array of strings and nested items (to be
        // removed and replaced by nodes field of dom elements, once inserted in DOM).
        var newItem = {
            data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
            _wrap: parentItem ? parentItem._wrap : null,
            tmpl: null,
            parent: parentItem || null,
            nodes: [],
            calls: tiCalls,
            nest: tiNest,
            wrap: tiWrap,
            html: tiHtml,
            update: tiUpdate
        };
        if(options) {
            $.extend(newItem, options, { nodes: [], parent: parentItem });
        }
        if(fn) {
            // Build the hierarchical content to be used during insertion into DOM
            newItem.tmpl = fn;
            newItem._ctnt = newItem._ctnt || $.isFunction(newItem.tmpl) && newItem.tmpl($, newItem) || fn;
            newItem.key = ++itemKey;
            // Keep track of new template item, until it is stored as $ Data on DOM element
            (stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
        }
        return newItem;
    }

    // Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
    $.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(name, original) {
        $.fn[ name ] = function(selector) {
            var ret = [], insert = $(selector), elems, i, l, tmplItems,
                parent = this.length === 1 && this[0].parentNode;

            appendToTmplItems = newTmplItems || {};
            if(parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1) {
                insert[ original ](this[0]);
                ret = this;
            } else {
                for(i = 0,l = insert.length; i < l; i++) {
                    cloneIndex = i;
                    elems = (i > 0 ? this.clone(true) : this).get();
                    $(insert[i])[ original ](elems);
                    ret = ret.concat(elems);
                }
                cloneIndex = 0;
                ret = this.pushStack(ret, name, insert.selector);
            }
            tmplItems = appendToTmplItems;
            appendToTmplItems = null;
            $.tmpl.complete(tmplItems);
            return ret;
        };
    });

    $.fn.extend({
        // Use first wrapped element as template markup.
        // Return wrapped set of template items, obtained by rendering template against data.
        tmpl: function(data, options, parentItem) {
            var ret = $.tmpl(this[0], data, options, parentItem);
            return ret;
        },

        // Find which rendered template item the first wrapped DOM element belongs to
        tmplItem: function() {
            var ret = $.tmplItem(this[0]);
            return ret;
        },

        // Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
        template: function(name) {
            var ret = $.template(name, this[0]);
            return ret;
        },

        domManip: function(args, table, callback, options) {
            if(args[0] && $.isArray(args[0])) {
                var dmArgs = $.makeArray(arguments), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
                while(i < elemsLength && !(tmplItem = $.data(elems[i++], "tmplItem"))) {
                }
                if(tmplItem && cloneIndex) {
                    dmArgs[2] = function(fragClone) {
                        // Handler called by oldManip when rendered template has been inserted into DOM.
                        $.tmpl.afterManip(this, fragClone, callback);
                    };
                }
                oldManip.apply(this, dmArgs);
            } else {
                oldManip.apply(this, arguments);
            }
            cloneIndex = 0;
            if(!appendToTmplItems) {
                $.tmpl.complete(newTmplItems);
            }
            return this;
        }
    });

    $.extend({
        // Return wrapped set of template items, obtained by rendering template against data.
        tmpl: function(tmpl, data, options, parentItem) {
            var ret, topLevel = !parentItem;
            if(topLevel) {
                // This is a top-level tmpl call (not from a nested template using {{tmpl}})
                parentItem = topTmplItem;
                tmpl = $.template[tmpl] || $.template(null, tmpl);
                wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
            } else if(!tmpl) {
                // The template item is already associated with DOM - this is a refresh.
                // Re-evaluate rendered template for the parentItem
                tmpl = parentItem.tmpl;
                newTmplItems[parentItem.key] = parentItem;
                parentItem.nodes = [];
                if(parentItem.wrapped) {
                    updateWrapped(parentItem, parentItem.wrapped);
                }
                // Rebuild, without creating a new template item
                return $(build(parentItem, null, parentItem.tmpl($, parentItem)));
            }
            if(!tmpl) {
                return []; // Could throw...
            }
            if(typeof data === "function") {
                data = data.call(parentItem || {});
            }
            if(options && options.wrapped) {
                updateWrapped(options, options.wrapped);
            }
            ret = $.isArray(data) ?
                $.map(data, function(dataItem) {
                    return dataItem ? newTmplItem(options, parentItem, tmpl, dataItem) : null;
                }) :
                [ newTmplItem(options, parentItem, tmpl, data) ];
            return topLevel ? $(build(parentItem, null, ret)) : ret;
        },

        // Return rendered template item for an element.
        tmplItem: function(elem) {
            var tmplItem;
            if(elem instanceof $) {
                elem = elem[0];
            }
            while(elem && elem.nodeType === 1 && !(tmplItem = $.data(elem,
                "tmplItem")) && (elem = elem.parentNode)) {
            }
            return tmplItem || topTmplItem;
        },

        // Set:
        // Use $.template( name, tmpl ) to cache a named template,
        // where tmpl is a template string, a script element or a $ instance wrapping a script element, etc.
        // Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

        // Get:
        // Use $.template( name ) to access a cached template.
        // Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
        // will return the compiled template, without adding a name reference.
        // If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
        // to $.template( null, templateString )
        template: function(name, tmpl) {
            if(tmpl) {
                // Compile template and associate with name
                if(typeof tmpl === "string") {
                    // This is an HTML string being passed directly in.
                    tmpl = buildTmplFn(tmpl)
                } else if(tmpl instanceof $) {
                    tmpl = tmpl[0] || {};
                }
                if(tmpl.nodeType) {
                    // If this is a template block, use cached copy, or generate tmpl function and cache.
                    tmpl = $.data(tmpl, "tmpl") || $.data(tmpl, "tmpl", buildTmplFn(tmpl.innerHTML));
                    // Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space.
                    // This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x.
                    // To correct this, include space in tag: foo="${ x }" -> foo="value of x"
                }
                return typeof name === "string" ? ($.template[name] = tmpl) : tmpl;
            }
            // Return named compiled template
            return name ? (typeof name !== "string" ? $.template(null, name) :
                ($.template[name] ||
                    // If not in map, treat as a selector. (If integrated with core, use quickExpr.exec)
                    $.template(null, name))) : null;
        },

        encode: function(text) {
            // Do HTML encoding replacing < > & and ' and " by corresponding entities.
            return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
        }
    });

    $.extend($.tmpl, {
        tag: {
            "tmpl": {
                _default: { $2: "null" },
                open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
                // tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
                // This means that {{tmpl foo}} treats foo as a template (which IS a function).
                // Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
            },
            "wrap": {
                _default: { $2: "null" },
                open: "$item.calls(__,$1,$2);__=[];",
                close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
            },
            "each": {
                _default: { $2: "$index, $value" },
                open: "if($notnull_1){$.each($1a,function($2){with(this){",
                close: "}});}"
            },
            "if": {
                open: "if(($notnull_1) && $1a){",
                close: "}"
            },
            "else": {
                open: "}else{"
            },
            "elif": {
                open: "}else if(($notnull_1) && $1a){"
            },
            "elseif": {
                open: "}else if(($notnull_1) && $1a){"
            },
            "html": {
                // Unecoded expression evaluation.
                open: "if($notnull_1){__.push($1a);}"
            },
            "=": {
                // Encoded expression evaluation. Abbreviated form is ${}.
                _default: { $1: "$data" },
                open: "if($notnull_1){__.push($.encode($1a));}"
            },
            "!": {
                // Comment tag. Skipped by parser
                open: ""
            }
        },

        // This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
        complete: function(items) {
            newTmplItems = {};
        },

        // Call this from code which overrides domManip, or equivalent
        // Manage cloning/storing template items etc.
        afterManip: function afterManip(elem, fragClone, callback) {
            // Provides cloned fragment ready for fixup prior to and after insertion into DOM
            var content = fragClone.nodeType === 11 ?
                $.makeArray(fragClone.childNodes) :
                fragClone.nodeType === 1 ? [fragClone] : [];

            // Return fragment to original caller (e.g. append) for DOM insertion
            callback.call(elem, fragClone);

            // Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by $.data.
            storeTmplItems(content);
            cloneIndex++;
        }
    });

    //========================== Private helper functions, used by code above ==========================

    function build(tmplItem, nested, content) {
        // Convert hierarchical content into flat string array
        // and finally return array of fragments ready for DOM insertion
        var frag, ret = content ? $.map(content, function(item) {
            return (typeof item === "string") ?
                // Insert template item annotations, to be converted to $.data( "tmplItem" ) when elems are inserted into DOM.
                (tmplItem.key ? item.replace(regex.template_anotate,
                    "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2") : item) :
                // This is a child template item. Build nested template.
                build(item, tmplItem, item._ctnt);
        }) :
            // If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}.
            tmplItem;
        if(nested) {
            return ret;
        }

        // top-level template
        ret = ret.join("");

        // Support templates which have initial or final text nodes, or consist only of text
        // Also support HTML entities within the HTML markup.
        ret.replace(regex.text_only_template, function(all, before, middle, after) {
            frag = $(middle).get();

            storeTmplItems(frag);
            if(before) {
                frag = unencode(before).concat(frag);
            }
            if(after) {
                frag = frag.concat(unencode(after));
            }
        });
        return frag ? frag : unencode(ret);
    }

    function unencode(text) {
        // Use createElement, since createTextNode will not render HTML entities correctly
        var el = document.createElement("div");
        el.innerHTML = text;
        return $.makeArray(el.childNodes);
    }

    // Generate a reusable function that will serve to render a template against data
    function buildTmplFn(markup) {
        var parse_tag = function(all, slash, type, fnargs, target, parens, args) {
            if(!type) {
                return "');__.push('";
            }

            var tag = $.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
            if(!tag && window.console && console.group) {
                console.group("Exception");
                console.error(markup);
                console.error('Unknown tag: ', type);
                console.error(all);
                console.groupEnd("Exception");
            }
            if(!tag) {
                return "');__.push('";
            }
            def = tag._default || [];
            if(parens && !regex.last_word.test(target)) {
                target += parens;
                parens = "";
            }
            if(target) {
                target = unescape(target);
                args = args ? ("," + unescape(args) + ")") : (parens ? ")" : "");
                // Support for target being things like a.toLowerCase();
                // In that case don't call with template item as 'this' pointer. Just evaluate...
                expr = parens ? (target.indexOf(".") > -1 ? target + unescape(parens) : ("(" + target + ").call($item" + args)) : target;
                exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
            } else {
                exprAutoFnDetect = expr = def.$1 || "null";
            }
            fnargs = unescape(fnargs);
            return "');" +
                tag[ slash ? "close" : "open" ]
                    .split("$notnull_1").join(target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true")
                    .split("$1a").join(exprAutoFnDetect)
                    .split("$1").join(expr)
                    .split("$2").join(fnargs || def.$2 || "") +
                "__.push('";
        };

        var depreciated_parse = function() {
            if($.tmpl.tag[arguments[2]]) {
                console.group("Depreciated");
                console.info(markup);
                console.info('Markup has old style indicators, use {% %} instead of {{ }}');
                console.info(arguments[0]);
                console.groupEnd("Depreciated");
                return parse_tag.apply(this, arguments);
            } else {
                return "');__.push('{{" + arguments[2] + "}}');__.push('";
            }
        };

        // Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
        // Introduce the data as local variables using with(){}
        var parsed_markup_data = "var $=$,call,__=[],$data=$item.data; with($data){__.push('";

        // Convert the template into pure JavaScript
        var parsed_markup = $.trim(markup);
        parsed_markup = parsed_markup.replace(regex.sq_escape, "\\$1");
        parsed_markup = parsed_markup.replace(regex.nl_strip, " ");
        parsed_markup = parsed_markup.replace(regex.shortcut_replace, "{%= $1%}");
        parsed_markup = parsed_markup.replace(regex.lang_parse,  parse_tag);
        parsed_markup = parsed_markup.replace(regex.old_lang_parse, depreciated_parse);
        parsed_markup_data += parsed_markup;

        parsed_markup_data += "');}return __;";

        return new Function("$", "$item", parsed_markup_data);
    }

    function updateWrapped(options, wrapped) {
        // Build the wrapped content.
        options._wrap = build(options, true,
            // Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
            $.isArray(wrapped) ? wrapped : [regex.html_expr.test(wrapped) ? wrapped : $(wrapped).html()]
        ).join("");
    }

    function unescape(args) {
        return args ? args.replace(regex.sq_unescape, "'").replace(regex.dq_unescape, "\\") : null;
    }

    function outerHtml(elem) {
        var div = document.createElement("div");
        div.appendChild(elem.cloneNode(true));
        return div.innerHTML;
    }

    // Store template items in $.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
    function storeTmplItems(content) {
        var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
        for(i = 0,l = content.length; i < l; i++) {
            if((elem = content[i]).nodeType !== 1) {
                continue;
            }
            elems = elem.getElementsByTagName("*");
            for(m = elems.length - 1; m >= 0; m--) {
                processItemKey(elems[m]);
            }
            processItemKey(elem);
        }
        function processItemKey(el) {
            var pntKey, pntNode = el, pntItem, tmplItem, key;
            // Ensure that each rendered template inserted into the DOM has its own template item,
            if((key = el.getAttribute(tmplItmAtt))) {
                while(pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute(tmplItmAtt))) {
                }
                if(pntKey !== key) {
                    // The next ancestor with a _tmplitem expando is on a different key than this one.
                    // So this is a top-level element within this template item
                    // Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
                    pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute(tmplItmAtt) || 0)) : 0;
                    if(!(tmplItem = newTmplItems[key])) {
                        // The item is for wrapped content, and was copied from the temporary parent wrappedItem.
                        tmplItem = wrappedItems[key];
                        tmplItem = newTmplItem(tmplItem, newTmplItems[pntNode] || wrappedItems[pntNode]);
                        tmplItem.key = ++itemKey;
                        newTmplItems[itemKey] = tmplItem;
                    }
                    if(cloneIndex) {
                        cloneTmplItem(key);
                    }
                }
                el.removeAttribute(tmplItmAtt);
            } else if(cloneIndex && (tmplItem = $.data(el, "tmplItem"))) {
                // This was a rendered element, cloned during append or appendTo etc.
                // TmplItem stored in $ data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
                cloneTmplItem(tmplItem.key);
                newTmplItems[tmplItem.key] = tmplItem;
                pntNode = $.data(el.parentNode, "tmplItem");
                pntNode = pntNode ? pntNode.key : 0;
            }
            if(tmplItem) {
                pntItem = tmplItem;
                // Find the template item of the parent element.
                // (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
                while(pntItem && pntItem.key != pntNode) {
                    // Add this element as a top-level node for this rendered template item, as well as for any
                    // ancestor items between this item and the item of its parent element
                    pntItem.nodes.push(el);
                    pntItem = pntItem.parent;
                }
                // Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
                delete tmplItem._ctnt;
                delete tmplItem._wrap;
                // Store template item as $ data on the element
                $.data(el, "tmplItem", tmplItem);
            }
            function cloneTmplItem(key) {
                key = key + keySuffix;
                tmplItem = newClonedItems[key] =
                    (newClonedItems[key] || newTmplItem(tmplItem,
                        newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent));
            }
        }
    }

    //---- Helper functions for template item ----

    function tiCalls(content, tmpl, data, options) {
        if(!content) {
            return stack.pop();
        }
        stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
    }

    function tiNest(tmpl, data, options) {
        // nested template, using {{tmpl}} tag
        return $.tmpl($.template(tmpl), data, options, this);
    }

    function tiWrap(call, wrapped) {
        // nested template, using {{wrap}} tag
        var options = call.options || {};
        options.wrapped = wrapped;
        // Apply the template, which may incorporate wrapped content,
        return $.tmpl($.template(call.tmpl), call.data, options, call.item);
    }

    function tiHtml(filter, textOnly) {
        var wrapped = this._wrap;
        return $.map(
            $($.isArray(wrapped) ? wrapped.join("") : wrapped).filter(filter || "*"),
            function(e) {
                return textOnly ?
                    e.innerText || e.textContent :
                    e.outerHTML || outerHtml(e);
            });
    }

    function tiUpdate() {
        var coll = this.nodes;
        $.tmpl(null, null, null, this).insertBefore(coll[0]);
        $(coll).remove();
    }
})(jQuery);

jQuery.noConflict();

jQuery(function ($) {
    var app = {},
        GROUP_ID = window.GROUP_ID;

    app.roulette = new $.Roulette({
        data: {
            groupId: GROUP_ID
        },
        element: $('#draw'),
        successCallback: function (response) {
            var _this = this;

            function showLosePopup() {
                var loseString = [
                    "<div class='popup-info'>",
                    "<h1>只有两手空空……</h1>",
                    "<h2>掐指一算，明天你会中奖哦！</h2>",
                    "</div>"
                ];

                $.Popup.setPopup({
                    width: 400,
                    domString: $(loseString.join(''))
                }, true);
            }

            function showWinPopup(prizeName) {
                var winString = [
                    "<div class='popup-info'>",
                    "<h1>恭喜您获得", prizeName , "！</h1>",
                    "<h2>请提供您的联系方式，以便我们发送中奖短信。</h2>",
                    "<input class='input' type='text' id='info-phone-number' maxlength='11'>",
                    "<button class='button' type='button' id='info-submit'>提交</button>",
                    "</div>"
                ];
                $.Popup.setPopup({
                    width: 400,
                    domString: winString.join('')
                }, true);
                $("#info-submit").on("click", function () {
                    var $this = $(this),
                        mobileNo = $.trim($("#info-phone-number").val());
                    if (/^1\d{10}$/.test(mobileNo)) {
                        _this.sendUserInfo(mobileNo, function () {
                            $this.off("click");
                            $.Popup.close();
                        });
                    }
                    else {
                        alert("请输入正确的手机号码哦！");
                    }
                });
            }

            switch (response.msg.prize.rank) {
                case 0:
                    showLosePopup();
                    break;
                default:
                    showWinPopup(response.msg.prize.prizeName);
                    break;
            }
        }
    });

    window.App = app;
});

jQuery(function ($) {
    if (window.storeList && window.storeList.length) {
        $.each(window.storeList, function () {
            var tmpl = $('#store-list-template').tmpl(this);
            $('#store-list').append(tmpl);
        });

        $(document).on('mouseenter', '.view-more', function () {
            $(this).next('.more-info').addClass('show');
        });
        $(document).on('mouseleave', '.view-more', function () {
            $(this).next('.more-info').removeClass('show');
        });

        $( '.carousel' ).carousel( {
            stepLength : 108
        } );
    }
});
