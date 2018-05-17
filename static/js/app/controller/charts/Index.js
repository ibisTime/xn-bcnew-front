define([
	'app/controller/base',
	'app/interface/MarketCtr',
	'echarts'
], function(base, MarketCtr, echarts) {
	var symbolVal = base.getUrlParam("symbol") || "btcusdt", //交易对
		exchange = base.getUrlParam("exchange") || "huobiPro", //交易所
		period = base.getUrlParam("period") || "15min", //周期

		isfull = base.getUrlParam("isfull") || '0'; //是否全屏 0缩小 1全屏

	var config = {
		symbol: symbolVal,
		exchange: exchange,
		period: period,
		size: "1000"
	};
	var timeFormat = { //x轴数据格式化格式
		"1min": "hh:mm",
		"5min": "hh:mm",
		"15min": "hh:mm",
		"30min": "hh:mm",
		"60min": "hh:mm",
		"1day": "yyyy-MM-dd",
		"1week": "yyyy-MM-dd",
		"1mon": "yyyy-MM-dd",
		"1year": "yyyy-MM-dd",
	};
	// 颜色
	var colorStyle = 'white'; // 颜色默认
	var colorStyleData = {
		"black": {
			upColor: "#45bb40",
			downColor: "#cc1414",
			borderColor: "#24292f",
			borderOpacity: "0.9"
		},
		"white": {
			upColor: "#1fc07d",
			downColor: "#ff5757",
			borderColor: "#eee",
			borderOpacity: "0.3"
		},
	}

	$("#chart").height($(".echarts-wrap").height() - $(".nav-wrap").height())
	var myChart = echarts.init(document.getElementById('chart'));
	var chartOption = {};
	var option = {};
	
	init();

	function init() {
		base.showLoading();
		if(isfull == '1') {
			$("#fullBtn").addClass("on")
		}
		$("#timeChoose ." + period).addClass('on')
		getSizeCandlestick();
		addListener();
	}

	function getSizeCandlestick(refresh) {
		return MarketCtr.getSizeCandlestick(config).then((data) => {
			option = {
				date: [],
				dateFormatDate: [],
				kValues: [],
				volumes: [],
				MAData: [],
				BOLLData: []
			};
			if(data.t.length) {
				data.t.forEach((item) => {
					option.date.push(base.formatDate(item * 1000, timeFormat[config.period]));
					option.dateFormatDate.push(base.formatDate(item * 1000, 'yyyy-MM-dd hh:ss'));
				})
			}
			if(data.v.length) {
				data.v.forEach((item) => {
					option.volumes.push(item);
				})
			}
			for(var i = 0; i < data.o.length; i++) {
				var tmpl = [];
				tmpl.push(data.o[i])
				tmpl.push(data.c[i])
				tmpl.push(data.l[i])
				tmpl.push(data.h[i])
				option.kValues.push(tmpl);
				option.MAData.push(data.o[i]);
				option.BOLLData.push(data.c[i]);
			}
			var lastIndex = data.t.length-1;
			var html = option.dateFormatDate[lastIndex] + ' 开:'+data.o[lastIndex]+' 高:'+data.h[lastIndex]+' 低:'+data.l[lastIndex]+' 收:'+data.c[lastIndex];
			$("#candlestickVal").html(html);
			option.MAData.reverse();
			option.BOLLData.reverse();
			
			setChart(refresh);
			base.hideLoading();
		})
	}

	function setChart(refresh, setIndex) {
		var indexVal = setIndex || 'ma';
		var setIndexOption = {
			"ma": {
				name: 'MA',
				type: 'line',
				data: option.MAData,
				showSymbol: false,
				lineStyle: {
					color: "#d3217b",
					width: 0.5
				},
			},
			"boll": {
				name: 'BOLL',
				type: 'line',
				data: option.BOLLData,
				showSymbol: false,
				lineStyle: {
					color: "#f4ea29",
					width: 0.5
				},
			},
		}

		chartOption = {
			animation: false,
			legend: {
				show: false
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					label: {
						show: false,
					}
				},
				confine: true,
				formatter: function(params) {
					if(params[0].componentSubType=='candlestick'){
						var param = params[0].data;
						var dateFormatDate = option.dateFormatDate[param[0]]
						var html = dateFormatDate +' 开:'+param[1]+' 高:'+param[4]+' 低:'+param[3]+' 收:'+param[2];
						$("#candlestickVal").html(html);
					}
	            } 
			},
			axisPointer: {
				link: {
					xAxisIndex: 'all'
				},
				label: {
					show: false,
				}
			},
			toolbox: {
				show: false
			},
			brush: {
				xAxisIndex: 'all',
				brushLink: 'all',
				outOfBrush: {
					colorAlpha: 0.1
				}
			},
			grid: [{
					left: '2%',
					right: '15%',
					top: '5%',
					height: $("body").height()<$("body").width()?'60%':'64%'
				},
				{
					left: '2%',
					right: '15%',
					top: $("body").height()<$("body").width()?'66%':'70%',
					height: '18%'
				}
			],
			xAxis: [{
					type: 'category',
					data: option.date,
					scale: true,
					axisLine: {
						onZero: false,
						lineStyle: {
							color: colorStyleData[colorStyle].borderColor,
							opacity: colorStyleData[colorStyle].borderOpacity
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					},
					axisLabel: {
						show: false
					},
					splitNumber: 20,
					inverse: true,
				},
				{
					type: 'category',
					gridIndex: 1,
					data: option.date,
					scale: true,
					boundaryGap: false,
					splitNumber: 20,
					axisLine: {
						lineStyle: {
							color: colorStyleData[colorStyle].borderColor,
							opacity: colorStyleData[colorStyle].borderOpacity
						}
					},
					axisLabel: {
						color: '#484848',
						fontSize: '.22rem',
//						formatter: function(v) {
//							var formatData = timeFormat[config.period];
//							return base.formatDate(v, formatData)
//						}
					},
					splitLine: {
						show: false
					},
					inverse: true,
				}
			],
			yAxis: [{
					scale: true,
					position: 'right',
					axisLine: {
						lineStyle: {
							color: colorStyleData[colorStyle].borderColor,
							opacity: colorStyleData[colorStyle].borderOpacity
						}
					},
					axisLabel: {
						color: '#484848',
						fontSize: '.22rem'
					},
					splitLine: {
						lineStyle: {
							color: colorStyleData[colorStyle].borderColor,
							opacity: colorStyleData[colorStyle].borderOpacity
						}
					},
				},
				{
					scale: true,
					gridIndex: 1,
					splitNumber: 2,
					axisLine: {
						lineStyle: {
							color: colorStyleData[colorStyle].borderColor,
							opacity: colorStyleData[colorStyle].borderOpacity
						}
					},
					axisTick: {
						show: false
					},
					splitLine: {
						show: false
					},
					axisLabel: {
						show: false
					},
					position: 'right'
				}
			],
			dataZoom: [{
				type: 'inside',
				xAxisIndex: [0, 1],
				startValue: 0,
				endValue: 88,
				minValueSpan: 6
			}, {
				type: 'slider',
				show: false
			}],
			series: [{
					type: 'candlestick',
					data: option.kValues,
					itemStyle: {
						color: colorStyleData[colorStyle].upColor,
						borderColor: colorStyleData[colorStyle].upColor,
						color0: colorStyleData[colorStyle].downColor,
						borderColor0: colorStyleData[colorStyle].downColor,
					},
					markPoint: {
						itemStyle: {
							borderColor: 0,
							shadowBlur: 0,
						},
						data: [{
								type: 'max',
								name: '最大值',
								symbol: 'image:///static/images/down.png',
								symbolSize: [10, 80],
								symbolOffset: [0, '-45%'],
								label: {
									color: '#77889a',
									fontStyle: '.24rem'
								},
							},
							{
								type: 'min',
								name: '最小值',
								symbol: 'image:///static/images/up.png',
								symbolSize: [10, 80],
								symbolOffset: [0, '40%'],
								label: {
									color: '#77889a',
									fontStyle: '.22rem'
								},
							}
						]
					}
				},
				{
					name: 'Volume',
					type: 'bar',
					xAxisIndex: 1,
					yAxisIndex: 1,
					data: option.volumes,
					itemStyle: {
						normal: {
							color: function(params) {
								var colorList;
								if(option.kValues[params.dataIndex][1] > option.kValues[params.dataIndex][0]) {
									colorList = colorStyleData[colorStyle].upColor;
								} else {
									colorList = colorStyleData[colorStyle].downColor;
								}
								return colorList;
							},
						}
					}
				},
//				setIndexOption[indexVal]
			]
		};

		if(refresh) {
			myChart.clear();
		}
		myChart.setOption(chartOption);
		
	}

	//改变色调
	function changeColorStyle(color) {
		base.showLoading();
		colorStyle = color;
		$(".bgClass").addClass('bg_' + color)
		if(color == 'white') {
			$(".bgClass").removeClass("bg_black")
		} else if(color == 'black') {
			$(".bgClass").removeClass("bg_white")
		}

		setChart();
		$("#colorStyleDialog").addClass("hidden")
		base.hideLoading();
	}
	
	function addListener() {
		$("#timeChoose .periodUl li").click(function() {
			var _this = $(this);
			var thisValue = _this.attr("data-value");
			if(thisValue == 'more') { //更多
				_this.addClass("on").siblings().removeClass("on");
				if($("#moreChoose").hasClass('on')) {
					$("#moreChoose").removeClass("on")
				} else {
					$("#moreChoose").addClass("on")
				}
			} else {
				if(_this.hasClass('on')) {
					return;
				}
				base.showLoading();
				config.period = thisValue;
				_this.addClass("on").siblings().removeClass("on");
				if($("#moreChoose").hasClass('on')) {
					$("#moreChoose").removeClass("on")
				}
				if(_this.hasClass("moreLi")) {
					$("#timeChoose .more").text(_this.text())
				} else {
					$("#timeChoose .more").text('更多')
				}
				getSizeCandlestick(true);
			}
			if($("#indexBtn").hasClass("on")) {
				$("#indexBtn").removeClass("on");
				$("#indexChoose").removeClass("on");
			}
		})

		$("#colorStyle").click(function() {
			var _this = $(this);
			$("#colorStyleDialog .content ." + _this.attr("data-style")).addClass("on").siblings().removeClass("on");
			$("#colorStyleDialog").removeClass("hidden")
		})

		$("#colorStyleDialog .subBtn").click(function() {
			var _this = $(this);
			changeColorStyle($("#colorStyleDialog .content div.on").attr("data-style"))
			$("#colorStyle").attr("data-style", $("#colorStyleDialog .content div.on").attr("data-style"))
		})

		$(".am-modal-mask").on("click", function() {
			$(this).parent(".am-modal-wrap").addClass("hidden")
		})

		$("#colorStyleDialog .content div").click(function() {
			$(this).addClass("on").siblings().removeClass("on")
		})

		$("#indexBtn").click(function() {
			if($("#indexChoose").hasClass('on')) {
				$("#indexBtn").removeClass("on")
				$("#indexChoose").removeClass("on")
			} else {
				$("#indexBtn").addClass("on")
				$("#indexChoose").addClass("on")
			}
			if($("#timeChoose .periodUl li.more").hasClass("on")) {
				$("#timeChoose .periodUl li.more").removeClass("on");
				$("#moreChoose").removeClass("on")
			}

		})

		$("#indexChoose li").click(function() {
			var _this = $(this)
			var thisValue = _this.attr("data-value");
			_this.addClass("on").siblings().removeClass("on");
			setChart(true, thisValue);
			$("#indexChoose").removeClass("on")
		})
		
	}

});