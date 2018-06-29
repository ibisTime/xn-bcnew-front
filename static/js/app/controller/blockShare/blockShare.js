define([
    'app/controller/base',
    'app/util/ajax',
], function(base, Ajax) {
	var code = base.getUrlParam("code")||"";
	$('.block-title').css('font-size','0.5rem');

    init();
    
    function init() {

		base.showLoading("加载中...")
		$.when(
			getBlockinfo()
		).then(function(){
			base.hideLoading()
		})

    }


	function getBlockinfo() {
        return Ajax.get("628616", {
			"code": code
		}).then(function (data) {
			var name = data.name;
			var description = data.description;
			$('.block-title').html(name);
			$('.block-description').html(description);
        })
    }



    });