define([
	'app/controller/base',
	'app/interface/MarketCtr',
	'echarts'
], function(base, MarketCtr, echarts) {
	var symbolVal = base.getUrlParam("symbol") || "btcusdt", //交易对
		exchange = base.getUrlParam("exchange") || "huobiPro", //交易所
		period = "60min", //周期
		unit = base.getUrlParam("unit") || "";//单位

	var config = {
		symbol: symbolVal,
		exchange: exchange,
		period: period,
		size: "24"
	};

	$("#chart").height($(".echarts-wrap").height() - $(".nav-wrap").height())
	var myChart = echarts.init(document.getElementById('chart'));
	var chartOption = {};
	var option = {};
	var primaryColor='#348ff6';

	init();

	function init() {
		base.showLoading();
		getSizeCandlestick();
		var timer = setInterval(function(){
			getSizeCandlestick(true)
		},60000)
		addListener();
	}

	function getSizeCandlestick(refresh) {
		return MarketCtr.getSizeCandlestick(config).then((data) => {
			option = {
				date: [],
				kValues: [],
				close: []
			};
			
			if(data.t.length) {
				data.t.forEach((item, i) => {
					option.date.push(base.formatDate(item * 1000, 'yyyy-MM-dd hh:mm'));
				})
				option.date.reverse();
			}
			if(data.c.length) {
				data.c.forEach((item) => {
					option.close.push(item);
				})
				
				option.close.reverse();
			}
			setChart(refresh);
			base.hideLoading();
		})
	}

	function setChart(refresh) {
		chartOption = {
			animation: false,
		    tooltip: {
		        trigger: 'axis',
		        axisPointer:{
		        	lineStyle:{
		        		color: primaryColor
		        	},
		        },
				confine: true,
				formatter: function(data){
					return '<p class="tooltip_txt">'+data[0].axisValue+'<br/>'+unit+data[0].data+'</p>';
				}
		    },
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: option.date,
				axisLine: {
					lineStyle: {
						color: '#eeeeee',
					}
				},
				axisLabel: {
					color: '#999999',
					fontSize: '.24rem',
					formatter: function(v){
						return base.formatDate(v, 'hh:mm')
					}
				},
			},
			yAxis: {
				scale: true,
				axisLine: {
					lineStyle: {
						color: '#eeeeee',
					}
				},
				axisLabel: {
					color: '#999999',
					fontSize: '.24rem'
				},
				splitLine: {
					lineStyle: {
						color: '#eee',
					}
				},
			},
			grid: [{
					left: '12%',
					right: '4%',
					top: '5%',
					height: '80%'
				}
			],
			series: [{
				data: option.close,
				type: 'line',
        		showSymbol: false,
		        symbol: 'circle',
		        symbolSize: 8,
        		smooth: true,
				areaStyle: {
					normal: {
		                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
		                    offset: 0,
		                    color: 'rgb(221, 239, 252)'
		                }, {
		                    offset: 1,
		                    color: 'rgb(238, 247, 253)'
		                }], false),
		                shadowColor: 'rgba(0, 0, 0, 0.1)',
		                shadowBlur: 10
		            }
				},
				lineStyle:{
					color: primaryColor
				},
				itemStyle: {
		            normal: {
		                color: primaryColor,
		                borderColor: 'rgba(0,136,212,0.2)',
		                borderWidth: 10,
		            }
		        },
			}]
		}
		if(refresh) {
			myChart.clear();
		}
		myChart.setOption(chartOption)
	}

	function addListener() {

	}

});