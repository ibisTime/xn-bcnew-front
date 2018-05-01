define([
    'app/controller/base',
    'app/interface/NewsCtr',
    'app/interface/GeneralCtr',
], function(base, NewsCtr, GeneralCtr) {
	var ownerId = base.getUrlParam("ownerId") ;
    
    init();
    
    function init(){
//  	if(!ownerId){
//  		return ;
//  	}
//      base.showLoading();
        addListener()
    }
    
    function addNews(params){
		return NewsCtr.addNews(params).then(function(data) {
			base.hideLoading()
	    });
	}
    
    //改函数要求浏览器必须要支持html5  
    function jsJustUpload(f, token) {  
        var Qiniu_UploadUrl = "http://upload-z2.qiniu.com";  
        var xhr = new XMLHttpRequest();  
        xhr.open('POST', Qiniu_UploadUrl, true);  
        var formData= new FormData();  
        var imgname = f.name.slice(0,f.name.lastIndexOf('.'));
        var suffix = f.name.slice(f.name.lastIndexOf('.') + 1);
        var key =  imgname+'_'+new Date().getTime()+'.'+suffix;
        console.log(key)
        
        formData.append('key', key);  
        formData.append('token', token);  
        formData.append('file', f);  
        xhr.onreadystatechange = function(response) {  
            if (xhr.readyState == 4 && xhr.status == 200&& xhr.responseText != "") {  
                var blkRet = JSON.parse(xhr.responseText);  
                $("#dialog").html("复制连接直接访问_:http://p6aev1fk1.bkt.clouddn.com/" + blkRet.key);  
            } else if (xhr.status != 200 && xhr.responseText) {  
                console.log("服务传输异常!!");  
            }  
        };  
        xhr.send(formData);  
    }  
    function test() {  
    	GeneralCtr.getQiniuToken().then(function(data){
    		var f = $("#file")[0].files[0];  
	        var token = data.uploadToken;  
	        jsJustUpload(f, token);  
			
    	})
    }  
    
    function addListener(){
    	$("#btn_upload").on('click',function(){
    		test();
    	})
    }
    
});
