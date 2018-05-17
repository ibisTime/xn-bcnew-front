define([
	'app/controller/base',
	'app/module/validate',
	'app/interface/NewsCtr',
	'app/interface/GeneralCtr',
	'app/module/qiniu',
	'Quill'
], function(base, Validate, NewsCtr, GeneralCtr, qiniu, Quill) {
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
			source: {},
			auther: {}
		},
		onkeyup: false
	});
	
	//重写字体
	var Size = Quill.import('attributors/style/size');
	// Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px'];
 	Size.whitelist = ['0.26rem', '0.31rem', '0.37rem', '0.41rem', '0.47rem', '0.52rem'];
 	Quill.register(Size, true);
 	
 	
 	
	var quill = new Quill('#editor', {
		theme: 'snow',
		modules: {
			toolbar: [
				[{ 'size': [false,'0.26rem', '0.31rem', '0.37rem', '0.41rem', '0.47rem', '0.52rem'] }],
				[{
					'header': [1, 2, 3, false],
				}],
				['bold', 'italic', 'underline'],
				['blockquote'],
				[{
					'align': []
				}],
				[{
					'color': []
				}, {
					'background': []
				}],
				['image']
			]
		}
	});
	
	//重写编辑器的图片预览方法
	var toolbar = quill.getModule('toolbar');
	toolbar.addHandler('image', function() {
		var fileInput = this.container.querySelector('input.ql-image[type=file]');
		if(fileInput == null) {
			fileInput = document.createElement('input');
			fileInput.setAttribute('type', 'file');
			fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
			fileInput.classList.add('ql-image');
			fileInput.addEventListener('change', function() {
				if(fileInput.files != null && fileInput.files[0] != null) {

					var Qiniu_UploadUrl = "http://upload-z2.qiniu.com";
					var xhr = new XMLHttpRequest();
					xhr.open('POST', Qiniu_UploadUrl, true);
					var formData = new FormData();
					var fileData = fileInput.files[0];
					var imgname = fileData.name.slice(0, fileData.name.lastIndexOf('.'));
					var suffix = fileData.name.slice(fileData.name.lastIndexOf('.') + 1);
					var key = imgname + '_' + new Date().getTime() + '.' + suffix;
					console.log(key)

					formData.append('key', key);
					formData.append('token', sessionStorage.getItem("qiniuToken"));
					formData.append('file', fileData);
					xhr.onreadystatechange = function(response) {
						if(xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
							var imageSrc = PIC_PREFIX + '/' + JSON.parse(xhr.responseText).key;

							var range = quill.getSelection(true);
							quill.insertEmbed(range.index, 'image', imageSrc);
							quill.setSelection(range.index + 1);

						} else if(xhr.status != 200 && xhr.responseText) {
							console.log("服务传输异常!!");
						}
					};
					xhr.send(formData);
				}
			});
			this.container.appendChild(fileInput);
		}
		fileInput.click();
	});
	
	
	
	init();

	function init() {
		if(!ownerId) {
			return;
		}
		$.when(
			initUpload(),
			getNewsType(),
		)

		addListener()
	}

	function addNews(params) {
		return NewsCtr.addNews(params).then(function(data) {});
	}

	//七牛
	function initUpload() {
		qiniu.getQiniuToken()
			.then((data) => {
				var token = data.uploadToken;
				sessionStorage.setItem("qiniuToken", data.uploadToken)
				qiniu.uploadInit({
					token: token,
					btnId: "uploadBtn",
					containerId: "uploadContainer",
					multi_selection: false,
					showUploadProgress: function(up, file) {
						$(".upload-progress").css("width", parseInt(file.percent, 10) + "%");
					},
					fileAdd: function(up, file) {
						$(".upload-progress-wrap").show();
					},
					fileUploaded: function(up, url, key) {
						$(".upload-progress-wrap").hide().find(".upload-progress").css("width", 0);
						$(".addAdvPic").addClass('hidden')
						$("#advPic").css("background-image", "url('" + url + "')");
						$('#advPic').attr('data-key', key)
					}
				});
			}, () => {})
	}

	function getNewsType() {
		return NewsCtr.getNewsType().then((data) => {
			var html = '';
			data.forEach((item) => {
				html += `<li data-code="${item.code}">${item.name}</li>`
			})
			$("#typeSelect ul").html(html)
		}, () => {})
	}

	function addListener() {
		//类型图标
		$("#typeBtn").click(function() {
			var _this = $(this);

			if(_this.hasClass("on")) {
				_this.removeClass("on")
				$("#typeSelect").addClass("hidden")
			} else {
				_this.addClass("on");
				$("#typeSelect").removeClass("hidden")
			}

		})

		//类型input
		$("#typeInput").click(function() {
			var _this = $("#typeBtn");

			if(_this.hasClass("on")) {
				_this.removeClass("on")
				$("#typeSelect").addClass("hidden")
			} else {
				_this.addClass("on");
				$("#typeSelect").removeClass("hidden")
			}

		})

		//类型下拉
		$("#typeSelect ul").on('click', 'li', function() {
			var _this = $(this);

			$("#typeName").val(_this.text())
			$("#type").val(_this.attr("data-code"))
			$("#typeBtn").click();
		})

		//类型遮罩层
		$("#typeSelect .mask").click(function() {
			$("#typeBtn").click();
		})

		//发布
		$("#submitBtn").click(function() {
			doSubmit();
		})
		
		$("#uploadBtn").click(function(){
			alert("点击")
		})
	}

	function doSubmit() {
		console.log(quill.container.firstChild.innerHTML)
		
		if(_formWrapper.valid()) {
			var params = _formWrapper.serializeObject()
			params.advPic = $('#advPic').attr('data-key');
			params.content = quill.container.firstChild.innerHTML;
			params.ownerId = ownerId;

			addNews(params)
		}

	}
});