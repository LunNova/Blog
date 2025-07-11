// bsky-comments.jsx - Bluesky Comments Module with JSX
// 
// Build with: swc compile bsky-comments.jsx -o bsky-comments.js
//
// Usage:
//   import BskyComments from './bsky-comments.js';
//   
//   const comments = new BskyComments(
//       'https://bsky.app/profile/did:plc:xyz/post/123',
//       document.getElementById('comments'),
//       { cssPath: '/path/to/comments.css' } // optional, defaults to '/comments.css'
//   );
//   
//   comments.render();
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
export var BskyComments = /*#__PURE__*/ function() {
    "use strict";
    function BskyComments(targetUrl, targetElement) {
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        _class_call_check(this, BskyComments);
        this.targetUrl = targetUrl;
        this.targetElement = targetElement;
        this.shadowRoot = null;
        this.cssPath = options.cssPath || '/comments.css';
        this.theme = options.theme || 'dark'; // 'light' or 'dark'
    }
    _create_class(BskyComments, [
        {
            key: "thumbnailify",
            value: function thumbnailify(avatarUrl) {
                if (avatarUrl) {
                    return avatarUrl.replace("img/avatar/plain", "img/avatar_thumbnail/plain");
                }
                return avatarUrl;
            }
        },
        {
            // Convert Bluesky URL to API URL
            key: "convertToApiUrl",
            value: function convertToApiUrl(bskyUrl) {
                // Extract the AT URI from the Bluesky URL
                var match = bskyUrl.match(/profile\/(did:[^\/]+)\/post\/([^\/\?]+)/);
                if (!match) {
                    throw new Error('Invalid Bluesky URL format');
                }
                var _match = _sliced_to_array(match, 3), did = _match[1], postId = _match[2];
                var atUri = "at://".concat(did, "/app.bsky.feed.post/").concat(postId);
                var encodedUri = encodeURIComponent(atUri);
                return "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=".concat(encodedUri);
            }
        },
        {
            // Format timestamp
            key: "formatTimestamp",
            value: function formatTimestamp(dateString) {
                var date = new Date(dateString);
                var options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                };
                return date.toLocaleDateString('en-US', options);
            }
        },
        {
            // Process text with facets (mentions, links, etc)
            key: "processTextWithFacets",
            value: function processTextWithFacets(text) {
                var facets = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
                if (!facets || facets.length === 0) return text;
                // Convert string to UTF-8 bytes for proper indexing
                var encoder = new TextEncoder();
                var decoder = new TextDecoder();
                var textBytes = encoder.encode(text);
                // Sort facets by index to process in order
                var sortedFacets = _to_consumable_array(facets).sort(function(a, b) {
                    return a.index.byteStart - b.index.byteStart;
                });
                var result = [];
                var lastEnd = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = sortedFacets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var facet = _step.value;
                        var start = facet.index.byteStart;
                        var end = facet.index.byteEnd;
                        // Add text before this facet
                        if (start > lastEnd) {
                            var beforeBytes = textBytes.slice(lastEnd, start);
                            result.push(decoder.decode(beforeBytes));
                        }
                        var facetBytes = textBytes.slice(start, end);
                        var facetText = decoder.decode(facetBytes);
                        // Process the facet based on its type
                        var processed = false;
                        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                        try {
                            for(var _iterator1 = facet.features[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                var feature = _step1.value;
                                if (feature.$type === 'app.bsky.richtext.facet#mention') {
                                    result.push(/*#__PURE__*/ h("a", {
                                        href: "https://bsky.app/profile/".concat(feature.did),
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        class: "mention"
                                    }, facetText));
                                    processed = true;
                                    break;
                                } else if (feature.$type === 'app.bsky.richtext.facet#link') {
                                    result.push(/*#__PURE__*/ h("a", {
                                        href: feature.uri,
                                        target: "_blank",
                                        rel: "noopener noreferrer"
                                    }, facetText));
                                    processed = true;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError1 = true;
                            _iteratorError1 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                    _iterator1.return();
                                }
                            } finally{
                                if (_didIteratorError1) {
                                    throw _iteratorError1;
                                }
                            }
                        }
                        // If no feature was processed, add the text as-is
                        if (!processed) {
                            result.push(facetText);
                        }
                        lastEnd = end;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                // Add any remaining text
                if (lastEnd < textBytes.length) {
                    var remainingBytes = textBytes.slice(lastEnd);
                    result.push(decoder.decode(remainingBytes));
                }
                return result.length > 0 ? result : text;
            }
        },
        {
            // Create comment element
            key: "createComment",
            value: function createComment(replyData) {
                var _this = this;
                var depth = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                var post = replyData.post || replyData; // Handle both reply objects and direct post objects
                var author = post.author, record = post.record, replyCount = post.replyCount, likeCount = post.likeCount, repostCount = post.repostCount, uri = post.uri, embed = post.embed;
                var text = (record === null || record === void 0 ? void 0 : record.text) || '';
                var facets = (record === null || record === void 0 ? void 0 : record.facets) || [];
                var recordEmbed = record === null || record === void 0 ? void 0 : record.embed;
                var timestamp = this.formatTimestamp((record === null || record === void 0 ? void 0 : record.createdAt) || '');
                var postId = uri.split('/').pop();
                var profileUrl = "https://bsky.app/profile/".concat(author.did);
                var postUrl = "https://bsky.app/profile/".concat(author.did, "/post/").concat(postId);
                // Process text with facets
                var processedText = this.processTextWithFacets(text, facets);
                // Use embed from post object (view version) or record object
                var embedToShow = embed || recordEmbed;
                // Check if there are any valid replies
                var validReplies = replyData.replies ? replyData.replies.filter(function(r) {
                    return r.post;
                }) : [];
                // Sort replies by date (oldest first - chronological)
                validReplies.sort(function(a, b) {
                    var _a_post_record, _b_post_record;
                    var dateA = new Date(((_a_post_record = a.post.record) === null || _a_post_record === void 0 ? void 0 : _a_post_record.createdAt) || a.post.indexedAt || 0);
                    var dateB = new Date(((_b_post_record = b.post.record) === null || _b_post_record === void 0 ? void 0 : _b_post_record.createdAt) || b.post.indexedAt || 0);
                    return dateA - dateB; // Oldest first
                });
                var hasReplies = validReplies.length > 0;
                // Count total nested replies
                var countAllReplies = function(replies) {
                    var count = 0;
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = replies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var reply = _step.value;
                            if (reply.post) {
                                count++;
                                if (reply.replies) {
                                    count += countAllReplies(reply.replies);
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                    return count;
                };
                var totalNestedReplies = hasReplies ? countAllReplies(validReplies) : 0;
                var startCollapsed = depth === 2 && hasReplies;
                return /*#__PURE__*/ h("div", {
                    class: "comment ".concat(startCollapsed ? 'collapsed' : ''),
                    "data-depth": depth
                }, /*#__PURE__*/ h("div", {
                    class: "comment-header"
                }, /*#__PURE__*/ h("a", {
                    href: profileUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "author-link"
                }, /*#__PURE__*/ h("img", {
                    src: this.thumbnailify(author.avatar) || '',
                    alt: author.handle,
                    class: "avatar"
                }), /*#__PURE__*/ h("span", {
                    class: "author-name"
                }, author.displayName || author.handle), /*#__PURE__*/ h("span", {
                    class: "author-handle"
                }, "@", author.handle))), /*#__PURE__*/ h("div", {
                    class: "comment-body"
                }, /*#__PURE__*/ h("div", {
                    class: "comment-text"
                }, processedText), embedToShow && function() {
                    var _embedToShow_record;
                    // Handle recordWithMedia type
                    if ((_embedToShow_record = embedToShow.record) === null || _embedToShow_record === void 0 ? void 0 : _embedToShow_record.record) {
                        var _record_value;
                        var record = embedToShow.record.record;
                        return /*#__PURE__*/ h("div", {
                            class: "embed-external"
                        }, /*#__PURE__*/ h("a", {
                            href: "https://bsky.app/profile/".concat(record.author.did, "/post/").concat(record.uri.split('/').pop()),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }, /*#__PURE__*/ h("div", {
                            class: "embed-title"
                        }, record.author.displayName || record.author.handle, /*#__PURE__*/ h("span", {
                            style: "color: #71717a; font-weight: normal; margin-left: 4px;"
                        }, "@", record.author.handle)), /*#__PURE__*/ h("div", {
                            style: "color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;"
                        }, ((_record_value = record.value) === null || _record_value === void 0 ? void 0 : _record_value.text) || '')));
                    } else if (embedToShow.record) {
                        var _embedToShow_record_author, _embedToShow_record_author1, _embedToShow_record_author2, _embedToShow_record_author3, _embedToShow_record_value;
                        return /*#__PURE__*/ h("div", {
                            class: "embed-external"
                        }, /*#__PURE__*/ h("a", {
                            href: "https://bsky.app/profile/".concat((_embedToShow_record_author = embedToShow.record.author) === null || _embedToShow_record_author === void 0 ? void 0 : _embedToShow_record_author.did, "/post/").concat(embedToShow.record.uri.split('/').pop()),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }, /*#__PURE__*/ h("div", {
                            class: "embed-title"
                        }, ((_embedToShow_record_author1 = embedToShow.record.author) === null || _embedToShow_record_author1 === void 0 ? void 0 : _embedToShow_record_author1.displayName) || ((_embedToShow_record_author2 = embedToShow.record.author) === null || _embedToShow_record_author2 === void 0 ? void 0 : _embedToShow_record_author2.handle) || 'Unknown', /*#__PURE__*/ h("span", {
                            style: "color: #71717a; font-weight: normal; margin-left: 4px;"
                        }, "@", ((_embedToShow_record_author3 = embedToShow.record.author) === null || _embedToShow_record_author3 === void 0 ? void 0 : _embedToShow_record_author3.handle) || 'unknown')), /*#__PURE__*/ h("div", {
                            style: "color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;"
                        }, ((_embedToShow_record_value = embedToShow.record.value) === null || _embedToShow_record_value === void 0 ? void 0 : _embedToShow_record_value.text) || embedToShow.record.text || '')));
                    } else if (embedToShow.external) {
                        return /*#__PURE__*/ h("div", {
                            class: "embed-external"
                        }, /*#__PURE__*/ h("a", {
                            href: embedToShow.external.uri,
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }, /*#__PURE__*/ h("div", {
                            class: "embed-title"
                        }, embedToShow.external.title), embedToShow.external.description && /*#__PURE__*/ h("div", {
                            class: "embed-description"
                        }, embedToShow.external.description), /*#__PURE__*/ h("div", {
                            class: "embed-url"
                        }, new URL(embedToShow.external.uri).hostname)));
                    }
                    return null;
                }(), /*#__PURE__*/ h("div", {
                    class: "comment-footer"
                }, /*#__PURE__*/ h("div", {
                    class: "footer-left"
                }, hasReplies && /*#__PURE__*/ h("button", {
                    class: "collapse-btn",
                    "aria-label": "Toggle thread",
                    "data-reply-count": totalNestedReplies
                }, startCollapsed ? "+ ".concat(totalNestedReplies, " ").concat(totalNestedReplies === 1 ? 'reply' : 'replies') : "− ".concat(totalNestedReplies, " ").concat(totalNestedReplies === 1 ? 'reply' : 'replies')), hasReplies && /*#__PURE__*/ h("span", {
                    class: "separator"
                }, "\xb7"), /*#__PURE__*/ h("a", {
                    href: postUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "timestamp"
                }, timestamp)), /*#__PURE__*/ h("div", {
                    class: "actions"
                }, /*#__PURE__*/ h("a", {
                    href: postUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "reply-btn"
                }, "↩ Reply"), /*#__PURE__*/ h("div", {
                    class: "stats"
                }, /*#__PURE__*/ h("span", {
                    class: "stat"
                }, "\uD83D\uDCAC ", replyCount || 0), /*#__PURE__*/ h("span", {
                    class: "stat"
                }, "\uD83D\uDD01 ", repostCount || 0), /*#__PURE__*/ h("span", {
                    class: "stat"
                }, "♥ ", likeCount || 0))))), hasReplies && /*#__PURE__*/ h("div", {
                    class: "replies-wrapper"
                }, /*#__PURE__*/ h("div", {
                    class: "replies"
                }, validReplies.map(function(reply) {
                    return _this.createComment(reply, depth + 1);
                }))));
            }
        },
        {
            // JSX to string helper
            key: "renderToString",
            value: function renderToString(jsx) {
                var _this = this;
                if (jsx === null || jsx === undefined || jsx === false) return '';
                if (typeof jsx === 'string' || typeof jsx === 'number') {
                    return this.escapeHtml(String(jsx));
                }
                if (Array.isArray(jsx)) {
                    return jsx.map(function(child) {
                        return _this.renderToString(child);
                    }).join('');
                }
                if ((typeof jsx === "undefined" ? "undefined" : _type_of(jsx)) === 'object' && jsx.type) {
                    var type = jsx.type, props = jsx.props;
                    var _ref = props || {}, children = _ref.children, attrs = _object_without_properties(_ref, [
                        "children"
                    ]);
                    var html = "<".concat(type);
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        // Add attributes
                        for(var _iterator = Object.entries(attrs)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var _step_value = _sliced_to_array(_step.value, 2), key = _step_value[0], value = _step_value[1];
                            if (value !== null && value !== undefined && value !== false) {
                                var attrName = key === 'class' ? 'class' : key;
                                html += " ".concat(attrName, '="').concat(this.escapeAttr(String(value)), '"');
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                    html += '>';
                    // Add children
                    if (children) {
                        html += this.renderToString(children);
                    }
                    // Close tag
                    html += "</".concat(type, ">");
                    return html;
                }
                return '';
            }
        },
        {
            // Escape HTML
            key: "escapeHtml",
            value: function escapeHtml(str) {
                var div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            }
        },
        {
            // Escape attribute values
            key: "escapeAttr",
            value: function escapeAttr(str) {
                return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            }
        },
        {
            key: "loadStyles",
            value: // Load CSS into shadow DOM
            function loadStyles() {
                var _this = this;
                return _async_to_generator(function() {
                    var link;
                    return _ts_generator(this, function(_state) {
                        link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = _this.cssPath;
                        _this.shadowRoot.appendChild(link);
                        // Return a promise that resolves when the CSS is loaded
                        return [
                            2,
                            new Promise(function(resolve, reject) {
                                link.onload = resolve;
                                link.onerror = function() {
                                    return reject(new Error("Failed to load ".concat(_this.cssPath)));
                                };
                            })
                        ];
                    });
                })();
            }
        },
        {
            // Setup event listeners
            key: "setupEventListeners",
            value: function setupEventListeners() {
                this.shadowRoot.addEventListener('click', function(e) {
                    // Handle collapse button clicks
                    if (e.target.classList.contains('collapse-btn')) {
                        var comment = e.target.closest('.comment');
                        var isCollapsed = comment.classList.contains('collapsed');
                        comment.classList.toggle('collapsed');
                        // Update button text
                        var replyCount = e.target.getAttribute('data-reply-count');
                        if (replyCount) {
                            var replyText = replyCount === '1' ? 'reply' : 'replies';
                            e.target.textContent = isCollapsed ? "− ".concat(replyCount, " ").concat(replyText) : "+ ".concat(replyCount, " ").concat(replyText);
                        }
                        e.stopPropagation();
                    }
                    // Handle clicking on expand banner or collapsed replies
                    var collapsedReplies = e.target.closest('.comment.collapsed .replies-wrapper');
                    if (collapsedReplies) {
                        var comment1 = e.target.closest('.comment');
                        if (comment1 && comment1.classList.contains('collapsed')) {
                            comment1.classList.remove('collapsed');
                            var btn = comment1.querySelector('.collapse-btn');
                            if (btn) {
                                var replyCount1 = btn.getAttribute('data-reply-count');
                                if (replyCount1) {
                                    var replyText1 = replyCount1 === '1' ? 'reply' : 'replies';
                                    btn.textContent = "− ".concat(replyCount1, " ").concat(replyText1);
                                }
                            }
                            e.stopPropagation();
                        }
                    }
                });
            }
        },
        {
            key: "render",
            value: // Fetch and render comments
            function render() {
                var _this = this;
                return _async_to_generator(function() {
                    var _mainPost_record, _mainPost_record1, _mainPost_record2, apiUrl, response, data, mainPost, postId, threadUrl, countComments, replies, totalComments, header, shadowContainer, commentsHtml, container, error, errorHeader, errorContainer;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                // Clear the target element
                                _this.targetElement.innerHTML = '';
                                _state.label = 1;
                            case 1:
                                _state.trys.push([
                                    1,
                                    5,
                                    ,
                                    6
                                ]);
                                // Convert URL and fetch data FIRST
                                apiUrl = _this.convertToApiUrl(_this.targetUrl);
                                return [
                                    4,
                                    fetch(apiUrl)
                                ];
                            case 2:
                                response = _state.sent();
                                if (!response.ok) {
                                    throw new Error("Failed to fetch comments: ".concat(response.status));
                                }
                                return [
                                    4,
                                    response.json()
                                ];
                            case 3:
                                data = _state.sent();
                                // Extract data needed for header
                                mainPost = data.thread.post;
                                postId = mainPost.uri.split('/').pop();
                                threadUrl = "https://bsky.app/profile/".concat(mainPost.author.did, "/post/").concat(postId);
                                // Count total comments recursively
                                countComments = function(replies) {
                                    var count = 0;
                                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                                    try {
                                        for(var _iterator = replies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                            var reply = _step.value;
                                            if (reply.post) {
                                                count++;
                                                if (reply.replies) {
                                                    count += countComments(reply.replies);
                                                }
                                            }
                                        }
                                    } catch (err) {
                                        _didIteratorError = true;
                                        _iteratorError = err;
                                    } finally{
                                        try {
                                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                                _iterator.return();
                                            }
                                        } finally{
                                            if (_didIteratorError) {
                                                throw _iteratorError;
                                            }
                                        }
                                    }
                                    return count;
                                };
                                replies = data.thread.replies || [];
                                totalComments = countComments(replies);
                                // Create and append the header OUTSIDE shadow DOM
                                header = document.createElement('div');
                                header.className = 'comments-header';
                                header.innerHTML = '\n                <h3 class="comments-title">\n                    '.concat(totalComments > 0 ? "".concat(totalComments, " ") : '', 'comments\n                    <a href="#bsky-comments" title="Copy link to this section">\uD83D\uDD17</a>\n                </h3>\n                <br>\n                via <a href="').concat(threadUrl, '" target="_blank" rel="noopener noreferrer">\n                    @').concat(mainPost.author.handle, "/post/").concat(postId, "\n                </a>\n            ");
                                _this.targetElement.appendChild(header);
                                // Create container for shadow DOM
                                shadowContainer = document.createElement('div');
                                _this.targetElement.appendChild(shadowContainer);
                                // Create shadow root in the container
                                _this.shadowRoot = shadowContainer.attachShadow({
                                    mode: 'open'
                                });
                                // Load CSS into shadow DOM
                                return [
                                    4,
                                    _this.loadStyles()
                                ];
                            case 4:
                                _state.sent();
                                // Sort top-level replies by date (oldest first)
                                replies.sort(function(a, b) {
                                    var _a_post_record, _b_post_record;
                                    if (!a.post || !b.post) return 0;
                                    var dateA = new Date(((_a_post_record = a.post.record) === null || _a_post_record === void 0 ? void 0 : _a_post_record.createdAt) || a.post.indexedAt || 0);
                                    var dateB = new Date(((_b_post_record = b.post.record) === null || _b_post_record === void 0 ? void 0 : _b_post_record.createdAt) || b.post.indexedAt || 0);
                                    return dateA - dateB;
                                });
                                // Render the comments
                                commentsHtml = _this.renderToString(/*#__PURE__*/ h("div", {
                                    class: "comments-container"
                                }, /*#__PURE__*/ h("div", {
                                    class: "root-post comment"
                                }, /*#__PURE__*/ h("div", {
                                    class: "root-post-header"
                                }, /*#__PURE__*/ h("a", {
                                    href: "https://bsky.app/profile/".concat(mainPost.author.did),
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    class: "author-link"
                                }, /*#__PURE__*/ h("img", {
                                    src: _this.thumbnailify(mainPost.author.avatar) || '',
                                    alt: mainPost.author.handle,
                                    class: "avatar-small"
                                }), /*#__PURE__*/ h("span", {
                                    class: "author-name"
                                }, mainPost.author.displayName || mainPost.author.handle), /*#__PURE__*/ h("span", {
                                    class: "author-handle"
                                }, "@", mainPost.author.handle))), /*#__PURE__*/ h("div", {
                                    class: "root-post-content"
                                }, _this.processTextWithFacets(((_mainPost_record = mainPost.record) === null || _mainPost_record === void 0 ? void 0 : _mainPost_record.text) || '', ((_mainPost_record1 = mainPost.record) === null || _mainPost_record1 === void 0 ? void 0 : _mainPost_record1.facets) || [])), (mainPost.embed || ((_mainPost_record2 = mainPost.record) === null || _mainPost_record2 === void 0 ? void 0 : _mainPost_record2.embed)) && function() {
                                    var _mainPost_record, _embed_record;
                                    var embed = mainPost.embed || ((_mainPost_record = mainPost.record) === null || _mainPost_record === void 0 ? void 0 : _mainPost_record.embed);
                                    // Handle recordWithMedia type
                                    if ((_embed_record = embed.record) === null || _embed_record === void 0 ? void 0 : _embed_record.record) {
                                        var _record_value;
                                        var record = embed.record.record;
                                        return /*#__PURE__*/ h("div", {
                                            class: "embed-external"
                                        }, /*#__PURE__*/ h("a", {
                                            href: "https://bsky.app/profile/".concat(record.author.did, "/post/").concat(record.uri.split('/').pop()),
                                            target: "_blank",
                                            rel: "noopener noreferrer"
                                        }, /*#__PURE__*/ h("div", {
                                            class: "embed-title"
                                        }, record.author.displayName || record.author.handle, /*#__PURE__*/ h("span", {
                                            style: "color: #71717a; font-weight: normal; margin-left: 4px;"
                                        }, "@", record.author.handle)), /*#__PURE__*/ h("div", {
                                            style: "color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;"
                                        }, ((_record_value = record.value) === null || _record_value === void 0 ? void 0 : _record_value.text) || '')));
                                    } else if (embed.record) {
                                        var _embed_record_author, _embed_record_author1, _embed_record_author2, _embed_record_author3, _embed_record_value;
                                        return /*#__PURE__*/ h("div", {
                                            class: "embed-external"
                                        }, /*#__PURE__*/ h("a", {
                                            href: "https://bsky.app/profile/".concat((_embed_record_author = embed.record.author) === null || _embed_record_author === void 0 ? void 0 : _embed_record_author.did, "/post/").concat(embed.record.uri.split('/').pop()),
                                            target: "_blank",
                                            rel: "noopener noreferrer"
                                        }, /*#__PURE__*/ h("div", {
                                            class: "embed-title"
                                        }, ((_embed_record_author1 = embed.record.author) === null || _embed_record_author1 === void 0 ? void 0 : _embed_record_author1.displayName) || ((_embed_record_author2 = embed.record.author) === null || _embed_record_author2 === void 0 ? void 0 : _embed_record_author2.handle) || 'Unknown', /*#__PURE__*/ h("span", {
                                            style: "color: #71717a; font-weight: normal; margin-left: 4px;"
                                        }, "@", ((_embed_record_author3 = embed.record.author) === null || _embed_record_author3 === void 0 ? void 0 : _embed_record_author3.handle) || 'unknown')), /*#__PURE__*/ h("div", {
                                            style: "color: #a1a1aa; font-size: 0.85rem; margin-bottom: 0.25rem; line-height: 1.4;"
                                        }, ((_embed_record_value = embed.record.value) === null || _embed_record_value === void 0 ? void 0 : _embed_record_value.text) || embed.record.text || '')));
                                    }
                                    return null;
                                }(), /*#__PURE__*/ h("div", {
                                    class: "root-post-footer"
                                }, /*#__PURE__*/ h("a", {
                                    href: threadUrl,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    class: "reply-button"
                                }, "↩ Reply on Bluesky"))), /*#__PURE__*/ h("div", {
                                    class: "comment-thread"
                                }, replies.length > 0 ? replies.filter(function(reply) {
                                    return reply.post;
                                }).map(function(reply) {
                                    return _this.createComment(reply, 0);
                                }) : /*#__PURE__*/ h("div", {
                                    class: "no-comments"
                                }, "No comments yet."))));
                                // Add comments to shadow DOM
                                container = document.createElement('div');
                                container.innerHTML = commentsHtml;
                                _this.shadowRoot.appendChild(container.firstElementChild);
                                // Setup event listeners
                                _this.setupEventListeners();
                                return [
                                    3,
                                    6
                                ];
                            case 5:
                                error = _state.sent();
                                console.error('Error loading comments:', error);
                                // Create error header if not already created
                                if (!_this.targetElement.querySelector('.comments-header')) {
                                    errorHeader = document.createElement('div');
                                    errorHeader.className = 'comments-header';
                                    errorHeader.innerHTML = '<h3 class="comments-title">Comments</h3>';
                                    _this.targetElement.appendChild(errorHeader);
                                }
                                // Show error message
                                errorContainer = document.createElement('div');
                                errorContainer.innerHTML = '\n                <div class="error" style="padding: 20px; color: #dc3545;">\n                    Failed to load comments: '.concat(error.message, "\n                </div>\n            ");
                                _this.targetElement.appendChild(errorContainer);
                                return [
                                    3,
                                    6
                                ];
                            case 6:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return BskyComments;
}();
// JSX pragma
function h(type, props) {
    for(var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        children[_key - 2] = arguments[_key];
    }
    return {
        type: type,
        props: _object_spread_props(_object_spread({}, props), {
            children: children.length > 1 ? children : children[0]
        })
    };
}
// Export for use as a module
export default BskyComments;
