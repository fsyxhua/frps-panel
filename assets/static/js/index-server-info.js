var loadServerInfo = (function ($) {
    var size = filesize.partial({base: 2, standard: "jedec"});
    var i18n = {};

    /**
     * get server info
     * @param lang {{}} language json
     * @param title page title
     */
    function loadServerInfo(lang, title) {
        i18n = lang;
        $("#title").text(title);
        $('#content').empty();
        var loading = layui.layer.load();

        $.getJSON('/proxy/api/serverinfo').done(function (result) {
            if (result.success) {
                var data = JSON.parse(result.data);
                data.proxyCounts = 0;
                httpPort = data.vhostHTTPPort;
                httpsPort = data.vhostHTTPSPort;
                for (var proxy in data.proxyTypeCount) {
                    data.proxyCounts = data.proxyCounts + data.proxyTypeCount[proxy];
                }
                data.bindPort = data.bindPort || i18n['Disable'];
                data.kcpBindPort = data.kcpBindPort || i18n['Disable'];
                data.quicBindPort = data.quicBindPort || i18n['Disable'];
                data.vhostHTTPPort = data.vhostHTTPPort || i18n['Disable'];
                data.vhostHTTPSPort = data.vhostHTTPSPort || i18n['Disable'];
                data.tcpmuxHTTPConnectPort = data.tcpmuxHTTPConnectPort || i18n['Disable'];
                data.subdomainHost = data.subdomainHost || i18n['NotSet'];
                data.maxPoolCount = data.maxPoolCount || i18n['NotSet'];
                data.maxPortsPerClient = data.maxPortsPerClient || i18n['NotLimit'];
                data.heartbeatTimeout = data.heartbeatTimeout || i18n['NotSet'];
                data.allowPortsStr = data.allowPortsStr || i18n['NotLimit'];
                data.tlsForce = i18n[data.tlsForce || false];
                data.totalTrafficInText = size(data.totalTrafficIn || 0);
                data.totalTrafficOutText = size(data.totalTrafficOut || 0);
                data.totalTrafficText = size((data.totalTrafficIn || 0) + (data.totalTrafficOut || 0));
                renderServerInfo(data);
            } else {
                layui.layer.msg(result.message);
            }
        }).always(function () {
            layui.layer.close(loading);
        });
    }

    /**
     * render server info page
     * @param data server info data
     */
    function renderServerInfo(data) {
        var html = layui.laytpl($('#serverInfoTemplate').html()).render(data);
        $('#content').html(html);
        $('#frpVersion').text(data.version);

        renderTrafficChart(data);
        renderCountChart(data);
    }

    /**
     * render traffic chart with echarts
     * @param data traffic data
     */
    function renderTrafficChart(data) {
        var chartLegend = [i18n['TrafficIn'], i18n['TrafficOut']];
        var chartData = [
            {value: data.totalTrafficIn, name: i18n['TrafficIn']},
            {value: data.totalTrafficOut, name: i18n['TrafficOut']}
        ];
        var chartDom = document.getElementById('trafficPieChart');
        var chart = echarts.init(chartDom);
        var option = {
            color: ['#5b7cfa', '#7ed46b'],
            title: {
                show: false
            },
            tooltip: {
                trigger: 'item',
                formatter: function (v) {
                    return size(v.value) + ' (' + v.percent + '%)';
                },
            },
            legend: {
                bottom: 0,
                data: chartLegend,
                textStyle: {color: '#7f8b9c'}
            },
            series: [
                {
                    type: 'pie',
                    radius: ['46%', '68%'],
                    center: ['50%', '44%'],
                    avoidLabelOverlap: true,
                    data: chartData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && chart.setOption(option);
    }

    /**
     * render proxy count chat with echarts
     * @param data proxy count data
     */
    function renderCountChart(data) {
        var proxies = data.proxyTypeCount;
        var chartLegend = [];
        var chartData = [];

        for (var type in proxies) {
            var temp = {
                name: type.toUpperCase(),
                value: proxies[type]
            };
            chartLegend.push(type.toUpperCase());
            chartData.push(temp);
        }

        var chartDom = document.getElementById('countPieChart');
        var chart = echarts.init(chartDom);
        var option = {
            color: ['#6e6af2', '#ef67b5', '#27c7e8', '#37df99', '#f2bd56', '#ff7a7a'],
            title: {
                show: false
            },
            tooltip: {
                trigger: 'item',
                formatter: function (v) {
                    return v.value + ' (' + v.percent + '%)';
                }
            },
            legend: {
                bottom: 0,
                data: chartLegend,
                textStyle: {color: '#7f8b9c'}
            },
            series: [
                {
                    type: 'pie',
                    radius: ['46%', '68%'],
                    center: ['50%', '44%'],
                    data: chartData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && chart.setOption(option);
    }

    return loadServerInfo;
})(layui.$);
