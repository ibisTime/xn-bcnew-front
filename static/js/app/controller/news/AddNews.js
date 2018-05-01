define([
    'app/controller/base',
  	'app/module/validate',
    'app/interface/NewsCtr',
    'app/interface/GeneralCtr',
    'app/module/qiniu',
], function(base, Validate, NewsCtr, GeneralCtr, qiniu) {
	var ownerId = base.getUrlParam("ownerId");
    var _formWrapper = $("#formWrapper");
    _formWrapper.validate({
        'rules': {
            title: {
                required: true,
            },
            typeName: {
                required: true,
            },
            source: {
            },
            auther: {
            }
        },
        onkeyup: false
    });
//  
    init();
    
    function init(){
    	if(!ownerId){
    		return ;
    	}
		$.when(
			initUpload(),
			getNewsType(),
		)
        addListener()
    }
    
    function addNews(params){
		return NewsCtr.addNews(params).then(function(data) {
	    });
	}
    
    //七牛
	function initUpload(){
		qiniu.getQiniuToken()
			.then((data) =>{
				var token = data.uploadToken;
				sessionStorage.setItem("qiniuToken",data.uploadToken)
				qiniu.uploadInit({
					token: token,
					btnId: "uploadBtn",
					containerId: "uploadContainer",
					multi_selection: false,
					showUploadProgress: function(up, file){
						$(".upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file){
						$(".upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key){
						$(".upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						$(".addAdvPic").addClass('hidden')
						$("#advPic").css("background-image", "url('"+url+"')");
						$('#advPic').attr('data-key',key)
					}
				});
			}, () => {})
	}
	
	function getNewsType(){
		return NewsCtr.getNewsType().then((data)=>{
			var html = '';
			data.forEach((item)=>{
				html+=`<li data-code="${item.code}">${item.name}</li>`
			})
			$("#typeSelect ul").html(html)
		}, () => {})
	}
	
    function addListener(){
    	//类型图标
    	$("#typeBtn").click(function(){
    		var _this = $(this);
    		
    		if(_this.hasClass("on")){
    			_this.removeClass("on")
    			$("#typeSelect").addClass("hidden")
    		}else{
    			_this.addClass("on");
    			$("#typeSelect").removeClass("hidden")
    		}
    		
    	})
    	
    	//类型input
    	$("#typeInput").click(function(){
    		var _this = $("#typeBtn");
    		
    		if(_this.hasClass("on")){
    			_this.removeClass("on")
    			$("#typeSelect").addClass("hidden")
    		}else{
    			_this.addClass("on");
    			$("#typeSelect").removeClass("hidden")
    		}
    		
    	})
    	
    	//类型下拉
    	$("#typeSelect ul").on('click','li',function(){
    		var _this = $(this);
    		
    		$("#typeName").val(_this.text())
    		$("#type").val(_this.attr("data-code"))
			$("#typeBtn").click();
    	})
    	
    	//类型遮罩层
    	$("#typeSelect .mask").click(function(){
			$("#typeBtn").click();
    	})
    	
    	//发布
    	$("#submitBtn").click(function(){
			doSubmit();
    	})
    }
    
    function doSubmit(){
    	var content = $("#content").val().replace(/\ +/g,"").replace(/[\r\n]/g,"");//去掉空格  回车换行
    	if(content==""){
    		$("#contentError").removeClass("hidden")
    	}else{
    		$("#contentError").addClass("hidden")
    	}
		if(_formWrapper.valid()&&content!==""){
			if(!$('#advPic').attr('data-key')){
				base.showMsg('请上传广告图');
				return ;
			}
			var params = _formWrapper.serializeObject()
			params.advPic = $('#advPic').attr('data-key');
			params.content = $("#content").val();
			params.ownerId = ownerId;
			
			addNews(params)
		}
    	
    	
	}
});
