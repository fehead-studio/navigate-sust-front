
Ajax = {
    getPointList:function (){
        $.ajax({
            url:service_url_pre+"/points/list",
            success:function (res) {
                if(res.status==="success"){
                    let data = res.data;
                    for (let i = 0; i < data.length; i++) {
                        let point={
                            title:data[i].name,
                            lng:data[i].lng,
                            lat:data[i].lat,
                            type:data[i].type,
                            isDef:data[i].isDef
                            // type_code:2,
                        };
                        let offsetarr = data[0].offset.split(",");
                        point.offset=[offsetarr[0],offsetarr[1]];
                        if(!point.isDef){
                            sustMarket.push(point)
                        }
                    }
                    // 学校额外点初始化
                    sustMarketPointInit();
                }else{
                    alert(res.data.errMsg);
                }
            }
        })
    },
    getPoiLikeName:function (name) {
        $.ajax({
            url: service_url_pre+"/point/"+name,
            success: function (res) {
                if(res.status==="success"){
                    excuSearchResult(res.data[0]);
                }else{
                    alert(res.data.errMsg);
                }

            }
        })
    },
    getPointListLikeName:function (name) {
        $.ajax({
            url: service_url_pre+"/unit/"+name,
            success: function (res) {
                if(res.status==="success"){
                    //console.log(res)
                    generateSearchSuggest(res.data);
                    /*if(res.data.length){

                    }*/
                    // excuSearchResult(res.data[0]);
                }else{
                    alert(res.data.errMsg);
                }

            }
        })
    }
}
