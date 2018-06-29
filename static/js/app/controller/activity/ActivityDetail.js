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
        	getActivityDetail(),
        	getAndroidUrl(),
        	getIosUrl()
        )
    	
        addListener()
    }
    
    //查询资讯详情
    function getActivityDetail() {
    	return GeneralCtr.getActivityDetail(code).then(function(data) {
    		$("title").html(data.title+"-活动详情")
    		$("#advPic").css({"background-image":"url('"+base.getImg(data.advPic,'?imageMogr2/auto-orient/thumbnail/!1500x720r')+"')"})
    		$("#title").text(data.title);
    		$("#readCount").text(data.readCount)
    		$("#price").text('￥'+data.price)
    		$("#time").text(base.formatDate(data.startDatetime,'yyyy-dd-MM hh:ss:mm')+'-'+base.formatDate(data.endDatetime,'yyyy-dd-MM hh:ss:mm'));
    		$("#address").text(data.address);
    		$("#mobile").text(data.contactMobile);
    		$("#content").html(data.content);
    		
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
