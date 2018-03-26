define([
    'app/controller/base',
    'app/interface/GeneralCtr',
], function(base, GeneralCtr) {
	var code = base.getUrlParam("code")||"";
	var androidUpdateUrl,iosUpdateUrl;
    
    init();
    
    function init(){
    	if(!code){
    		base.showMsg("code为空!")
    		return ;
    	}
        base.showLoading();
        $.when(
        	getNewsDetail(),
        	getAndroidUrl(),
        	getIosUrl()
        )
    	
        addListener()
    }
    
    //查询资讯详情
    function getNewsDetail() {
    	return GeneralCtr.getNewsDetail(code).then(function(data) {
    		$("title").html(data.title+"-资讯详情")
    		$(".news-wrap .title").html(data.title);
    		$(".news-wrap .auther").html(data.auther);
    		$(".news-wrap .source").html(data.source);
    		$(".news-wrap .showDatetime").html(base.formatDate(data.showDatetime,'yyyy-dd-MM hh:ss:mm'));
    		$(".news-wrap .content").html(data.content);
    		
    		base.hideLoading();
    	});
    }
    
    function getAndroidUrl(){
		return GeneralCtr.getSysConfigType("android-c").then(function(data) {
        	androidUpdateUrl = data.downloadUrl;
	    }, function() {
	        base.showMsg("获取安卓下载地址失败");
	    });
	}
	
	function getIosUrl(){
		return GeneralCtr.getSysConfigType("ios-c").then(function(data) {
    		iosUpdateUrl = data.downloadUrl;
	    }, function() {
	        base.showMsg("获取ios下载地址失败");
	    });
	}
    
    function addListener(){
		$("#downloadBtn").click(function(){
			if(base.getUserBrowser()=="ios"){
				if(iosUpdateUrl!=""&&iosUpdateUrl){
					window.location.href = iosUpdateUrl;
				}else{
					base.confirm("当前iPhone版尚未上线，敬请期待！").then(function(){},function(){})
				}
			}else{
				if(androidUpdateUrl!=""&&androidUpdateUrl){
					if(base.is_weixn()){
						$(".download-mask").removeClass("hidden")
					}else{
						window.location.href = androidUpdateUrl;
					}
				}else{
					base.confirm("当前android版尚未上线，敬请期待！").then(function(){},function(){})
				}
			}
		})
		
		$(".download-mask").click(function(){
			$(".upload-mask").addClass("hidden")
		})
    }
});
