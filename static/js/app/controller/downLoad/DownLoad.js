define([
    'app/controller/base',
    'app/interface/GeneralCtr',
], function(base, GeneralCtr) {
	var androidUpdateUrl,iosUpdateUrl;
    
    init();
    
    function init(){
        base.showLoading();
        $.when(
        	getAndroidUrl(),
        	getIosUrl()
        )
    	
        addListener()
    }
    
    function getAndroidUrl(){
		return GeneralCtr.getSysConfigType("android-c").then(function(data) {
			base.hideLoading()
        	androidUpdateUrl = data.downloadUrl;
	    }, function() {
	    	base.hideLoading()
	        base.showMsg("获取安卓下载地址失败");
	    });
	}
	
	function getIosUrl(){
		return GeneralCtr.getSysConfigType("ios-c").then(function(data) {
			base.hideLoading()
    		iosUpdateUrl = data.downloadUrl;
	    }, function() {
	    	base.hideLoading()
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
