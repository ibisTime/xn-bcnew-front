define([
    'app/util/dialog',
    'app/util/cookie',
    'app/module/loading',
    'app/util/ajax'
], function(dialog, CookieUtil, loading, Ajax) {

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };
    
    //给form表单赋值
    $.fn.setForm = function(jsonValue) {  
	    var obj=this;  
	    $.each(jsonValue, function (name, ival) { 
	    	if(obj.find("#" + name).length){
	    		var $oinput = obj.find("#" + name);
	    		if ($oinput.attr("type")== "radio" || $oinput.attr("type")== "checkbox"){  
		            $oinput.each(function(){  
		                if(Object.prototype.toString.apply(ival) == '[object Array]'){//是复选框，并且是数组  
		                    for(var i=0;i<ival.length;i++){  
		                        if($(this).val()==ival[i])  
		                        $(this).attr("checked", "checked");  
		                    }  
		                }else{  
		                    if($(this).val()==ival){
		                        $(this).attr("checked", "checked")
		                    };
		                }  
		            });  
		        }else if($oinput.attr("type")== "textarea"){//多行文本框  
		            obj.find("[name="+name+"]").html(ival);  
		        }else{
		        	if($oinput.attr("data-format")){ //需要格式化的日期 如:data-format="yyyy-MM-dd"
		        		obj.find("[name="+name+"]").val(Base.formatDate(ival,$oinput.attr("data-format")));   
		        	}else if($oinput.attr("data-amount")){ //需要格式化的日期 如:data-format="yyyy-MM-dd"
		        		obj.find("[name="+name+"]").val(Base.formatMoney(ival));   
		        	}else{
		        		obj.find("[name="+name+"]").val(ival);   
		        	}
		        }  
	    	}
	   });  
	};
    
    var Base = {
        // simple encrypt information with ***
        encodeInfo: function(info, headCount, tailCount, space) {
            headCount = headCount || 0;
            tailCount = tailCount || 0;
            info = info.trim();
            var header = info.slice(0, headCount),
                len = info.length,
                tailer = info.slice(len - tailCount),
                mask = '**************************************************', // allow this length
                maskLen = len - headCount - tailCount;
            if (space) {
                mask = '**** **** **** **** **** **** **** **** **** **** **** ****';
            }
            return maskLen > 0
                ? (header + mask.substring(0, maskLen + (space
                    ? maskLen / 4
                    : 0)) + (space
                    ? ' '
                    : '') + tailer)
                : info;
        },
        formatDate: function(date, format) {
            if (!date)
                return "--";

            return new Date(date).format(format||'yyyy-dd-MM');
        },
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null)
                return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        showMsg: function(msg, time) {
            var d = dialog({content: msg, quickClose: true});
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 1500);
        },

        //判断密码强度
        calculateSecurityLevel: function(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                    strength_M++;
                    // 特殊符号
                } else if ((code >= 32 && code <= 47) || (code >= 58 && code <= 64) || (code >= 94 && code <= 96) || (code >= 123 && code <= 126)) {
                    strength_H++;
                }
            }
            // 弱
            if ((strength_L == 0 && strength_M == 0) || (strength_L == 0 && strength_H == 0) || (strength_M == 0 && strength_H == 0)) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        getUserId: function() {
            return sessionStorage.getItem("userId") || "";
        },
        setSessionUser: function(data) {
            sessionStorage.setItem("userId", data.userId);
            sessionStorage.setItem("token", data.token);
        },
        setSessionQiniuUrl: function(data) {
            CookieUtil.set("qiniuUrl", data);
        },
        clearSessionUser: function() {
            sessionStorage.removeItem("userId"); //userId
            sessionStorage.removeItem("token"); //token
            sessionStorage.removeItem("qiniuUrl"); //qiniuUrl
        },
        isLogin: function() {
            return !!Base.getUserId();
        },
        getDomain: function() {
            return location.origin;
        },
        goLogin: function() {
            sessionStorage.setItem("l-return", location.pathname + location.search);
            location.href = "../user/redirect.html";
        },
        throttle: function(method, context, t) {
            var tt = t || 100;
            clearTimeout(method.tId);
            method.tId = setTimeout(function() {
                method.call(context);
            }, tt)
        },
        // 获取图片
        getImg: function(pic, suffix) {
            if (!pic) {
                return "";
            }
            if (pic) {
                pic = pic.split(/\|\|/)[0];
            }
            if (!/^http/i.test(pic)) {
                suffix = suffix || '?imageMogr2/auto-orient/interlace/1';
                pic = PIC_PREFIX + pic + suffix;
            }
            return pic
        },
        getAvatar: function(pic) {
            if(!pic) {
                return "/static/images/avatar.png";
            }
            return Base.getImg(pic, "?imageMogr2/auto-orient/interlace/1");
        },
        getWXAvatar: function(pic){
            if(!pic) {
                return "/static/images/avatar.png";
            }
            return Base.getImg(pic, "?imageMogr2/auto-orient/thumbnail/!65x65r");
        },
        // 获取分享的图片
        getShareImg: function(pic) {
            if (!pic) {
                return location.origin + '/static/images/share.png';
            }
            return Base.getImg(pic);
        },
        formatMoney: function(s) {
            if (!$.isNumeric(s))
                return "--";
            s = (+s / 1000).toString();
            s = s.replace(/(\.\d\d)\d+/ig, "$1");
            return parseFloat(s).toFixed(2);
        },
        // 模糊银行卡
        getBankCard: function(card) {
            if (!card)
                return "";
            if (card.length == 16) {
                card = "**** **** **** " + card.substr(12);
            } else if (card.length == 19) {
                card = "**** **** **** **** " + card.substr(16);
            }
            return card;
        },
        //判断终端
        getUserBrowser:function(){
        	var browser = {
                versions: function() {
                    var u = navigator.userAgent, app = navigator.appVersion;
                    return {//移动终端浏览器版本信息
                        trident: u.indexOf('Trident') > -1, //IE内核
                        presto: u.indexOf('Presto') > -1, //opera内核
                        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                        mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                        iPad: u.indexOf('iPad') > -1, //是否iPad
                        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                    };
                }(),
                language: (navigator.browserLanguage || navigator.language).toLowerCase()
            }
 
            if (browser.versions.ios || browser.versions.iPhone || browser.versions.iPad) {//ios
            	return 'ios';
            }else{//android
            	return 'android';
            }
        },
        //判断是否是微信
		is_weixn:function (){ 
			var ua = navigator.userAgent.toLowerCase(); 
			if(ua.match(/MicroMessenger/i)=="micromessenger") { 
				return true; 
			} else { 
				return false; 
			} 
		},
        // 确认框
        confirm: function(msg, cancelValue, okValue) {
            return (new Promise(function(resolve, reject) {
                var d = dialog({
                    content: msg,
                    ok: function() {
                        var that = this;
                        setTimeout(function() {
                            that.close().remove();
                        }, 1000);
                        resolve();
                        return true;
                    },
                    cancel: function() {
                        reject()
                        return true;
                    },
                    cancelValue: cancelValue || "取消",
                    okValue: okValue || "确认"
                });
                d.showModal();
            }));

        },
        // 显示loading
        showLoading: function(msg, hasBottom) {
            loading.createLoading(msg, hasBottom);
        },
        // 隐藏loading
        hideLoading: function() {
            loading.hideLoading();
        },
        // 清除内容里的标签
        clearTag: function(content) {
            return content.replace(/<[^>]+>|<\/[^>]+>|<[^>]+\/>|&nbsp;/ig, "");
        },
        encode: function(str) {
            if (!str || str.length === 0) {
                return '';
            }
            var s = '';
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/<(?=[^o][^)])/g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br>");
            return s;
        },
    };
    return Base;
});
