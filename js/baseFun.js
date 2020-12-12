
/**
 * 点绘制
 */
function makePoint(lng,lat,icon) {

    let marker = new AMap.Marker({
        position: [lng, lat],
        icon:icon,
    });

    map.add(marker);
    return marker;
}

/**
 * 根据类型获取图片
 * @param type
 * @returns {string}
 */
function getImageByType(type) {
    // return "../image/baseline_cached_black_18dp.png";
    return "//webapi.amap.com/theme/v1.3/images/newpc/way_btn2.png";
}

/**
 * 根据类型生成icon
 * @param type
 * @returns {AMap.Icon}
 */
function makeIcon(type) {
    let image = getImageByType(type);

    let icon = new AMap.Icon({
        // 图标尺寸
        size:new AMap.Size(36,36),
        // 图标地址
        image:image,
        imageOffset: new AMap.Pixel(0, -60),  // 图像相对展示区域的偏移量，适于雪碧图等
        // imageSize: new AMap.Size(40, 50)   // 根据所设置的大小拉伸或压缩图片
    })

    return icon;
}

/**
 * 绘制icon点
 * @param lng
 * @param lat
 * @param type
 * @returns {AMap.Marker}
 */
function makeIconPoint(lng, lat, type) {
    let icon = makeIcon(type);
    let market = makePoint(lng,lat,icon);

    return market;
}

/**
 * 绘制自定义内容点
 * @param lng
 * @param lat
 * @param content
 * @returns {AMap.Marker}
 */
function makeContentPoint(lng, lat, content,pixel) {
    // let content = '<div style="" class="glyphicon glyphicon-pencil"></div>';;
    let marker = new AMap.Marker({
        position: [lng, lat],
        content:content,
        topWhenClick:true,
        offset: pixel
    });

    map.add(marker);
    sustMarketPointHub.push(marker);
    return marker;
}

/**
 * 制作坐标html内容
 * @param type
 * @param title
 * @returns {null}
 */
function getContentHtml(type,title) {
    let position;
    let template=
        `<div id="sust_market_point">
            <div style="margin: 0 auto;width: 40px;height: 40px;overflow: hidden">
                <img style="position: relative;left:-{0}px;top:-{1}px;" src="../image/icon-normal-big.png">
            </div>
            <span>{2}</span>
         </div>
`;
    switch (type) {
       case "餐厅":
           position=[2,6];
           break;
       case "超市":
           position=[2,12];
           break;
        case "医院":
           position=[3,6];
           break;
        case "组织":
            position=[7,5];
            break;
        case "快递":
            position=[3,16];
            break;
        case "建筑":
            position=[5,15];
            break;
    }
    let leftOffset = position[0]*40;
    let topOffset = position[1]*40;
    let content = String.format(template, leftOffset, topOffset,title);
    return content;
}

function searchByPointName(name) {
    if(name=="") return;

    Ajax.getPoiLikeName(name);

    // for (let i = 0; i < sustMarketPoi.length; i++) {
    //     if(name==sustMarketPoi[i].item.name){
    //         return sustMarketPoi[i];
    //     }
    // }
}

/**
 * 执行自己的搜索方式
 * 生成窗口
 * @param poi
 */
function excuSearchResult(poi) {

    // 打开
    poi.location=new AMap.LngLat(parseFloat(poi.lng),parseFloat(poi.lat));
    let marker = new AMap.Marker();

    infoWindow = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -20)
    });
    let info = {
        // source: source,
        id: poi.id,
        name: poi.name,
        location: poi.location.toString(),
        address: poi.address
    };
    // console.log(poiResult);
    marker.setMap(map);
    infoWindow.setMap(map);

    marker.setPosition(poi.location);
    infoWindow.setPosition(poi.location);
    let content=`<table>
<tr>
<td>名称：</td><td>{0}</td><tr>
<tr>
<td>地址：</td><td>{1}</td><tr>
</table>`;
    infoWindow.setContent(String.format(content,poi.name,poi.position));
    infoWindow.open(map, marker.getPosition());
    infoWindowCloseCallback(marker);
    // poiPicker.clearSearchResults();

}

/**
 * 绑定infoWindow关闭事件
 *  关闭窗口同时删除对应点
 * @param marker
 */
function infoWindowCloseCallback(marker) {
    infoWindow.on("close",function () {
        map.remove(marker);
    });
}

/**
 * 搜索建议
 * @param key
 */
function searchSuggest(key) {
    //console.log(key);
    if(key===""){ // 还原搜索建议
        $("#search_suggest_container").html("");
        return;
    }
    Ajax.getPointListLikeName(key)
}
function generateSearchSuggest(poi) {
    //console.log("generateSearchSuggest")
    let resultHtml ="";
    for (let i = 0; i < poi.length; i++) {
        resultHtml+=searchContentHtml(poi[i].id,i,poi[i].name,poi[i].position);
    }
    if (poi.length === 0) resultHtml+=feedbackContentHtml()
    $("#search_suggest_container").html(resultHtml);

    // 初始化搜索结果点击事件
    initSearchResultOnclick(poi);

}
/**
 * 搜索建议结果拼装
 * @param top 第几个 从0 开始
 * @param title
 * @param address
 * @returns {html}
 */
function searchContentHtml(id,top,title,address) {
    let template = `
    <div id="search_result_{0}" class="input_search_result"style="top: {1}%;">
        <div class="input_search_title" >
            <div class="glyphicon glyphicon-play"></div>
            <div class="input_search_result_name">&nbsp{2}</div>
        </div>
        <div class="input_search_result_position">{3}</div>
    </div>`;
    let content = String.format(template,id,6+top*4, title, address);
    return content;
}

/**
 * 一个地点都未搜索到时展示
 * @returns {void|string|never}
 */
function feedbackContentHtml(){
    const template = `
    <div class="input_search_result"style="top: 10%;">
        <div class="input_search_title" data-toggle="modal" data-target="#myModal">
            <div class="glyphicon glyphicon-play" ></div>
            <div>没找到?点击联系我们</div>
        </div>
    </div>
    `
    const content = String.format(template);
    return content
}


/**
 * 搜索结果点击触发
 * @param poi
 */
function initSearchResultOnclick(poi) {
    let id=0;
    $(".input_search_result").click(function () {
        id=$(this).attr("id").split("_")[2];
        let name = $(this).find(".input_search_result_name").text().trim();
        searchInputTag.val(name);
        console.log(name);
        for (let i = 0; i < poi.length; i++) {
            if(id==poi[i].id){
                console.log(poi[i]);
                excuSearchResult(poi[i]);
            }
        }
        $("#search_suggest_container").html("");
    });

}
