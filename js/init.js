
let map;

let sustMainAreaPolygon;
let sustLifeAreaPolygon;

let sustMarketPointHub=[];

let searchInput;

let searchInputTag;

// 全局唯一的一个窗口 因为只能同时显示一个
let infoWindow;

/**
 * 组件初始化
 */
function compomentInit() {
    /**
     * 格式化字符串
     * @param src
     * @returns {void | string | never|null}
     */
    String.format = function(src){
        if (arguments.length == 0) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    };
    /**
     * 搜索框html代码存储
     */
    searchInput = $(".input_wrapper").parent().html();

    searchInputTag = $("#pickerInput");
}

function mapInit() {
    map = new AMap.Map('container',{
        // pitch:75,
        // viewModel:'3D',
        zoom:16,
        center:[108.977368,34.377653],
    });
    // 地图缩放事件绑定
    map.on("zoomchange",function () {
        let arr = map.getAllOverlays("marker");
        let curZoom = map.getZoom();
        if(curZoom<16){
            map.remove(arr);
        }else{
            map.add(sustMarketPointHub);
        }
    });
}
// 生活区
let sustLifeArea = [
    [108.976772,34.381229],
    [108.976493,34.38177],
    [108.976112,34.381721],
    [108.975452,34.383824],
    [108.98028,34.3847],
    [108.980146,34.385121],
    [108.981439,34.385347],
    [108.981562,34.385063],
    [108.981305,34.384598],
    [108.981391,34.382398],
    [108.976772,34.381229],
];
// 教学区
let sustMainArea = [
    [108.971477,34.379486],
    [108.981321,34.382146],
    // [108.981342,34.378896],
    [108.981176,34.375115],
    // [108.980559,34.378825],
    [108.980441,34.375071],
    [108.973011,34.375603],
    [108.972931,34.376967],
    [108.971509,34.377006],
    [108.971477,34.379486]
];

/**
 * 插件加载
 */
function pluginInit() {
    AMap.plugin(['AMap.ToolBar','AMap.Scale'],function(){//异步加载插件
        var toolbar = new AMap.ToolBar();
        var scale = new AMap.Scale();
        map.addControl(toolbar);
        map.addControl(scale);
    });
}

/**
 * 地标搜索初始化
 */
let poiPicker;
function serchPointInit() {
    //设置DomLibrary，jQuery或者Zepto
    AMapUI.setDomLibrary($);
    var marker = new AMap.Marker();

    var infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -20)
    });
    //加载PoiPicker，loadUI的路径参数为模块名中 'ui/' 之后的部分

    AMapUI.loadUI(['misc/PoiPicker'], function(PoiPicker) {
        poiPicker = new PoiPicker({
            input: 'pickerInput', //输入框id
            city:'西安',
            // autocompleteOptions:AMap.Autocomplete({
            //     city:"西安",
            //     citylimit:true
            // })
            // placeSearchOptions:AMap.PlaceSearch({
            //
            // })
        });
        //监听poi选中信息
        poiPicker.on('poiPicked', function(poiResult) {
            console.log("==================");
            //用户选中的poi点信息
            let source = poiResult.source,
            poi = poiResult.item,
                info = {
                    source: source,
                    id: poi.id,
                    name: poi.name,
                    location: poi.location.toString(),
                    address: poi.address
                };
            console.log(poiResult);
            marker.setMap(map);
            infoWindow.setMap(map);

            marker.setPosition(poi.location);
            infoWindow.setPosition(poi.location);

            infoWindow.setContent('POI信息: <pre>' + JSON.stringify(info, null, 2) + '</pre>');
            infoWindow.open(map, marker.getPosition());
            // var lng = poiResult.item.location.lng;
            // var lat = poiResult.item.location.lat;
            // var user_marker = new AMap.Marker({
            //     position: [lng, lat]
            // });
            // map.add(user_marker);
            // sustMarketPointHub.add(user_marker);
        });
    });

}


function sustLifeAreaRangeLineInit() {
    drawRangeLineInit(sustLifeArea);
}

function sustMainAreaRangeLineInit() {
    drawRangeLineInit(sustMainArea);
}

/**
 * 区域线绘制
 * @param area
 */
function drawRangeLineInit(area) {
    let polyline = new AMap.Polyline({
        path: area,          //设置线覆盖物路径
        strokeColor: "#70adff", //线颜色
        strokeWeight: 3,        //线宽
        strokeStyle: "solid",   //线样式
    });
    map.add(polyline);
}

/**
 * 区域绘制
 */
function sustAllAreaPolygonInit() {

    sustMainAreaPolygon = new AMap.Polygon({
        path: sustMainArea,

    });

    sustLifeAreaPolygon = new AMap.Polygon({
        path: sustLifeArea,
    });

    let overlayGroup = new AMap.OverlayGroup([sustMainAreaPolygon, sustLifeAreaPolygon]);
    overlayGroup.setOptions({
        strokeColor: "#ffffff",
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillOpacity: 0, // 不透明度 0为完全透明
        fillColor: '#ffffff',
        zIndex: 50,
    });

    map.add(overlayGroup);
}

/**
 * 进行学校区域的镂空
 */
function sustHollow() {

    AMapUI.loadUI(['geo/DistrictExplorer'], function(DistrictExplorer) {
        initPage(DistrictExplorer);
    });

    function getAllRings(feature) {

        let coords = feature.geometry.coordinates,
            rings = [];

        for (let i = 0, len = coords.length; i < len; i++) {
            rings.push(coords[i][0]);
        }

        return rings;
    }
    function getLongestRing(feature) {
        let rings = getAllRings(feature);

        rings.sort(function(a, b) {
            return b.length - a.length;
        });

        return rings[0];
    }
    function initPage(DistrictExplorer) {
        //创建一个实例
        let districtExplorer = new DistrictExplorer({
            map: map
        });

        let countryCode = 100000, //全国
            cityCodes = [
            ];

        districtExplorer.loadMultiAreaNodes(
            //只需加载全国和市，全国的节点包含省级
            [countryCode].concat(cityCodes),
            function(error, areaNodes) {

                let countryNode = areaNodes[0],
                    cityNodes = areaNodes.slice(1);

                let path = [];

                //首先放置背景区域，这里是大陆的边界
                path.push(getLongestRing(countryNode.getParentFeature()));
                // 镂空教学区
                path.push(sustMainAreaPolygon.getPath());

                // 镂空生活区
                path.push(sustLifeAreaPolygon.getPath());

                //绘制带环多边形
                //https://lbs.amap.com/api/javascript-api/reference/overlay#Polygon
                let polygon = new AMap.Polygon({
                    bubble: true,
                    lineJoin: 'round',
                    strokeColor: 'grave', //线颜色
                    strokeOpacity: 1, //线透明度
                    strokeWeight: 1, //线宽
                    fillColor: 'black', //填充色
                    fillOpacity: 0.15, //填充透明度
                    map: map,
                    path: path
                });
            });

    }

}

/**
 * 学校额外点初始化
 */
function sustMarketPointInit(){
    for (let i = 0; i < sustMarket.length; i++) {
        let point = sustMarket[i];
        if(point.isDef){// 如果已经被定义了则不进行绘制
            continue;
        }
        let content = getContentHtml(point.type,point.title);
        makeContentPoint(point.lng,point.lat,content,new AMap.Pixel(point.offset[0], point.offset[1]));
    }
}
